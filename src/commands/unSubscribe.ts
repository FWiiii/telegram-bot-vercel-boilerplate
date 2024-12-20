import type { Context } from 'telegraf'
import type { Chat } from 'telegraf/typings/core/types/typegram'
import { sql } from '../db/db'

export function unSubscribe() {
  return async (ctx: Context) => {
    const chatId = ctx.chat?.id
    // @ts-ignore
    const dateToUnsubscribe = ctx.payload

    try {
      const currentSubscription = await sql`SELECT subscribe FROM subscribe_date WHERE chat_id = ${chatId}`

      if (!currentSubscription[0]?.subscribe.includes(dateToUnsubscribe)) {
        return ctx.reply(`You are not subscribed to ${dateToUnsubscribe}`)
      }

      await sql`
        UPDATE subscribe_date 
        SET subscribe = CASE
          WHEN array_length(subscribe, 1) = 1 THEN ARRAY[]::text[]
          ELSE array_remove(subscribe, ${dateToUnsubscribe})
        END
        WHERE chat_id = ${chatId}
      `

      const subscribeDates = await sql`SELECT * FROM subscribe_date WHERE chat_id = ${chatId}`
      const remainingDates = subscribeDates[0].subscribe

      if (remainingDates.length === 0)
        ctx.reply('You have unsubscribed from all dates.')
      else
        ctx.reply(`Unsubscribed from ${dateToUnsubscribe}. Your remaining subscriptions: ${remainingDates.join(', ')}`)
    }
    catch (error) {
      console.error(error)
      ctx.reply('Unsubscribe failed')
    }
  }
}
