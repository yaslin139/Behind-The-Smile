// File: app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import https from "https";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url"); // The image URL you want to proxy

  if (!rawUrl) {
    return new NextResponse("Missing 'url' parameter.", { status: 400 });
  }

  // Wrap in a Promise<Response> so the type is explicit
  return new Promise<Response>((resolve, reject) => {
    https.get(rawUrl, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        return resolve(
          new NextResponse(
            `Failed to fetch image with status: ${proxyRes.statusCode}`, 
            { status: proxyRes.statusCode }
          )
        );
      }
      // Get content-type header from the remote image
      const contentType = proxyRes.headers["content-type"] || "image/jpeg";

      // Create a readable stream to pipe the data
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
