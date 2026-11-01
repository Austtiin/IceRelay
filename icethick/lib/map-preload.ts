export function warmMapConnection() {
  if (typeof document === 'undefined' || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;
  if (document.querySelector('link[data-ice-relay-map-preconnect]')) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = 'https://api.mapbox.com';
  link.crossOrigin = 'anonymous';
  link.dataset.iceRelayMapPreconnect = 'true';
  document.head.appendChild(link);
}
