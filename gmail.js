// gmail.js
import { google } from "googleapis";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
];

export function getGmailAuth(userEmail) {
  return new google.auth.JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: GMAIL_SCOPES,
    subject: userEmail,
  });
}

export async function enableWatch(userEmail) {
  const auth = getGmailAuth(userEmail);
  await auth.authorize();

  const gmail = google.gmail({
    version: "v1",
    auth,
  });

  await gmail.users.watch({
    userId: "me",
    requestBody: {
      topicName: "projects/caramel-galaxy-488314-k0/topics/gmail-events",
    },
  });

  //console.log("Watch enabled for:", userEmail);
}