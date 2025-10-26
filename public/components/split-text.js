// ========================================
// SplitText Component - JavaScript
// Animated Text Effects with Theme Support
// ========================================

class SplitText {
  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;

    if (!this.element) {
      console.warn('SplitText: Element not found');
      return;
    }

    this.options = {
      type: options.type || 'chars', // 'chars', 'words', or 'both'
      animation: options.animation || 'fade', // 'fade', 'slide-up', 'wave', 'rotate', 'scale', 'blur'
      gradient: options.gradient || false,
      hover: options.hover || false,
      delay: options.delay || 0,
      duration: options.duration || 0.6,
      stagger: options.stagger || 0.05,
      ...options
    };

    this.originalText = this.element.textContent;
    this.split();
  }

  split() {
    const text = this.originalText;
    const type = this.options.type;

    // Clear existing content
    this.element.innerHTML = '';

    // Add container wrapper
    this.element.classList.add('split-text-container');

    // Create split text wrapper
    const wrapper = document.createElement('div');
    wrapper.classList.add('split-text');

    // Add animation class
    if (this.options.animation) {
      wrapper.classList.add(`split-text-${this.options.animation}`);
    }

    // Add gradient class
    if (this.options.gradient) {
      wrapper.classList.add('split-text-gradient');
    }

    // Add hover class
    if (this.options.hover) {
      wrapper.classList.add('split-text-hover');
    }

    if (type === 'chars' || type === 'both') {
      this.splitIntoChars(text, wrapper);
    } else if (type === 'words') {
      this.splitIntoWords(text, wrapper);
    }

    this.element.appendChild(wrapper);
  }

  splitIntoChars(text, wrapper) {
    const chars = text.split('');

    chars.forEach((char, index) => {
      const span = document.createElement('span');
      span.classList.add('split-text-char');
      span.textContent = char === ' ' ? '\u00A0' : char;

      // Apply stagger delay
      if (this.options.animation && this.options.animation !== 'wave') {
        span.style.animationDelay = `${this.options.delay + (index * this.options.stagger)}s`;
      }

      wrapper.appendChild(span);
    });
  }

  splitIntoWords(text, wrapper) {
    const words = text.split(' ');

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.classList.add('split-text-word');

      if (this.options.type === 'both') {
        // Split words into characters
        word.split('').forEach((char, charIndex) => {
          const charSpan = document.createElement('span');
          charSpan.classList.add('split-text-char');
          charSpan.textContent = char;

          // Apply stagger delay
          const totalIndex = wordIndex * 10 + charIndex; // Rough calculation
          if (this.options.animation && this.options.animation !== 'wave') {
            charSpan.style.animationDelay = `${this.options.delay + (totalIndex * this.options.stagger)}s`;
          }

          wordSpan.appendChild(charSpan);
        });
      } else {
        wordSpan.textContent = word;

        // Apply stagger delay
        if (this.options.animation && this.options.animation !== 'wave') {
          wordSpan.style.animationDelay = `${this.options.delay + (wordIndex * this.options.stagger)}s`;
        }
      }

      wrapper.appendChild(wordSpan);

      // Add space after word (except for last word)
      if (wordIndex < words.length - 1) {
        const space = document.createElement('span');
        space.classList.add('split-text-char');
        space.textContent = '\u00A0';
        wrapper.appendChild(space);
      }
    });
  }

  // Replay animation
  replay() {
    const wrapper = this.element.querySelector('.split-text');
    if (!wrapper) return;

    // Remove and re-add animation class to trigger restart
    const animationClass = `split-text-${this.options.animation}`;
    wrapper.classList.remove(animationClass);

    // Force reflow
    void wrapper.offsetWidth;

    wrapper.classList.add(animationClass);
  }

  // Revert to original text
  revert() {
    this.element.textContent = this.originalText;
    this.element.classList.remove('split-text-container');
  }

  // Update animation type
  setAnimation(animation) {
    const wrapper = this.element.querySelector('.split-text');
    if (!wrapper) return;

    // Remove old animation class
    if (this.options.animation) {
      wrapper.classList.remove(`split-text-${this.options.animation}`);
    }

    // Add new animation class
    this.options.animation = animation;
    wrapper.classList.add(`split-text-${animation}`);
  }
}

// ========================================
// Auto-initialize SplitText elements
// ========================================

function initSplitText() {
  // Find all elements with data-split-text attribute
  const elements = document.querySelectorAll('[data-split-text]');

  elements.forEach(element => {
    const options = {
      type: element.dataset.splitType || 'chars',
      animation: element.dataset.splitAnimation || 'fade',
      gradient: element.dataset.splitGradient === 'true',
      hover: element.dataset.splitHover === 'true',
      delay: parseFloat(element.dataset.splitDelay) || 0,
      duration: parseFloat(element.dataset.splitDuration) || 0.6,
      stagger: parseFloat(element.dataset.splitStagger) || 0.05
    };

    new SplitText(element, options);
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSplitText);
} else {
  initSplitText();
}

// ========================================
// Export for use in other scripts
// ========================================

if (typeof window !== 'undefined') {
  window.SplitText = SplitText;
}

// ========================================
// Usage Examples:
// ========================================

/*

// HTML Usage:
<h1 data-split-text
    data-split-type="chars"
    data-split-animation="fade"
    data-split-gradient="true">
  Welcome to FixItNow
</h1>

// JavaScript Usage:
const splitText = new SplitText('.my-title', {
  type: 'chars',
  animation: 'fade',
  gradient: true,
  hover: true,
  delay: 0.2,
  stagger: 0.05
});

// Replay animation
splitText.replay();

// Change animation
splitText.setAnimation('wave');

// Revert to original
splitText.revert();

*/
