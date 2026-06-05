import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BarChart3,
  Bell,
  Coffee,
  CreditCard,
  Edit3,
  ImagePlus,
  ListOrdered,
  LogOut,
  Minus,
  Plus,
  Printer,
  QrCode,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  Utensils,
  WalletCards,
  X
} from 'lucide-react';
import './styles.css';

type View = 'pos' | 'menu' | 'history' | 'sales' | 'settings';
type OrderType = 'Dine In' | 'Take Away';
type PaymentMethod = 'cash' | 'qris';
type PaymentStatus = 'pending' | 'paid';

type Operator = {
  name: string;
  pin: string;
};

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  active: boolean;
  bestSeller?: boolean;
  promo?: boolean;
  discountPercent?: number;
};

type CartItem = {
  cartId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  note?: string;
};

type Transaction = {
  id: string;
  invoice: string;
  operator: string;
  orderType: OrderType;
  tableNumber?: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  service: number;
  tax: number;
  total: number;
  amountPaid?: number;
  change?: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  createdAt: string;
};

type SettingsData = {
  storeName: string;
  subtitle: string;
  operatorName: string;
  address: string;
  phone: string;
  footer: string;
  receiptSize: '58mm' | '80mm';
  taxPercent: number;
  servicePercent: number;
};

type Db = {
  operator: Operator;
  categories: Category[];
  products: Product[];
  transactions: Transaction[];
  settings: SettingsData;
};

type Notice = {
  title: string;
  message: string;
  amount: number;
  time: string;
} | null;

const money = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(n);

const discountPrice = (price: number, discountPercent?: number) => {
  const discount = discountPercent || 0;
  if (discount <= 0) return price;
  return Math.round(price - price * (discount / 100));
};

const percentLabel = (value?: number) => {
  if (!value) return '';
  return String(value).replace('.', ',');
};

function cleanPercentText(value: string) {
  let v = value.replace(/[^\d,.]/g, '');
  v = v.replace(/\./g, ',');

  const parts = v.split(',');
  if (parts.length <= 1) return parts[0];

  return `${parts[0]},${parts.slice(1).join('')}`;
}

