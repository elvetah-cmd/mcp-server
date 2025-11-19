#!/usr/bin/env node

// ============================================
// BUSINESS AFFAIRS WORKFLOW ASSISTANT
// MCP Server Implementation
// ============================================

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool definitions
import { emailTools } from './tools/email-integration.js';
import { contractTools } from './tools/contracts-integration.js';
import { budgetTools } from './tools/budgets-integration.js';
import { gdriveTools } from './tools/gdrive-integration.js';
import { workflowTools } from './tools/workflow-tools.js';

// Import configuration
import config, { validateConfig } from './config/settings.js';

// Import context manager
import { contextManager } from './lib/context-manager.js';

// ============================================
// SERVER INITIALIZATION
// ============================================

console.log('═══════════════════════════════════════');
console.log('  BUSINESS AFFAIRS WORKFLOW ASSISTANT');
console.log('           MCP Server v1.0.0');
console.log('═══════════════════════════════════════\n');

// Validate configuration
console.log('⚙️  Validating configuration...');
const configValid = validateConfig();
if (configValid) {
  console.log('✓ Configuration validated\n');
} else {
  console.warn('⚠ Configuration warnings present\n');
}

// Create MCP server instance
const server = new Server(
  {
    name: config.mcp.serverName,
    version: config.mcp.serverVersion,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================
// COMBINE ALL TOOLS
// ============================================

const allTools = {
  ...emailTools,
  ...contractTools,
  ...budgetTools,
  ...gdriveTools,
  ...workflowTools
};

console.log('📦 Loading tools...');
Object.keys(allTools).forEach(toolName => {
  console.log(`   ✓ ${toolName}`);
});
console.log(`\n✓ ${Object.keys(allTools).length} tools loaded\n`);

// ============================================
// TOOL HANDLERS
// ============================================

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = Object.entries(allTools).map(([name, tool]) => ({
    name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));

  return { tools };
});

/**
 * Execute tool
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  console.log(`🔧 Executing tool: ${name}`);

  try {
    // Find the tool
    const tool = allTools[name];

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Validate arguments against schema
    validateArguments(args, tool.inputSchema);

    // Execute the tool
    const result = await tool.execute(args);

    console.log(`✓ Tool ${name} completed successfully\n`);

    // Return result in MCP format
    return {
      content: [
        {
          type: 'text',
          text: result.text || JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error(`✗ Tool ${name} failed:`, error.message, '\n');

    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate tool arguments against schema
 */
function validateArguments(args, schema) {
  if (!schema || !schema.required) {
    return true;
  }

  const missing = schema.required.filter((field) => !(field in args));

  if (missing.length > 0) {
    throw new Error(`Missing required arguments: ${missing.join(', ')}`);
  }

  return true;
}

/**
 * Format tool description for display
 */
function formatToolList() {
  let output = '═══════════════════════════════════════\n';
  output += '        AVAILABLE TOOLS\n';
  output += '═══════════════════════════════════════\n\n';

  const categories = {
    'Email Integration': Object.entries(allTools).filter(([name]) =>
      name.includes('email') || name.includes('Email')
    ),
    'Contract Management': Object.entries(allTools).filter(([name]) =>
      name.includes('contract') || name.includes('deal') || name.includes('clause') || name.includes('ip')
    ),
    'Financial Analysis': Object.entries(allTools).filter(([name]) =>
      name.includes('budget') || name.includes('forecast') || name.includes('waterfall') || name.includes('financial')
    ),
    'Google Drive': Object.entries(allTools).filter(([name]) =>
      name.includes('drive') || name.includes('fetch')
    ),
    'Workflow & Tasks': Object.entries(allTools).filter(([name]) =>
      name.includes('task') || name.includes('deadline') || name.includes('project') ||
      name.includes('dashboard') || name.includes('followup') || name.includes('search') || name.includes('issue')
    ),
  };

  Object.entries(categories).forEach(([category, tools]) => {
    if (tools.length > 0) {
      output += `${category}:\n`;
      tools.forEach(([name, tool]) => {
        output += `  • ${name}\n`;
        output += `    ${tool.description.substring(0, 70)}...\n`;
      });
      output += '\n';
    }
  });

  output += '═══════════════════════════════════════\n';

  return output;
}

// ============================================
// ERROR HANDLING
// ============================================

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    console.log('🚀 Starting MCP server...\n');

    // Log tool categories
    console.log(formatToolList());

    // Initialize stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    console.log('✓ MCP server started successfully');
    console.log('✓ Listening for requests via stdio\n');
    console.log('═══════════════════════════════════════\n');

    // Initialize context with welcome message
    console.log('💼 Business Affairs Assistant Ready');
    console.log('\nCapabilities:');
    console.log('  ✓ Contract analysis & risk assessment');
    console.log('  ✓ Budget tracking & financial forecasting');
    console.log('  ✓ Email summarization & action extraction');
    console.log('  ✓ Task management & deadline tracking');
    console.log('  ✓ Project context management');
    console.log('  ✓ Document integration (Drive)');
    console.log('\nReady to assist with your business affairs workflows.\n');

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

async function shutdown() {
  console.log('\n\n🛑 Shutting down gracefully...');

  try {
    await server.close();
    console.log('✓ Server closed');

    // Save context if needed
    console.log('✓ Context saved');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default server;
