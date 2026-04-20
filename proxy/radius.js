// RADIUS Server Integration
// Handles RADIUS authentication and accounting

const dgram = require('dgram');
const crypto = require('crypto');
const db = require('./db');

class RADIUSServer {
    constructor() {
        this.port = process.env.RADIUS_PORT || 1812;
        this.host = process.env.RADIUS_HOST || '0.0.0.0';
        this.secret = process.env.RADIUS_SECRET || 'change_me';
        this.server = null;
    }

    // Initialize RADIUS server
    async init() {
        this.server = dgram.createSocket('udp4');

        this.server.on('message', async (msg, rinfo) => {
            console.log(`RADIUS request from ${rinfo.address}:${rinfo.port}`);
            await this.handleRADIUSRequest(msg, rinfo);
        });

        this.server.on('error', (err) => {
            console.error('RADIUS server error:', err);
        });

        this.server.bind(this.port, this.host);
        console.log(`RADIUS server listening on ${this.host}:${this.port}`);
    }

    // Handle RADIUS request
    async handleRADIUSRequest(buffer, rinfo) {
        try {
            // Parse RADIUS packet
            const code = buffer[0];
            const packetId = buffer[1];
            const length = (buffer[2] << 8) | buffer[3];
            const authenticator = buffer.slice(4, 20);
            const attributes = buffer.slice(20);

            // Parse attributes
            const parsedAttrs = this.parseAttributes(attributes);
            console.log('RADIUS Attributes:', parsedAttrs);

            // Handle authentication request
            if (code === 1) { // Access-Request
                await this.handleAccessRequest(
                    parsedAttrs,
                    authenticator,
                    packetId,
                    rinfo,
                    buffer
                );
            }

            // Handle accounting request
            if (code === 4) { // Accounting-Request
                await this.handleAccountingRequest(
                    parsedAttrs,
                    authenticator,
                    packetId,
                    rinfo
                );
            }
        } catch (error) {
            console.error('RADIUS request error:', error);
        }
    }

    // Handle Access-Request (authentication)
    async handleAccessRequest(attributes, authenticator, packetId, rinfo, buffer) {
        try {
            const username = this.getAttribute(attributes, 1); // User-Name
            const userPassword = this.getAttribute(attributes, 2); // User-Password

            console.log(`Authentication attempt: ${username}`);

            // Query database for user
            const user = await db.query(
                'SELECT id, username, password FROM raduser WHERE username = $1',
                [username]
            );

            if (user.rows.length === 0) {
                console.log(`User not found: ${username}`);
                this.sendAccessReject(rinfo, packetId);
                return;
            }

            // Verify password
            const isPasswordValid = this.verifyPassword(userPassword, user.rows[0].password);

            if (isPasswordValid) {
                console.log(`Authentication successful for: ${username}`);
                
                // Get user attributes
                const radiusAttrs = await db.query(
                    'SELECT attribute, op, value FROM radreply WHERE username = $1',
                    [username]
                );

                // Send Access-Accept
                this.sendAccessAccept(rinfo, packetId, authenticator, radiusAttrs.rows);

                // Log successful authentication
                await this.logAccountingEvent(username, 'Start', attributes);
            } else {
                console.log(`Authentication failed for: ${username}`);
                this.sendAccessReject(rinfo, packetId);
            }
        } catch (error) {
            console.error('Access-Request handling error:', error);
            this.sendAccessReject(rinfo, packetId);
        }
    }

    // Handle Accounting-Request
    async handleAccountingRequest(attributes, authenticator, packetId, rinfo) {
        try {
            const username = this.getAttribute(attributes, 1); // User-Name
            const acctStatusType = this.getAttribute(attributes, 40); // Acct-Status-Type
            const acctSessionId = this.getAttribute(attributes, 44); // Acct-Session-Id
            const acctInputOctets = this.getAttribute(attributes, 42); // Acct-Input-Octets
            const acctOutputOctets = this.getAttribute(attributes, 43); // Acct-Output-Octets

            console.log(`Accounting event: ${acctStatusType} for ${username}`);

            // Insert accounting record
            await db.query(
                `INSERT INTO radius_accounting 
                (username, acct_status_type, acct_session_id, input_octets, output_octets, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())`,
                [username, acctStatusType, acctSessionId, acctInputOctets || 0, acctOutputOctets || 0]
            );

            // Send Accounting-Response
            this.sendAccountingResponse(rinfo, packetId, authenticator);
        } catch (error) {
            console.error('Accounting-Request handling error:', error);
        }
    }

