import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Telegraf } from 'telegraf'
import { about, sendSubscribeMessage, setRandomInterval, subscribe, time } from './commands'
import { unSubscribe } from './commands/unSubscribe'
import { development, production } from './core'
import { sql } from './db/db'

const BOT_TOKEN = process.env.BOT_TOKEN || ''
const ENVIRONMENT = process.env.NODE_ENV || ''

const bot = new Telegraf(BOT_TOKEN)

bot.command('about', about())
bot.command('time', time())
bot.command('subscribe', subscribe())
bot.command('unsubscribe', unSubscribe())
const interval = setRandomInterval(async () => {
  const users = await sql`SELECT * FROM subscribe_date`
  await sendSubscribeMessage(bot, users as Array<{ subscribe: string[], user_name: string, chat_id: string }>)
}, 1000 * 10, 1000 * 60)

// prod mode (Vercel)
export async function startVercel(req: VercelRequest, res: VercelResponse) {
  await production(req, res, bot)
}
// dev mode
ENVIRONMENT !== 'production' && development(bot)
