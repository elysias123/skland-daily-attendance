import { builtinModules } from 'node:module'
import process from 'node:process'
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
  modules: [
    (nitro) => {
      if (nitro.options.preset === 'cloudflare-module' || process.env.SKLAND_DISABLE_INTERNAL_SCHEDULE === '1')
        nitro.options.scheduledTasks = {}
    },
  ],
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
