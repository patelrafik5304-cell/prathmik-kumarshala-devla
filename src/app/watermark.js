(function() {
  'use strict';

  let intervalId;

  function addWatermark() {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        const username = data?.user?.username || 'Unknown';
        const name = data?.user?.name || 'Unknown';

        const watermark = document.createElement('div');
        watermark.id = 'screen-watermark';
        watermark.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483647;overflow:hidden';

        for (let i = 0; i < 6; i++) {
          const span = document.createElement('div');
          span.style.cssText = `position:absolute;transform:rotate(-45deg);font-size:18px;color:rgba(255,255,255,0.08);font-weight:bold;white-space:nowrap;user-select:none;-webkit-user-select:none;left:${Math.random() * 100}%;top:${Math.random() * 100}%`;
          span.textContent = `${name} (${username})`;
          watermark.appendChild(span);
        }

        document.body.appendChild(watermark);

        intervalId = setInterval(() => {
          watermark.querySelectorAll('div').forEach(div => {
            div.textContent = `${name} (${username})`;
          });
        }, 60000);
      })
      .catch(() => {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addWatermark);
  } else {
    addWatermark();
  }
})();
