import type { Context, Telegraf } from 'telegraf'
import type { Chat } from 'telegraf/typings/core/types/typegram'
import { sql } from '../db/db'
import { timeToDate } from './time'

export function subscribe() {
  return async (ctx: Context) => {
    const chat = ctx.chat as Chat.PrivateChat
    const chatId = ctx.chat?.id
    const userName = chat.username
    // @ts-expect-error
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
      const subscribeDates = await sql`SELECT * FROM subscribe_date WHERE chat_id = ${chatId}`
      ctx.reply(`Subscribed! You are subscribed to the following dates: ${subscribeDates[0].subscribe.join(', ')}`)
    }
    catch (error) {
      console.error(error)
      ctx.reply('Subscribe failed')
    }
  }
}

export async function sendSubscribeMessage(bot: Telegraf, users: Array<{ subscribe: string[], user_name: string, chat_id: string }>) {
  if (users.length === 0)
    return
  for (const user of users) {
    const subscribeDate = user.subscribe
    if (subscribeDate.length === 0)
      continue
    const userName = user.user_name
    const chatId = user.chat_id
    for (const date of subscribeDate) {
      const { diffInDays, diffInHours, diffInMinutes, diffInSeconds } = timeToDate(new Date(date))
      bot.telegram.sendMessage(chatId, `Hi ${userName} ${diffInDays} days ${diffInHours} hours ${diffInMinutes} minutes ${diffInSeconds} seconds left to ${date}`)
    }
  }
}

export function setRandomInterval(callback: () => Promise<void>, min: number, max: number) {
  let timeout: NodeJS.Timeout | null = null
  const getRandomInterval = () => Math.floor(Math.random() * (max - min + 1)) + min
  const runInterval = () => {
    const nextDelay = getRandomInterval()
    timeout = setTimeout(async () => {
      await callback()
      runInterval()
    }, nextDelay)
  }
  runInterval()
  return () => clearTimeout(timeout!)
}
