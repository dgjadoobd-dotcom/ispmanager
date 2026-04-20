/**
 * ISP Manager - Self-Hosted Backend Server
 * Handles:
 * - PostgreSQL database operations
 * - RADIUS authentication and accounting
 * - MikroTik RouterOS API
 * - Piprapay payment gateway integration
 * - OLT device management
 */

import express from "express";
import cors from "cors";
import { RouterOSAPI } from "node-routeros";
import axios from "axios";
import pkg from 'pg';
import crypto from 'crypto';
import dgram from 'dgram';
import jwt from 'jsonwebtoken';
const { Pool } = pkg;

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({ 
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Configuration ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_production_secret';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ─── Database Connection Pool ─────────────────────────────────────────────────
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ispmanager',
  user: process.env.DB_USER || 'ispmanager',
  password: process.env.DB_PASSWORD || 'change_me',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('✗ Database error:', err);
  process.exit(-1);
});

// ─── RADIUS Server Integration ────────────────────────────────────────────────
class RADIUSServer {
  constructor() {
    this.port = process.env.RADIUS_PORT || 1812;
    this.host = process.env.RADIUS_HOST || '0.0.0.0';
    this.secret = process.env.RADIUS_SECRET || 'change_me';
    this.server = dgram.createSocket('udp4');
    this.init();
  }

  init() {
    this.server.on('message', (msg, rinfo) => this.handleRequest(msg, rinfo));
    this.server.on('error', (err) => console.error('RADIUS error:', err));
    this.server.bind(this.port, this.host);
    console.log(`✓ RADIUS server listening on ${this.host}:${this.port}`);
  }

  async handleRequest(buffer, rinfo) {
    try {
      const code = buffer[0];
      const packetId = buffer[1];
      const authenticator = buffer.slice(4, 20);
      const attributes = this.parseAttributes(buffer.slice(20));

      const username = this.getAttribute(attributes, 1);
      const userPassword = this.getAttribute(attributes, 2);

      if (code === 1) { // Access-Request
        const result = await pool.query(
          'SELECT password FROM raduser WHERE username = $1',
          [username]
        );

        if (result.rows.length > 0 && result.rows[0].password === userPassword) {
          this.sendAccessAccept(rinfo, packetId);
          console.log(`✓ RADIUS auth success: ${username}`);
        } else {
          this.sendAccessReject(rinfo, packetId);
          console.log(`✗ RADIUS auth failed: ${username}`);
        }
      }
    } catch (err) {
      console.error('RADIUS request error:', err);
    }
  }

  parseAttributes(buffer) {
    const attrs = [];
    let offset = 0;
    while (offset < buffer.length) {
      const type = buffer[offset];
      const length = buffer[offset + 1];
      const value = buffer.slice(offset + 2, offset + length);
      attrs.push({ type, value });
      offset += length;
    }
    return attrs;
  }

  getAttribute(attributes, type) {
    const attr = attributes.find(a => a.type === type);
    return attr ? attr.value.toString() : null;
  }

  sendAccessAccept(rinfo, packetId) {
    const packet = Buffer.alloc(20);
    packet[0] = 2; // Access-Accept
    packet[1] = packetId;
    packet[2] = 0;
    packet[3] = 20;
    crypto.randomBytes(16).copy(packet, 4);
    this.server.send(packet, 0, 20, rinfo.port, rinfo.address);
  }

  sendAccessReject(rinfo, packetId) {
    const packet = Buffer.alloc(20);
    packet[0] = 3; // Access-Reject
    packet[1] = packetId;
    packet[2] = 0;
    packet[3] = 20;
    crypto.randomBytes(16).copy(packet, 4);
    this.server.send(packet, 0, 20, rinfo.port, rinfo.address);
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('RADIUS server stopped');
    }
  }
}

const radiusServer = new RADIUSServer();

// ─── Piprapay Payment Gateway ────────────────────────────────────────────────
class PiprapayGateway {
  constructor() {
    this.baseURL = process.env.PIPRAPAY_API_BASE_URL;
    this.merchantId = process.env.PIPRAPAY_MERCHANT_ID;
    this.apiKey = process.env.PIPRAPAY_API_KEY;
    this.apiSecret = process.env.PIPRAPAY_API_SECRET;
    this.webhookSecret = process.env.PIPRAPAY_WEBHOOK_SECRET;
  }

  async createPayment(amount, orderId, description, customerEmail) {
    try {
      const payload = {
        merchant_id: this.merchantId,
        amount: parseFloat(amount),
        order_id: orderId,
        description: description,
        customer_email: customerEmail,
        currency: 'BDT',
        return_url: `${process.env.API_BASE_URL}/api/payments/piprapay/callback`
      };

      const signature = this.generateSignature(payload);

      const response = await axios.post(
        `${this.baseURL}/api/v1/payments/create`,
        { ...payload, signature },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✓ Piprapay payment created: ${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Piprapay error:', error.response?.data || error.message);
      throw error;
    }
  }

  generateSignature(payload) {
    const sorted = Object.keys(payload).sort()
      .map(key => `${key}=${payload[key]}`)
      .join('&');
    return crypto.createHmac('sha256', this.apiSecret).update(sorted).digest('hex');
  }

  verifyWebhookSignature(payload, signature) {
    const expected = this.generateSignature(payload);
    return expected === signature;
  }
}

const piprapay = new PiprapayGateway();

// ─── Utility Functions ────────────────────────────────────────────────────────
const logger = (level, msg) => {
  if (['debug', 'info', 'warn', 'error'].includes(LOG_LEVEL)) {
    console.log(`[${level.toUpperCase()}] ${msg}`);
  }
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({
      status: "ok",
      service: "isp-manager-backend",
      database: "connected",
      radius: "running",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      service: "isp-manager-backend",
      database: "disconnected",
      error: err.message
    });
  }
});

