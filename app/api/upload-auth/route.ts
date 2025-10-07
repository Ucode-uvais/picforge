//@ts-nocheck
import { getUploadAuthParams } from "@imagekit/next/server";
import exp from "constants";

export async function GET() {
  try {
    // generate auth params using imagekit sdk
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    });

    return Response.json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("Error generating upload auth params:", error);
    return Response.json(
      { error: "Failed to generate upload auth params" },
      { status: 500 }
    );
  }
}
