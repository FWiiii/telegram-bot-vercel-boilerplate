import type { VercelRequest, VercelResponse } from '@vercel/node'

import { Telegraf } from 'telegraf'
import { about } from './commands'
import { development, production } from './core'
import { greeting } from './text'

const BOT_TOKEN = process.env.BOT_TOKEN || ''
const ENVIRONMENT = process.env.NODE_ENV || ''

const bot = new Telegraf(BOT_TOKEN)

bot.command('about', about())
bot.on('message', greeting())

// prod mode (Vercel)
export async function startVercel(req: VercelRequest, res: VercelResponse) {
  await production(req, res, bot)
}
// dev mode
ENVIRONMENT !== 'production' && development(bot)
