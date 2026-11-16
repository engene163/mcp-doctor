'use strict';
const fs = require('fs'), os = require('os'), path = require('path');

const TARGETS = [
  path.join(os.homedir(), '.claude.json'),
  path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json'),
  path.join(os.homedir(), '.cursor', 'mcp.json'),
  path.join(os.homedir(), '.vscode', 'mcp.json'),
];

module.exports = function diagnose() {
  const out = [];
  for (const f of TARGETS) {
    try {
      if (!fs.existsSync(f)) { out.push({ f, state: 'missing' }); continue; }
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      const srv = j.mcpServers || {};
      const names = Object.keys(srv);
      if (!names.length) { out.push({ f, state: 'empty' }); continue; }
      const broken = names.filter(n => !srv[n] || !srv[n].command);
      out.push({ f, state: broken.length ? 'broken' : 'ok', broken });
    } catch { out.push({ f, state: 'invalid' }); }
  }
  return out;
};
