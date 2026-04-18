/**
 * ISP Manager - Backend Proxy Server
 * Handles MikroTik RouterOS API and OLT HTTP connections
 * Runs inside Docker, proxied by Nginx at /api/*
 */

import express from "express";
import cors from "cors";
import { RouterOSAPI } from "node-routeros";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(cors({ 
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "isp-proxy", time: new Date().toISOString() });
});

// ─── MikroTik API ─────────────────────────────────────────────────────────────

/**
 * Test MikroTik connection
 * POST /api/mikrotik/test
 * Body: { host, port, username, password, use_ssl }
 */
app.post("/api/mikrotik/test", async (req, res) => {
  const { host, port = 8728, username, password, use_ssl = false } = req.body;
  if (!host || !username || !password) {
    return res.status(400).json({ success: false, error: "host, username, password required" });
  }

  const conn = new RouterOSAPI({
    host,
    port: Number(port),
    user: username,
    password,
    tls: use_ssl,
    timeout: 8,
  });

  try {
    await conn.connect();
    const identity = await conn.write("/system/identity/print");
    const resource = await conn.write("/system/resource/print");
    await conn.close();
    res.json({
      success: true,
      message: `Connected to ${identity[0]?.name || host}`,
      data: {
        identity: identity[0]?.name,
        version: resource[0]?.version,
        board: resource[0]?.["board-name"],
        uptime: resource[0]?.uptime,
        cpu_load: resource[0]?.["cpu-load"],
        free_memory: resource[0]?.["free-memory"],
        total_memory: resource[0]?.["total-memory"],
      },
    });
  } catch (err) {
    await conn.close().catch(() => {});
    res.status(502).json({ success: false, error: err.message || "Connection failed" });
  }
});

/**
 * Get all PPP secrets (customers)
 * POST /api/mikrotik/ppp/secrets
 */
app.post("/api/mikrotik/ppp/secrets", async (req, res) => {
  const { host, port = 8728, username, password, use_ssl = false } = req.body;
  const conn = new RouterOSAPI({ host, port: Number(port), user: username, password, tls: use_ssl, timeout: 10 });
  try {
    await conn.connect();
    const secrets = await conn.write("/ppp/secret/print");
    await conn.close();
    res.json({ success: true, data: secrets });
  } catch (err) {
    await conn.close().catch(() => {});
    res.status(502).json({ success: false, error: err.message });
  }
});

/**
 * Get active PPP connections
 * POST /api/mikrotik/ppp/active
 */
app.post("/api/mikrotik/ppp/active", async (req, res) => {
  const { host, port = 8728, username, password, use_ssl = false } = req.body;
  const conn = new RouterOSAPI({ host, port: Number(port), user: username, password, tls: use_ssl, timeout: 10 });
  try {
    await conn.connect();
    const active = await conn.write("/ppp/active/print");
    await conn.close();
    res.json({ success: true, data: active });
  } catch (err) {
    await conn.close().catch(() => {});
    res.status(502).json({ success: false, error: err.message });
  }
});

/**
 * Enable/disable PPP user
 * POST /api/mikrotik/ppp/enable  or  /api/mikrotik/ppp/disable
 * Body: { host, port, username, password, ppp_username }
 */
app.post("/api/mikrotik/ppp/:action(enable|disable)", async (req, res) => {
  const { host, port = 8728, username, password, use_ssl = false, ppp_username } = req.body;
  const { action } = req.params;
  if (!ppp_username) return res.status(400).json({ success: false, error: "ppp_username required" });

  const conn = new RouterOSAPI({ host, port: Number(port), user: username, password, tls: use_ssl, timeout: 10 });
  try {
    await conn.connect();
    // Find the secret by name
    const secrets = await conn.write("/ppp/secret/print", [`?name=${ppp_username}`]);
    if (!secrets.length) {
      await conn.close();
      return res.status(404).json({ success: false, error: `PPP user '${ppp_username}' not found` });
    }
    const id = secrets[0][".id"];
    if (action === "disable") {
      await conn.write("/ppp/secret/disable", [`=.id=${id}`]);
    } else {
      await conn.write("/ppp/secret/enable", [`=.id=${id}`]);
    }
    await conn.close();
    res.json({ success: true, message: `User '${ppp_username}' ${action}d` });
  } catch (err) {
    await conn.close().catch(() => {});
    res.status(502).json({ success: false, error: err.message });
  }
});

/**
 * Update PPP user speed profile
 * POST /api/mikrotik/ppp/update-speed
 * Body: { host, port, username, password, ppp_username, profile }
 */
app.post("/api/mikrotik/ppp/update-speed", async (req, res) => {
  const { host, port = 8728, username, password, use_ssl = false, ppp_username, profile } = req.body;
  if (!ppp_username || !profile) return res.status(400).json({ success: false, error: "ppp_username and profile required" });

  const conn = new RouterOSAPI({ host, port: Number(port), user: username, password, tls: use_ssl, timeout: 10 });
  try {
    await conn.connect();
    const secrets = await conn.write("/ppp/secret/print", [`?name=${ppp_username}`]);
    if (!secrets.length) {
      await conn.close();
      return res.status(404).json({ success: false, error: `PPP user '${ppp_username}' not found` });
    }
    const id = secrets[0][".id"];
    await conn.write("/ppp/secret/set", [`=.id=${id}`, `=profile=${profile}`]);
    await conn.close();
    res.json({ success: true, message: `Speed profile updated to '${profile}' for '${ppp_username}'` });
  } catch (err) {
    await conn.close().catch(() => {});
    res.status(502).json({ success: false, error: err.message });
  }
});

