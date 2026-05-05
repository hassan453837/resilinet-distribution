require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const supabase = require('./supabase');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let incidents = [];
let nodes = [];
let tacticalMessages = [];
let nodeHeartbeats = {};
let socketNodeMap = {};

async function loadIncidents() {
  const { data, error } = await supabase.from('incidents').select('*');
  if (error) {
    console.error('Failed to load incidents from Supabase:', error.message);
    incidents = [];
    return;
  }
  incidents = (data || []).map(mapIncidentRecord);
}

async function loadNodes() {
  const { data, error } = await supabase.from('nodes').select('*');
  if (error) {
    console.error('Failed to load nodes from Supabase:', error.message);
    nodes = [];
    return;
  }
  nodes = (data || []).map(mapNodeRecord);
}

async function loadMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('id, created_at, sender_id, recipient_id, content, type')
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) {
    console.error('Failed to load messages from Supabase:', error.message);
    tacticalMessages = [];
    return;
  }

  tacticalMessages = data || [];
}

function mapNodeRecord(node) {
  if (!node) return null;
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    status: node.status || 'offline',
    location: {
      lat: node.location_lat ?? 0,
      lng: node.location_lng ?? 0,
      address: node.location_address || ''
    },
    resources: node.resources || {},
    lastHeartbeat: node.last_heartbeat ?? 0
  };
}

function updateNodeCache(updatedNode) {
  if (!updatedNode || !updatedNode.id) return;
  nodes = [updatedNode, ...nodes.filter((node) => node.id !== updatedNode.id)];
}

function getNodeById(nodeId) {
  return nodes.find((node) => node.id === nodeId);
}

function mapIncidentRecord(incident) {
  if (!incident) return null;
  return {
    id: incident.id,
    title: incident.title,
    description: incident.description,
    severity: incident.severity,
    type: incident.type,
    status: incident.status,
    location: {
      lat: incident.location_lat ?? 0,
      lng: incident.location_lng ?? 0,
      address: incident.location_address || ''
    },
    createdAt: incident.created_at,
    assignedNodeId: incident.assigned_node_id,
    resolvedAt: incident.resolved_at,
    resolutionNote: incident.resolution_note
  };
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

app.post('/api/signup', async (req, res) => {
  const { email, password, role, node_id } = req.body || {};

  if (!email || !password || !role || !node_id) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  if (!nodes.length) {
    await loadNodes();
  }
  const node = getNodeById(node_id);
  const organization_name = node?.name;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert({ email, password: passwordHash, role, node_id, organization_name })
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ user: sanitizeUser(data) });
  } catch (err) {
    console.error('Signup failed:', err);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const passwordMatches = await bcrypt.compare(password, data.password || '');
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (data.node_id) {
      const now = Date.now();
      const { data: nodeData, error: nodeError } = await supabase
        .from('nodes')
        .update({ status: 'online', last_heartbeat: now })
        .eq('id', data.node_id)
        .select('*')
        .single();

      if (nodeError) {
        console.error('Failed to update node status:', nodeError.message);
        return res.status(500).json({ error: 'Failed to update node status.' });
      }

      if (nodeData) {
        const mappedNode = mapNodeRecord(nodeData);
        if (mappedNode) {
          updateNodeCache(mappedNode);
          nodeHeartbeats[data.node_id] = now;
          io.emit('node-online', mappedNode);
        }
      }
    }

    return res.json({ user: sanitizeUser(data) });
  } catch (err) {
    console.error('Login failed:', err);
    return res.status(500).json({ error: 'Failed to login.' });
  }
});

app.post('/api/logout', async (req, res) => {
  const { node_id } = req.body || {};

  if (!node_id) {
    return res.status(400).json({ error: 'Node id is required.' });
  }

  const { data, error } = await supabase
    .from('nodes')
    .update({ status: 'offline' })
    .eq('id', node_id)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to update node status:', error.message);
    return res.status(500).json({ error: 'Failed to update node status.' });
  }

  if (data) {
    const mappedNode = mapNodeRecord(data);
    if (mappedNode) {
      updateNodeCache(mappedNode);
      io.emit('node-offline', mappedNode);
    }
  }

  delete nodeHeartbeats[node_id];
  return res.json({ ok: true });
});

