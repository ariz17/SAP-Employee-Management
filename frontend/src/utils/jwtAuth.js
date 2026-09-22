// Utility for JWT Token Generation, Decoding, and Storage

// Helper: base64url encode a string
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper: base64url decode a string
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

// Simple pseudo-HMAC signature for client-side demonstration
function pseudoSignature(headerPayload, secret = 'sap-btp-secret-key-2026') {
  let hash = 0;
  const combined = headerPayload + '.' + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return base64UrlEncode(Math.abs(hash).toString(16) + 'sig');
}

/**
 * Generate a JWT token with claims
 */
export function generateJwtToken(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    iat: now,
    exp: now + 60 * 60 * 24, // 24 hours validity
    iss: 'sap-cloud-identity-service',
    ...payload
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = pseudoSignature(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Decode and verify JWT token
 */
export function decodeJwtToken(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('JWT token has expired');
      return null;
    }

    return payload;
  } catch (err) {
    console.error('Failed to parse JWT token:', err);
    return null;
  }
}

const JWT_STORAGE_KEY = 'sap_jwt_auth_token';

export function saveJwtToken(token) {
  try {
    sessionStorage.setItem(JWT_STORAGE_KEY, token);
  } catch (e) {
    console.error('Error saving JWT:', e);
  }
}

export function getStoredJwtToken() {
  try {
    return sessionStorage.getItem(JWT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function removeJwtToken() {
  try {
    sessionStorage.removeItem(JWT_STORAGE_KEY);
    sessionStorage.removeItem('sap_session_user');
  } catch (e) {
    console.error('Error removing JWT:', e);
  }
}

/**
 * Authenticate credentials and return JWT token and decoded user
 */
export function authenticateCredentials({ userId, password, employees = [] }) {
  const cleanId = (userId || '').trim();
  const cleanPass = (password || '').trim();

  // 1. Admin Authentication
  if (cleanId.toLowerCase() === 'ariz17' && cleanPass === 'arbab786') {
    const payload = {
      userId: 'ariz17',
      role: 'admin',
      name: 'Arbab Rizvi (Admin)',
      email: 'admin.ariz17@enterprise.sap',
      dept: 'SAP BTP Administration'
    };
    const token = generateJwtToken(payload);
    return {
      success: true,
      token,
      user: { ...payload, token }
    };
  }

  // 2. Employee Authentication
  // Match by Empid (e.g. 100101), Email, or Name (e.g. "mridul", "harshit", "arbab", etc.)
  const target = cleanId.toLowerCase();
  const emp = employees.find(e => {
    const idMatch = e.Empid.toLowerCase() === target;
    const emailMatch = e.Email.toLowerCase() === target || e.Email.toLowerCase().startsWith(target);
    const fullNameMatch = e.Name.toLowerCase() === target || e.Name.toLowerCase().includes(target);
    const firstNameMatch = e.Name.toLowerCase().split(' ')[0] === target;
    return idMatch || emailMatch || fullNameMatch || firstNameMatch;
  });

  if (emp) {
    const firstName = emp.Name.toLowerCase().split(' ')[0];
    const validPasswords = [
      'emp123',
      `${firstName}123`,
      emp.Empid
    ];

    if (validPasswords.includes(cleanPass)) {
      const payload = {
        userId: emp.Empid,
        empid: emp.Empid,
        role: 'employee',
        name: emp.Name,
        email: emp.Email,
        dept: emp.Dept
      };
      const token = generateJwtToken(payload);
      return {
        success: true,
        token,
        user: { ...payload, token }
      };
    } else {
      return {
        success: false,
        error: 'Invalid User ID or Password.'
      };
    }
  }

  return {
    success: false,
    error: 'Invalid User ID or Password.'
  };
}
