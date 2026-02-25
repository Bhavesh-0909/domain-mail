import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

import { setupWatchForAllUsers } from "./watch.js";
import cron from "node-cron";


const app = express();
app.use(express.json());

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/admin.directory.user.readonly",
];

console.log("PRIVATE_KEY length:", process.env.PRIVATE_KEY?.length);
console.log(process.env.PRIVATE_KEY?.slice(0, 50));

function getAuthClient(userEmail) {
  return new google.auth.JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: SCOPES,
    subject: userEmail
  });
}

app.post("/gmail-events", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) return res.status(400).send("No message");

    const decoded = Buffer.from(message.data, "base64").toString();
    const data = JSON.parse(decoded);

    const userEmail = data.emailAddress;

    const auth = getAuthClient(userEmail);

    const gmail = google.gmail({
      version: "v1",
      auth,
    });

    const list = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
    });

    if (!list.data.messages) {
      return res.status(200).send("No new mail");
    }

    for (const msg of list.data.messages) {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const snippet = full.data.snippet || "";

      const isSpam = snippet.toLowerCase().includes("lottery");

      if (isSpam) {
        await gmail.users.messages.modify({
          userId: "me",
          id: msg.id,
          requestBody: {
            addLabelIds: ["SPAM"],
            removeLabelIds: ["INBOX"],
          },
        });
      }
    }

    res.status(200).send("Processed");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.post("/setup-watch", async (req, res) => {
  try {
    await setupWatchForAllUsers();
    res.status(200).send("Watch setup for all users");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error setting up watch");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

cron.schedule("0 2 * * *", async () => {
  await setupWatchForAllUsers();
});