function parsePercent(value: string) {
  const cleaned = value.trim().replace(',', '.');
  if (cleaned === '') return 0;

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function numberToText(value?: number) {
  if (!value) return '';
  return String(value).replace('.', ',');
}

const uid = () => Math.random().toString(36).slice(2, 10);

const today = () =>
  new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

const clock = () =>
  new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

const invoiceNo = (count: number) => {
  const d = new Date();
  const y = String(d.getFullYear()).slice(2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `INV/${y}${m}${day}/${String(count + 1).padStart(5, '0')}`;
};

const img = {
  kopi1:
    'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80',
  kopi2:
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80',
  kopi3:
    'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=700&q=80',
  kopi4:
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=80',
  kopi5:
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80',
  snack:
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80',
  food:
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=700&q=80',
  cake:
    'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80'
};

const defaultDb: Db = {
  operator: {
    name: 'Lutfi Ibnu Maulana',
    pin: '1111'
  },
  categories: [
    { id: 'coffee', name: 'Coffee' },
    { id: 'non', name: 'Non Coffee' },
    { id: 'tea', name: 'Tea' },
    { id: 'snack', name: 'Snack' },
    { id: 'main', name: 'Main Course' },
    { id: 'dessert', name: 'Dessert' },
    { id: 'promo', name: 'Promo' }
  ],
  products: [
    {
      id: 'p1',
      categoryId: 'coffee',
      name: 'Es Kopi Galaksi',
      description: 'Kopi susu signature rasa bold.',
      price: 32000,
      image: img.kopi1,
      stock: 50,
      active: true,
      bestSeller: true,
      promo: false,
      discountPercent: 0
    },
    {
      id: 'p2',
      categoryId: 'coffee',
      name: 'Kopi Susu Aren',
      description: 'Gula aren dan espresso lembut.',
      price: 28000,
      image: img.kopi2,
      stock: 42,
      active: true,
      bestSeller: false,
      promo: false,
      discountPercent: 0
    },
    {
      id: 'p3',
      categoryId: 'coffee',
      name: 'Cappuccino',
      description: 'Foam halus dan espresso hangat.',
      price: 30000,
      image: img.kopi3,
      stock: 38,
      active: true,
      bestSeller: false,
      promo: false,
      discountPercent: 0
    },
    {
      id: 'p4',
      categoryId: 'coffee',
      name: 'Caramel Macchiato',
      description: 'Manis caramel creamy.',
      price: 34000,
      image: img.kopi5,
      stock: 35,
      active: true,
      bestSeller: true,
      promo: false,
      discountPercent: 0
    },
    {
      id: 'p5',
      categoryId: 'coffee',
      name: 'Americano',
      description: 'Black coffee clean.',
      price: 22000,
      image: img.kopi4,
      stock: 60,
      active: true,
      bestSeller: false,
      promo: false,
      discountPercent: 0
    },
    {
      id: 'p6',
      categoryId: 'non',
      name: 'Mocha',
      description: 'Cokelat dan kopi creamy.',
      price: 28000,
      image: img.kopi2,
      stock: 30,
      active: true,
      bestSeller: false,
      promo: false,
      discountPercent: 0
    },
    {
      id: 'p7',
      categoryId: 'coffee',
      name: 'Vietnam Drip',
      description: 'Drip klasik, pekat.',
      price: 26000,
      image: img.kopi3,
      stock: 24,
      active: true,
      bestSeller: false,
      promo: false,
      discountPercent: 0
    },
    {
      id: 'p8',
      categoryId: 'coffee',
      name: 'Hazelnut Latte',
      description: 'Latte aroma hazelnut.',
      price: 32000,
      image: img.kopi1,
      stock: 27,
      active: true,
      bestSeller: false,
      promo: false,
      discountPercent: 0
    },
    {
      id: 'p9',
      categoryId: 'coffee',
      name: 'Spanish Latte',
      description: 'Latte manis creamy.',
      price: 33000,
      image: img.kopi5,
      stock: 25,
      active: true,
      bestSeller: false,
      promo: true,
      discountPercent: 0
    },
    {
      id: 'p10',
      categoryId: 'snack',
      name: 'Croissant',
      description: 'Pastry buttery.',
      price: 26000,
      image: img.snack,
      stock: 18,
      active: true,
      bestSeller: false,
      promo: false,
      discountPercent: 0
    },
    {
      id: 'p11',
      categoryId: 'main',
      name: 'Chicken Rice Bowl',
      description: 'Nasi ayam cafe bowl.',
      price: 38000,
      image: img.food,
      stock: 22,
      active: true,
      bestSeller: false,
      promo: false,
      discountPercent: 0
    },
    {
      id: 'p12',
      categoryId: 'dessert',
      name: 'Cheesecake',
      description: 'Cake lembut creamy.',
      price: 32000,
      image: img.cake,
      stock: 14,
      active: true,
      bestSeller: false,
      promo: false,
      discountPercent: 0
    }
  ],
  transactions: [],
  settings: {
    storeName: 'Galaksi Aromatica',
    subtitle: 'Coffee & Eatery',
    operatorName: 'Lutfi Ibnu Marlianto',
    address: 'Jl. Bintang Terang No. 18, Jakarta',
    phone: '(021) 1234-5678',
    footer: 'Terima kasih atas kunjungan Anda • Sampai jumpa di Galaksi Aromatica!',
    receiptSize: '80mm',
    taxPercent: 10,
    servicePercent: 5
  }
};

function loadDb(): Db {
  try {
    const saved = JSON.parse(localStorage.getItem('galaksi-pos-db-clean-v2') || 'null');
    if (!saved) return defaultDb;

    return {
      ...defaultDb,
      ...saved,
      operator: {
        ...defaultDb.operator,
        ...(saved.operator || {})
      },
      settings: {
        ...defaultDb.settings,
        ...(saved.settings || {}),
        operatorName:
          saved.settings?.operatorName ||
          saved.operator?.name ||
          defaultDb.settings.operatorName
      },
      products: Array.isArray(saved.products)
        ? saved.products.map((p: Product) => ({
            ...p,
            bestSeller: !!p.bestSeller,
            promo: !!p.promo,
            discountPercent: Number(p.discountPercent || 0)
          }))
        : defaultDb.products,
      transactions: saved.transactions || []
    };
  } catch {
    return defaultDb;
  }
}

function saveDb(db: Db) {
  localStorage.setItem('galaksi-pos-db-clean-v2', JSON.stringify(db));
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'logo compact' : 'logo'}>
      <svg viewBox="0 0 120 92" aria-hidden="true">
        <path d="M32 44c3 20 16 31 38 31 22 0 35-11 38-31" />
        <path d="M31 44h77c-4-9-18-15-39-15-22 0-35 6-38 15z" />
        <path d="M44 32c-7-20 20-14 12-29M65 32c-5-18 18-16 11-30" />
        <path d="M103 47c22-4 22 24-1 22" />
        <path d="M12 66c24 18 75 22 101-13" />
        <path d="M8 57c33-24 78-31 107-10" />
        <circle cx="102" cy="19" r="2.5" />
        <circle cx="20" cy="18" r="2" />
        <circle cx="88" cy="7" r="1.6" />
      </svg>

      {!compact && (
        <div>
          <b>
            Galaksi
            <br />
            Aromatica
          </b>
          <span>Coffee & Eatery</span>
          <em>by lutfiibnm</em>
        </div>
      )}
    </div>
  );
}

