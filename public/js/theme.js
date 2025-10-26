// ========================================
// Theme Management System
// ========================================

class ThemeManager {
  constructor() {
    this.theme = this.getStoredTheme() || 'light';
    this.init();
  }

  init() {
    // Apply theme on page load
    this.applyTheme(this.theme);

    // Create theme toggle button if it doesn't exist
    this.createThemeToggle();

    // Listen for system theme changes
    this.listenForSystemThemeChanges();
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (e) {
      console.warn('localStorage not available:', e);
      return null;
    }
  }

  setStoredTheme(theme) {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
  }

  applyTheme(theme) {
    // Remove existing theme
    document.documentElement.removeAttribute('data-theme');

    // Apply new theme
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    this.theme = theme;
    this.setStoredTheme(theme);

    // Dispatch custom event for other scripts to listen
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  createThemeToggle() {
    // Check if toggle already exists
    if (document.querySelector('.theme-toggle')) {
      this.attachToggleListener();
      return;
    }

    // Create toggle button
    const toggle = document.createElement('div');
    toggle.className = 'theme-toggle';
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-label', 'Toggle theme');
    toggle.setAttribute('tabindex', '0');

    toggle.innerHTML = `
      <i class="fas fa-sun theme-icon sun"></i>
      <i class="fas fa-moon theme-icon moon"></i>
      <div class="theme-toggle-inner"></div>
    `;

    document.body.appendChild(toggle);
    this.attachToggleListener();
  }

  attachToggleListener() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    // Click event
    toggle.addEventListener('click', () => {
      this.toggleTheme();
      this.animateToggle();
    });

    // Keyboard support
    toggle.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTheme();
        this.animateToggle();
      }
    });
  }

  animateToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    toggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      toggle.style.transform = 'rotate(0deg)';
    }, 300);
  }

  listenForSystemThemeChanges() {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    darkModeQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!this.getStoredTheme()) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Get current theme
  getCurrentTheme() {
    return this.theme;
  }

  // Force set theme
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('Invalid theme:', theme);
      return;
    }
    this.applyTheme(theme);
  }
}

// ========================================
// Initialize Theme Manager
// ========================================

let themeManager;

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
  });
} else {
  themeManager = new ThemeManager();
}

// ========================================
// Global Theme Utilities
// ========================================

// Export for use in other scripts
window.getTheme = () => themeManager?.getCurrentTheme() || 'light';
window.setTheme = (theme) => themeManager?.setTheme(theme);
window.toggleTheme = () => themeManager?.toggleTheme();

// ========================================
// Smooth Page Transitions
// ========================================

// Add transition class to body for smooth theme changes
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
});

// ========================================
// Theme Change Event Listener Example
// ========================================

window.addEventListener('themechange', (e) => {
  console.log('Theme changed to:', e.detail.theme);

  // Update any charts, graphs, or third-party components
  // that need to respond to theme changes
  updateComponentsTheme(e.detail.theme);
});

function updateComponentsTheme(theme) {
  // Update any dynamic components that need theme awareness
  // For example: charts, maps, etc.

  // Update meta theme-color for mobile browsers
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    document.head.appendChild(metaThemeColor);
  }

  metaThemeColor.content = theme === 'dark' ? '#0a0a0a' : '#ffffff';
}

// ========================================
// Prevent Flash of Unstyled Content (FOUC)
// ========================================

// This script should be inlined in the <head> of your HTML:
// <script>
//   (function() {
//     const theme = localStorage.getItem('theme') || 'light';
//     if (theme === 'dark') {
//       document.documentElement.setAttribute('data-theme', 'dark');
//     }
//   })();
// </script>
