import { builtinModules } from 'node:module'
import { defineConfig } from 'nitro'
import { esmExternalRequirePlugin } from 'rolldown/plugins'

export default defineConfig({
  serverDir: './',
  experimental: {
    tasks: true,
  },
  scheduledTasks: {
    '30 */2 * * *': ['attendance'],
  },
  runtimeConfig: {
    tokens: '',
    notificationUrls: '',
    maxRetries: '3',
    scheduleJitterSeconds: '',
    nitro: {
      envPrefix: 'SKLAND_',
    },
  },
  hooks: {
    'rollup:before': (_nitro, config) => {
      const { output, external } = config
      if (Array.isArray(external)) {
        config.external = external.filter(id => typeof id !== 'string' || (!id.startsWith('node:') && !builtinModules.includes(id)))
      }

      if (output && !Array.isArray(output) && output.inlineDynamicImports === false)
        delete output.inlineDynamicImports
    },
  },
  rolldownConfig: {
    plugins: [esmExternalRequirePlugin({ external: [...builtinModules, /^node:/] })],
    resolve: {
      mainFields: ['module', 'main'],
    },
    output: {
      codeSplitting: {
        groups: [
          {
            name: 'unstorage',
            test: /node_modules\/unstorage\/dist\/drivers\/(?!redis)/,
          },
          {
            name: 'unstorage-drivers-redis',
            test: /node_modules\/unstorage\/dist\/drivers\/redis/,
          },
        ],
      },
    },
  },
})
