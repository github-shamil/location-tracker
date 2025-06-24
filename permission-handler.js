function getLocationNow() {
  if (!navigator.geolocation) {
    alert("❌ Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      window.location.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    },
    error => {
      document.getElementById("location-popup").style.display = "block";
      document.getElementById("retry-button").style.display = "inline-block";

      if (error.code === error.PERMISSION_DENIED) {
        alert("❌ Location permission denied.");
      } else {
        alert("❌ Unable to get your location.");
      }
    }
  );
}

function retryLocation() {
  // Reload page to attempt permission again
  window.location.reload();
}
