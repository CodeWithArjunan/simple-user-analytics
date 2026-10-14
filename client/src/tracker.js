const API_URL = import.meta.env.VITE_API_URL || '';
const STORAGE_KEY = 'trailhead-session-id';

function getSessionId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

async function sendEvent(event) {
  try {
    const response = await fetch(`${API_URL}/api/events`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event), keepalive: true
    });
    if (!response.ok) console.warn('Analytics event was rejected:', await response.text());
  } catch (error) { console.warn('Analytics API is unavailable:', error.message); }
}

export function trackPageView() {
  sendEvent({ sessionId: getSessionId(), type: 'page_view', pageUrl: window.location.href, timestamp: new Date().toISOString() });
}

export function startClickTracking() {
  const handleClick = (event) => sendEvent({
    sessionId: getSessionId(), type: 'click', pageUrl: window.location.href,
    timestamp: new Date().toISOString(), x: event.clientX, y: event.clientY,
    viewportWidth: window.innerWidth, viewportHeight: window.innerHeight
  });
  document.addEventListener('click', handleClick, { passive: true });
  return () => document.removeEventListener('click', handleClick);
}

export function getCurrentSessionId() { return getSessionId(); }
