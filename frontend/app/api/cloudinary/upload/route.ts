import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { validateImageUrl, validateOrigin } from "@/lib/security";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Maximum allowed image payload size (~10MB)
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    // 1. CORS / Origin Check
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: "Forbidden: Invalid request origin" },
        { status: 403 },
      );
    }

    // 2. Rate Limiting (max 10 uploads per min per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`cloudinary_${clientIp}`, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many upload requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.reset - Math.floor(Date.now() / 1000)),
          },
        },
      );
    }

    // 3. Ensure Cloudinary credentials are configured
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Cloudinary is not properly configured on the server." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { image } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "No valid image provided" },
        { status: 400 },
      );
    }

    // 4. Validate payload size
    if (image.length > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: "Image file exceeds the maximum allowed size (10MB)" },
        { status: 413 },
      );
    }

    // 5. Validate image data format
    if (!validateImageUrl(image)) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed formats: PNG, JPEG, WEBP, GIF" },
        { status: 400 },
      );
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "habit-builder",
      resource_type: "image",
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
