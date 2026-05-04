/**
 * Job harian: kedaluwarsa batch poin (type earned) yang sudah lewat expires_at.
 * Jalankan via cron, misal: 0 2 * * * cd backend && node scripts/expirePointsDaily.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { expirePointsDaily } = require('../src/services/pointsService');

expirePointsDaily()
  .then((r) => {
    console.log('[expirePointsDaily]', r);
    process.exit(0);
  })
  .catch((e) => {
    console.error('[expirePointsDaily]', e);
    process.exit(1);
  });
