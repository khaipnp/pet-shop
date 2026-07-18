import { NextResponse } from 'next/server'
import { handleSePayWebhook, type SePayWebhookPayload } from '@/lib/sepay'

export async function POST(request: Request) {
  try {
    const body = await request.json() as SePayWebhookPayload
    const signature = request.headers.get('x-sepay-signature') || undefined

    const result = await handleSePayWebhook(body, signature)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('SePay webhook error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    )
  }
}