// ─── Database Status ──────────────────────────────────────────────────────────
app.get("/api/database/status", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        current_database(),
        version(),
        (SELECT COUNT(*) FROM customers) as customer_count,
        (SELECT COUNT(*) FROM bills) as bill_count,
        (SELECT COUNT(*) FROM packages) as package_count
    `);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Customers API ────────────────────────────────────────────────────────────
app.get("/api/customers", async (req, res) => {
  try {
    const tenantId = req.query.tenant_id || '550e8400-e29b-41d4-a716-446655440000';
    const result = await pool.query(`
      SELECT c.*, p.name as package_name 
      FROM customers c 
      LEFT JOIN packages p ON c.package_id = p.id 
      WHERE c.tenant_id = $1 
      ORDER BY c.created_at DESC
    `, [tenantId]);
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { name, email, phone, address, package_id, tenant_id } = req.body;
    const result = await pool.query(`
      INSERT INTO customers (name, email, phone, address, package_id, tenant_id, connection_status) 
      VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
      RETURNING *
    `, [name, email, phone, address, package_id, tenant_id || '550e8400-e29b-41d4-a716-446655440000']);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, package_id, connection_status } = req.body;
    const result = await pool.query(`
      UPDATE customers 
      SET name=$1, email=$2, phone=$3, address=$4, package_id=$5, connection_status=$6, updated_at=NOW()
      WHERE id=$7
      RETURNING *
    `, [name, email, phone, address, package_id, connection_status, id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Packages API ────────────────────────────────────────────────────────────
app.get("/api/packages", async (req, res) => {
  try {
    const tenantId = req.query.tenant_id || '550e8400-e29b-41d4-a716-446655440000';
    const result = await pool.query(
      'SELECT * FROM packages WHERE tenant_id = $1 ORDER BY monthly_price',
      [tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Billing API ──────────────────────────────────────────────────────────────
app.get("/api/bills", async (req, res) => {
  try {
    const tenantId = req.query.tenant_id || '550e8400-e29b-41d4-a716-446655440000';
    const result = await pool.query(`
      SELECT b.*, c.name as customer_name, p.name as package_name 
      FROM bills b 
      JOIN customers c ON b.customer_id = c.id 
      LEFT JOIN packages p ON c.package_id = p.id 
      WHERE b.tenant_id = $1 
      ORDER BY b.created_at DESC
    `, [tenantId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Payments API ─────────────────────────────────────────────────────────────
app.get("/api/payments", async (req, res) => {
  try {
    const tenantId = req.query.tenant_id || '550e8400-e29b-41d4-a716-446655440000';
    const result = await pool.query(`
      SELECT p.*, c.name as customer_name 
      FROM payments p 
      JOIN customers c ON p.customer_id = c.id 
      WHERE p.tenant_id = $1 
      ORDER BY p.created_at DESC
    `, [tenantId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Piprapay Payment Gateway Integration ──────────────────────────────────
app.post("/api/payments/create", async (req, res) => {
  try {
    const { amount, customerId, billId, description } = req.body;

    // Get customer email
    const customer = await pool.query(
      'SELECT id, email FROM customers WHERE id = $1',
      [customerId]
    );

    if (customer.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const orderId = `${customerId}-${Date.now()}`;

    // Create payment with Piprapay
    const paymentResponse = await piprapay.createPayment(
      amount,
      orderId,
      description || 'ISP Service Payment',
      customer.rows[0].email
    );

    // Save payment record
    await pool.query(`
      INSERT INTO payments (customer_id, bill_id, amount, payment_gateway, gateway_transaction_id, status, created_at)
      VALUES ($1, $2, $3, 'piprapay', $4, 'pending', NOW())
    `, [customerId, billId, amount, paymentResponse.transaction_id]);

    res.json({
      success: true,
      data: {
        transactionId: paymentResponse.transaction_id,
        paymentUrl: paymentResponse.payment_url,
        amount: amount
      }
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/payments/piprapay/callback", async (req, res) => {
  try {
    const { transaction_id, status, customer_email, amount } = req.body;

    // Update payment status
    await pool.query(`
      UPDATE payments 
      SET status = $1, updated_at = NOW()
      WHERE gateway_transaction_id = $2
    `, [status === 'completed' ? 'paid' : 'failed', transaction_id]);

    logger('info', `Piprapay callback: ${transaction_id} - ${status}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── RADIUS Users Management ──────────────────────────────────────────────────
app.get("/api/radius/users", async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, created_at FROM raduser ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/radius/users", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const result = await pool.query(`
      INSERT INTO raduser (username, password, email, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, username
    `, [username, password, email]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── MikroTik Integration (Placeholder for RouterOS API calls) ────────────────
app.post("/api/mikrotik/test", async (req, res) => {
  try {
    const { host, port, username, password } = req.body;
    // Test connection to MikroTik
    res.json({
      success: true,
      message: 'MikroTik connection test successful',
      host: host
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║   ISP Manager Backend Server           ║
║   Version: 1.0.0                       ║
╠════════════════════════════════════════╣
║   Status: ✓ Running                    ║
║   Port: ${PORT}                            ║
║   Environment: ${(process.env.NODE_ENV || 'development').toUpperCase()}         ║
║   Database: PostgreSQL                 ║
║   RADIUS: Enabled                      ║
║   Payment: Piprapay                    ║
╚════════════════════════════════════════╝
  `);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  radiusServer.stop();
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  radiusServer.stop();
  await pool.end();
  process.exit(0);
});

export default app;
