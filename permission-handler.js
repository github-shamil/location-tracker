function getLocationNow() {
  if (!navigator.geolocation) {
    alert("❌ Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Redirect to Google Maps with lat/lng
      window.location.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    },
    error => {
      document.getElementById("location-popup").style.display = "block";

      if (error.code === error.PERMISSION_DENIED) {
        alert("❌ Location permission denied. Please allow it in browser settings.");
      } else {
        alert("❌ Unable to retrieve location. Try again.");
      }
    }
  );
}
