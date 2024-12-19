import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Telegraf } from 'telegraf'
import { about, sendSubscribeMessage, subscribe, time } from './commands'
import { development, production } from './core'

const BOT_TOKEN = process.env.BOT_TOKEN || ''
const ENVIRONMENT = process.env.NODE_ENV || ''

const bot = new Telegraf(BOT_TOKEN)

bot.command('about', about())
bot.command('time', time())
bot.command('subscribe', subscribe())

sendSubscribeMessage(bot)

// prod mode (Vercel)
export async function startVercel(req: VercelRequest, res: VercelResponse) {
  await production(req, res, bot)
}
// dev mode
ENVIRONMENT !== 'production' && development(bot)
