export type PaymentStatus = 'pending' | 'success' | 'failed';

/**
 * Pemetaan status Midtrans ke tiga status standar aplikasi:
 * - settlement / capture(accept) -> success
 * - pending / capture(challenge) -> pending
 * - deny / cancel / expire / failure -> failed
 */
export function mapMidtransStatus(
  transactionStatus: string | undefined,
  fraudStatus?: string | undefined,
): PaymentStatus {
  switch ((transactionStatus ?? '').toLowerCase()) {
    case 'settlement':
      return 'success';
    case 'capture':
      return (fraudStatus ?? '').toLowerCase() === 'challenge' ? 'pending' : 'success';
    case 'pending':
      return 'pending';
    case 'deny':
    case 'cancel':
    case 'expire':
    case 'failure':
      return 'failed';
    default:
      return 'pending';
  }
}
