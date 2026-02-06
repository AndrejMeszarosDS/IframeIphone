const iframeId = 'epIframe';

let lastSentHeight = 0;

const updateIframeHeight = () => {
    const height = document.body.scrollHeight;
    if (height !== lastSentHeight) {
        lastSentHeight = height;
        const msg = `[iFrameSizer]${iframeId}:${height}:100:reset`;
        window.parent.postMessage(msg, '*');
    }
};

const observeResize = root => {
    const obs = new MutationObserver(() => {
        clearTimeout(obs._t);
        obs._t = setTimeout(updateIframeHeight, 50);
    });

    obs.observe(root, { childList: true, attributes: true, subtree: true });
    updateIframeHeight();
};

const root = document.querySelector('html');

if (root) {
    observeResize(root);
} else {
    console.error('Required DOM element not found: .wrapper or .index');
}


/* ----------------------------------------------------------------------------- */

const postMsg = payload => {
    const msg = `[iFrameSizer]${iframeId}:0:0:message:${JSON.stringify(payload)}`;
    window.parent.postMessage(msg, '*');
};

const isVisible = el => {
    if (!el || !el.isConnected) return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
};

const getOpenModals = () => {
    const modal = document.getElementById('base-modal-content');
    return modal && isVisible(modal) ? [modal] : [];
};

const sendModalOpened = modal => {
    if (!modal) return;
    setTimeout(() => {
        const rect = modal.getBoundingClientRect();
        postMsg({ type: 'modalOpened', top: rect.top, height: rect.height });
    }, 50);
};

const sendModalClosed = () => {
    postMsg({ type: 'modalClosed', top: 0, height: 0 });
};

let previouslyOpen = false;

setInterval(() => {

    const nowOpen = getOpenModals();

    if (nowOpen.length > 0 && !previouslyOpen) {
        const first = nowOpen[0];
        sendModalOpened(first);
        window.dispatchEvent(new CustomEvent('modalOpened', { detail: first }));
    }

    if (nowOpen.length === 0 && previouslyOpen) {
        window.dispatchEvent(new CustomEvent('modalClosed'));
        sendModalClosed();
    }
    previouslyOpen = nowOpen.length > 0;
}, 150);
