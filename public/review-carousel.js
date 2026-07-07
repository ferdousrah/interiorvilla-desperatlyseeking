(function() {
  function initReviewCarousel() {
    var section = document.getElementById('google-reviews-section');
    if (!section) return;
    if (section.dataset.carouselInit) return;
    section.dataset.carouselInit = 'true';

    var container = section.querySelector('[data-review-scroll]');
    var prevBtn = section.querySelector('[data-scroll-prev]');
    var nextBtn = section.querySelector('[data-scroll-next]');

    if (container && prevBtn && nextBtn) {
      var cardWidth = 340;
      prevBtn.addEventListener('click', function() {
        container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', function() {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      });
    }

    // Scroll-triggered fade-in animations
    var animItems = section.querySelectorAll('[data-animate]');
    if (animItems.length > 0 && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var delay = entry.target.getAttribute('data-delay') || '0';
            entry.target.style.transitionDelay = delay + 'ms';
            entry.target.classList.add('review-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      animItems.forEach(function(item) {
        observer.observe(item);
      });
    }
  }

  // Run on initial load
  initReviewCarousel();

  // Re-run on client-side navigation (Next.js SPA transitions)
  if ('MutationObserver' in window) {
    var timer;
    var bodyObserver = new MutationObserver(function() {
      clearTimeout(timer);
      timer = setTimeout(initReviewCarousel, 150);
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }
})();
