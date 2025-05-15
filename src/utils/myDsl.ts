import Prism from 'prismjs';

/**
 * Custom DSL grammar for Prism
 * 
 * Each key in this object (e.g. "keyword", "number", etc.)
 * corresponds to a token name. Prism wraps matched text in <span class="token X">,
 * where X is the token name.  You can then color them in CSS.
 */
Prism.languages['my-dsl'] = {
  // Single-line comments (// ...)
  'comment': {
    pattern: /\/\/.*/,
    greedy: true
  },

  // Arrow symbol "->"
  'arrow': {
    pattern: /->/,
    alias: 'arrow'
  },

  // DSL keywords & properties
  'keyword': {
    pattern: /\b(?:network|device|interface|link|coordinates|power|speed|bandwidth|ip)\b/,
    alias: 'keyword'
  },

  // Device type definitions
  'type-name': {
    pattern: /\b(?:pc|laptop|switch|router|server)\b/,
    alias: 'type'
  },

  // IPv4 addresses (e.g., 192.168.1.10)
  'ip': {
    pattern: /\b\d{1,3}(?:\.\d{1,3}){3}\b/,
    alias: 'ip'
  },

  // Numbers (integer or float)
  'number': {
    pattern: /\b\d+(?:\.\d+)?\b/,
    alias: 'number'
  },

  // Braces { } (we give them their own token so we can color them distinctly)
  'brace': {
    pattern: /[{}]/,
    alias: 'punctuation'
  },

  // Parentheses or other punctuation
  'punctuation': /[()]/,

  // Identifiers (e.g., MyNetwork, PC0, FastEthernet0)
  // Simple fallback for alphanumeric names not matched above
  'identifier': {
    pattern: /\b[A-Za-z0-9_]+\b/,
    alias: 'identifier'
  }
};
