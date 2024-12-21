import type { Context, Telegraf } from 'telegraf'
import type { Chat } from 'telegraf/typings/core/types/typegram'
import { bold, fmt, mention, spoiler } from 'telegraf/format'
import { sql } from '../db/db'
import { timeToDate } from './time'

export function subscribe() {
  return async (ctx: Context) => {
    const chat = ctx.chat as Chat.PrivateChat
    const chatId = ctx.chat?.id
    const userName = chat.username
    // @ts-expect-error
    const subscribeDate = ctx.payload

    if (!subscribeDate) {
      return ctx.reply('Please provide a date to subscribe to.')
    }

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

// export async function sendSubscribeMessage(bot: Telegraf) {
//   const users = await sql`SELECT * FROM subscribe_date`

//   if (users.length === 0)
//     return
//   const promises = users.map(async (user) => {
//     return new Promise((resolve) => {
//       let replyText = `Hi,${user.user_name}\n`
//       for (const date of user.subscribe) {
//         const { diffInDays, diffInHours, diffInMinutes, diffInSeconds } = timeToDate(new Date(date))
//         replyText += `${diffInDays} days ${diffInHours} hours ${diffInMinutes} minutes ${diffInSeconds} seconds left to ${date}.\n`
//       }
//       bot.telegram.sendMessage(user.chat_id, bold(replyText))
//       resolve(user)
//     })
//   })
//   try {
//     const results = await Promise.all(promises)
//     console.log('Messages sent successfully:', results)
//   }
//   catch (error) {
//     console.error('Error sending messages:', error)
//   }
// }
