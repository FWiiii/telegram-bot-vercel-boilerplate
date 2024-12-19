import type { Context, Telegraf } from 'telegraf'
import type { Chat } from 'telegraf/typings/core/types/typegram'
import { sql } from '../db/db'
import { timeToDate } from './time'

export function subscribe() {
  return async (ctx: Context) => {
    const chat = ctx.chat as Chat.PrivateChat
    const chatId = ctx.chat?.id
    const userName = chat.username
    // @ts-ignore
    const subscribeDate = ctx.payload

    const hasSubscribe = await sql`SELECT * FROM subscribe_date WHERE chat_id = ${chatId}`

    try {
      if (hasSubscribe.length > 0) {
        await sql`
          UPDATE subscribe_date 
          SET subscribe = CASE
            WHEN array_position(subscribe, ${subscribeDate}) IS NULL 
            THEN array_append(subscribe, ${subscribeDate})
            ELSE subscribe
          END
          WHERE chat_id = ${chatId}
        `
      }
      else {
        await sql`INSERT INTO subscribe_date (chat_id, user_name, subscribe) VALUES (${chatId}, ${userName}, ARRAY[${subscribeDate}])`
      }
      ctx.reply('Subscribe!')
    }
    catch (error) {
      console.error(error)
      ctx.reply('Subscribe failed')
    }
  }
}

export function sendSubscribeMessage(bot: Telegraf) {
  let interval: NodeJS.Timeout | null = null
  interval && clearInterval(interval)
  interval = setInterval(async () => {
    const users = await sql`SELECT * FROM subscribe_date`
    const user = users[0]
    const subscribeDate = user.subscribe
    const userName = user.user_name
    const chatId = user.chat_id
    for (const date of subscribeDate) {
      const { diffInDays, diffInHours, diffInMinutes, diffInSeconds } = timeToDate(new Date(date))
      bot.telegram.sendMessage(chatId, `Hi ${userName} ${diffInDays} days ${diffInHours} hours ${diffInMinutes} minutes ${diffInSeconds} seconds left to ${date}`)
    }
  }, Math.floor(Math.random() * 100 + 30) * 1000 * 60)
}
