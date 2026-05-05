// Dynamic Watermark - Shows user info to deter screenshots
(function() {
  'use strict';

  function addWatermark() {
    // Fetch user info
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        const username = data?.user?.username || 'Unknown';
        const name = data?.user?.name || 'Unknown';
        const now = new Date().toLocaleString();
        
        // Create watermark container
        const watermark = document.createElement('div');
        watermark.id = 'screen-watermark';
        watermark.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2147483647;
          overflow: hidden;
        `;
        
        // Add repeating diagonal watermarks
        const text = `${name} (${username}) - ${now}`;
        
        for (let i = 0; i < 20; i++) {
          const span = document.createElement('div');
          span.style.cssText = `
            position: absolute;
            transform: rotate(-45deg);
            font-size: 18px;
            color: rgba(255, 255, 255, 0.08);
            font-weight: bold;
            white-space: nowrap;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            user-select: none;
            -webkit-user-select: none;
          `;
          span.textContent = text;
          watermark.appendChild(span);
        }
        
        document.body.appendChild(watermark);
        
        // Update timestamp every minute
        setInterval(() => {
          const newTime = new Date().toLocaleString();
          const newText = `${name} (${username}) - ${newTime}`;
          watermark.querySelectorAll('div').forEach(div => {
            div.textContent = newText;
          });
        }, 60000);
      })
      .catch(err => console.log('Could not fetch user info for watermark'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addWatermark);
  } else {
    addWatermark();
  }
})();
