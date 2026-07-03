import { NextResponse } from "next/server";
import { analyzeLandLive } from "@/lib/analyze-land";
import { analyzeLand } from "@/lib/mock-analysis";
import { logger, logRequest } from "@/lib/logger";

export async function GET(request: Request) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address?.trim()) {
    logRequest("GET", "/api/analyze", 400, Date.now() - start);
    return NextResponse.json(
      { error: "address 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    logger.info("Analysis started", "analyze", {
      address: address.trim().slice(0, 30),
    });
    const analysis = await analyzeLandLive(address.trim());
    logRequest("GET", "/api/analyze", 200, Date.now() - start);
    logger.info("Analysis completed", "analyze", {
      dataSource: analysis.dataSource,
      score: analysis.overallScore,
    });
    return NextResponse.json(analysis);
  } catch (err) {
    logger.error("Analysis failed, using mock fallback", "analyze", {
      error: err instanceof Error ? err.message : "unknown",
    });
    logRequest("GET", "/api/analyze", 200, Date.now() - start);
    return NextResponse.json(analyzeLand(address.trim()));
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  let address = "";

  try {
    const body = await request.json();
    address = body?.address?.trim() ?? "";

    if (!address) {
      logRequest("POST", "/api/analyze", 400, Date.now() - start);
      return NextResponse.json(
        { error: "address가 필요합니다." },
        { status: 400 }
      );
    }

    logger.info("Analysis started", "analyze", {
      address: address.slice(0, 30),
    });
    const analysis = await analyzeLandLive(address);
    logRequest("POST", "/api/analyze", 200, Date.now() - start);
    return NextResponse.json(analysis);
  } catch (err) {
    logger.error("Analysis failed, using mock fallback", "analyze", {
      error: err instanceof Error ? err.message : "unknown",
    });
    logRequest("POST", "/api/analyze", 200, Date.now() - start);
    if (address) {
      return NextResponse.json(analyzeLand(address));
    }
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 }
    );
  }
}
