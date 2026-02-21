import { uploadToCloudinary } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Convert files to data URIs and upload to Cloudinary
    const results = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
        const result = await uploadToCloudinary(dataUri, {
          folder: "seoul-studio/chat-uploads",
        });
        return {
          url: result.url,
          name: file.name,
        };
      })
    );

    return NextResponse.json({ images: results });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