app.post('/api/messages', async (req, res) => {
  const { sender_id, recipient_id = null, content, type } = req.body || {};

  if (!sender_id || !content || !type) {
    return res.status(400).json({ error: 'Missing required message fields.' });
  }

  const payload = {
    sender_id,
    recipient_id,
    content,
    type,
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(payload)
    .select('id, created_at, sender_id, recipient_id, content, type')
    .single();

  if (error) {
    console.error('Failed to save tactical message:', error.message);

    const fallbackMessage = {
      id: `MSG-${Date.now()}`,
      created_at: new Date().toISOString(),
      sender_id,
      recipient_id,
      content,
      type,
    };

    tacticalMessages = [...tacticalMessages, fallbackMessage];
    io.emit('tactical-message', fallbackMessage);
    return res.status(202).json({ ok: true, message: fallbackMessage, warning: error.message });
  }

  const savedMessage = data || payload;
  tacticalMessages = [...tacticalMessages, savedMessage];
  io.emit('tactical-message', savedMessage);
  return res.status(201).json({ ok: true, message: savedMessage });
});

app.get('/api/nodes', async (_req, res) => {
  if (!nodes.length) {
    await loadNodes();
  }
  return res.json({ nodes });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('init', incidents.filter(Boolean));
  socket.emit('init-nodes', nodes);
  socket.emit('tactical-message-init', tacticalMessages);

  socket.on('register-node', ({ nodeId }) => {
    if (nodeId) {
      socket.data.nodeId = nodeId;
      socketNodeMap[socket.id] = nodeId;
    }
  });

  socket.on('add-incident', async (incident) => {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        type: incident.type,
        status: incident.status,
        location_lat: incident.location?.lat,
        location_lng: incident.location?.lng,
        location_address: incident.location?.address,
        created_at: incident.createdAt,
        assigned_node_id: incident.assignedNodeId,
        resolved_at: incident.resolvedAt,
        resolution_note: incident.resolutionNote
      })
      .select('*')
      .single();

    if (error) {
      console.error('Failed to save incident:', error.message);
      return;
    }

    const savedIncident = data ? mapIncidentRecord(data) : incident;
    if (savedIncident) {
      incidents = [savedIncident, ...incidents.filter(i => i.id !== savedIncident.id)];
      io.emit('add-incident', savedIncident);
      console.log('Incident broadcast:', savedIncident.id);
    }
  });

  socket.on('resolve-incident', async (id) => {
    const { error } = await supabase
      .from('incidents')
      .update({ status: 'resolved' })
      .eq('id', id);

    if (error) {
      console.error('Failed to resolve incident:', error.message);
      return;
    }

    incidents = incidents.map(i => i.id === id ? { ...i, status: 'resolved' } : i);
    io.emit('resolve-incident', id);
  });

  socket.on('heartbeat', ({ nodeId }) => {
    if (!nodeId) return;
    const now = Date.now();
    nodeHeartbeats[nodeId] = now;
    const node = getNodeById(nodeId);
    if (node) {
      const updatedNode = { ...node, status: 'online', last_heartbeat: now };
      updateNodeCache(updatedNode);
      io.emit('node-online', updatedNode);
    }
  });

  socket.on('node-offline', ({ nodeId }) => {
    if (!nodeId) return;
    const node = getNodeById(nodeId);
    if (node) {
      const updatedNode = { ...node, status: 'offline' };
      updateNodeCache(updatedNode);
      io.emit('node-offline', updatedNode);
    }
    delete nodeHeartbeats[nodeId];
  });

  socket.on('tactical-message', async (message, ack) => {
    const { sender_id, recipient_id = null, content, type } = message || {};

    if (!sender_id || !content || !type) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Missing required message fields.' });
      return;
    }

    const payload = {
      sender_id,
      recipient_id,
      content,
      type,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(payload)
      .select('id, created_at, sender_id, recipient_id, content, type')
      .single();

    if (error) {
      console.error('Failed to save tactical message:', error.message);

      const fallbackMessage = {
        id: `MSG-${Date.now()}`,
        created_at: new Date().toISOString(),
        sender_id,
        recipient_id,
        content,
        type,
      };

      tacticalMessages = [...tacticalMessages, fallbackMessage];
      io.emit('tactical-message', fallbackMessage);
      if (typeof ack === 'function') ack({ ok: true, message: fallbackMessage, warning: error.message });
      return;
    }

    const savedMessage = data || payload;
    tacticalMessages = [...tacticalMessages, savedMessage];
    io.emit('tactical-message', savedMessage);
    if (typeof ack === 'function') ack({ ok: true, message: savedMessage });
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    const nodeId = socketNodeMap[socket.id] || socket.data.nodeId;
    if (nodeId) {
      const { data, error } = await supabase
        .from('nodes')
        .update({ status: 'offline' })
        .eq('id', nodeId)
        .select('*')
        .single();

      if (error) {
        console.error('Failed to update node status on disconnect:', error.message);
      } else if (data) {
        const mappedNode = mapNodeRecord(data);
        if (mappedNode) {
          updateNodeCache(mappedNode);
          io.emit('node-offline', mappedNode);
        }
      }

      delete nodeHeartbeats[nodeId];
      delete socketNodeMap[socket.id];
    }
  });
});

setInterval(() => {
  const now = Date.now();
  Object.keys(nodeHeartbeats).forEach((nodeId) => {
    if (now - nodeHeartbeats[nodeId] > 5000) {
      console.log(`Node offline: ${nodeId}`);
      const node = getNodeById(nodeId);
      if (node) {
        const updatedNode = { ...node, status: 'offline' };
        updateNodeCache(updatedNode);
        io.emit('node-offline', updatedNode);
      }
      delete nodeHeartbeats[nodeId];
    }
  });
}, 3000);

async function startServer() {
  await loadIncidents();
  await loadNodes();
  await loadMessages();
  server.listen(3001, () => console.log('Hub server running on port 3001'));
}

startServer();