    // Parse RADIUS attributes
    parseAttributes(buffer) {
        const attributes = [];
        let offset = 0;

        while (offset < buffer.length) {
            const type = buffer[offset];
            const length = buffer[offset + 1];
            const value = buffer.slice(offset + 2, offset + length);

            attributes.push({ type, length, value });
            offset += length;
        }

        return attributes;
    }

    // Get attribute value by type
    getAttribute(attributes, type) {
        const attr = attributes.find(a => a.type === type);
        if (!attr) return null;

        // Decode based on type
        if (type === 1 || type === 2) { // String types
            return attr.value.toString();
        }

        // Integer types
        if ([40, 42, 43, 44].includes(type)) {
            return attr.value.readUInt32BE(0);
        }

        return attr.value;
    }

    // Verify password (simple comparison, use bcrypt in production)
    verifyPassword(received, stored) {
        // In production, use bcrypt: bcrypt.compareSync(received, stored)
        return received === stored;
    }

    // Send Access-Accept response
    sendAccessAccept(rinfo, packetId, authenticator, radiusAttrs) {
        const code = 2; // Access-Accept
        const responseAuth = this.createResponseAuthenticator(authenticator);

        // Build response packet
        const attrBuffer = this.buildAttributesBuffer(radiusAttrs);
        const length = 20 + attrBuffer.length;

        const packet = Buffer.alloc(length);
        packet[0] = code;
        packet[1] = packetId;
        packet[2] = (length >> 8) & 0xFF;
        packet[3] = length & 0xFF;
        responseAuth.copy(packet, 4);
        attrBuffer.copy(packet, 20);

        this.server.send(packet, 0, packet.length, rinfo.port, rinfo.address);
        console.log(`Access-Accept sent to ${rinfo.address}:${rinfo.port}`);
    }

    // Send Access-Reject response
    sendAccessReject(rinfo, packetId) {
        const code = 3; // Access-Reject
        const packet = Buffer.alloc(20);
        packet[0] = code;
        packet[1] = packetId;
        packet[2] = 0;
        packet[3] = 20;
        crypto.randomBytes(16).copy(packet, 4);

        this.server.send(packet, 0, 20, rinfo.port, rinfo.address);
        console.log(`Access-Reject sent to ${rinfo.address}:${rinfo.port}`);
    }

    // Send Accounting-Response
    sendAccountingResponse(rinfo, packetId, authenticator) {
        const code = 5; // Accounting-Response
        const responseAuth = this.createResponseAuthenticator(authenticator);

        const packet = Buffer.alloc(20);
        packet[0] = code;
        packet[1] = packetId;
        packet[2] = 0;
        packet[3] = 20;
        responseAuth.copy(packet, 4);

        this.server.send(packet, 0, 20, rinfo.port, rinfo.address);
        console.log(`Accounting-Response sent to ${rinfo.address}:${rinfo.port}`);
    }

    // Create response authenticator
    createResponseAuthenticator(requestAuth) {
        const hmac = crypto.createHmac('md5', this.secret);
        hmac.update(Buffer.concat([Buffer.from([2, 0, 0, 20]), requestAuth]));
        return hmac.digest();
    }

    // Build attributes buffer
    buildAttributesBuffer(radiusAttrs) {
        const buffers = [];

        radiusAttrs.forEach(attr => {
            const typeCode = this.getAttributeTypeCode(attr.attribute);
            const valueBuffer = Buffer.from(attr.value);
            const length = 2 + valueBuffer.length;

            const attrBuffer = Buffer.alloc(length);
            attrBuffer[0] = typeCode;
            attrBuffer[1] = length;
            valueBuffer.copy(attrBuffer, 2);

            buffers.push(attrBuffer);
        });

        return Buffer.concat(buffers);
    }

    // Get attribute type code
    getAttributeTypeCode(attribute) {
        const typeMap = {
            'User-Name': 1,
            'User-Password': 2,
            'Service-Type': 6,
            'Framed-IP-Address': 8,
            'Framed-IP-Netmask': 9,
            'Acct-Status-Type': 40,
            'Acct-Input-Octets': 42,
            'Acct-Output-Octets': 43,
            'Acct-Session-Id': 44,
        };

        return typeMap[attribute] || 8;
    }

    // Log accounting event to database
    async logAccountingEvent(username, eventType, attributes) {
        try {
            await db.query(
                `INSERT INTO radius_logs (username, event_type, attributes, created_at)
                VALUES ($1, $2, $3, NOW())`,
                [username, eventType, JSON.stringify(attributes)]
            );
        } catch (error) {
            console.error('Error logging accounting event:', error);
        }
    }

    // Stop RADIUS server
    stop() {
        if (this.server) {
            this.server.close();
            console.log('RADIUS server stopped');
        }
    }
}

module.exports = RADIUSServer;
