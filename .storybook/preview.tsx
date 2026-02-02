import type { Preview } from '@storybook/react';
import '../src/styles/accordion.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        light: {
          name: 'light',
          value: '#ffffff',
        },

        dark: {
          name: 'dark',
          value: '#1a1a1a',
        },

        grey: {
          name: 'grey',
          value: '#f5f5f5',
        }
      }
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  tags: ['autodocs'],

  initialGlobals: {
    backgrounds: {
      value: 'light'
    }
  }
};

export default preview;
