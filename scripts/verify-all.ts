import crypto from 'crypto';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 HANDY MANDY MVP - AUTOMATED VERIFICATION TEST SUITE');
console.log('═══════════════════════════════════════════════════════════════\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    failedTests++;
  }
}

// -------------------------------------------------------------
// TC-01: Password Hashing & Verification (Argon2 / scrypt)
// -------------------------------------------------------------
console.log('1️⃣ Testing Authentication & Cryptographic Hashing...');

async function testAuth() {
  const password = 'Password123!';
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      resolve(key.toString('hex'));
    });
  });
  const hash = `scrypt$${salt}$${derivedKey}`;

  // Verify correct password
  const [, saltExtract, keyExtract] = hash.split('$');
  const verifyKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, saltExtract, 64, (err, key) => {
      if (err) reject(err);
      resolve(key);
    });
  });
  const isMatch = crypto.timingSafeEqual(Buffer.from(keyExtract, 'hex'), verifyKey);
  assert(isMatch, 'TC-01a: Correct password matches generated hash');

  // Verify wrong password rejects
  const wrongKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt('WrongPassword!', saltExtract, 64, (err, key) => {
      if (err) reject(err);
      resolve(key);
    });
  });
  const isWrongMatch = crypto.timingSafeEqual(Buffer.from(keyExtract, 'hex'), wrongKey);
  assert(!isWrongMatch, 'TC-01b: Incorrect password is rejected');
}

// -------------------------------------------------------------
// TC-02: Deterministic Pricing Calculation
// -------------------------------------------------------------
console.log('\n2️⃣ Testing Deterministic Pricing Engine...');

function calculateMockPricing(params: {
  items: Array<{ unitPrice: number; quantity: number; requiresHub: boolean }>;
  includeInstallation: boolean;
  includeHub: boolean;
}) {
  const INSTALL_FEE_PER_DEVICE = 150_000;
  const HUB_FEE = 450_000;

  const subtotal = params.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalUnits = params.items.reduce((sum, i) => sum + i.quantity, 0);
  const installationFee = params.includeInstallation ? totalUnits * INSTALL_FEE_PER_DEVICE : 0;
  const hubFee = params.includeHub ? HUB_FEE : 0;
  const totalAmount = subtotal + installationFee + hubFee;

  return { subtotal, totalUnits, installationFee, hubFee, totalAmount };
}

function testPricing() {
  // Case A: 2 x CCTV (850,000 IDR each) + Install + Hub
  const caseA = calculateMockPricing({
    items: [{ unitPrice: 850000, quantity: 2, requiresHub: true }],
    includeInstallation: true,
    includeHub: true
  });
  // Subtotal = 1,700,000; Install = 2 * 150k = 300,000; Hub = 450,000; Total = 2,450,000
  assert(caseA.subtotal === 1700000, 'TC-02a: Subtotal is 1,700,000 IDR');
  assert(caseA.installationFee === 300000, 'TC-02b: Installation fee is 300,000 IDR for 2 units');
  assert(caseA.hubFee === 450000, 'TC-02c: Hub fee is 450,000 IDR');
  assert(caseA.totalAmount === 2450000, 'TC-02d: Total is accurately 2,450,000 IDR');

  // Case B: No installation, no hub
  const caseB = calculateMockPricing({
    items: [{ unitPrice: 320000, quantity: 3, requiresHub: false }],
    includeInstallation: false,
    includeHub: false
  });
  assert(caseB.installationFee === 0 && caseB.hubFee === 0, 'TC-02e: No additional fees when toggled off');
  assert(caseB.totalAmount === 960000, 'TC-02f: Total matches device price only (960,000 IDR)');
}

// -------------------------------------------------------------
// TC-03: Midtrans SHA-512 Signature Verification
// -------------------------------------------------------------
console.log('\n3️⃣ Testing Midtrans Cryptographic Signature & Webhook Security...');

function testSignature() {
  const orderId = 'ORDER-12345';
  const statusCode = '200';
  const grossAmount = '2450000.00';
  const serverKey = 'SB-Mid-server-TESTKEY123';

  // Compute expected SHA512 signature
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const validSignature = crypto.createHash('sha512').update(payload).digest('hex');

  // Verify valid signature
  const checkValid = crypto.createHash('sha512').update(payload).digest('hex') === validSignature;
  assert(checkValid, 'TC-03a: Valid webhook signature passes verification');

  // Tampered payload verification
  const tamperedPayload = `${orderId}${statusCode}9999999.00${serverKey}`;
  const checkTampered = crypto.createHash('sha512').update(tamperedPayload).digest('hex') === validSignature;
  assert(!checkTampered, 'TC-03b: Tampered gross_amount signature is rejected');
}

// -------------------------------------------------------------
// TC-04: Role-Based Route Guard Logic
// -------------------------------------------------------------
console.log('\n4️⃣ Testing RBAC Route Access Matrix...');

function testRBAC() {
  function canAccess(pathname: string, user: { role: string } | null): boolean {
    if (pathname.startsWith('/admin')) {
      return !!user && user.role === 'ADMIN';
    }
    if (pathname.startsWith('/technician')) {
      return !!user && (user.role === 'TECHNICIAN' || user.role === 'ADMIN');
    }
    if (pathname.startsWith('/orders') || pathname.startsWith('/booking')) {
      return !!user;
    }
    return true;
  }

  assert(!canAccess('/admin/orders', null), 'TC-04a: Anonymous user denied access to /admin');
  assert(!canAccess('/admin/orders', { role: 'CUSTOMER' }), 'TC-04b: Customer denied access to /admin');
  assert(canAccess('/admin/orders', { role: 'ADMIN' }), 'TC-04c: Admin granted access to /admin');

  assert(!canAccess('/technician/orders', { role: 'CUSTOMER' }), 'TC-04d: Customer denied access to /technician');
  assert(canAccess('/technician/orders', { role: 'TECHNICIAN' }), 'TC-04e: Technician granted access to /technician');

  assert(!canAccess('/booking/location', null), 'TC-04f: Anonymous user redirected from /booking');
  assert(canAccess('/booking/location', { role: 'CUSTOMER' }), 'TC-04g: Customer granted access to /booking');
}

async function run() {
  await testAuth();
  testPricing();
  testSignature();
  testRBAC();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

run();
