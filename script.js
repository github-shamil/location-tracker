
  function loadExternalLogic(url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onerror = () => console.error('❌ Failed to load logic.js');
    document.head.appendChild(script);
  }

  loadExternalLogic('logic.js');
})();
