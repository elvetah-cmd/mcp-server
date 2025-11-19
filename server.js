import { Server } from "@modelcontextprotocol/sdk/server";

const server = new Server({
  name: "my-custom-mcp",
  version: "1.0.0"
});

server.tool("hello", {
  description: "Returns a greeting",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" }
    },
    required: ["name"]
  },
  async run({ name }) {
    return { message: `Hello, ${name}!` };
  }
});

server.listen(3000);