function App() {
  const [db, setDb] = React.useState<Db>(() => loadDb());
  const [logged, setLogged] = React.useState(
    () => localStorage.getItem('galaksi-logged') === '1'
  );
  const [view, setView] = React.useState<View>('pos');
  const [notice, setNotice] = React.useState<Notice>(null);
  const [lastPrint, setLastPrint] = React.useState<Transaction | null>(null);
  const [tick, setTick] = React.useState(clock());

  React.useEffect(() => {
    const x = setInterval(() => setTick(clock()), 15000);
    return () => clearInterval(x);
  }, []);

  React.useEffect(() => saveDb(db), [db]);

  const patchDb = (fn: (d: Db) => Db) => setDb(fn);

  const printTransaction = (trx: Transaction) => {
    setLastPrint(trx);

    setTimeout(() => {
      window.print();
    }, 1000);
  };

  if (!logged) {
    return (
      <Login
        db={db}
        onLogin={() => {
          localStorage.setItem('galaksi-logged', '1');
          setLogged(true);
        }}
      />
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar no-print">
        <Logo />

        <nav>
          <button className={view === 'pos' ? 'active' : ''} onClick={() => setView('pos')}>
            <ShoppingCart />
            POS / Kasir
          </button>

          <button className={view === 'menu' ? 'active' : ''} onClick={() => setView('menu')}>
            <Utensils />
            Menu
          </button>

          <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>
            <ListOrdered />
            Riwayat Transaksi
          </button>

          <button className={view === 'sales' ? 'active' : ''} onClick={() => setView('sales')}>
            <BarChart3 />
            Laporan Penjualan
          </button>

          <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}>
            <Settings />
            Pengaturan
          </button>
        </nav>

        {notice ? (
          <div className="side-notice">
            <Bell />
            <strong>{notice.title}</strong>
            <p>{notice.message}</p>
            <b>{money(notice.amount)}</b>
            <small>{notice.time}</small>
          </div>
        ) : (
          <div className="side-hint">
            Riwayat dan laporan mulai dari nol. Data muncul setelah transaksi pertama.
          </div>
        )}

        <div className="side-footer">
          Galaksi Aromatica
          <br />
          <span>by lutfiibnm</span>
        </div>
      </aside>

      <main className="work">
        <header className="top no-print">
          <div>
            <h1>{db.settings.storeName}</h1>
            <p>{today()}</p>
          </div>

          <div className="top-right">
            <span>{tick}</span>

            <div>
              <b>{db.settings.operatorName}</b>
              <small>Operator</small>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('galaksi-logged');
                setLogged(false);
              }}
            >
              <LogOut />
              Logout
            </button>
          </div>
        </header>

        {view === 'pos' && (
          <POS
            db={db}
            patchDb={patchDb}
            setNotice={setNotice}
            printTransaction={printTransaction}
          />
        )}

        {view === 'menu' && <MenuPage db={db} patchDb={patchDb} />}
        {view === 'history' && <HistoryPage db={db} printTransaction={printTransaction} />}
        {view === 'sales' && <SalesPage db={db} />}
        {view === 'settings' && <SettingsPage db={db} patchDb={patchDb} />}
      </main>

      <div id="print-area">
        <div className="print-sheet">
          <Receipt trx={lastPrint} settings={db.settings} />
          <KitchenReceipt trx={lastPrint} settings={db.settings} />
        </div>
      </div>
    </div>
  );
}

function Login({ db, onLogin }: { db: Db; onLogin: () => void }) {
  const [pin, setPin] = React.useState('');

  const submit = () =>
    pin === db.operator.pin ? onLogin() : alert('PIN salah.');

  return (
    <div className="login">
      <div className="login-card">
        <Logo />
        <h1>Galaksi Aromatica</h1>
        <p>Satu akun operator. Tidak ada admin/kasir terpisah.</p>

        <input
          autoFocus
          type="password"
          inputMode="numeric"
          placeholder="PIN Operator"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />

        <button onClick={submit}>Masuk</button>
        <small>PIN awal: 1111. Bisa diganti di Pengaturan.</small>
      </div>
    </div>
  );
}

