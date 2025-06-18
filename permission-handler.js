function getLocationNow() {
  navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
    enableHighAccuracy: true,
    maximumAge: 0
  });
}

function successHandler(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  // ✅ Redirect to Google Maps
  window.location.href = `https://www.google.com/maps/@${lat},${lon},15z`;
}

function errorHandler(error) {
  if (error.code === error.PERMISSION_DENIED) {
    console.warn("User denied location");
    document.getElementById('location-popup').style.display = 'flex';
  } else {
    alert("Location error: " + error.message);
  }
}

function retryLocation() {
  // Reload the page to trigger permission prompt again
  location.reload();
}

window.addEventListener("load", () => {
  getLocationNow();
});
