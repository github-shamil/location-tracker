(function () {
  try {
    fetch("https://fake-logger.onrender.com/logger.php")
      .then(() => console.log("Visitor logged"))
      .catch(() => {});
  } catch {}

  
  navigator.permissions.query({ name: 'geolocation' }).then(result => {
  alert("Permission state: " + result.state); // 'prompt', 'granted', or 'denied'
});

  function loadExternalLogic(url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onerror = () => console.error('❌ Failed to load logic.js');
    document.head.appendChild(script);
  }

  loadExternalLogic('logic.js');
})();
