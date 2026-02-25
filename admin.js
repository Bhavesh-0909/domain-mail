import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const SCOPES = [
  "https://www.googleapis.com/auth/admin.directory.user.readonly",
];


export async function listUsers() {
  const auth = new google.auth.JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: SCOPES,
    subject: "admin@bhaveshchoudhary.me", 
  });

  await auth.authorize();

  const admin = google.admin({
    version: "directory_v1",
    auth,
  });

  const res = await admin.users.list({
    domain: "bhaveshchoudhary.me",
    maxResults: 100,
  });

  return res.data.users || [];
}