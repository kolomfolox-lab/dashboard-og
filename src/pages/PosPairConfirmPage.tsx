import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, QrCode, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ownerAPI } from '@/services/api';

interface PairRequestInfo {
  code: string;
  status: 'waiting' | 'confirmed' | 'expired';
  expires_at?: string;
}

interface RestaurantOption {
  id: string;
  name: string;
}

function errorText(e: unknown): string {
  const err = e as {
    response?: { data?: { error?: { message?: string }; detail?: string } };
  };
  return (
    err?.response?.data?.error?.message ||
    err?.response?.data?.detail ||
    'Не удалось выполнить запрос'
  );
}

/**
 * Обратный Magic Pair: касса на экране показывает QR, владелец сканирует
 * его телефоном и попадает сюда (app.waitly.uz/pos-pair/<code>). Страница
 * подтверждает, к какому ресторану подключить терминал.
 */
export default function PosPairConfirmPage() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const [req, setReq] = useState<PairRequestInfo | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ restaurant_name: string } | null>(null);

  useEffect(() => {
    if (!user || !code) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [reqRes, meRes] = await Promise.all([
          ownerAPI.getPosPairRequest(code),
          ownerAPI.getMe(),
        ]);
        if (!active) return;
        setReq(reqRes.data);
        const list: RestaurantOption[] = (meRes.data?.restaurants || []).map(
          (r: { id: string; name: string }) => ({ id: r.id, name: r.name }),
        );
        setRestaurants(list);
        setSelected(list[0]?.id || '');
        setLoading(false);
      } catch (e) {
        if (!active) return;
        setLoading(false);
        setReq({ code, status: 'expired' });
        setError(errorText(e));
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [user, code]);

  const confirm = async () => {
    if (!selected) {
      setError('Выберите ресторан для подключения');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await ownerAPI.confirmPosPairRequest(code!, selected);
      setDone({ restaurant_name: res.data.restaurant_name });
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
          <QrCode className="mx-auto h-10 w-10 text-indigo-600" />
          <h1 className="mt-3 text-lg font-black text-gray-900">Подключение кассы</h1>
          <p className="mt-2 text-sm text-gray-500">
            Касса ждёт подтверждения. Войдите как владелец, чтобы продолжить.
          </p>
          <Link
            to="/login"
            state={{ from: `/pos-pair/${code ?? ''}` }}
            className="mt-4 inline-block w-full rounded-xl bg-indigo-600 py-3 font-bold text-white"
          >
            Войти как владелец
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Smartphone className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900">Подключение кассы</h1>
            <p className="text-xs text-gray-500">Код {code}</p>
          </div>
        </div>

        {done ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-2 font-bold text-emerald-700">
              Касса подключена к «{done.restaurant_name}»
            </p>
            <p className="mt-1 text-sm text-gray-500">
              На терминале осталось ввести PIN сотрудника.
            </p>
          </div>
        ) : req?.status === 'confirmed' ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-2 font-bold text-emerald-700">Касса уже подключена</p>
          </div>
        ) : req?.status === 'expired' ? (
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-center">
            <p className="font-bold text-amber-700">Код истёк или не найден</p>
            {error ? <p className="mt-1 text-sm text-amber-600">{error}</p> : null}
            <p className="mt-1 text-sm text-gray-500">
              Попросите кассу показать свежий QR — код живёт 90 секунд.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm text-gray-600">
              Касса с кодом <b>{code}</b> просит подключение. Выберите заведение и
              подтвердите — терминал подключится автоматически.
            </p>

            <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Заведение
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-3 font-semibold text-gray-800 outline-none focus:border-indigo-500"
            >
              {restaurants.length === 0 ? (
                <option value="">Нет доступных заведений</option>
              ) : (
                restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))
              )}
            </select>

            {error ? (
              <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>
            ) : null}

            <button
              onClick={confirm}
              disabled={busy || !selected}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
              Подтвердить подключение
            </button>

            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
              <RefreshCw className="h-3 w-3" /> Код одноразовый и живёт 90 секунд
            </p>
          </>
        )}
      </div>
    </div>
  );
}
