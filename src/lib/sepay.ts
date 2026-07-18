import crypto from 'node:crypto'
import prisma from '@/lib/prisma'

// ─── Types ─────────────────────────────────────────────

export interface SePayWebhookPayload {
  id: number
  gateway: string
  transactionDate: string
  accountNumber: string
  code: string
  content: string
  transferType: string
  description: string
  transferAmount: number
  referenceCode: string
  accumulated: number
  subAccount: string
}

export interface SePayWebhookResponse {
  success: boolean
  message?: string
}

// ─── Signature Verification ────────────────────────────

/**
 * Verifies the SePay webhook signature.
 * SePay signs the payload with HMAC-SHA256 using a shared secret.
 */
export function verifySePaySignature(
  payload: SePayWebhookPayload,
  signature: string,
): boolean {
  const secret = process.env.SEPAY_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[SePay] SEPAY_WEBHOOK_SECRET is not configured — skipping signature verification')
    return true
  }

  // SePay signing format: sort keys alphabetically, concatenate values, HMAC-SHA256
  const sortedKeys = Object.keys(payload).sort()
  const signString = sortedKeys.map((key) => String((payload as unknown as Record<string, unknown>)[key])).join('')

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signString)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature),
  )
}

// ─── Webhook Handler ───────────────────────────────────

/**
 * Handles an incoming SePay payment notification webhook.
 *
 * Workflow:
 * 1. Verify the HMAC signature (if configured)
 * 2. Extract the order code from the transaction content/description
 * 3. Look up the matching order
 * 4. Update the payment status to PAID and store the SePay transaction ID
 *
 * SePay sends transaction descriptions like:
 *   "DH-20260718-00001 Thanh toan don hang"
 * The order code is extracted from the leading portion of the content.
 */
export async function handleSePayWebhook(
  payload: SePayWebhookPayload,
  signature?: string,
): Promise<SePayWebhookResponse> {
  try {
    // Step 1: Verify signature
    if (signature) {
      const isValid = verifySePaySignature(payload, signature)
      if (!isValid) {
        console.warn('[SePay] Invalid webhook signature')
        return { success: false, message: 'Invalid signature' }
      }
    }

    // Step 2: Extract order code from transaction content
    // Content looks like: "DH-20260718-00001 Thanh toan don hang"
    const orderCode = extractOrderCode(payload.content)
    if (!orderCode) {
      console.warn('[SePay] Could not extract order code from content:', payload.content)
      return { success: false, message: 'Order code not found in content' }
    }

    // Step 3: Find the order
    const order = await prisma.order.findUnique({
      where: { orderCode },
    })

    if (!order) {
      console.warn(`[SePay] Order not found: ${orderCode}`)
      return { success: false, message: `Order ${orderCode} not found` }
    }

    // Skip if already paid
    if (order.paymentStatus === 'PAID') {
      return { success: true, message: 'Order already paid' }
    }

    // Verify amount matches (allow small tolerance for bank fees)
    const amount = payload.transferAmount
    const orderTotal = Number(order.total)
    if (Math.abs(amount - orderTotal) > 1000) {
      console.warn(
        `[SePay] Amount mismatch for ${orderCode}: expected ${orderTotal}, received ${amount}`,
      )
      return { success: false, message: 'Amount mismatch' }
    }

    // Step 4: Update order payment status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        sepayTransId: String(payload.id),
      },
    })

    console.log(
      `[SePay] Payment confirmed for ${orderCode} (transId: ${payload.id}, amount: ${amount})`,
    )

    return { success: true, message: 'Payment processed' }
  } catch (error) {
    console.error('[SePay] Webhook handler error:', error)
    return { success: false, message: 'Internal server error' }
  }
}

// ─── Helpers ───────────────────────────────────────────

/**
 * Extracts the order code (e.g., "DH-20260718-00001") from the
 * beginning of a SePay transaction content string.
 */
function extractOrderCode(content: string): string | null {
  const match = content.trim().match(/^(DH-\d{8}-\d{5})\b/)
  return match ? match[1] : null
}
