import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { requireAuth } from "@/lib/serverAuth";

export const runtime = "nodejs"; // Node runtime needed for Buffer

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

interface FileLike {
  name?: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  try {
    console.log("=== Upload API called ===");

    // --- Auth check ---
    const authResult = await requireAuth(req);
    if (authResult.error || !authResult.user) {
      console.warn("Unauthorized upload attempt");
      return authResult.response!;
    }
    console.log("Authenticated user:", authResult.user.email);

    // --- Parse file ---
    const formData = await req.formData();
    const rawFile = formData.get("file");

    // Node-compatible type guard
    const file = rawFile instanceof Blob && "arrayBuffer" in rawFile ? (rawFile as FileLike) : null;

    if (!file) {
      console.log("No valid file received in formData");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name || `upload-${Date.now()}`;

    console.log("Received file:", fileName, "size:", buffer.length);

    // --- Upload to ImageKit ---
    const upload: ImageKitUploadResult = await new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: buffer.toString("base64"),
          fileName,
          useBase64: true,
          useUniqueFileName: true,
          folder: "/uploads",
        },
        (err, result) => {
          if (err) {
            console.error("ImageKit upload error:", err);
            return reject(err);
          }
          if (!result || !result.url) {
            console.error("Invalid result from ImageKit:", result);
            return reject(new Error("Invalid result from ImageKit"));
          }
          resolve(result as ImageKitUploadResult);
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
