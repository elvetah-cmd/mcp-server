# Business Affairs Workflow Assistant - MCP Server

A comprehensive Model Context Protocol (MCP) server designed specifically for business affairs professionals in media, entertainment, and production industries. This intelligent assistant integrates your data sources, provides workflow support, automates tasks, and maintains project context while communicating like an experienced business affairs executive.

## 🎯 Features

### Data Integration & Cross-Referencing
- **Contracts**: Parse and analyze deal terms, IP rights, and legal provisions
- **Budgets**: Track spending, forecast costs, analyze variance
- **Emails**: Summarize correspondence, extract action items
- **Transcripts**: Process meeting notes, identify commitments
- **Google Drive**: Sync documents and folders (integration ready)

### Intelligent Workflow Support
- **Drafting**: Generate legal clauses, email responses, contract summaries
- **Risk Analysis**: Identify legal, commercial, financial, and operational risks
- **Deal Structuring**: Analyze deal components, calculate valuations, model waterfalls
- **Summarization**: Create executive briefs from complex documents
- **Follow-ups**: Track action items, deadlines, and commitments

### Proactive Automation
- **Task Extraction**: Automatically identify and categorize tasks
- **Deadline Tracking**: Monitor and alert on upcoming/overdue items
- **Risk Monitoring**: Flag high-priority issues requiring attention
- **Project Context**: Maintain comprehensive project histories
- **Smart Reminders**: Contextual alerts for critical dates and risks

### Professional Standards
- Commercially structured outputs
- Legally coherent language
- Concise, actionable formatting
- Industry-standard terminology
- Business affairs executive tone

## 📁 Project Structure

```
mcp-server/
├── server.js                 # Main MCP server
├── package.json             # Dependencies and scripts
├── README.md               # This file
├── config/
│   └── settings.js         # Configuration
├── lib/
│   ├── parsers.js          # Document parsing utilities
│   ├── formatters.js       # Professional output formatting
│   ├── validators.js       # Data validation
│   ├── risk-analyzer.js    # Risk identification engine
│   └── context-manager.js  # Project context management
├── tools/
│   ├── email-integration.js      # Email tools
│   ├── contracts-integration.js  # Contract analysis tools
│   ├── budgets-integration.js    # Financial tools
│   ├── gdrive-integration.js     # Google Drive integration
│   └── workflow-tools.js         # Task & project management
└── routes/
    └── index.js            # Optional HTTP endpoints
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone or download this repository**

```bash
cd /home/user/mcp-server
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure (optional)**

Create a `.env` file for optional integrations:

```bash
# Email Integration (Gmail)
ENABLE_EMAIL=true
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token

# Google Drive Integration
ENABLE_GDRIVE=true
GDRIVE_CLIENT_ID=your_client_id
GDRIVE_CLIENT_SECRET=your_client_secret
GDRIVE_REFRESH_TOKEN=your_refresh_token

# Optional: Microsoft Outlook
OUTLOOK_CLIENT_ID=your_client_id
OUTLOOK_CLIENT_SECRET=your_client_secret
OUTLOOK_TENANT_ID=your_tenant_id
```

4. **Start the server**

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

## 🔧 Available Tools

### Contract Management

- `extract_deal_terms` - Extract structured deal parameters from contracts
- `flag_contract_risks` - Identify legal, commercial, and financial risks
- `draft_clause` - Generate legal clauses (confidentiality, indemnity, etc.)
- `compare_contract_versions` - Compare and highlight differences
- `extract_ip_rights` - Analyze IP ownership and licensing terms
- `generate_contract_checklist` - Create due diligence checklists

### Financial Analysis

- `analyze_budget` - Parse and analyze budget documents
- `compare_budget_actual` - Variance analysis with alerts
- `generate_forecast` - Financial projections based on burn rate
- `analyze_waterfall` - Revenue distribution modeling
- `calculate_deal_value` - Scenario-based deal valuations
- `import_budget_file` - Import CSV/Excel budgets (integration ready)

### Email Integration

- `fetch_emails` - Retrieve emails from inbox (integration ready)
- `summarize_email` - Generate executive briefs with action items
- `draft_email_response` - Create professional responses
- `extract_email_actions` - Identify tasks and commitments

### Google Drive

- `list_drive_files` - List files from folders
- `fetch_drive_document` - Download and parse documents
- `upload_to_drive` - Upload generated reports
- `search_drive` - Search for documents
- `sync_project_folder` - Sync entire project folders
- `watch_drive_folder` - Monitor for changes (webhook ready)

### Workflow & Task Management

- `extract_tasks` - Convert any text into actionable tasks
- `check_deadlines` - Review upcoming and overdue deadlines
- `get_dashboard` - Comprehensive project overview
- `track_issue` - Log and monitor issues/risks
- `generate_followups` - Create follow-up lists
- `create_project` - Initialize new project
- `get_project_summary` - Detailed project status
- `search_projects` - Search across all projects

## 💼 Usage Examples

### Analyze a Contract

