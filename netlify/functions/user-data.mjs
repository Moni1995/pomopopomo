import { getStore } from "@netlify/blobs";

export const handler = async (event, context) => {
  const user = context.clientContext?.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: "Not authenticated" }) };
  }

  const store = getStore("user-data");
  const key = user.sub;

  if (event.httpMethod === "GET") {
    try {
      const data = await store.get(key);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: data || "null",
      };
    } catch (e) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: "null",
      };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      await store.set(key, event.body);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, body: "Method not allowed" };
};
