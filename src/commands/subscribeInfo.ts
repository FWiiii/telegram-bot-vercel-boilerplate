import type { Context } from 'telegraf'
import { sql } from '../db/db'

export function subscribeInfo() {
  return async (ctx: Context) => {
    const chatId = ctx.chat?.id

    try {
      const subscribeDates = await sql`SELECT subscribe FROM subscribe_date WHERE chat_id = ${chatId}`

      if (!subscribeDates.length || !subscribeDates[0].subscribe.length) {
        return ctx.reply('You have no active subscriptions.')
      }

      ctx.reply(`Your current subscriptions: ${subscribeDates[0].subscribe.join(', ')}`)
    }
    catch (error) {
      console.error(error)
      ctx.reply('Failed to fetch subscriptions')
    }
  }
}
