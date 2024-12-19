import { type Context, Input } from 'telegraf'

export function time() {
  return async (ctx: Context) => {
    // @ts-ignore
    const tagetDate = new Date(ctx.payload)
    const { diffInDays, diffInHours, diffInMinutes, diffInSeconds } = timeToDate(tagetDate)
    ctx.replyWithPhoto(Input.fromLocalFile('assets/doraemon.jpeg'), { caption: `${diffInDays} days ${diffInHours} hours ${diffInMinutes} minutes ${diffInSeconds} seconds left` })
  }
}

function timeToDate(tagetDate: Date) {
  const now = new Date()
  const diff = tagetDate.getTime() - now.getTime()
  const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24))
  const diffInHours = Math.floor(diff / (1000 * 60 * 60)) % 24
  const diffInMinutes = Math.floor(diff / (1000 * 60)) % 60
  const diffInSeconds = Math.floor(diff / 1000) % 60
  return { diffInDays, diffInHours, diffInMinutes, diffInSeconds }
}
