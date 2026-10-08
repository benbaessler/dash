import { neynar } from "@/lib/neynar";
import { rateLimit } from "@/lib/kv";
import { getSignedKey } from "@/utils/getSignedKey";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const fid = Number(request.headers.get("x-fid"));

  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allowed = await rateLimit(`signer:${fid}`, 5, 60 * 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const signedKey = await getSignedKey(true);

    return NextResponse.json(signedKey, {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const signer_uuid = searchParams.get("signer_uuid");

  if (!signer_uuid) {
    return NextResponse.json(
      { error: "signer_uuid is required" },
      { status: 400 }
    );
  }

  try {
    const signer = await neynar.lookupSigner({ signerUuid: signer_uuid });

    return NextResponse.json(
      {
        signer_uuid: signer.signer_uuid,
        public_key: signer.public_key,
        status: signer.status,
        signer_approval_url: signer.signer_approval_url,
        fid: signer.fid,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
