import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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

    // Forward the request to Flejet External API
    // Using localhost for now
    const flejetUrl = "https://flejet.vercel.app/api/external/schedule";

    const response = await fetch(flejetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspaceId: flejetConfig.workspaceId,
        apiKey: flejetConfig.apiKey,
        userId: flejetConfig.userId,
        content,
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
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
