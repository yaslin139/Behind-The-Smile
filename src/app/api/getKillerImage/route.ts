import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX;
  if (!apiKey || !cx) {
    return NextResponse.json({ error: "Missing Google API configuration" }, { status: 500 });
  }

  const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(googleUrl);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      return NextResponse.json({ link: data.items[0].link });
    } else {
      return NextResponse.json({ error: "No image found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching image from Google:", error);
    return NextResponse.json({ error: "Image fetch failed" }, { status: 500 });
  }
}