// ═══════════════════════════════════════════════
//  STATE & INITIALIZATION
// ═══════════════════════════════════════════════
let currentTheme = localStorage.getItem('yummways_theme') || 'dark';

// 1. Disable browser scroll restoration immediately
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// 2. Scroll to top on fresh load
window.scrollTo({ top: 0, left: 0, behavior: "auto" });

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);
  bindEvents();
  
  // 3. Remove loader and trigger hero entrance animations after a cinematic delay
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 1200); // ~1200ms ensures all loader intro animations complete first
});

// ═══════════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════════
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  localStorage.setItem('yummways_theme', theme);
}

// ═══════════════════════════════════════════════
//  EVENTS
// ═══════════════════════════════════════════════
function bindEvents() {
  // Theme
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
    });
  }

  // Scroll effects (Navbar + Parallax)
  const navbar = document.getElementById('navbar');
  const heroBg = document.getElementById('heroBg');
  const scrollInd = document.querySelector('.scroll-indicator');
  const parallaxWrappers = document.querySelectorAll('.parallax-wrapper');
  const heroContent = document.querySelector('.hero-content');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        
        // Navbar
        if (navbar) navbar.classList.toggle('scrolled', scrollY > 50);
        
        // Parallax only if near top to save performance and motion is allowed
        if (scrollY < window.innerHeight && !prefersReducedMotion) {
          if (heroBg) heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
          if (heroContent) heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
          if (scrollInd) scrollInd.style.opacity = Math.max(0, 1 - scrollY / 300);
          
          parallaxWrappers.forEach((el, index) => {
            const speed = (index % 3 + 1) * 0.15;
            const dir = index % 2 === 0 ? 1 : -1;
            el.style.transform = `translateY(${scrollY * speed * dir}px)`;
          });
        }
        
        // Global Parallax Elements
        if (!prefersReducedMotion) {
          document.querySelectorAll('.parallax-element').forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const speed = el.dataset.speed || 0.1;
              const yOffset = (window.innerHeight - rect.top) * speed;
              if(el.classList.contains('phone-mockup')) {
                 el.style.transform = `translateY(-${yOffset * 0.2}px) rotateX(${yOffset * 0.01}deg) translate(var(--mx, 0px), var(--my, 0px)) rotate(var(--mrot, 0deg))`;
              } else {
                 el.style.transform = `translateY(${yOffset}px)`;
              }
            }
          });
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  // Phone Mockup subtle interaction (Desktop only)
  const phoneMockup = document.querySelector('.phone-mockup');
  if (phoneMockup && window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
    let mTick = false;
    document.addEventListener('mousemove', (e) => {
      if (!mTick) {
        requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth) - 0.5; // -0.5 to 0.5
          const y = (e.clientY / window.innerHeight) - 0.5;
          phoneMockup.style.setProperty('--mx', `${x * 8}px`);
          phoneMockup.style.setProperty('--my', `${y * 8}px`);
          phoneMockup.style.setProperty('--mrot', `${x * 2}deg`);
          mTick = false;
        });
        mTick = true;
      }
    });
  }

  // Global Scroll Animations (IntersectionObserver)
  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        
        // Handle count-up elements
        if (entry.target.classList.contains('count-up')) {
          startCountUp(entry.target);
        }
        entry.target.querySelectorAll('.count-up').forEach(startCountUp);
        
        // Optimize: Stop observing once revealed
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  });

  // Observe all elements with animation classes
  document.querySelectorAll('.reveal-up, .reveal-down, .reveal-left, .reveal-right, .scale-in, .blur-reveal, .stagger-container').forEach(el => {
    animationObserver.observe(el);
  });


  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = navLinks.style.display === 'flex';
      if (isExpanded) {
        navLinks.style.display = 'none';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'var(--nav-bg)';
        navLinks.style.padding = '1rem';
        navLinks.style.borderBottom = '1px solid var(--border)';
      }
    });

    // Close mobile menu on link click
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          navLinks.style.display = 'none';
        }
      });
    });
  }
}

// ═══════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════

// Formats numbers with Indian comma system (e.g. 5,00,000)
function formatIndianNumber(num) {
  const x = Math.floor(num).toString();
  let lastThree = x.substring(x.length - 3);
  const otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers != '') {
    lastThree = ',' + lastThree;
  }
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
}

// Animates a number from 0 to target over 2s
function startCountUp(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = 'true';
  
  const target = parseInt(el.dataset.val, 10);
  if (isNaN(target)) return;
  
  const duration = 2000;
  const start = performance.now();
  
  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(target * easeOut);
    
    el.textContent = formatIndianNumber(current);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = formatIndianNumber(target);
    }
  }
  
  requestAnimationFrame(update);
}