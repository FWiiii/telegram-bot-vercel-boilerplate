import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Telegraf } from 'telegraf'
import { subscribe, subscribeInfo, unSubscribe } from './commands'
import { development, production } from './core'

const BOT_TOKEN = process.env.BOT_TOKEN || ''
const ENVIRONMENT = process.env.NODE_ENV || ''

const bot = new Telegraf(BOT_TOKEN)

bot.command('subscribe', subscribe())
bot.command('un_subscribe', unSubscribe())
bot.command('subscribe_info', subscribeInfo())

bot.telegram.setMyCommands([
  { command: 'subscribe', description: 'Subscribe to a date' },
  { command: 'un_subscribe', description: 'Unsubscribe from a date' },
  { command: 'subscribe_info', description: 'Get your current subscriptions' },
])

// prod mode (Vercel)
export async function startVercel(req: VercelRequest, res: VercelResponse) {
  await production(req, res, bot)
}
// dev mode
ENVIRONMENT !== 'production' && development(bot)
