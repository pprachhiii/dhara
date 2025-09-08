import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { requireAuth } from "@/lib/serverAuth";

export const runtime = "nodejs"; // Important: Node runtime for Buffer

interface ImageKitUploadResult {
  fileId: string;
  name: string;
  url: string;
  height?: number;
  width?: number;
  size?: number;
  fileType?: string;
  thumbnailUrl?: string;
}

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  try {
    console.log("=== Upload API called ===");

    const authResult = await requireAuth(req);
    if (authResult.error || !authResult.user) {
      console.warn("Unauthorized upload attempt");
      return authResult.response!;
    }
    console.log("Authenticated user:", authResult.user.email);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      console.log("No valid file received in formData");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name || `upload-${Date.now()}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Received file:", fileName, "size:", buffer.length);

    const upload: ImageKitUploadResult = await new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: buffer.toString("base64"),
          fileName,
          useBase64: true,
          useUniqueFileName: true,
          folder: "/uploads",
        },
        (
          err: unknown,
          result:
            | {
                fileId: string;
                name: string;
                url: string;
                height?: number;
                width?: number;
                size?: number;
                fileType?: string;
                thumbnailUrl?: string;
              }
            | undefined
        ) => {
          if (err) {
            console.error("ImageKit upload error:", err);
            return reject(err);
          }
          if (!result || !result.url) {
            console.error("Invalid result from ImageKit:", result);
            return reject(new Error("Invalid result from ImageKit"));
          }
          resolve(result);
        }
      );
    });

    console.log("Upload successful:", upload.url);
    return NextResponse.json({ url: upload.url });
  } catch (error) {
    console.error("Upload failed:", error);
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.json({ error: "Upload failed", details: message }, { status: 500 });
  }
}
