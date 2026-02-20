/**
 * WeightBuddy Landing Page - Main Script
 * Vanilla JS, no dependencies.
 */

(function () {
  'use strict';

  var NAVBAR_SCROLL_THRESHOLD = 50;
  var NAVBAR_HEIGHT = 80;
  var CAROUSEL_INTERVAL_MS = 5000;
  var COUNTER_DURATION_MS = 2000;
  var ANIMATION_OBSERVER_THRESHOLD = 0.15;

  function rafThrottle(fn) {
    var ticking = false;
    return function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          fn();
          ticking = false;
        });
      }
    };
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* Scroll-Triggered Animations */
  function initScrollAnimations() {
    var animatedElements = document.querySelectorAll('[data-animate]');
    if (!animatedElements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: ANIMATION_OBSERVER_THRESHOLD }
    );

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* Navbar Scroll Behaviour */
  function initNavbarScroll() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    function update() {
      if (window.scrollY > NAVBAR_SCROLL_THRESHOLD) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    update();
    window.addEventListener('scroll', rafThrottle(update), { passive: true });
  }

  /* Mobile Navigation */
  function initMobileNav() {
    var hamburger = document.getElementById('navHamburger');
    var navLinks = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    function setNavOpen(open) {
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }

    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = navLinks.classList.contains('open');
      setNavOpen(!isOpen);
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        setNavOpen(false);
      }
    });

    document.addEventListener('click', function (e) {
      if (
        navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        e.target !== hamburger &&
        !hamburger.contains(e.target)
      ) {
        setNavOpen(false);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        setNavOpen(false);
        hamburger.focus();
      }
    });
  }

  /* FAQ Accordion */
  function initFaqAccordion() {
    var faqQuestions = document.querySelectorAll('.faq-question');
    if (!faqQuestions.length) return;

    faqQuestions.forEach(function (question) {
      question.addEventListener('click', function () {
        var parentItem = question.closest('.faq-item');
        if (!parentItem) return;

        var isCurrentlyOpen = parentItem.classList.contains('open');

        document.querySelectorAll('.faq-item.open').forEach(function (item) {
          item.classList.remove('open');
          var btn = item.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        if (!isCurrentlyOpen) {
          parentItem.classList.add('open');
          question.setAttribute('aria-expanded', 'true');
        }
      });

      question.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    });
  }

  /* Testimonial Carousel */
  function initTestimonialCarousel() {
    var track = document.querySelector('.carousel-track');
    var dotsContainer = document.querySelector('.carousel-dots');
    if (!track) return;

    var slides = track.querySelectorAll('.testimonial-card');
    if (!slides.length) return;

    var currentIndex = 0;
    var autoAdvanceTimer = null;
    var isPaused = false;

    if (dotsContainer) {
      slides.forEach(function (_slide, i) {
        var dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', function () {
          goToSlide(i);
          restartAutoAdvance();
        });
        dotsContainer.appendChild(dot);
      });
    }

    var dots = dotsContainer
      ? dotsContainer.querySelectorAll('.carousel-dot')
      : [];

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      var slideWidth = slides[0].offsetWidth;
      var gap = parseInt(getComputedStyle(track).gap, 10) || 0;

      track.scrollTo({
        left: (slideWidth + gap) * currentIndex,
        behavior: 'smooth',
      });

      updateDots();
    }

    function updateDots() {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    var scrollTimeout = null;
    track.addEventListener(
      'scroll',
      function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function () {
          var slideWidth = slides[0].offsetWidth;
          var gap = parseInt(getComputedStyle(track).gap, 10) || 0;
          var newIndex = Math.round(track.scrollLeft / (slideWidth + gap));
          if (
            newIndex !== currentIndex &&
            newIndex >= 0 &&
            newIndex < slides.length
          ) {
            currentIndex = newIndex;
            updateDots();
          }
        }, 100);
      },
      { passive: true }
    );

    function startAutoAdvance() {
      stopAutoAdvance();
      autoAdvanceTimer = setInterval(function () {
        if (!isPaused) {
          goToSlide(currentIndex + 1);
        }
      }, CAROUSEL_INTERVAL_MS);
    }

    function stopAutoAdvance() {
      if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }
    }

    function restartAutoAdvance() {
      startAutoAdvance();
    }

    var carouselRoot = track.closest('.carousel') || track;

    carouselRoot.addEventListener('mouseenter', function () {
      isPaused = true;
    });
    carouselRoot.addEventListener('mouseleave', function () {
      isPaused = false;
    });
    carouselRoot.addEventListener(
      'focusin',
      function () {
        isPaused = true;
      },
      true
    );
    carouselRoot.addEventListener(
      'focusout',
      function () {
        isPaused = false;
      },
      true
    );

    startAutoAdvance();
  }

  /* Smooth Scroll & Active Nav Link */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      var targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      var top =
        targetEl.getBoundingClientRect().top +
        window.pageYOffset -
        NAVBAR_HEIGHT;

      window.scrollTo({ top: top, behavior: 'smooth' });

      if (history.pushState) {
        history.pushState(null, '', targetId);
      }
    });

    initActiveNavTracking();
  }

  function initActiveNavTracking() {
    var navAnchors = document.querySelectorAll('#navLinks a[href^="#"]');
    if (!navAnchors.length) return;

    var sections = [];
    navAnchors.forEach(function (anchor) {
      var id = anchor.getAttribute('href');
      var section = id ? document.querySelector(id) : null;
      if (section) {
        sections.push({ el: section, link: anchor });
      }
    });

    if (!sections.length) return;

    function update() {
      var scrollPos = window.scrollY + NAVBAR_HEIGHT + 40;
      var currentSection = null;

      sections.forEach(function (s) {
        if (s.el.offsetTop <= scrollPos) {
          currentSection = s;
        }
      });

      navAnchors.forEach(function (a) {
        a.classList.remove('active');
      });

      if (currentSection) {
        currentSection.link.classList.add('active');
      }
    }

    update();
    window.addEventListener('scroll', rafThrottle(update), { passive: true });
  }

  /* Counter Animation */
  function initCounterAnimation() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-count-suffix') || '';
    var isFloat = String(target).indexOf('.') !== -1;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;

      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / COUNTER_DURATION_MS, 1);
      var easedProgress = easeOutCubic(progress);
      var currentValue = easedProgress * target;

      if (isFloat) {
        el.textContent = currentValue.toFixed(1) + suffix;
      } else {
        el.textContent = Math.round(currentValue).toLocaleString() + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (isFloat) {
          el.textContent = target.toFixed(1) + suffix;
        } else {
          el.textContent = Math.round(target).toLocaleString() + suffix;
        }
      }
    }

    requestAnimationFrame(step);
  }

  /* Init */
  function init() {
    initScrollAnimations();
    initNavbarScroll();
    initMobileNav();
    initFaqAccordion();
    initTestimonialCarousel();
    initSmoothScroll();
    initCounterAnimation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
