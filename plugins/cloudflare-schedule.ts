import { definePlugin } from 'nitro'
import { runTask } from 'nitro/task'

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:scheduled', async ({ env, context }) => {
    await runTask('attendance', { context: { cloudflare: { env, context } } })
  })
})
