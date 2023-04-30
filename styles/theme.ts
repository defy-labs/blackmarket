import { extendTheme } from '@chakra-ui/react'

// Chakra foundations
// https://github.com/chakra-ui/chakra-ui/tree/main/packages/theme/src/foundations

export const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    300: '#93C5FD',
    500: '#3B82F6',
    600: '#2563EB',
  },
  brand: {
    50: '#F3F3F4',
    100: '#F3F3F4',
    200: '#6A6E79',
    300: '#6A6E79',
    400: '#060D20',
    500: '#060D20',
    600: '#040813',
    700: '#040813',
    800: '#040813',
    900: '#040813',
    black: '#000000',
  },
  secondary: {
    100: '#C9FBCB',
    500: '#02B14F',
    black: '#232323',
    accent: '#08C725',
  },
  gray: {
    100: '#F3F4F6',
    200: '#E5E7Eb',
    300: '#D1D5Db',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
  },
  green: {
    50: '#ECFDF5',
    300: '#6EE7B7',
    500: '#10B981',
  },
  orange: {
    50: '#FFF7ED',
    300: '#FDBA74',
    500: '#F97316',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    300: '#FCA5A5',
    500: '#EF4444',
    900: '#7F1D1D',
  },
  Heading: {
    variants: {
      title: {
        fontSize: '36px',
        lineHeight: '40px',
        fontWeight: 700,
      },
      heading2: {
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: 700,
      },
      heading4: {
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 600,
      },
    },
  },
  Text: {
    variants: {
      text: {
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: 400,
      },
      'text-sm': {
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 400,
      },
      caption: {
        fontSize: '12px',
        lineHeight: '16px',
        fontWeight: 400,
      },
      error: {
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 500,
        color: 'red.500',
      },
    },
  },
}

export const theme = extendTheme({
  breakPoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'xl',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Checkbox: {
      baseStyle: {
        container: {
          w: 'full',
          rounded: 'xl',
          p: 2,
          _hover: {
            bg: 'brand.50',
          },
          _selected: {
            bg: 'brand.50',
          },
          _checked: {
            bg: 'brand.50',
          },
        },
        control: {
          bg: 'white',
          border: '1px solid',
          borderRadius: '4px',
          borderColor: 'gray.200',
          color: 'white',

          _checked: {
            bg: 'brand.500',
            borderColor: 'brand.500',
            color: 'white',

            _hover: {
              bg: 'brand.600',
              borderColor: 'brand.600',
              color: 'white',
            },

            _disabled: {
              bg: 'brand.700',
              borderColor: 'brand.700',
              color: 'white',
              opacity: 0.3,
            },
          },

          _indeterminate: {
            bg: 'brand.500',
            borderColor: 'brand.500',
            color: 'white',
          },

          _disabled: {
            bg: 'brand.700',
            borderColor: 'brand.700',
            opacity: 0.3,
          },

          _focus: {
            borderColor: 'brand.500',
            boxShadow: 'none',
          },

          _focusVisible: {
            boxShadow: 'none',
          },

          _invalid: {
            borderColor: 'red.500',
          },
        },
        label: {
          width: 'full',
        },
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Accordion: {
      baseStyle: {
        container: {
          py: 4,
          _first: {
            borderTopWidth: '0px',
            pt: 0,
          },
          _last: {
            borderBottomWidth: '0px',
            pb: 0,
          },
        },
        button: {
          px: 0,
          py: 0,
          _hover: {
            bg: 'transparent',
          },
          _focus: {
            boxShadow: 'none',
          },
        },
        panel: {
          px: 0,
          pb: 0,
          pt: 3,
        },
      },
    },
    Link: {
      baseStyle: {
        textDecoration: 'none',
        _hover: {
          textDecoration: 'none',
        },
        _focus: {
          textDecoration: 'none',
        },
        _visited: {
          textDecoration: 'none',
        },
        _active: {
          textDecoration: 'none',
        },
      },
    },
    Heading: {
      variants: {
        title: {
          fontSize: '36px',
          lineHeight: '40px',
          fontWeight: 800,
        },
        subtitle: {
          fontSize: '24px',
          lineHeight: '32px',
          fontWeight: 700,
        },
        heading1: {
          fontSize: '20px',
          lineHeight: '28px',
          fontWeight: 700,
        },
        heading2: {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: 600,
        },
        heading3: {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: 500,
        },
        heading4: {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 700,
        },
      },
    },
    Text: {
      variants: {
        text: {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: 400,
        },
        'text-sm': {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 400,
        },
        subtitle1: {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: 500,
        },
        subtitle2: {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 500,
        },
        button1: {
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: 600,
        },
        button2: {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 600,
        },
        caption: {
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: 400,
        },
        error: {
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 500,
          color: 'red.500',
        },
      },
    },
  },
	fonts: {
		heading: 'Inter',
		body: 'Inter',
		mono: 'Inter',
	},
  colors: COLORS,
  radii: {
		none: '0',
		sm: '16px',
		base: '16px',
		md: '16px',
		lg: '16px',
		xl: '24px',
		'2xl': '24px',
		'3xl': '24px',
		full: '9999px',
	},
})
