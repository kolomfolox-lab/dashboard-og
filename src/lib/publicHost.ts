export function getHostname() {
  return window.location.hostname.toLowerCase();
}

export function isReviewHubHost(hostname = getHostname()) {
  return (
    hostname === 'review.waitly.uz' ||
    hostname === 'reviews.waitly.uz' ||
    hostname === 'review.moonlauncher.org' ||
    hostname === 'reviews.moonlauncher.org' ||
    hostname.startsWith('review.') ||
    hostname.startsWith('reviews.')
  );
}

export function isLocalHost(hostname = getHostname()) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function isMarketingHost(hostname = getHostname()) {
  return (
    hostname === 'waitly.uz' ||
    hostname === 'www.waitly.uz' ||
    hostname === 'moonlauncher.org' ||
    hostname === 'www.moonlauncher.org'
  );
}

export function shouldUseReviewsRoot(hostname = getHostname()) {
  return isReviewHubHost(hostname);
}
