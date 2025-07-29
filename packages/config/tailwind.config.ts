import type { Config } from 'tailwindcss'

export const baseConfig: Config = {
  content: [], // to be overridden
  theme: {
    extend: {
      colors: {},
      borderRadius: {},
      fontFamily: {},
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
  ],
}
