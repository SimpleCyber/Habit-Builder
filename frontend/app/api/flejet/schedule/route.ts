import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { sanitizeText, validateImageUrl, validateOrigin } from "@/lib/security";

export async function POST(request: Request) {
  try {
    // 1. CORS / Origin Check
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Invalid request origin" },
        { status: 403 },
      );
    }

    // 2. Rate Limiting (max 20 schedule requests per min per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`flejet_${clientIp}`, 20, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.reset - Math.floor(Date.now() / 1000)),
          },
        },
      );
    }

    const body = await request.json();
    const { content, scheduledTime, imageUrl, imageBase64, flejetConfig } =
      body;

    if (
      !flejetConfig ||
      !flejetConfig.workspaceId ||
      !flejetConfig.apiKey ||
      !flejetConfig.userId
    ) {
      return NextResponse.json(
        { success: false, error: "Flejet is not connected" },
        { status: 400 },
      );
    }

    // 3. Input sanitization
    const sanitizedContent = sanitizeText(content, 2000);
    if (!sanitizedContent) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 },
      );
    }

    // 4. Validate image if provided
    if (imageUrl && !validateImageUrl(imageUrl)) {
      return NextResponse.json(
        { success: false, error: "Invalid image URL provided" },
        { status: 400 },
      );
    }

    // Forward the request to Flejet External API
    const flejetUrl = "https://flejet.vercel.app/api/external/schedule";

    const response = await fetch(flejetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspaceId: String(flejetConfig.workspaceId).trim(),
        apiKey: String(flejetConfig.apiKey).trim(),
        userId: String(flejetConfig.userId).trim(),
        content: sanitizedContent,
        scheduledTime,
        imageUrl,
        imageBase64,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to schedule on Flejet" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[FLEJET-PROXY] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
