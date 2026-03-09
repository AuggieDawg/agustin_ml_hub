import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth";

export { authOptions };

export async function auth() {
  return getServerSession(authOptions);
}