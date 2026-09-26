const fs = require('fs');
const path = require('path');
const https = require('https');

const trackerPath = path.join(__dirname, '../data/DATABASE_TRACKER.json');
const tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));

// Load .env
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const serviceRoleKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Supabase URL or Service Role Key missing!');
  process.exit(1);
}

const urlObj = new URL(supabaseUrl);

function request(method, reqPath, body = null, preferMerge = false) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const preferHeader = preferMerge 
      ? 'resolution=merge-duplicates,return=minimal' 
      : 'return=minimal';

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: reqPath,
      method: method,
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': preferHeader
      }
    };

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Ensure all items have uniform schema keys for Supabase REST API
const normalizedTracker = tracker.map(p => ({
  id: p.id,
  name: p.name || '',
  brand: p.brand || '',
  price: typeof p.price === 'number' ? p.price : 0,
  image: p.image || '',
  volume: p.volume || '100 ml',
  is_archived: Boolean(p.is_archived),
  free_delivery: Boolean(p.free_delivery),
  in_stock: p.in_stock !== false,
  created_at: p.created_at || new Date().toISOString(),
  tagline: p.tagline || '',
  badge: p.badge || null,
  description: p.description || '',
  top_notes: Array.isArray(p.top_notes) ? p.top_notes : [],
  heart_notes: Array.isArray(p.heart_notes) ? p.heart_notes : [],
  base_notes: Array.isArray(p.base_notes) ? p.base_notes : []
}));

async function main() {
  const purgedIds = [
    'archived-img-4', 'archived-img-5', 'archived-img-6', 'archived-img-7',
    'archived-img-10', 'archived-img-11', 'archived-img-13', 'archived-img-15',
    'archived-img-16', 'archived-img-18', 'archived-img-23', 'archived-img-25',
    'archived-img-26', 'archived-img-28', 'archived-img-43', 'archived-img-44',
    'archived-img-45'
  ];

  console.log(`1. Deleting ${purgedIds.length} purged promo archive rows from Supabase...`);
  const deletePath = `/rest/v1/products?id=in.(${purgedIds.join(',')})`;
  try {
    await request('DELETE', deletePath);
    console.log('Purged promo archive rows successfully deleted from Supabase.');
  } catch (err) {
    console.error('Error deleting purged rows:', err.message);
  }

  console.log('2. Syncing updated DATABASE_TRACKER.json (133 products) to Supabase...');
  const batchSize = 20;
  for (let i = 0; i < normalizedTracker.length; i += batchSize) {
    const batch = normalizedTracker.slice(i, i + batchSize);
    const upsertPath = `/rest/v1/products?on_conflict=id`;
    try {
      await request('POST', upsertPath, batch, true);
      console.log(`Successfully upserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)...`);
    } catch (err) {
      console.error(`Error upserting batch ${Math.floor(i / batchSize) + 1}:`, err.message);
    }
  }

  console.log('Supabase sync completed successfully!');
}

main();
