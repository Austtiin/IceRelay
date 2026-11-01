'use client';

import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';

const theme = createTheme({
  palette: {
    primary: {
      main: '#426b8c',
      dark: '#18364f',
      light: '#c6d9e8',
    },
    secondary: {
      main: '#FE5F55', // Danger/accent red
      light: '#FF8C42',
    },
    warning: {
      main: '#F7A93D',
    },
    success: {
      main: '#4A90E2',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          padding: '0.75rem 2rem',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true;
    const insert = cache.insert;
    let pending: { name: string; global: boolean }[] = [];

    cache.insert = (...args) => {
      const [selector, serialized] = args;
      if (cache.inserted[serialized.name] === undefined) {
        pending.push({ name: serialized.name, global: selector === '' });
      }
      return insert(...args);
    };

    return {
      cache,
      flush: () => {
        const styles = pending;
        pending = [];
        return styles;
      },
    };
  });

  // Emit server-generated styles outside the hydrating component tree.
  useServerInsertedHTML(() => {
    const pending = flush();
    if (pending.length === 0) return null;

    let css = '';
    let names = '';
    const globals = [];
    for (const entry of pending) {
      const style = cache.inserted[entry.name];
      if (typeof style !== 'string') {
        throw new Error(`Missing server-rendered Emotion CSS: ${entry.name}`);
      }
      if (entry.global) {
        globals.push(
          <style
            key={entry.name}
            data-emotion={`${cache.key}-global ${entry.name}`}
            dangerouslySetInnerHTML={{ __html: style }}
          />
        );
      } else {
        names += ` ${entry.name}`;
        css += style;
      }
    }

    return (
      <>
        {globals}
        {css && (
          <style data-emotion={`${cache.key}${names}`} dangerouslySetInnerHTML={{ __html: css }} />
        )}
      </>
    );
  });

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
}
