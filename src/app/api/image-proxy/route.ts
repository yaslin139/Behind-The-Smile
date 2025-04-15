import { NextRequest, NextResponse } from "next/server";
import http from "http";
import https from "https";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  if (!rawUrl) {
    return new NextResponse("Missing 'url' parameter.", { status: 400 });
  }

  // Create a URL object from the raw URL to determine the protocol.
  let urlObj: URL;
  try {
    urlObj = new URL(rawUrl);
  } catch (err) {
    return new NextResponse("Invalid URL parameter.", { status: 400 });
  }

  // Select the correct module based on the protocol.
  const getter = urlObj.protocol === "http:" ? http.get : https.get;

  return new Promise<Response>((resolve, reject) => {
    getter(rawUrl, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        return resolve(
          new NextResponse(
            `Failed to fetch image with status: ${proxyRes.statusCode}`,
            { status: proxyRes.statusCode }
          )
        );
      }
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