```javascript
// Through MCP client (e.g., Claude Desktop)
"Extract deal terms from this contract: [contract text]"
```

The server will:
1. Parse parties, financials, dates, deliverables
2. Validate completeness
3. Identify any gaps
4. Format as executive summary

### Risk Assessment

```javascript
"Flag risks in this agreement: [contract text]"
```

Returns:
- Categorized risks (legal, commercial, financial, operational)
- Severity levels (critical, high, medium, low)
- Recommended mitigations
- Overall risk score

### Budget Tracking

```javascript
"Compare this budget vs actual spending: [budget data] [actual data]"
```

Provides:
- Line-by-line variance analysis
- Alert thresholds
- Spending patterns
- Recommendations

### Task Management

```javascript
"Extract tasks from this meeting: [transcript]"
```

Automatically:
- Identifies action items
- Assigns priorities
- Extracts deadlines
- Determines assignees
- Stores in project context

## 🔗 Integration Setup

### Gmail API

1. Enable Gmail API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add credentials to `.env` file
4. Run OAuth flow to get refresh token

### Google Drive API

1. Enable Google Drive API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Configure redirect URIs
4. Store credentials in `.env`

### Microsoft Outlook (Alternative)

1. Register app in Azure Portal
2. Configure Microsoft Graph API permissions
3. Add credentials to `.env`

## 📊 Project Context Management

The server maintains comprehensive project context including:

- **Documents**: All uploaded contracts, budgets, emails
- **Tasks**: Action items with status tracking
- **Risks**: Identified issues and their mitigation status
- **Deadlines**: All commitments and their due dates
- **Stakeholders**: Project participants and their roles
- **Notes**: Running commentary and decisions
- **Timeline**: Key milestones and dates
- **Financials**: Budget allocations and spending

### Creating a Project

```javascript
{
  "name": "Feature Film Production Deal",
  "description": "Production agreement for feature film",
  "stakeholders": ["Producer", "Director", "Studio"],
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

### Querying Context

```javascript
// Get dashboard
"Show me my dashboard"

// Project summary
"Summarize project [project-id]"

// Search
"Find all contracts mentioning 'termination'"

// Check deadlines
"What deadlines are coming up this week?"
```

## 🎨 Output Formatting

All outputs follow professional business affairs standards:

- **Executive Summaries**: Concise, bullet-pointed key takeaways
- **Risk Reports**: Categorized by severity with actionable mitigations
- **Financial Analysis**: Clear numerical presentation with variance highlights
- **Task Lists**: Prioritized with deadlines and assignees
- **Legal Drafting**: Proper clause structure with jurisdiction notes

## ⚙️ Configuration

Edit `config/settings.js` to customize:

- Default currency and date formats
- Risk threshold levels
- Budget alert percentages
- Deadline reminder intervals
- Contract categorization keywords
- Security settings
- Logging preferences

## 🧪 Testing

```bash
# Run validation
npm run validate

# Test configuration
node -e "import('./config/settings.js').then(m => console.log(m.config))"
```

## 🔒 Security

- Credentials stored in environment variables
- Optional data encryption at rest
- Session timeouts
- Rate limiting support
- Audit logging

## 📝 Best Practices

1. **Create Projects**: Organize work by creating dedicated projects
2. **Link Documents**: Always associate documents with projects for context
3. **Regular Reviews**: Check dashboard and deadlines daily
4. **Risk Tracking**: Flag and monitor all identified risks
5. **Task Updates**: Mark tasks complete as you finish them
6. **Context Notes**: Add notes to projects for institutional memory

## 🛠️ Development

### Adding New Tools

1. Create tool definition in appropriate file under `tools/`
2. Export from the module
3. Tools are automatically loaded by `server.js`

Example:

```javascript
export const myTools = {
  my_new_tool: {
    description: 'What this tool does',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string' }
      },
      required: ['input']
    },
    execute: async ({ input }) => {
      // Implementation
      return { text: 'Result' };
    }
  }
};
```

### Extending Context Manager

The `ContextManager` class in `lib/context-manager.js` can be extended with additional methods for custom project data structures.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues, questions, or feature requests:
- GitHub Issues: [Create an issue](https://github.com/your-org/business-affairs-mcp/issues)
- Documentation: See inline code comments
- Examples: Check `examples/` directory (coming soon)

## 🗺️ Roadmap

- [ ] Complete Gmail/Outlook integration
- [ ] Complete Google Drive integration
- [ ] Add Slack notifications
- [ ] Implement data persistence (database)
- [ ] Add authentication layer
- [ ] Create web dashboard
- [ ] Export reports to PDF
- [ ] Template library for common clauses
- [ ] AI-powered clause generation
- [ ] Multi-language support

## 🙏 Acknowledgments

Built with:
- [Model Context Protocol SDK](https://github.com/anthropics/anthropic-mcp)
- Node.js ecosystem
- Inspired by business affairs professionals everywhere

---

**Ready to transform your business affairs workflow!** 🚀

For questions or support, contact your development team or open an issue on GitHub.
