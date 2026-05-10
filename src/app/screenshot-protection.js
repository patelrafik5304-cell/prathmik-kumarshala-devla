(function() {
  'use strict';

  document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'PrintScreen' || e.key === 'F12') { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === 'I' || e.key === 'i')) { e.preventDefault(); return false; }
    if (e.ctrlKey && (e.key === 'p' || e.key === 's')) { e.preventDefault(); return false; }
  });

  document.addEventListener('dragstart', function(e) { e.preventDefault(); return false; });

  window.addEventListener('beforeprint', function(e) { e.preventDefault(); return false; });
})();
