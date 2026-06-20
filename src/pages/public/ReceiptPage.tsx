import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Loader2, Printer } from 'lucide-react';

import api from '@/services/api';

interface ReceiptData {
  transaction_id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  paid_at: string | null;
  fiscal_sign: string | null;
  fiscal_number: string | null;
  fiscal_qr: string | null;
  receipt: {
    fiscal_sign: string;
    fiscal_number: string;
    qr_code: string;
    receipt_data: any;
  } | null;
}

export default function ReceiptPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    api.get(`/payments/receipt/${transactionId}/`)
      .then((res) => setData(res.data))
      .catch(() => setError('Receipt not found.'))
      .finally(() => setLoading(false));
  }, [transactionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07111a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97360]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#07111a] px-4 text-center">
        <div className="text-6xl">🧾</div>
        <h1 className="text-2xl font-bold text-white">Receipt not found</h1>
        <p className="text-sm text-white/52">{error || 'This receipt could not be loaded.'}</p>
      </div>
    );
  }

  let qrUrl = '';
  let qrPayload: any = null;
  const qrRaw = data.fiscal_qr || data.receipt?.qr_code || '';
  if (qrRaw) {
    try {
      qrPayload = JSON.parse(qrRaw);
    } catch { qrUrl = qrRaw; }
  }

  const items = data.receipt?.receipt_data?.items || [];

  return (
    <div className="min-h-screen bg-[#07111a] px-4 py-10" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#0b1622]/95 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <div className="bg-[linear-gradient(135deg,rgba(249,115,96,0.2),rgba(14,165,233,0.1))] p-8 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-400/20">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fd4ff]">{data.provider} · {data.currency}</div>
            <div className="mt-2 font-display text-4xl font-bold text-white">{Number(data.amount).toLocaleString()} UZS</div>
            <div className="mt-1 text-sm text-white/52">{data.paid_at ? new Date(data.paid_at).toLocaleString('ru-RU') : ''}</div>
          </div>

          <div className="p-6 space-y-5">
            {items.length > 0 ? (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">Order items</div>
                <div className="mt-2 space-y-2">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white/78">{item.name}</span>
                      <span className="text-white">{Number(item.price || item.amount || 0).toLocaleString()} × {item.qty || 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {data.fiscal_number ? (
              <div className="rounded-[20px] border border-white/8 bg-black/12 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-white/40">Receipt #</div>
                  <div className="text-right font-mono text-white/78">{data.fiscal_number}</div>
                  <div className="text-white/40">Fiscal sign</div>
                  <div className="text-right font-mono text-xs text-white/78 break-all">{data.fiscal_sign || '—'}</div>
                  <div className="text-white/40">TIN</div>
                  <div className="text-right font-mono text-white/78">{qrPayload?.tin || '—'}</div>
                </div>
              </div>
            ) : null}

            {qrRaw ? (
              <div className="text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40 mb-2">Fiscal QR</div>
                <div className="inline-block rounded-[20px] border border-white/10 bg-white p-3">
                  <img src={qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrRaw)}`} alt="Fiscal QR" className="h-36 w-36" />
                </div>
                <p className="mt-2 text-[10px] text-white/32">Verify on kkm.uz using the fiscal sign above</p>
              </div>
            ) : null}

            <button onClick={() => window.print()} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white">
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
