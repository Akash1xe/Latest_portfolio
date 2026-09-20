import type { IncomingMessage, ServerResponse } from "node:http";

export type VercelRequest = IncomingMessage & {
  body: unknown;
  query: Record<string, string | string[] | undefined>;
};

export type VercelResponse = ServerResponse & {
  json: (body: unknown) => VercelResponse;
  redirect: (statusCode: number, location: string) => VercelResponse;
  status: (statusCode: number) => VercelResponse;
};

