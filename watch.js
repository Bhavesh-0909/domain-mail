// watch.js
import { listUsers } from "./admin.js";
import { enableWatch } from "./gmail.js";

export async function setupWatchForAllUsers() {
  const users = await listUsers();

  for (const user of users) {
    await enableWatch(user.primaryEmail);
  }
}

setupWatchForAllUsers();