import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcrypt";

// Init Firebase just once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = getFirestore();

// Vercel API handler
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { phone, password, name } = await req.json();

  if (!phone || !password || !name) {
    return new Response(
      JSON.stringify({ error: "Missing fields" }),
      { status: 400 }
    );
  }

  // Check if user exists
  const userRef = db.collection("users").doc(phone);
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    return new Response(
      JSON.stringify({ error: "User already exists" }),
      { status: 409 }
    );
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Save user
  await userRef.set({
    phone,
    name,
    password: hashed,
    avatar: "https://files.catbox.moe/9uqgm9.png",
    createdAt: new Date(),
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
