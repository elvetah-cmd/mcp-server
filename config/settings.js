// ============================================
// CONFIGURATION SETTINGS
// ============================================

/**
 * Application configuration
 */
export const config = {
  // Server settings
  server: {
    name: 'Business Affairs Workflow Assistant',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },

  // MCP settings
  mcp: {
    serverName: 'business-affairs-mcp',
    serverVersion: '1.0.0',
    protocolVersion: '2024-11-05'
  },

  // Feature flags
  features: {
    emailIntegration: process.env.ENABLE_EMAIL === 'true',
    gdriveIntegration: process.env.ENABLE_GDRIVE === 'true',
    webhooks: process.env.ENABLE_WEBHOOKS === 'true'
  },

  // Email integration (Gmail API)
  email: {
    provider: process.env.EMAIL_PROVIDER || 'gmail', // 'gmail' or 'outlook'
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    redirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send'
    ]
  },

  // Google Drive integration
  gdrive: {
    clientId: process.env.GDRIVE_CLIENT_ID,
    clientSecret: process.env.GDRIVE_CLIENT_SECRET,
    redirectUri: process.env.GDRIVE_REDIRECT_URI || 'http://localhost:3000/oauth/gdrive/callback',
    refreshToken: process.env.GDRIVE_REFRESH_TOKEN,
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file'
    ]
  },

  // Microsoft Outlook integration (alternative to Gmail)
  outlook: {
    clientId: process.env.OUTLOOK_CLIENT_ID,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    tenantId: process.env.OUTLOOK_TENANT_ID,
    redirectUri: process.env.OUTLOOK_REDIRECT_URI || 'http://localhost:3000/oauth/outlook/callback'
  },

  // Business rules
  business: {
    // Default currency for financial operations
    defaultCurrency: 'USD',

    // Risk analysis thresholds
    riskThresholds: {
      critical: 25,
      high: 15,
      medium: 5
    },

    // Budget variance alert threshold (percentage)
    budgetAlertThreshold: 10,

    // Deadline reminder settings (days ahead)
    deadlineReminders: {
      urgent: 1,   // Remind 1 day before
      warning: 3,  // Remind 3 days before
      notice: 7    // Remind 7 days before
    },

    // Auto-categorization keywords
    contractKeywords: {
      production: ['production agreement', 'production contract', 'filming'],
      distribution: ['distribution', 'theatrical', 'streaming'],
      licensing: ['license', 'rights', 'territory'],
      talent: ['talent', 'actor', 'director', 'cast'],
      vendor: ['vendor', 'supplier', 'service provider']
    }
  },

  // Formatting preferences
  formatting: {
    dateFormat: 'YYYY-MM-DD',
    currencyFormat: 'en-US',
    timezone: process.env.TZ || 'UTC'
  },

  // Security settings
  security: {
    // Enable data encryption at rest
    encryptData: process.env.ENCRYPT_DATA === 'true',

    // Session timeout (milliseconds)
    sessionTimeout: 3600000, // 1 hour

    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    destination: process.env.LOG_FILE || 'logs/app.log'
  },

  // Webhook settings
  webhooks: {
    secret: process.env.WEBHOOK_SECRET,
    endpoints: {
      slack: process.env.SLACK_WEBHOOK_URL,
      teams: process.env.TEAMS_WEBHOOK_URL
    }
  },

  // AI/LLM settings (for future enhancements)
  ai: {
    provider: process.env.AI_PROVIDER || 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.AI_MODEL || 'claude-3-sonnet-20240229',
    maxTokens: 4096
  }
};

/**
 * Validate configuration
 */
export function validateConfig() {
  const errors = [];

  // Check email integration if enabled
  if (config.features.emailIntegration) {
    if (config.email.provider === 'gmail' && !config.email.clientId) {
      errors.push('Gmail integration enabled but GMAIL_CLIENT_ID not set');
    }
  }

  // Check Drive integration if enabled
  if (config.features.gdriveIntegration) {
    if (!config.gdrive.clientId) {
      errors.push('Google Drive integration enabled but GDRIVE_CLIENT_ID not set');
    }
  }

  if (errors.length > 0) {
    console.warn('Configuration warnings:', errors);
  }

  return errors.length === 0;
}

/**
 * Get configuration value by path
 */
export function getConfig(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], config);
}

export default config;
