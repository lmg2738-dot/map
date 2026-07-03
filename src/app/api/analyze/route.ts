import { NextResponse } from "next/server";
import { analyzeLandLive } from "@/lib/analyze-land";
import { analyzeLand } from "@/lib/mock-analysis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address?.trim()) {
    return NextResponse.json(
      { error: "address 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const analysis = await analyzeLandLive(address.trim());
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[analyze GET]", err);
    return NextResponse.json(analyzeLand(address.trim()));
  }
}

export async function POST(request: Request) {
  let address = "";
  try {
    const body = await request.json();
    address = body?.address?.trim() ?? "";

    if (!address) {
      return NextResponse.json(
        { error: "address가 필요합니다." },
        { status: 400 }
      );
    }

    const analysis = await analyzeLandLive(address);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[analyze POST]", err);
    if (address) {
      return NextResponse.json(analyzeLand(address));
    }
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 }
    );
  }
}
