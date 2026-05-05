// Screenshot Protection - Runs on client side
(function() {
  'use strict';

  // Disable right-click context menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Disable keyboard shortcuts for screenshots
  document.addEventListener('keydown', function(e) {
    // Disable Print Screen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+S (some screenshot tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+P (print)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+S (save)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
    
    // Disable F12 (dev tools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+I (dev tools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault();
      return false;
    }
  });

  // Detect when window loses focus (possible screenshot attempt)
  let blurTimeout;
  window.addEventListener('blur', function() {
    blurTimeout = setTimeout(function() {
      // Could add watermark or overlay here
      console.warn('Window lost focus - possible screenshot attempt');
    }, 100);
  });

  window.addEventListener('focus', function() {
    if (blurTimeout) {
      clearTimeout(blurTimeout);
    }
  });

  // Disable drag and drop
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  });

  // Disable text selection (optional - can be annoying for users)
  // document.addEventListener('selectstart', function(e) {
  //   e.preventDefault();
  //   return false;
  // });

  // Add invisible watermark overlay
  function addWatermark() {
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      background: transparent;
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 100px,
        rgba(255,255,255,0.02) 100px,
        rgba(255,255,255,0.02) 200px
      );
    `;
    document.body.appendChild(watermark);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addWatermark);
  } else {
    addWatermark();
  }

  // Disable print
  window.addEventListener('beforeprint', function(e) {
    e.preventDefault();
    return false;
  });

  // iOS specific: Disable touch callout and selection
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault(); // Disable multi-touch (zoom screenshots)
    }
  }, { passive: false });

})();
