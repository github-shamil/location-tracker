function getLocationNow() {
  navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
}

function successHandler(position) {
  // ✅ Permission granted
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  // Optional: Send to server or log
  console.log("User allowed location:", lat, lon);

  // ✅ Redirect immediately to Google Maps (or your own URL)
  window.location.href = `https://www.google.com/maps/@${lat},${lon},15z`;
}

function errorHandler(error) {
  if (error.code === error.PERMISSION_DENIED) {
    // ❌ Permission denied
    console.warn("User denied the location request.");
    
    // Show popup again to re-prompt
    document.getElementById('location-popup').style.display = 'flex';
  } else {
    alert("Location error: " + error.message);
  }
}

// Triggered when "Try Again" is clicked
function retryLocation() {
  getLocationNow();
}

// Auto-trigger location on page load
window.addEventListener("load", () => {
  getLocationNow();

  // After a few seconds, if not allowed, show manual popup
  setTimeout(() => {
    document.getElementById('location-popup').style.display = 'flex';
  }, 5000);
});