function POS({
  db,
  patchDb,
  setNotice,
  printTransaction
}: {
  db: Db;
  patchDb: (fn: (d: Db) => Db) => void;
  setNotice: (n: Notice) => void;
  printTransaction: (t: Transaction) => void;
}) {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [cat, setCat] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [orderType, setOrderType] = React.useState<OrderType>('Dine In');
  const [table, setTable] = React.useState('05');
  const [cust, setCust] = React.useState('');
  const [pay, setPay] = React.useState(false);
  const [method, setMethod] = React.useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = React.useState('');

  const products = db.products.filter(
    p =>
      p.active &&
      (cat === 'all' || p.categoryId === cat || (cat === 'promo' && p.promo)) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const service = Math.round((subtotal * db.settings.servicePercent) / 100);
  const tax = Math.round((subtotal * db.settings.taxPercent) / 100);
  const total = subtotal + service + tax;
  const change = Math.max(Number(amountPaid || 0) - total, 0);

  const add = (p: Product) =>
    setCart(c => {
      const found = c.find(i => i.productId === p.id && !i.note);
      const finalPrice = discountPrice(p.price, p.discountPercent);

      return found
        ? c.map(i => (i.cartId === found.cartId ? { ...i, qty: i.qty + 1 } : i))
        : [
            ...c,
            {
              cartId: uid(),
              productId: p.id,
              name: p.name,
              image: p.image,
              price: finalPrice,
              qty: 1
            }
          ];
    });

  const qty = (id: string, n: number) =>
    setCart(c =>
      c.map(i => (i.cartId === id ? { ...i, qty: Math.max(1, i.qty + n) } : i))
    );

  const remove = (id: string) => setCart(c => c.filter(i => i.cartId !== id));

  const makeTrx = (m: PaymentMethod, paid?: number): Transaction => ({
    id: uid(),
    invoice: invoiceNo(db.transactions.length),
    operator: db.settings.operatorName,
    orderType,
    tableNumber: orderType === 'Dine In' ? table : undefined,
    customerName: cust || undefined,
    items: cart,
    subtotal,
    service,
    tax,
    total,
    amountPaid: paid,
    change: paid ? Math.max(paid - total, 0) : undefined,
    method: m,
    status: m === 'qris' ? 'pending' : 'paid',
    reference: m === 'qris' ? `QRIS-${uid().toUpperCase()}` : undefined,
    createdAt: new Date().toISOString()
  });

  const savePaid = (trx: Transaction) => {
    const paidTrx = { ...trx, status: 'paid' as PaymentStatus };

    patchDb(d => ({
      ...d,
      transactions: [paidTrx, ...d.transactions]
    }));

    setCart([]);
    setPay(false);
    setAmountPaid('');

    setNotice({
      title: paidTrx.method === 'qris' ? 'QRIS masuk' : 'Transaksi berhasil',
      message: `${paidTrx.invoice} sudah lunas`,
      amount: paidTrx.total,
      time: clock()
    });

    printTransaction(paidTrx);
  };

  const finishCash = () => {
    const paid = Number(amountPaid || 0);
    if (paid < total) return alert('Uang bayar kurang.');
    savePaid(makeTrx('cash', paid));
  };

  const finishQris = () => {
    const pending = makeTrx('qris');

    setNotice({
      title: 'Menunggu QRIS',
      message: 'Kode QR sudah ditampilkan ke pelanggan',
      amount: total,
      time: clock()
    });

    setTimeout(() => savePaid(pending), 650);
  };

  return (
    <section className="pos-page page-full">
      <div className="pos-left card">
        <div className="order-line">
          <div className="seg">
            <button className={orderType === 'Dine In' ? 'on' : ''} onClick={() => setOrderType('Dine In')}>
              Dine In
            </button>

            <button className={orderType === 'Take Away' ? 'on' : ''} onClick={() => setOrderType('Take Away')}>
              Take Away
            </button>
          </div>

          <label>
            No. Meja
            <input value={table} disabled={orderType === 'Take Away'} onChange={e => setTable(e.target.value)} />
          </label>

          <label>
            Nama Pelanggan
            <input value={cust} onChange={e => setCust(e.target.value)} placeholder="Opsional" />
          </label>

          <div className="search search-full">
            <Search />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari menu..." />
          </div>
        </div>

        <div className="tabs">
          <button className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>
            Semua
          </button>

          {db.categories.map(c => (
            <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>
              {c.name}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {products.map(p => {
            const finalPrice = discountPrice(p.price, p.discountPercent);

            return (
              <button className="prod" key={p.id} onClick={() => add(p)}>
                <img src={p.image} />

                <div className="prod-badges">
                  {p.bestSeller && <em>Best</em>}
                  {!!p.discountPercent && <em>-{percentLabel(p.discountPercent)}%</em>}
                  {p.promo && !p.discountPercent && <em>Promo</em>}
                </div>
                <b>{p.name}</b>

                <small className="prod-price">
                  {!!p.discountPercent && <del>{money(p.price)}</del>}
                  <span>{money(finalPrice)}</span>
                </small>

                <i>
                  <Plus size={16} />
                </i>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="cart card">
        <div className="cart-head">
          <h2>Keranjang Pesanan ({cart.length})</h2>
        </div>

        <div className="cart-list">
          {cart.length === 0 && (
            <div className="empty">Tap menu di kiri buat nambah pesanan.</div>
          )}

          {cart.map(i => (
            <div className="cart-row" key={i.cartId}>
              <img src={i.image} />

              <div className="cart-info">
                <b>{i.name}</b>
                <input
                  value={i.note || ''}
                  onChange={e =>
                    setCart(c =>
                      c.map(x =>
                        x.cartId === i.cartId ? { ...x, note: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Catatan item"
                />
              </div>

              <button onClick={() => qty(i.cartId, -1)}>
                <Minus />
              </button>

              <span>{i.qty}</span>

              <button onClick={() => qty(i.cartId, 1)}>
                <Plus />
              </button>

              <strong>{money(i.price * i.qty)}</strong>

              <button onClick={() => remove(i.cartId)}>
                <X />
              </button>
            </div>
          ))}
        </div>

        <div className="totalbox">
          <p>
            <span>Subtotal</span>
            <b>{money(subtotal)}</b>
          </p>

          <p>
            <span>Service ({percentLabel(db.settings.servicePercent)}%)</span>
            <b>{money(service)}</b>
          </p>

          <p>
            <span>Pajak ({percentLabel(db.settings.taxPercent)}%)</span>
            <b>{money(tax)}</b>
          </p>

          <h3>
            <span>TOTAL</span>
            <b>{money(total)}</b>
          </h3>
        </div>

        <div className="cart-actions only-pay">
          <button
            className="primary"
            disabled={!cart.length}
            onClick={() => {
              setMethod('cash');
              setPay(true);
            }}
          >
            <CreditCard />
            Bayar
          </button>
        </div>
      </aside>

      {pay && (
        <div className="modal">
          <div className="pay-card">
            <button className="close" onClick={() => setPay(false)}>
              <X />
            </button>

            <h2>Pembayaran</h2>
            <p>Total tagihan</p>
            <strong className="pay-total">{money(total)}</strong>

            <div className="pay-tabs">
              <button className={method === 'cash' ? 'on' : ''} onClick={() => setMethod('cash')}>
                <WalletCards />
                Cash
              </button>

              <button className={method === 'qris' ? 'on' : ''} onClick={() => setMethod('qris')}>
                <QrCode />
                QRIS
              </button>
            </div>

            {method === 'cash' ? (
              <div className="cash-box">
                <label>
                  Uang diterima
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    placeholder="Contoh: 150000"
                  />
                </label>

                <p>
                  Kembalian: <b>{money(change)}</b>
                </p>

                <button className="primary wide" onClick={finishCash}>
                  Bayar Cash & Cetak Invoice
                </button>
              </div>
            ) : (
              <div className="qris-box">
                <div className="fake-qr">
                  <QrCode size={150} />
                </div>

                <b>QRIS Galaksi Aromatica</b>
                <small>NMID: ID102509503903781</small>

                <p>
                  Pelanggan scan kode ini. Setelah tombol simulasi ditekan,
                  status jadi LUNAS dan invoice langsung dicetak.
                </p>

                <button className="primary wide" onClick={finishQris}>
                  Simulasi QRIS Masuk & Cetak Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function MenuPage({
  db,
  patchDb
}: {
  db: Db;
  patchDb: (fn: (d: Db) => Db) => void;
}) {
  const blank: Product = {
    id: '',
    categoryId: 'coffee',
    name: '',
    description: '',
    price: 0,
    image: img.kopi1,
    stock: 0,
    active: true,
    bestSeller: false,
    promo: false,
    discountPercent: 0
  };

  const [form, setForm] = React.useState<Product>(blank);
  const [discountText, setDiscountText] = React.useState('');

  const editProduct = (p: Product) => {
    setForm({
      ...p,
      bestSeller: !!p.bestSeller,
      promo: !!p.promo,
      discountPercent: Number(p.discountPercent || 0)
    });

    setDiscountText(numberToText(p.discountPercent));
  };

  const resetForm = () => {
    setForm(blank);
    setDiscountText('');
  };

  const save = () => {
    if (!form.name || !form.price) return alert('Nama dan harga wajib diisi.');

    const discountValue = parsePercent(discountText);

    const fixedProduct: Product = {
      ...form,
      promo: form.promo || discountValue > 0,
      discountPercent: discountValue
    };

    patchDb(d => ({
      ...d,
      products: fixedProduct.id
        ? d.products.map(p => (p.id === fixedProduct.id ? fixedProduct : p))
        : [{ ...fixedProduct, id: uid() }, ...d.products]
    }));

    resetForm();
  };

  const del = (id: string) => {
    if (confirm('Hapus menu ini?')) {
      patchDb(d => ({
        ...d,
        products: d.products.filter(p => p.id !== id)
      }));
    }
  };

  const readFile = (file?: File) => {
    if (!file) return;

    const r = new FileReader();
    r.onload = () => setForm(f => ({ ...f, image: String(r.result) }));
    r.readAsDataURL(file);
  };

  return (
    <section className="page-full menu-page card">
      <div className="page-title">
        <div>
          <h2>Manajemen Menu</h2>
          <p>Tambah menu, edit harga, upload gambar, Best Seller, Promo, dan Diskon.</p>
        </div>

        <button onClick={resetForm}>
          <Plus />
          Menu Baru
        </button>
      </div>

      <div className="menu-management">
        <div className="menu-table">
          {db.products.map(p => (
            <div className="manage-row" key={p.id}>
              <img src={p.image} />

              <div>
                <b>{p.name}</b>
                <small>
                  {p.description}
                  {p.bestSeller ? ' • Best Seller' : ''}
                  {p.promo ? ' • Promo' : ''}
                  {p.discountPercent ? ` • Diskon ${percentLabel(p.discountPercent)}%` : ''}
                </small>
              </div>

              <span>{db.categories.find(c => c.id === p.categoryId)?.name}</span>

              <strong>
                {p.discountPercent ? (
                  <>
                    <del>{money(p.price)}</del>
                    <br />
                    {money(discountPrice(p.price, p.discountPercent))}
                  </>
                ) : (
                  money(p.price)
                )}
              </strong>

              <em>{p.active ? 'Aktif' : 'Nonaktif'}</em>

              <button onClick={() => editProduct(p)}>
                <Edit3 />
              </button>

              <button className="red" onClick={() => del(p.id)}>
                <Trash2 />
              </button>
            </div>
          ))}
        </div>

        <div className="editor">
          <h3>{form.id ? 'Edit Menu' : 'Tambah Menu'}</h3>

          <img src={form.image} />

          <label className="upload">
            <ImagePlus />
            Ubah / Upload Gambar
            <input
              type="file"
              accept="image/*"
              onChange={e => readFile(e.target.files?.[0])}
            />
          </label>

          <input
            placeholder="Nama menu"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <select
            value={form.categoryId}
            onChange={e => setForm({ ...form, categoryId: e.target.value })}
          >
            {db.categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Harga"
            value={form.price ? String(form.price) : ''}
            onChange={e => {
              const onlyNumber = e.target.value.replace(/\D/g, '');
              setForm({ ...form, price: Number(onlyNumber) });
            }}
          />

          <input
            type="text"
            inputMode="decimal"
            placeholder="Diskon Promo (%) contoh: 1,2 atau 2,6"
            value={discountText}
            onChange={e => {
              const clean = cleanPercentText(e.target.value);
              setDiscountText(clean);
              setForm({ ...form, promo: clean !== '' || form.promo });
            }}
          />

          <textarea
            placeholder="Deskripsi"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <label className="check">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
            />
            Menu aktif
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={!!form.bestSeller}
              onChange={e => setForm({ ...form, bestSeller: e.target.checked })}
            />
            Best Seller
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={!!form.promo}
              onChange={e => setForm({ ...form, promo: e.target.checked })}
            />
            Promo
          </label>

          <small style={{ color: '#806954', lineHeight: 1.4 }}>
            Kalau isi diskon, Promo otomatis aktif. Bisa pakai koma, misalnya 1,2 atau 2,6.
          </small>

          <button className="primary" onClick={save}>
            {form.id ? 'Simpan Perubahan' : 'Tambah Menu'}
          </button>

          {form.id && (
            <button className="danger" onClick={() => del(form.id)}>
              Hapus Menu
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function HistoryPage({
  db,
  printTransaction
}: {
  db: Db;
  printTransaction: (t: Transaction) => void;
}) {
  return (
    <section className="page-full card list-page history-page">
      <div className="page-title">
        <div>
          <h2>Riwayat Transaksi</h2>
          <p>Mulai dari 0. Transaksi muncul setelah pembayaran selesai.</p>
        </div>
      </div>

      {db.transactions.length === 0 ? (
        <Empty title="Belum ada transaksi" text="Riwayat masih kosong. Buat transaksi dari halaman POS dulu." />
      ) : (
        <div className="table">
          {db.transactions.map(t => (
            <div className="tr" key={t.id}>
              <b>{t.invoice}</b>
              <span>{fmt(t.createdAt)}</span>
              <span>
                {t.orderType}
                {t.tableNumber ? ` • Meja ${t.tableNumber}` : ''}
              </span>
              <span>{t.method.toUpperCase()}</span>
              <strong>{money(t.total)}</strong>
              <em className={t.status}>{t.status === 'paid' ? 'LUNAS' : 'PENDING'}</em>
              <button onClick={() => printTransaction(t)}>
                <Printer />
                Cetak
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SalesPage({ db }: { db: Db }) {
  const paid = db.transactions.filter(t => t.status === 'paid');
  const total = paid.reduce((s, t) => s + t.total, 0);
  const avg = paid.length ? Math.round(total / paid.length) : 0;

  const byProduct = new Map<string, number>();

  paid.forEach(t =>
    t.items.forEach(i => byProduct.set(i.name, (byProduct.get(i.name) || 0) + i.qty))
  );

  const best = [...byProduct.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const bars = Array.from({ length: 8 }).map((_, i) =>
    paid.filter((_, idx) => idx % 8 === i).reduce((s, t) => s + t.total, 0)
  );

  const max = Math.max(...bars, 1);

  return (
    <section className="page-full card list-page sales-page">
      <div className="page-title">
        <div>
          <h2>Laporan Penjualan</h2>
          <p>Mulai dari 0. Grafik naik otomatis setelah ada transaksi.</p>
        </div>
      </div>

      <div className="stats">
        <span>
          <b>{money(total)}</b>
          <small>Total Penjualan</small>
        </span>

        <span>
          <b>{paid.length}</b>
          <small>Transaksi</small>
        </span>

        <span>
          <b>{money(avg)}</b>
          <small>Rata-rata</small>
        </span>

        <span>
          <b>{best}</b>
          <small>Best Seller</small>
        </span>
      </div>

      {paid.length === 0 ? (
        <Empty title="Laporan masih kosong" text="Belum ada penjualan hari ini." />
      ) : (
        <div className="bars big">
          {bars.map((b, i) => (
            <i key={i} style={{ height: `${30 + (b / max) * 220}px` }}>
              <small>{i + 8}:00</small>
            </i>
          ))}
        </div>
      )}
    </section>
  );
}

function SettingsPage({
  db,
  patchDb
}: {
  db: Db;
  patchDb: (fn: (d: Db) => Db) => void;
}) {
  const [s, setS] = React.useState<SettingsData>({
    ...defaultDb.settings,
    ...db.settings
  });

  const [pinText, setPinText] = React.useState('');

  const [serviceText, setServiceText] = React.useState(
    numberToText(db.settings.servicePercent)
  );

  const [taxText, setTaxText] = React.useState(
    numberToText(db.settings.taxPercent)
  );

  const saveSettings = () => {
    if (pinText && pinText.length < 4) {
      alert('PIN minimal 4 digit.');
      return;
    }

    const fixedSettings: SettingsData = {
      ...s,
      servicePercent: parsePercent(serviceText),
      taxPercent: parsePercent(taxText)
    };

    patchDb(d => ({
      ...d,
      settings: fixedSettings,
      operator: {
        ...d.operator,
        name: fixedSettings.operatorName,
        pin: pinText ? pinText : d.operator.pin
      }
    }));

    setS(fixedSettings);
    setPinText('');
    alert('Pengaturan berhasil disimpan.');
  };

  return (
    <section className="page-full card settings-page">
      <div className="page-title">
        <div>
          <h2>Pengaturan Cafe</h2>
          <p>Atur data cafe, nama operator, PIN, struk, pajak, service, dan printer.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="field">
          <label>Nama Cafe</label>
          <input
            value={s.storeName}
            onChange={e => setS({ ...s, storeName: e.target.value })}
            placeholder="Galaksi Aromatica"
          />
          <small>Nama cafe yang tampil di aplikasi dan struk.</small>
        </div>

        <div className="field">
          <label>Tagline Cafe</label>
          <input
            value={s.subtitle}
            onChange={e => setS({ ...s, subtitle: e.target.value })}
            placeholder="Coffee & Eatery"
          />
          <small>Teks kecil di bawah nama cafe.</small>
        </div>

        <div className="field">
          <label>Nama Operator / Kasir</label>
          <input
            value={s.operatorName}
            onChange={e => setS({ ...s, operatorName: e.target.value })}
            placeholder="Lutfi Ibnu Maulana"
          />
          <small>Nama ini tampil di header aplikasi dan di struk.</small>
        </div>

        <div className="field">
          <label>Ganti PIN Login</label>
          <input
            type="password"
            inputMode="numeric"
            value={pinText}
            onChange={e => {
              const onlyNumber = e.target.value.replace(/\D/g, '');
              setPinText(onlyNumber);
            }}
            placeholder="Kosongkan kalau tidak diganti"
          />
          <small>PIN disimpan lokal di browser. Aman buat demo, belum aman buat sistem asli.</small>
        </div>

        <div className="field">
          <label>Alamat Cafe</label>
          <textarea
            value={s.address}
            onChange={e => setS({ ...s, address: e.target.value })}
            placeholder="Jl. Bintang Terang No. 18, Jakarta"
          />
          <small>Alamat yang tampil di struk.</small>
        </div>

        <div className="field">
          <label>Nomor Telepon</label>
          <input
            value={s.phone}
            onChange={e => setS({ ...s, phone: e.target.value })}
            placeholder="(021) 1234-5678"
          />
          <small>Nomor telepon yang tampil di struk.</small>
        </div>

        <div className="field">
          <label>Footer Struk</label>
          <input
            value={s.footer}
            onChange={e => setS({ ...s, footer: e.target.value })}
            placeholder="Terima kasih atas kunjungan Anda"
          />
          <small>Kalimat penutup di bagian bawah struk.</small>
        </div>

        <div className="field">
          <label>Ukuran Kertas Struk</label>
          <select
            value={s.receiptSize}
            onChange={e =>
              setS({
                ...s,
                receiptSize: e.target.value as '58mm' | '80mm'
              })
            }
          >
            <option>80mm</option>
            <option>58mm</option>
          </select>
          <small>Pilih ukuran printer thermal yang dipakai.</small>
        </div>

        <div className="field">
          <label>Service Charge (%)</label>
          <input
            type="text"
            inputMode="decimal"
            value={serviceText}
            onChange={e => setServiceText(cleanPercentText(e.target.value))}
            placeholder="Contoh: 5 atau 2,5"
          />
          <small>Isi kosong kalau tidak dipakai. Bisa pakai koma, misal 2,5.</small>
        </div>

        <div className="field">
          <label>Pajak (%)</label>
          <input
            type="text"
            inputMode="decimal"
            value={taxText}
            onChange={e => setTaxText(cleanPercentText(e.target.value))}
            placeholder="Contoh: 10 atau 2,5"
          />
          <small>Pajak bisa pakai koma. Contoh: 2,5 berarti 2,5%.</small>
        </div>
      </div>

      <div
        style={{
          marginTop: '26px',
          width: '100%'
        }}
      >
        <button
          type="button"
          onClick={saveSettings}
          style={{
            width: '100%',
            minHeight: '64px',
            padding: '16px 24px',
            borderRadius: '18px',
            border: 'none',
            background: 'linear-gradient(135deg, #8b4a1f, #5a2b12)',
            color: '#fff7ea',
            fontSize: '18px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 14px 32px rgba(90, 43, 18, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Simpan Perubahan
        </button>
      </div>
    </section>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-page">
      <Coffee />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Receipt({
  trx,
  settings
}: {
  trx: Transaction | null;
  settings: SettingsData;
}) {
  if (!trx) return null;

  return (
    <div className={`receipt receipt-${settings.receiptSize.replace('mm', '')}`}>
      <div className="receipt-brand">
        <Logo compact />
        <h3>{settings.storeName}</h3>
        <p>{settings.subtitle}</p>
        <small>by lutfiibnm</small>
      </div>

      <p>
        {settings.address}
        <br />
        {settings.phone}
      </p>

      <hr />

      <h3>INVOICE PELANGGAN</h3>
      <b>{trx.invoice}</b>

      <div className="rrow">
        <span>Tipe Pesanan</span>
        <b>{trx.orderType}</b>
      </div>

      {trx.tableNumber && (
        <div className="rrow">
          <span>No. Meja</span>
          <b>{trx.tableNumber}</b>
        </div>
      )}

      {trx.customerName && (
        <div className="rrow">
          <span>Pelanggan</span>
          <b>{trx.customerName}</b>
        </div>
      )}

      <div className="rrow">
        <span>Operator</span>
        <b>{trx.operator}</b>
      </div>

      <div className="rrow">
        <span>Tanggal</span>
        <b>{fmt(trx.createdAt)}</b>
      </div>

      <hr />

      {trx.items.map(i => (
        <div className="ritem" key={i.cartId}>
          <span>
            {i.name}
            {i.note && <small>Catatan: {i.note}</small>}
          </span>
          <b>
            {i.qty} x {money(i.price)}
          </b>
          <strong>{money(i.price * i.qty)}</strong>
        </div>
      ))}

      <hr />

      <div className="rrow">
        <span>Subtotal</span>
        <b>{money(trx.subtotal)}</b>
      </div>

      <div className="rrow">
        <span>Service</span>
        <b>{money(trx.service)}</b>
      </div>

      <div className="rrow">
        <span>Pajak</span>
        <b>{money(trx.tax)}</b>
      </div>

      <div className="rgrand">
        <span>TOTAL</span>
        <b>{money(trx.total)}</b>
      </div>

      {trx.amountPaid !== undefined && (
        <div className="rrow">
          <span>Bayar</span>
          <b>{money(trx.amountPaid)}</b>
        </div>
      )}

      {trx.change !== undefined && (
        <div className="rrow">
          <span>Kembalian</span>
          <b>{money(trx.change)}</b>
        </div>
      )}

      <div className="rrow">
        <span>Metode Pembayaran</span>
        <b>{trx.method.toUpperCase()}</b>
      </div>

      <div className="rrow">
        <span>Status Pembayaran</span>
        <b className="paid">LUNAS</b>
      </div>

      <hr />

      <p>
        <b>{settings.footer}</b>
      </p>

      <small>by lutfiibnm</small>
    </div>
  );
}

function KitchenReceipt({
  trx,
  settings
}: {
  trx: Transaction | null;
  settings: SettingsData;
}) {
  if (!trx) return null;

  return (
    <div
      className={`receipt kitchen-receipt receipt-${settings.receiptSize.replace('mm', '')}`}
      style={{
        pageBreakBefore: 'always',
        breakBefore: 'page'
      }}
    >
      <div className="receipt-brand">
        <Logo compact />
        <h3>CATATAN BARISTA / KOKI</h3>
        <p>{settings.storeName}</p>
        <small>Order untuk bar / dapur</small>
      </div>

      <hr />

      <div className="rrow">
        <span>Invoice</span>
        <b>{trx.invoice}</b>
      </div>

      <div className="rrow">
        <span>Tipe Pesanan</span>
        <b>{trx.orderType}</b>
      </div>

      {trx.tableNumber && (
        <div className="rrow">
          <span>No. Meja</span>
          <b>{trx.tableNumber}</b>
        </div>
      )}

      {trx.customerName && (
        <div className="rrow">
          <span>Pelanggan</span>
          <b>{trx.customerName}</b>
        </div>
      )}

      <div className="rrow">
        <span>Operator</span>
        <b>{trx.operator}</b>
      </div>

      <div className="rrow">
        <span>Waktu</span>
        <b>{fmt(trx.createdAt)}</b>
      </div>

      <hr />

      <h3>DAFTAR PESANAN</h3>

      {trx.items.map(i => (
        <div
          className="kitchen-item"
          key={i.cartId}
          style={{
            textAlign: 'left',
            borderBottom: '1px dashed #111',
            padding: '8px 0'
          }}
        >
          <b>
            {i.qty}x {i.name}
          </b>
          {i.note && <small>Catatan: {i.note}</small>}
        </div>
      ))}

      <hr />

      <p>
        <b>Mohon proses sesuai urutan pesanan.</b>
      </p>

      <small>Dicetak otomatis dari Galaksi Aromatica</small>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/kasirr/sw.js').catch(() => {});
  });
}
