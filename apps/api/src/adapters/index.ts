import { ConnType } from "@prisma/client";
import { BaseAdapter } from "./base.adapter";
import { RestAdapter } from "./rest.adapter";
import { ClaudeAdapter } from "./claude.adapter";
import { OpenAIAdapter } from "./openai.adapter";
import { LangChainAdapter } from "./langchain.adapter";
import { WebSocketAdapter } from "./websocket.adapter";
import { MockAdapter } from "./mock.adapter";

const adapters: Record<ConnType, BaseAdapter> = {
  REST: new RestAdapter(),
  CLAUDE_API: new ClaudeAdapter(),
  OPENAI: new OpenAIAdapter(),
  LANGCHAIN: new LangChainAdapter(),
  WEBSOCKET: new WebSocketAdapter(),
  MOCK: new MockAdapter(),
};

export function getAdapter(connType: ConnType): BaseAdapter {
  return adapters[connType];
}

export { BaseAdapter };
