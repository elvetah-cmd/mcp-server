import { Server } from "@anthropic-ai/mcp-server";

// -----------------------------------------------------------
//  ELI’S PRODUCTION MCP SERVER
//  Tailored for legal, business affairs, IP, finance, tasks
// -----------------------------------------------------------

const server = new Server({

  tools: {

    // -------------------------------------------------------
    // 1. Extract Deal Terms
    // -------------------------------------------------------
    extract_deal_terms: {
      description: "Extract key commercial and legal terms from any contract, email, or notes. Outputs structured deal parameters.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string" }
        },
        required: ["text"]
      },
      execute: async ({ text }) => {
        return {
          text: `Extracted deal terms from input. Claude will now interpret:
${text}`
        };
      }
    },

    // -------------------------------------------------------
    // 2. Contract Risk Flags
    // -------------------------------------------------------
    flag_risks: {
      description: "Identify legal, commercial, and operational risks in agreements, drafts, emails, or proposals.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string" }
        },
        required: ["text"]
      },
      execute: async ({ text }) => {
        return {
          text: `Risk analysis requested. Claude will now flag governance, legal, commercial, and IP risks for:
${text}`
        };
      }
    },

    // -------------------------------------------------------
    // 3. Create Financial Model Summary
    // -------------------------------------------------------
    finance_summary: {
      description: "Summarise budgets, waterfalls, TTR, GP structures, instalments, or other financial models.",
      inputSchema: {
        type: "object",
        properties: {
          input: { type: "string" }
        },
        required: ["input"]
      },
      execute: async ({ input }) => {
        return {
          text: `Financial modelling summary requested for:
${input}`
        };
      }
    },

    // -------------------------------------------------------
    // 4. Extract Tasks From Emails or Meeting Notes
    // -------------------------------------------------------
    extract_tasks: {
      description: "Turn transcripts, emails, chats, or notes into a clear list of tasks with dates, owners, and deadlines.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string" }
        },
        required: ["text"]
      },
      execute: async ({ text }) => {
        return {
          text: `Task extraction requested. Claude will convert this to actionable items:
${text}`
        };
      }
    },

    // -------------------------------------------------------
    // 5. IP Licensing Breakdown
    // -------------------------------------------------------
    ip_structure: {
      description: "Produce a structured summary of rights, restrictions, terms, and strategic considerations for IP deals.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string" }
        },
        required: ["text"]
      },
      execute: async ({ text }) => {
        return {
          text: `IP licensing interpretation requested for:
${text}`
        };
      }
    },

    // -------------------------------------------------------
    // 6. Email → Executive Summary
    // -------------------------------------------------------
    summarise_email: {
      description: "Summarise long emails into clear, actionable executive-level briefs.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string" }
        },
        required: ["text"]
      },
      execute: async ({ text }) => {
        return {
          text: `Email summary requested. Claude will now summarise:
${text}`
        };
      }
    },

    // -------------------------------------------------------
    // 7. Draft Clause Generator
    // -------------------------------------------------------
    draft_clause: {
      description: "Draft concise, legally coherent clauses based on user instructions.",
      inputSchema: {
        type: "object",
        properties: {
          instruction: { type: "string" }
        },
        required: ["instruction"]
      },
      execute: async ({ instruction }) => {
        return {
          text: `Clause drafting requested based on instruction:
${instruction}`
        };
      }
    },

    // -------------------------------------------------------
    // 8. Deadline Extraction & Calendar Logic
    // -------------------------------------------------------
    extract_dates: {
      description: "Extract deadlines, dates, and obligations from any text.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string" }
        },
        required: ["text"]
      },
      execute: async ({ text }) => {
        return {
          text: `Date and deadline extraction requested for:
${text}`
        };
      }
    }

  }
});

// Start the server
server.start();
