const Agent = require('../models/agent');
const { generateAgentId } = require('../utils/uuidGenerator');

async function registerAgent(req, res) {
  try {
    const { user_id, name, endpoint_url, version } = req.body;
    if (!user_id || !name || !endpoint_url) {
      return res.status(400).json({ error: 'user_id, name, and endpoint_url are required' });
    }
    const id = generateAgentId();
    const agent = await Agent.create({ id, user_id, name, endpoint_url, version });
    res.status(201).json(agent);
  } catch (err) {
    console.error('registerAgent error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function listAgents(req, res) {
  try {
    const agents = await Agent.findAll();
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAgent(req, res) {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { registerAgent, listAgents, getAgent };
