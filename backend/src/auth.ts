import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "./env.js";

/**
 * Single-user bearer-token auth. Deliberately simple: no sessions, no user
 * table, no refresh tokens. This app is reachable from the open internet
 * (it's on a cloud host), so "simple" still means "actually checked on
 * every request" — just via a constant-time comparison against one secret
 * rather than a full auth system that would be overkill for one user.
 */
export function requireAuth(request: FastifyRequest, reply: FastifyReply, done: () => void): void {
  const header = request.headers.authorization;
  const headerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  // <img>/<a> tags can't set an Authorization header, so the page/cover
  // routes are fetched with ?token=... instead. Everything else uses the
  // header. Both are checked here so every route can share one guard.
  const queryToken = (request.query as Record<string, string> | undefined)?.token;
  const token = headerToken ?? queryToken;

  if (!token || !timingSafeEqual(token, env.API_TOKEN)) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  done();
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
