/**
 * Design Tokens — Single Source of Truth
 * Ref: design-system.md
 */

export const DESIGN_TOKENS = {
  // 1.1 Primary — xanh lá (hành động chính, success)
  primary: {
    main: '#7FCA27',
    hover: '#6BB01F',
    pressed: '#6BB01F',
    subtle: '#EEF8E4',
    textOn: '#FFFFFF',
  },

  // 1.2 Brand — xanh dương (link, thông tin, action phụ, focus indicator)
  brand: {
    main: '#1E74E8',
    hover: '#185EC0',
    pressed: '#185EC0',
    subtle: '#EAF2FD',
  },

  // 1.3 Semantic — trạng thái
  semantic: {
    success: {
      main: '#7FCA27',
      subtle: '#EEF8E4',
    },
    info: {
      main: '#1E74E8',
      subtle: '#EAF2FD',
    },
    warning: {
      main: '#FF8832',
      subtle: '#FFF6EC',
    },
    error: {
      main: '#D32F2F',
      subtle: '#FDECEC',
    },
    neutral: {
      main: '#6B6B6B',
      subtle: '#F2F2F2',
    },
  },

  // 1.4 Text
  text: {
    primary: '#1F1F1F',
    secondary: '#6B6B6B',
    placeholder: '#D1D1D1',
    disabled: '#D1D1D1',
    inverse: '#FFFFFF',
    link: '#1E74E8',
  },

  // 1.5 Border (stroke thay cho shadow)
  border: {
    default: '#E0E0E0',
    strong: '#D1D1D1',
    focus: '#1E74E8',
  },

  // 1.6 Background
  background: {
    page: '#FFFFFF',
    subtle: '#F8F8F8',
    disabled: '#F2F2F2',
  },

  // 3. Spacing (Base 4px)
  spacing: {
    space0: '0px',
    space4: '4px',
    space8: '8px',
    space12: '12px',
    space16: '16px',
    space20: '20px',
    space24: '24px',
    space32: '32px',
  },

  // 4. Border Radius (Bội 4px)
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // 5. Shadow (Overlay ONLY)
  shadow: {
    none: 'none',
    sm: '0 2px 4px 0 rgba(0,0,0,0.08)',
    md: '0 4px 8px 0 rgba(0,0,0,0.10)',
  },

  // 5.1 Motion
  motion: {
    fast: '150ms ease-out',
    base: '200ms ease-out',
    slow: '300ms ease-out',
    none: '0ms',
  },

  // 7.1 Z-index Scale
  zIndex: {
    base: 0,
    raised: 10,
    sticky: 100,
    dropdown: 200,
    backdrop: 300,
    modal: 400,
    toast: 500,
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
