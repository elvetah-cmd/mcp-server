// ============================================
// ROUTES - HTTP Endpoints (Optional)
// ============================================

/**
 * Optional Express routes for REST API access
 * These complement the MCP server functionality
 */

import { contextManager } from '../lib/context-manager.js';

/**
 * Health check endpoint
 */
export function healthCheck(req, res) {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Business Affairs Workflow Assistant',
    version: '1.0.0'
  });
}

/**
 * Get dashboard data
 */
export function getDashboard(req, res) {
  try {
    const dashboard = contextManager.getDashboard();
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all projects
 */
export function getProjects(req, res) {
  try {
    const projects = contextManager.getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get specific project
 */
export function getProject(req, res) {
  try {
    const { projectId } = req.params;
    const project = contextManager.getProject(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get upcoming deadlines
 */
export function getDeadlines(req, res) {
  try {
    const daysAhead = parseInt(req.query.days) || 30;
    const deadlines = contextManager.getUpcomingDeadlines(daysAhead);
    res.json(deadlines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get overdue items
 */
export function getOverdue(req, res) {
  try {
    const overdue = contextManager.getOverdueDeadlines();
    res.json(overdue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get active issues
 */
export function getActiveIssues(req, res) {
  try {
    const issues = contextManager.getActiveIssues();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Search across projects
 */
export function search(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = contextManager.search(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Setup Express routes
 */
export function setupRoutes(app) {
  // Health check
  app.get('/health', healthCheck);

  // Dashboard
  app.get('/api/dashboard', getDashboard);

  // Projects
  app.get('/api/projects', getProjects);
  app.get('/api/projects/:projectId', getProject);

  // Deadlines
  app.get('/api/deadlines', getDeadlines);
  app.get('/api/overdue', getOverdue);

  // Issues
  app.get('/api/issues', getActiveIssues);

  // Search
  app.get('/api/search', search);

  console.log('✓ HTTP routes configured');
}

export default {
  setupRoutes,
  healthCheck,
  getDashboard,
  getProjects,
  getProject,
  getDeadlines,
  getOverdue,
  getActiveIssues,
  search
};
