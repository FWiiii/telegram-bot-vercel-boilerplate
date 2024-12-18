import type { Context } from 'telegraf'
import createDebug from 'debug'

const debug = createDebug('bot:greeting_text')

function replyToMessage(ctx: Context, messageId: number, string: string) {
  return ctx.reply(string, {
    reply_parameters: { message_id: messageId },
  })
}

function greeting() {
  return async (ctx: Context) => {
    debug('Triggered "greeting" text command')

    const messageId = ctx.message?.message_id
    const userName = `${ctx.message?.from.first_name} ${ctx.message?.from.last_name}`

    if (messageId) {
      await replyToMessage(ctx, messageId, `Hello, ${userName}!`)
    }
  }
}

export { greeting }
