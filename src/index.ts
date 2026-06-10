import { recordRequest } from "./analytics";
import { classifyRequest } from "./classify";
import { handleRequest } from "./router";
import type { Env, ExecutionContextLike } from "./types";

export default {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContextLike,
  ): Promise<Response> {
    const response = await handleRequest(request, env);
    const classification = classifyRequest({
      userAgent: request.headers.get("user-agent") ?? "",
      referer: request.headers.get("referer") ?? "",
      url: request.url,
    });

    context.waitUntil(
      recordRequest({
        request,
        response,
        classification,
        env,
      }),
    );

    return response;
  },
};
