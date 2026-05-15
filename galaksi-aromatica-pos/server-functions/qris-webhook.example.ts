// Contoh server function webhook QRIS untuk Lovable/TanStack/Supabase style.
// Ini contoh arsitektur, bukan file aktif bawaan Vite frontend.
// Implementasikan di server function Lovable, jangan di frontend.

type WebhookPayload = {
  order_id?: string;
  transaction_status?: 'settlement' | 'capture' | 'pending' | 'expire' | 'cancel' | 'deny';
  fraud_status?: string;
  signature_key?: string;
  gross_amount?: string;
  payment_type?: string;
  transaction_id?: string;
};

export async function handleQrisWebhook(req: Request, env: { PAYMENT_WEBHOOK_SECRET: string }) {
  const payload = (await req.json()) as WebhookPayload;

  // 1. Validasi signature sesuai provider.
  // Contoh Midtrans biasanya hash dari order_id + status_code + gross_amount + server_key.
  // Jangan asal percaya callback.
  const signatureValid = Boolean(payload.signature_key); // ganti dengan validasi asli
  if (!signatureValid) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
  }

  // 2. Mapping status provider ke status internal.
  let status: 'pending' | 'paid' | 'failed' | 'expired' = 'pending';
  if (payload.transaction_status === 'settlement' || payload.transaction_status === 'capture') status = 'paid';
  if (payload.transaction_status === 'expire') status = 'expired';
  if (payload.transaction_status === 'cancel' || payload.transaction_status === 'deny') status = 'failed';

  // 3. Update transaksi berdasarkan payment_reference / order_id di database Supabase.
  // await supabase.from('transactions').update({ payment_status: status, paid_at: status === 'paid' ? new Date().toISOString() : null }).eq('payment_reference', payload.order_id)

  // 4. Simpan payment_logs raw payload.
  // await supabase.from('payment_logs').insert({ gateway_name: 'midtrans', gateway_reference: payload.transaction_id, raw_payload: payload, status })

  return new Response(JSON.stringify({ ok: true, status }), { status: 200 });
}
