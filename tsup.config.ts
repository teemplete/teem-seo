import { defineConfig } from 'tsup'
import { execSync } from 'node:child_process'

const copyStyles = {
  onSuccess: async () => {
    execSync('node scripts/copy-styles.mjs', { stdio: 'inherit' })
  },
}

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'next/index': 'src/next/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'next'],
    treeshake: true,
  },
  {
    entry: {
      'react/index': 'src/react/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'next'],
    treeshake: true,
    ...copyStyles,
  },
])
