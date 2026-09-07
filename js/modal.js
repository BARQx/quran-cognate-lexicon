// ============================================================
// Modal Dialog Controller & Scroll Locking (Zero Layout Shift)
// ============================================================

let lockedScrollY = 0;
let isModalOpen = false;

function isPointInsideDialog(clientX, clientY, dialog) {
  if (!dialog || !dialog.open) return false;
  const rect = dialog.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

function lockModalState(targetDialog) {
  if (!isModalOpen) {
    lockedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // Measure exact scrollbar width before locking
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.style.setProperty('--scrollbar-compensation', `${scrollbarWidth}px`);

    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    isModalOpen = true;
  }
  if (targetDialog) {
    targetDialog.scrollTop = 0;
  }
}

function unlockModalState(closingDialog) {
  queueMicrotask(() => {
    const openDialogs = Array.from(document.querySelectorAll('dialog')).filter(d => d.open && d !== closingDialog);
    if (openDialogs.length === 0 && isModalOpen) {
      isModalOpen = false;
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.documentElement.style.setProperty('--scrollbar-compensation', '0px');
      window.scrollTo(window.scrollX || 0, lockedScrollY);
      document.querySelectorAll('dialog').forEach(d => {
        delete d.dataset.modalInit;
      });
    }
  });
}

// Hook native showModal & close for instantaneous synchronous lock without microtask flicker
if (typeof HTMLDialogElement !== 'undefined' && HTMLDialogElement.prototype) {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;

  HTMLDialogElement.prototype.showModal = function() {
    lockModalState(this);
    try {
      return originalShowModal.call(this);
    } finally {
      this.scrollTop = 0;
    }
  };

  HTMLDialogElement.prototype.close = function(returnValue) {
    const res = originalClose.call(this, returnValue);
    unlockModalState(this);
    return res;
  };
}

const dialogObserver = new MutationObserver(() => {
  const anyOpen = Array.from(document.querySelectorAll('dialog')).some(d => d.open);
  if (anyOpen && !isModalOpen) {
    lockModalState();
  } else if (!anyOpen && isModalOpen) {
    unlockModalState();
  }
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  dialog.addEventListener('close', () => unlockModalState(dialog));
  // Ensure dialogs NEVER close from outside taps or escape gestures — only explicit button clicks close them
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
  });
});

// Prevent wheel scrolling on the background page while a dialog is visible
window.addEventListener('wheel', (e) => {
  const openDialog = document.querySelector('dialog[open]');
  if (!openDialog) return;
  if (!isPointInsideDialog(e.clientX, e.clientY, openDialog)) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent touch swiping on the background page while a dialog is visible
window.addEventListener('touchmove', (e) => {
  const openDialog = document.querySelector('dialog[open]');
  if (!openDialog) return;
  if (e.touches && e.touches[0]) {
    if (!isPointInsideDialog(e.touches[0].clientX, e.touches[0].clientY, openDialog)) {
      e.preventDefault();
    }
  }
}, { passive: false });

// Prevent navigation keys from scrolling the background page while a dialog is visible
window.addEventListener('keydown', (e) => {
  const openDialog = document.querySelector('dialog[open]');
  if (!openDialog) return;
  const navKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
  if (navKeys.includes(e.key) && !openDialog.contains(document.activeElement)) {
    e.preventDefault();
  }
}, { passive: false });

// Pin background window scroll position so the page never moves while a modal is visible
window.addEventListener('scroll', () => {
  if (isModalOpen) {
    const currentY = window.scrollY || window.pageYOffset || 0;
    if (Math.abs(currentY - lockedScrollY) > 1) {
      window.scrollTo(window.scrollX || 0, lockedScrollY);
    }
  }
}, { passive: false });
