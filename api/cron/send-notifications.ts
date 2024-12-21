import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Telegraf } from 'telegraf'
import { bold } from 'telegraf/format'
import { timeToDate } from '../../src/commands/time'
import { sql } from '../../src/db/db'

const bot = new Telegraf(process.env.BOT_TOKEN!)

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // 验证 cron job 的密钥（可选但推荐）
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const users = await sql`SELECT * FROM subscribe_date`

    if (users.length === 0) {
      return res.status(200).json({ message: 'No subscriptions found' })
    }

    const promises = users.map(async (user) => {
      return new Promise((resolve) => {
        let replyText = `Hi,${user.user_name}\n`
        for (const date of user.subscribe) {
          const { diffInDays, diffInHours, diffInMinutes, diffInSeconds } = timeToDate(new Date(date))
          replyText += `${diffInDays} days ${diffInHours} hours ${diffInMinutes} minutes ${diffInSeconds} seconds left to ${date}.\n`
        }
        bot.telegram.sendMessage(user.chat_id, bold(replyText))
        resolve(user)
      })
    })

    await Promise.all(promises)
    res.status(200).json({ message: 'Notifications sent successfully' })
  }
  catch (error) {
    console.error('Error sending notifications:', error)
    res.status(500).json({ error: 'Failed to send notifications' })
  }
}
