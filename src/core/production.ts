import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { Context, Telegraf } from 'telegraf'
import type { Update } from 'telegraf/typings/core/types/typegram'
import createDebug from 'debug'

const debug = createDebug('bot:dev')

const PORT = (process.env.PORT && Number.parseInt(process.env.PORT, 10)) || 3000
const VERCEL_URL = `${process.env.VERCEL_URL}`

async function production(req: VercelRequest, res: VercelResponse, bot: Telegraf<Context<Update>>) {
  debug('Bot runs in production mode')
  debug(`setting webhook: ${VERCEL_URL}`)

  if (!VERCEL_URL) {
    throw new Error('VERCEL_URL is not set.')
  }

  const getWebhookInfo = await bot.telegram.getWebhookInfo()
  if (getWebhookInfo.url !== `${VERCEL_URL}/api`) {
    debug(`deleting webhook ${VERCEL_URL}`)
    await bot.telegram.deleteWebhook()
    debug(`setting webhook: ${VERCEL_URL}/api`)
    await bot.telegram.setWebhook(`${VERCEL_URL}/api`)
  }

  if (req.method === 'POST') {
    await bot.handleUpdate(req.body as unknown as Update, res)
  }
  else {
    res.status(200).json('Listening to bot events...')
  }
  debug(`starting webhook on port: ${PORT}`)
}
export { production }