/**
 * Add PPP user to address list (block)
 * POST /api/mikrotik/address-list/add
 */
app.post("/api/mikrotik/address-list/add", async (req, res) => {
  const { host, port = 8728, username, password, use_ssl = false, address, list, comment } = req.body;
  const conn = new RouterOSAPI({ host, port: Number(port), user: username, password, tls: use_ssl, timeout: 10 });
  try {
    await conn.connect();
    await conn.write("/ip/firewall/address-list/add", [
      `=list=${list || "blocked"}`,
      `=address=${address}`,
      ...(comment ? [`=comment=${comment}`] : []),
    ]);
    await conn.close();
    res.json({ success: true, message: `${address} added to ${list || "blocked"}` });
  } catch (err) {
    await conn.close().catch(() => {});
    res.status(502).json({ success: false, error: err.message });
  }
});

/**
 * Get interface traffic stats
 * POST /api/mikrotik/interfaces
 */
app.post("/api/mikrotik/interfaces", async (req, res) => {
  const { host, port = 8728, username, password, use_ssl = false } = req.body;
  const conn = new RouterOSAPI({ host, port: Number(port), user: username, password, tls: use_ssl, timeout: 10 });
  try {
    await conn.connect();
    const ifaces = await conn.write("/interface/print");
    await conn.close();
    res.json({ success: true, data: ifaces });
  } catch (err) {
    await conn.close().catch(() => {});
    res.status(502).json({ success: false, error: err.message });
  }
});

/**
 * Generic MikroTik command executor
 * POST /api/mikrotik/exec
 * Body: { host, port, username, password, use_ssl, command, params }
 */
app.post("/api/mikrotik/exec", async (req, res) => {
  const { host, port = 8728, username, password, use_ssl = false, command, params = [] } = req.body;
  if (!command) return res.status(400).json({ success: false, error: "command required" });

  const conn = new RouterOSAPI({ host, port: Number(port), user: username, password, tls: use_ssl, timeout: 10 });
  try {
    await conn.connect();
    const result = await conn.write(command, params);
    await conn.close();
    res.json({ success: true, data: result });
  } catch (err) {
    await conn.close().catch(() => {});
    res.status(502).json({ success: false, error: err.message });
  }
});

// ─── OLT API (HTTP-based, e.g. C-Data, ZTE, Huawei) ─────────────────────────

/**
 * Test OLT connection
 * POST /api/olt/test
 * Body: { host, port, protocol, username, password }
 */
app.post("/api/olt/test", async (req, res) => {
  const { host, port = 80, protocol = "http", username, password } = req.body;
  if (!host || !username || !password) {
    return res.status(400).json({ success: false, error: "host, username, password required" });
  }

  try {
    const baseUrl = `${protocol}://${host}:${port}`;
    // Try common OLT login endpoints
    const endpoints = ["/api/login", "/cgi-bin/luci", "/login", "/api/v1/auth"];
    let connected = false;
    let info = {};

    for (const endpoint of endpoints) {
      try {
        const resp = await axios.post(
          `${baseUrl}${endpoint}`,
          { username, password },
          { timeout: 5000, validateStatus: (s) => s < 500 }
        );
        if (resp.status < 400) {
          connected = true;
          info = { endpoint, status: resp.status };
          break;
        }
      } catch (_) {
        // try next endpoint
      }
    }

    if (!connected) {
      // Try a simple GET to check reachability
      const resp = await axios.get(`${baseUrl}`, { timeout: 5000, validateStatus: () => true });
      connected = resp.status < 500;
      info = { status: resp.status, note: "Device reachable but login endpoint unknown" };
    }

    res.json({ success: connected, message: connected ? `OLT at ${host} is reachable` : `Cannot reach ${host}`, data: info });
  } catch (err) {
    res.status(502).json({ success: false, error: `Cannot reach OLT at ${host}: ${err.message}` });
  }
});

/**
 * Proxy any OLT HTTP request (avoids CORS)
 * POST /api/olt/proxy
 * Body: { host, port, protocol, path, method, headers, data }
 */
app.post("/api/olt/proxy", async (req, res) => {
  const { host, port = 80, protocol = "http", path = "/", method = "GET", headers = {}, data } = req.body;
  if (!host) return res.status(400).json({ success: false, error: "host required" });

  try {
    const url = `${protocol}://${host}:${port}${path}`;
    const response = await axios({
      method: method.toLowerCase(),
      url,
      headers,
      data,
      timeout: 10000,
      validateStatus: () => true,
    });
    res.status(response.status).json({
      success: response.status < 400,
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
  } catch (err) {
    res.status(502).json({ success: false, error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ISP Proxy running on port ${PORT}`);
});
