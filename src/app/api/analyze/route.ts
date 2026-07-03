import { NextResponse } from "next/server";
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

  const analysis = analyzeLand(address.trim());
  return NextResponse.json(analysis);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const address = body?.address;

    if (!address?.trim()) {
      return NextResponse.json(
        { error: "address가 필요합니다." },
        { status: 400 }
      );
    }

    const analysis = analyzeLand(address.trim());
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 }
    );
  }
}
