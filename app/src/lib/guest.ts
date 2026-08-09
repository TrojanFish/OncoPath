export function getGuestId(): string {
  if (typeof window === 'undefined') return 'anonymous';
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = 'guest-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
}
