import type { Preview } from '@storybook/nextjs-vite'
import "../app/globals.css"

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "canvas",
      values: [
        { name: "canvas", value: "#08090C" },
        { name: "panel", value: "#111419" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
}

export default preview
