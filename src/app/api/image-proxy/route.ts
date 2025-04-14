// File: app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import https from "https";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url"); // The image URL you want to proxy

  if (!rawUrl) {
    return new NextResponse("Missing 'url' parameter.", { status: 400 });
  }

  // If you have to handle http as well as https, consider using `http` or node-fetch.
  return new Promise((resolve, reject) => {
    https.get(rawUrl, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        return resolve(
          new NextResponse(`Failed to fetch image with status: ${proxyRes.statusCode}`, { status: proxyRes.statusCode })
        );
      }
      // Grab content-type header from the remote image
      const contentType = proxyRes.headers["content-type"] || "image/jpeg";

      // Stream the data back
      const responseStream = new ReadableStream({
        start(controller) {
          proxyRes.on("data", (chunk) => controller.enqueue(chunk));
          proxyRes.on("end", () => controller.close());
          proxyRes.on("error", (err) => controller.error(err));
        },
      });

      const response = new NextResponse(responseStream);
      response.headers.set("Content-Type", contentType);
      resolve(response);
    }).on("error", (err) => {
      reject(err);
    });
  });
}
