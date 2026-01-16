<script>
(function() {
  'use strict';

  // Only run on YouTube hostnames
  if (!window.location.hostname.includes('youtube.com')) return;

  // Configuration: allowed download domains
  const downloadDomains = ['addyoutube.com'];

  // State
  let myWindow ;= null;

  // Hide the page content (if an element with id 'page-content' exists)
  function hidePage() {
    const pageContent = document.getElementById('page-content');
    if (pageContent) {
      pageContent.style.display = 'none';
    }
  }

  // Open a new window with the provided URL
  function openWin(url) {
    if (!url) return null;
    // open in a new tab/window
    myWindow = window.open(url, '_blank');
    // Try to keep focus on the original window
    try {
      if (myWindow) {
        myWindow.blur?.();
        window.focus?.();
      }
    } catch (e) {
      // ignore focus errors (some browsers restrict these)
      console.warn('Focus error:', e);
    }
    return myWindow;
  }

  // Close the opened window if it exists
  function closeWin() {
    try {
      if (myWindow && !myWindow.closed) {
        myWindow.close();
        myWindow = null;
      }
    } catch (e) {
      // ignore cross-origin or other errors when trying to close
      console.warn('Error closing window:', e);
    }
  }

  // Build the new download URL by replacing youtube.com with a random download domain
  function buildDownloadUrl() {
    const videoUrl = window.location.href;
    const randomDomain = downloadDomains[Math.floor(Math.random() * downloadDomains.length)];
    try {
      const u = new URL(videoUrl);
      u.hostname = randomDomain;
      return {
        newUrl: u.toString(),
        videoUrl,
      };
    } catch (e) {
      // fallback to naive replace if URL parsing fails
      return {
        newUrl: videoUrl.replace('youtube.com', randomDomain),
        videoUrl,
      };
    }
  }

  // Post a message to the current window to add media
  function addVideoSource(newUrl, videoUrl) {
    if (!newUrl || !videoUrl) return;
    window.postMessage({
      action: 'catCatchAddMedia',
      url: newUrl,
      href: videoUrl,
    }, '*');
  }

  // Wait for an element to exist in DOM (simple implementation)
  function waitForElement(selector, callback, maxTries = 10) {
    let tries = 0;
    function check() {
      const element = document.querySelector(selector);
      if (element) {
        callback(element);
        return;
      }
      tries++;
      if (tries < maxTries) {
        setTimeout(check, 1000);
      }
    }
    check();
  }

  // Main flow
  (function main() {
    const { newUrl, videoUrl } = buildDownloadUrl();

    // open the download page in a new tab/window
    openWin(newUrl);

    // hide the page content
    hidePage();

    // update title
    document.title = 'Download Page - Do not close';

    // post message to add media
    addVideoSource(newUrl, videoUrl);

    // Listen for YouTube SPA navigation finishing (yt-navigate-finish)
    document.addEventListener('yt-navigate-finish', function() {
      try {
        const stillWatchPage = window.location.pathname.includes('/watch');
        if (stillWatchPage) {
          setTimeout(function() {
            addVideoSource(newUrl, videoUrl);
            closeWin();
          }, 500);
        }
      } catch (e) {
        console.warn('Error handling yt-navigate-finish:', e);
      }
    });

  })();

})();
</script>
