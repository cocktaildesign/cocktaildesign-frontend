import { NextResponse } from "next/server";
import { YANDEX_REVIEWS_URL } from "@/lib/reviews";

export function GET() {
  return NextResponse.redirect(YANDEX_REVIEWS_URL, 307);
}
