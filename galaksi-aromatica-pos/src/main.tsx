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
  Package,
  Plus,
  Printer,
  QrCode,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Utensils,
  WalletCards,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trophy,
  ClipboardList
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type View = 'pos' | 'menu' | 'stock' | 'history' | 'sales' | 'settings';
type OrderType = 'Dine In' | 'Take Away';
type PaymentMethod = 'cash' | 'qris';
type PaymentStatus = 'pending' | 'paid';

type Operator = { name: string; pin: string };
type Category = { id: string; name: string };

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

// NEW: Raw material / bahan baku
type RawMaterial = {
  id: string;
  name: string;
  unit: string;          // e.g. kg, liter, pcs, sachet
  currentStock: number;
  minStock: number;      // low-stock threshold
  costPerUnit: number;   // harga beli per unit
  lastUpdated: string;   // ISO date
};

// NEW: Link antara produk dan bahan baku yang dipakai
type ProductIngredient = {
  productId: string;
  materialId: string;
  amountPerSale: number; // berapa unit bahan baku berkurang per 1 produk terjual
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
  rawMaterials: RawMaterial[];
  productIngredients: ProductIngredient[];
  transactions: Transaction[];
  settings: SettingsData;
};

type Notice = {
  title: string;
  message: string;
  amount: number;
  time: string;
} | null;

// ─── UTILS ────────────────────────────────────────────────────────────────────

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

const todayISO = () => new Date().toISOString().slice(0, 10);

const clock = () =>
  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

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

// ─── IMAGES ───────────────────────────────────────────────────────────────────

const img = {
  kopi1: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80',
  kopi2: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80',
  kopi3: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=700&q=80',
  kopi4: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=80',
  kopi5: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80',
  snack: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80',
  food:  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=700&q=80',
  cake:  'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80'
};

// ─── DEFAULT DB ───────────────────────────────────────────────────────────────

const defaultRawMaterials: RawMaterial[] = [
  { id: 'rm1', name: 'Biji Kopi Arabika', unit: 'kg',    currentStock: 12,  minStock: 3,  costPerUnit: 120000, lastUpdated: todayISO() },
  { id: 'rm2', name: 'Susu Full Cream',   unit: 'liter', currentStock: 8,   minStock: 2,  costPerUnit: 18000,  lastUpdated: todayISO() },
  { id: 'rm3', name: 'Gula Aren',         unit: 'kg',    currentStock: 5,   minStock: 1,  costPerUnit: 25000,  lastUpdated: todayISO() },
  { id: 'rm4', name: 'Sirup Hazelnut',    unit: 'botol', currentStock: 3,   minStock: 1,  costPerUnit: 85000,  lastUpdated: todayISO() },
  { id: 'rm5', name: 'Cup Plastik 16oz',  unit: 'pcs',   currentStock: 200, minStock: 50, costPerUnit: 1200,   lastUpdated: todayISO() },
  { id: 'rm6', name: 'Teh Hijau',         unit: 'sachet',currentStock: 80,  minStock: 20, costPerUnit: 500,    lastUpdated: todayISO() },
  { id: 'rm7', name: 'Tepung Terigu',     unit: 'kg',    currentStock: 7,   minStock: 2,  costPerUnit: 14000,  lastUpdated: todayISO() },
  { id: 'rm8', name: 'Cokelat Bubuk',     unit: 'kg',    currentStock: 2,   minStock: 1,  costPerUnit: 75000,  lastUpdated: todayISO() }
];

const defaultProductIngredients: ProductIngredient[] = [
  { productId: 'p1', materialId: 'rm1', amountPerSale: 0.02 },
  { productId: 'p1', materialId: 'rm2', amountPerSale: 0.15 },
  { productId: 'p2', materialId: 'rm1', amountPerSale: 0.018 },
  { productId: 'p2', materialId: 'rm3', amountPerSale: 0.03 },
  { productId: 'p3', materialId: 'rm1', amountPerSale: 0.02 },
  { productId: 'p3', materialId: 'rm2', amountPerSale: 0.12 },
  { productId: 'p8', materialId: 'rm4', amountPerSale: 0.05 },
  { productId: 'p8', materialId: 'rm2', amountPerSale: 0.15 },
];

const defaultDb: Db = {
  operator: { name: 'Lutfi Ibnu Maulana', pin: '1111' },
  categories: [
    { id: 'coffee', name: 'Coffee' },
    { id: 'non',    name: 'Non Coffee' },
    { id: 'tea',    name: 'Tea' },
    { id: 'snack',  name: 'Snack' },
    { id: 'main',   name: 'Main Course' },
    { id: 'dessert',name: 'Dessert' },
    { id: 'promo',  name: 'Promo' }
  ],
  products: [
    { id:'p1',  categoryId:'coffee',  name:'Es Kopi Galaksi',    description:'Kopi susu signature rasa bold.',  price:32000, image:img.kopi1, stock:50, active:true,  bestSeller:true,  promo:false, discountPercent:0 },
    { id:'p2',  categoryId:'coffee',  name:'Kopi Susu Aren',     description:'Gula aren dan espresso lembut.',  price:28000, image:img.kopi2, stock:42, active:true,  bestSeller:false, promo:false, discountPercent:0 },
    { id:'p3',  categoryId:'coffee',  name:'Cappuccino',         description:'Foam halus dan espresso hangat.', price:30000, image:img.kopi3, stock:38, active:true,  bestSeller:false, promo:false, discountPercent:0 },
    { id:'p4',  categoryId:'coffee',  name:'Caramel Macchiato',  description:'Manis caramel creamy.',           price:34000, image:img.kopi5, stock:35, active:true,  bestSeller:true,  promo:false, discountPercent:0 },
    { id:'p5',  categoryId:'coffee',  name:'Americano',          description:'Black coffee clean.',             price:22000, image:img.kopi4, stock:60, active:true,  bestSeller:false, promo:false, discountPercent:0 },
    { id:'p6',  categoryId:'non',     name:'Mocha',              description:'Cokelat dan kopi creamy.',        price:28000, image:img.kopi2, stock:30, active:true,  bestSeller:false, promo:false, discountPercent:0 },
    { id:'p7',  categoryId:'coffee',  name:'Vietnam Drip',       description:'Drip klasik, pekat.',             price:26000, image:img.kopi3, stock:24, active:true,  bestSeller:false, promo:false, discountPercent:0 },
    { id:'p8',  categoryId:'coffee',  name:'Hazelnut Latte',     description:'Latte aroma hazelnut.',           price:32000, image:img.kopi1, stock:27, active:true,  bestSeller:false, promo:false, discountPercent:0 },
    { id:'p9',  categoryId:'coffee',  name:'Spanish Latte',      description:'Latte manis creamy.',             price:33000, image:img.kopi5, stock:25, active:true,  bestSeller:false, promo:true,  discountPercent:0 },
    { id:'p10', categoryId:'snack',   name:'Croissant',          description:'Pastry buttery.',                 price:26000, image:img.snack, stock:18, active:true,  bestSeller:false, promo:false, discountPercent:0 },
    { id:'p11', categoryId:'main',    name:'Chicken Rice Bowl',  description:'Nasi ayam cafe bowl.',            price:38000, image:img.food,  stock:22, active:true,  bestSeller:false, promo:false, discountPercent:0 },
    { id:'p12', categoryId:'dessert', name:'Cheesecake',         description:'Cake lembut creamy.',             price:32000, image:img.cake,  stock:14, active:true,  bestSeller:false, promo:false, discountPercent:0 }
  ],
  rawMaterials: defaultRawMaterials,
  productIngredients: defaultProductIngredients,
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

// ─── PERSIST ──────────────────────────────────────────────────────────────────

function loadDb(): Db {
  try {
    const saved = JSON.parse(localStorage.getItem('galaksi-pos-db-v3') || 'null');
    if (!saved) return defaultDb;
    return {
      ...defaultDb,
      ...saved,
      operator: { ...defaultDb.operator, ...(saved.operator || {}) },
      settings: {
        ...defaultDb.settings,
        ...(saved.settings || {}),
        operatorName: saved.settings?.operatorName || saved.operator?.name || defaultDb.settings.operatorName
      },
      products: Array.isArray(saved.products)
        ? saved.products.map((p: Product) => ({
            ...p,
            bestSeller: !!p.bestSeller,
            promo: !!p.promo,
            discountPercent: Number(p.discountPercent || 0)
          }))
        : defaultDb.products,
      rawMaterials: Array.isArray(saved.rawMaterials) ? saved.rawMaterials : defaultDb.rawMaterials,
      productIngredients: Array.isArray(saved.productIngredients) ? saved.productIngredients : defaultDb.productIngredients,
      transactions: saved.transactions || []
    };
  } catch {
    return defaultDb;
  }
}

function saveDb(db: Db) {
  localStorage.setItem('galaksi-pos-db-v3', JSON.stringify(db));
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────

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
          <b>Galaksi<br />Aromatica</b>
          <span>Coffee & Eatery</span>
          <em>by lutfiibnm</em>
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

function App() {
  const [db, setDb] = React.useState<Db>(() => loadDb());
  const [logged, setLogged] = React.useState(() => localStorage.getItem('galaksi-logged') === '1');
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
    setTimeout(() => window.print(), 1000);
  };

  // Kurangi stok bahan baku otomatis saat ada penjualan
  const deductRawMaterials = (items: CartItem[], dbState: Db): Db => {
    const updatedMaterials = [...dbState.rawMaterials];
    items.forEach(item => {
      const ingredients = dbState.productIngredients.filter(pi => pi.productId === item.productId);
      ingredients.forEach(ing => {
        const idx = updatedMaterials.findIndex(m => m.id === ing.materialId);
        if (idx !== -1) {
          updatedMaterials[idx] = {
            ...updatedMaterials[idx],
            currentStock: Math.max(0, updatedMaterials[idx].currentStock - ing.amountPerSale * item.qty),
            lastUpdated: todayISO()
          };
        }
      });
    });
    return { ...dbState, rawMaterials: updatedMaterials };
  };

  if (!logged) {
    return (
      <Login db={db} onLogin={() => { localStorage.setItem('galaksi-logged', '1'); setLogged(true); }} />
    );
  }

  // Low-stock count for badge
  const lowStockCount = db.rawMaterials.filter(m => m.currentStock <= m.minStock).length;

  return (
    <div className="shell">
      <aside className="sidebar no-print">
        <Logo />
        <nav>
          {([
            ['pos',      <ShoppingCart />, 'POS / Kasir'],
            ['menu',     <Utensils />,     'Menu'],
            ['stock',    <Package />,      'Stok Bahan Baku'],
            ['history',  <ListOrdered />,  'Riwayat Transaksi'],
            ['sales',    <BarChart3 />,    'Laporan Penjualan'],
            ['settings', <Settings />,     'Pengaturan'],
          ] as [View, React.ReactNode, string][]).map(([v, icon, label]) => (
            <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>
              {icon}
              {label}
              {v === 'stock' && lowStockCount > 0 && (
                <span className="badge-warn">{lowStockCount}</span>
              )}
            </button>
          ))}
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
          Galaksi Aromatica<br /><span>by lutfiibnm</span>
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
            <button onClick={() => { localStorage.removeItem('galaksi-logged'); setLogged(false); }}>
              <LogOut /> Logout
            </button>
          </div>
        </header>

        {view === 'pos' && (
          <POS db={db} patchDb={patchDb} setNotice={setNotice}
            printTransaction={printTransaction} deductRawMaterials={deductRawMaterials} />
        )}
        {view === 'menu'     && <MenuPage    db={db} patchDb={patchDb} />}
        {view === 'stock'    && <StockPage   db={db} patchDb={patchDb} />}
        {view === 'history'  && <HistoryPage db={db} printTransaction={printTransaction} />}
        {view === 'sales'    && <SalesPage   db={db} />}
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

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function Login({ db, onLogin }: { db: Db; onLogin: () => void }) {
  const [pin, setPin] = React.useState('');
  const submit = () => pin === db.operator.pin ? onLogin() : alert('PIN salah.');

  return (
    <div className="login">
      <div className="login-card">
        <Logo />
        <h1>Galaksi Aromatica</h1>
        <p>Satu akun operator. Tidak ada admin/kasir terpisah.</p>
        <input autoFocus type="password" inputMode="numeric" placeholder="PIN Operator"
          value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && submit()} />
        <button onClick={submit}>Masuk</button>
        <small>PIN awal: 1111. Bisa diganti di Pengaturan.</small>
      </div>
    </div>
  );
}

// ─── POS ──────────────────────────────────────────────────────────────────────

function POS({
  db, patchDb, setNotice, printTransaction, deductRawMaterials
}: {
  db: Db;
  patchDb: (fn: (d: Db) => Db) => void;
  setNotice: (n: Notice) => void;
  printTransaction: (t: Transaction) => void;
  deductRawMaterials: (items: CartItem[], db: Db) => Db;
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

  const products = db.products.filter(p =>
    p.active &&
    (cat === 'all' || p.categoryId === cat || (cat === 'promo' && p.promo)) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const service  = Math.round((subtotal * db.settings.servicePercent) / 100);
  const tax      = Math.round((subtotal * db.settings.taxPercent) / 100);
  const total    = subtotal + service + tax;
  const change   = Math.max(Number(amountPaid || 0) - total, 0);

  const add = (p: Product) =>
    setCart(c => {
      const found = c.find(i => i.productId === p.id && !i.note);
      const finalPrice = discountPrice(p.price, p.discountPercent);
      return found
        ? c.map(i => i.cartId === found.cartId ? { ...i, qty: i.qty + 1 } : i)
        : [...c, { cartId: uid(), productId: p.id, name: p.name, image: p.image, price: finalPrice, qty: 1 }];
    });

  const qty    = (id: string, n: number) => setCart(c => c.map(i => i.cartId === id ? { ...i, qty: Math.max(1, i.qty + n) } : i));
  const remove = (id: string) => setCart(c => c.filter(i => i.cartId !== id));

  const makeTrx = (m: PaymentMethod, paid?: number): Transaction => ({
    id: uid(),
    invoice: invoiceNo(db.transactions.length),
    operator: db.settings.operatorName,
    orderType, tableNumber: orderType === 'Dine In' ? table : undefined,
    customerName: cust || undefined, items: cart,
    subtotal, service, tax, total,
    amountPaid: paid, change: paid ? Math.max(paid - total, 0) : undefined,
    method: m, status: m === 'qris' ? 'pending' : 'paid',
    reference: m === 'qris' ? `QRIS-${uid().toUpperCase()}` : undefined,
    createdAt: new Date().toISOString()
  });

  const savePaid = (trx: Transaction) => {
    const paidTrx = { ...trx, status: 'paid' as PaymentStatus };
    patchDb(d => {
      const afterDeduct = deductRawMaterials(paidTrx.items, d);
      return { ...afterDeduct, transactions: [paidTrx, ...afterDeduct.transactions] };
    });
    setCart([]); setPay(false); setAmountPaid('');
    setNotice({ title: paidTrx.method === 'qris' ? 'QRIS masuk' : 'Transaksi berhasil',
      message: `${paidTrx.invoice} sudah lunas`, amount: paidTrx.total, time: clock() });
    printTransaction(paidTrx);
  };

  const finishCash = () => {
    const paid = Number(amountPaid || 0);
    if (paid < total) return alert('Uang bayar kurang.');
    savePaid(makeTrx('cash', paid));
  };

  const finishQris = () => {
    const pending = makeTrx('qris');
    setNotice({ title: 'Menunggu QRIS', message: 'Kode QR sudah ditampilkan ke pelanggan', amount: total, time: clock() });
    setTimeout(() => savePaid(pending), 650);
  };

  return (
    <section className="pos-page page-full">
      <div className="pos-left card">
        <div className="order-line">
          <div className="seg">
            <button className={orderType === 'Dine In'   ? 'on' : ''} onClick={() => setOrderType('Dine In')}>Dine In</button>
            <button className={orderType === 'Take Away' ? 'on' : ''} onClick={() => setOrderType('Take Away')}>Take Away</button>
          </div>
          <label>No. Meja<input value={table} disabled={orderType === 'Take Away'} onChange={e => setTable(e.target.value)} /></label>
          <label>Nama Pelanggan<input value={cust} onChange={e => setCust(e.target.value)} placeholder="Opsional" /></label>
          <div className="search search-full">
            <Search />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari menu..." />
          </div>
        </div>

        <div className="tabs">
          <button className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>Semua</button>
          {db.categories.map(c => (
            <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>{c.name}</button>
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
                <i><Plus size={16} /></i>
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
          {cart.length === 0 && <div className="empty">Tap menu di kiri buat nambah pesanan.</div>}
          {cart.map(i => (
            <div className="cart-row" key={i.cartId}>
              <img src={i.image} />
              <div className="cart-info">
                <b>{i.name}</b>
                <input value={i.note || ''} onChange={e => setCart(c => c.map(x => x.cartId === i.cartId ? { ...x, note: e.target.value } : x))} placeholder="Catatan item" />
              </div>
              <button onClick={() => qty(i.cartId, -1)}><Minus /></button>
              <span>{i.qty}</span>
              <button onClick={() => qty(i.cartId,  1)}><Plus /></button>
              <strong>{money(i.price * i.qty)}</strong>
              <button onClick={() => remove(i.cartId)}><X /></button>
            </div>
          ))}
        </div>
        <div className="totalbox">
          <p><span>Subtotal</span><b>{money(subtotal)}</b></p>
          <p><span>Service ({percentLabel(db.settings.servicePercent)}%)</span><b>{money(service)}</b></p>
          <p><span>Pajak ({percentLabel(db.settings.taxPercent)}%)</span><b>{money(tax)}</b></p>
          <h3><span>TOTAL</span><b>{money(total)}</b></h3>
        </div>
        <div className="cart-actions only-pay">
          <button className="primary" disabled={!cart.length} onClick={() => { setMethod('cash'); setPay(true); }}>
            <CreditCard /> Bayar
          </button>
        </div>
      </aside>

      {pay && (
        <div className="modal">
          <div className="pay-card">
            <button className="close" onClick={() => setPay(false)}><X /></button>
            <h2>Pembayaran</h2>
            <p>Total tagihan</p>
            <strong className="pay-total">{money(total)}</strong>
            <div className="pay-tabs">
              <button className={method === 'cash' ? 'on' : ''} onClick={() => setMethod('cash')}><WalletCards /> Cash</button>
              <button className={method === 'qris' ? 'on' : ''} onClick={() => setMethod('qris')}><QrCode /> QRIS</button>
            </div>
            {method === 'cash' ? (
              <div className="cash-box">
                <label>Uang diterima
                  <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="Contoh: 150000" />
                </label>
                <p>Kembalian: <b>{money(change)}</b></p>
                <button className="primary wide" onClick={finishCash}>Bayar Cash & Cetak Invoice</button>
              </div>
            ) : (
              <div className="qris-box">
                <div className="fake-qr"><QrCode size={150} /></div>
                <b>QRIS Galaksi Aromatica</b>
                <small>NMID: ID102509503903781</small>
                <p>Pelanggan scan kode ini. Setelah tombol simulasi ditekan, status jadi LUNAS dan invoice langsung dicetak.</p>
                <button className="primary wide" onClick={finishQris}>Simulasi QRIS Masuk & Cetak Invoice</button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── MENU PAGE ────────────────────────────────────────────────────────────────

function MenuPage({ db, patchDb }: { db: Db; patchDb: (fn: (d: Db) => Db) => void }) {
  const blank: Product = { id:'', categoryId:'coffee', name:'', description:'', price:0, image:img.kopi1, stock:0, active:true, bestSeller:false, promo:false, discountPercent:0 };
  const [form, setForm] = React.useState<Product>(blank);
  const [discountText, setDiscountText] = React.useState('');

  const editProduct = (p: Product) => {
    setForm({ ...p, bestSeller: !!p.bestSeller, promo: !!p.promo, discountPercent: Number(p.discountPercent || 0) });
    setDiscountText(numberToText(p.discountPercent));
  };
  const resetForm = () => { setForm(blank); setDiscountText(''); };
  const save = () => {
    if (!form.name || !form.price) return alert('Nama dan harga wajib diisi.');
    const discountValue = parsePercent(discountText);
    const fixedProduct: Product = { ...form, promo: form.promo || discountValue > 0, discountPercent: discountValue };
    patchDb(d => ({ ...d, products: fixedProduct.id
      ? d.products.map(p => p.id === fixedProduct.id ? fixedProduct : p)
      : [{ ...fixedProduct, id: uid() }, ...d.products] }));
    resetForm();
  };
  const del = (id: string) => {
    if (confirm('Hapus menu ini?')) patchDb(d => ({ ...d, products: d.products.filter(p => p.id !== id) }));
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
        <div><h2>Manajemen Menu</h2><p>Tambah menu, edit harga, upload gambar, Best Seller, Promo, dan Diskon.</p></div>
        <button onClick={resetForm}><Plus /> Menu Baru</button>
      </div>
      <div className="menu-management">
        <div className="menu-table">
          {db.products.map(p => (
            <div className="manage-row" key={p.id}>
              <img src={p.image} />
              <div>
                <b>{p.name}</b>
                <small>{p.description}{p.bestSeller ? ' • Best Seller' : ''}{p.promo ? ' • Promo' : ''}{p.discountPercent ? ` • Diskon ${percentLabel(p.discountPercent)}%` : ''}</small>
              </div>
              <span>{db.categories.find(c => c.id === p.categoryId)?.name}</span>
              <strong>{p.discountPercent ? (<><del>{money(p.price)}</del><br />{money(discountPrice(p.price, p.discountPercent))}</>) : money(p.price)}</strong>
              <em>{p.active ? 'Aktif' : 'Nonaktif'}</em>
              <button onClick={() => editProduct(p)}><Edit3 /></button>
              <button className="red" onClick={() => del(p.id)}><Trash2 /></button>
            </div>
          ))}
        </div>

        <div className="editor">
          <h3>{form.id ? 'Edit Menu' : 'Tambah Menu'}</h3>
          <img src={form.image} />
          <label className="upload">
            <ImagePlus /> Ubah / Upload Gambar
            <input type="file" accept="image/*" onChange={e => readFile(e.target.files?.[0])} />
          </label>
          <input placeholder="Nama menu" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
            {db.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="text" inputMode="numeric" placeholder="Harga" value={form.price ? String(form.price) : ''}
            onChange={e => setForm({ ...form, price: Number(e.target.value.replace(/\D/g, '')) })} />
          <input type="text" inputMode="decimal" placeholder="Diskon Promo (%) contoh: 1,2 atau 2,6" value={discountText}
            onChange={e => { const clean = cleanPercentText(e.target.value); setDiscountText(clean); setForm({ ...form, promo: clean !== '' || form.promo }); }} />
          <textarea placeholder="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label className="check"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />Menu aktif</label>
          <label className="check"><input type="checkbox" checked={!!form.bestSeller} onChange={e => setForm({ ...form, bestSeller: e.target.checked })} />Best Seller</label>
          <label className="check"><input type="checkbox" checked={!!form.promo} onChange={e => setForm({ ...form, promo: e.target.checked })} />Promo</label>
          <small style={{ color: '#806954', lineHeight: 1.4 }}>Kalau isi diskon, Promo otomatis aktif. Bisa pakai koma, misalnya 1,2 atau 2,6.</small>
          <button className="primary" onClick={save}>{form.id ? 'Simpan Perubahan' : 'Tambah Menu'}</button>
          {form.id && <button className="danger" onClick={() => del(form.id)}>Hapus Menu</button>}
        </div>
      </div>
    </section>
  );
}

// ─── STOCK PAGE (NEW) ─────────────────────────────────────────────────────────

function StockPage({ db, patchDb }: { db: Db; patchDb: (fn: (d: Db) => Db) => void }) {
  const blankMaterial: RawMaterial = { id: '', name: '', unit: 'kg', currentStock: 0, minStock: 0, costPerUnit: 0, lastUpdated: todayISO() };
  const [form, setForm] = React.useState<RawMaterial>(blankMaterial);
  const [editing, setEditing] = React.useState(false);
  const [tab, setTab] = React.useState<'materials' | 'ingredients'>('materials');

  // Ingredient linking state
  const [linkProductId, setLinkProductId] = React.useState('');
  const [linkMaterialId, setLinkMaterialId] = React.useState('');
  const [linkAmount, setLinkAmount] = React.useState('');

  const resetForm = () => { setForm(blankMaterial); setEditing(false); };

  const saveMaterial = () => {
    if (!form.name || !form.unit) return alert('Nama dan satuan wajib diisi.');
    patchDb(d => ({
      ...d,
      rawMaterials: form.id
        ? d.rawMaterials.map(m => m.id === form.id ? form : m)
        : [{ ...form, id: uid(), lastUpdated: todayISO() }, ...d.rawMaterials]
    }));
    resetForm();
  };

  const deleteMaterial = (id: string) => {
    if (confirm('Hapus bahan baku ini?')) patchDb(d => ({ ...d, rawMaterials: d.rawMaterials.filter(m => m.id !== id) }));
  };

  const restock = (id: string, amount: number) => {
    patchDb(d => ({ ...d, rawMaterials: d.rawMaterials.map(m => m.id === id ? { ...m, currentStock: Math.max(0, m.currentStock + amount), lastUpdated: todayISO() } : m) }));
  };

  const addIngredientLink = () => {
    if (!linkProductId || !linkMaterialId || !linkAmount) return alert('Lengkapi semua field.');
    const amount = parseFloat(linkAmount);
    if (isNaN(amount) || amount <= 0) return alert('Jumlah tidak valid.');
    // Remove existing link for same product+material, then add new
    patchDb(d => ({
      ...d,
      productIngredients: [
        ...d.productIngredients.filter(pi => !(pi.productId === linkProductId && pi.materialId === linkMaterialId)),
        { productId: linkProductId, materialId: linkMaterialId, amountPerSale: amount }
      ]
    }));
    setLinkProductId(''); setLinkMaterialId(''); setLinkAmount('');
  };

  const removeIngredientLink = (productId: string, materialId: string) => {
    patchDb(d => ({ ...d, productIngredients: d.productIngredients.filter(pi => !(pi.productId === productId && pi.materialId === materialId)) }));
  };

  const lowItems = db.rawMaterials.filter(m => m.currentStock <= m.minStock);

  return (
    <section className="page-full card stock-page">
      <div className="page-title">
        <div>
          <h2>Stok Bahan Baku</h2>
          <p>Pantau, tambah, dan kelola stok bahan baku. Stok otomatis berkurang saat ada transaksi.</p>
        </div>
        <button onClick={() => { resetForm(); setEditing(true); }}><Plus /> Bahan Baru</button>
      </div>

      {lowItems.length > 0 && (
        <div className="low-stock-alert">
          <AlertTriangle size={18} />
          <span><b>{lowItems.length} bahan baku</b> mendekati atau di bawah stok minimum: {lowItems.map(m => m.name).join(', ')}</span>
        </div>
      )}

      <div className="stock-tabs">
        <button className={tab === 'materials'   ? 'on' : ''} onClick={() => setTab('materials')}>  <Package size={15} />  Daftar Bahan Baku</button>
        <button className={tab === 'ingredients' ? 'on' : ''} onClick={() => setTab('ingredients')}><ClipboardList size={15} /> Tautan Produk-Bahan</button>
      </div>

      {tab === 'materials' && (
        <div className="stock-body">
          <div className="stock-table">
            {db.rawMaterials.map(m => {
              const isLow = m.currentStock <= m.minStock;
              const pct   = Math.min(100, m.minStock > 0 ? (m.currentStock / (m.minStock * 3)) * 100 : 100);
              return (
                <div className={`stock-row ${isLow ? 'low' : ''}`} key={m.id}>
                  <div className="stock-info">
                    <b>{m.name}</b>
                    <small>Min stok: {m.minStock} {m.unit} • Harga beli: {money(m.costPerUnit)}/{m.unit} • Update: {m.lastUpdated}</small>
                    <div className="stock-bar">
                      <div className="stock-bar-fill" style={{ width: `${pct}%`, background: isLow ? '#e05050' : '#6db87a' }} />
                    </div>
                  </div>
                  <div className="stock-qty">
                    <span className={isLow ? 'qty-low' : 'qty-ok'}>{m.currentStock.toFixed(2)}</span>
                    <small>{m.unit}</small>
                    {isLow && <AlertTriangle size={14} color="#e05050" />}
                  </div>
                  <div className="stock-actions">
                    <button onClick={() => { const v = prompt(`Tambah stok ${m.name} (${m.unit}):`, ''); if (v !== null) restock(m.id, parseFloat(v) || 0); }}>
                      <ChevronUp size={14} /> Tambah
                    </button>
                    <button onClick={() => { const v = prompt(`Kurangi stok ${m.name} (${m.unit}):`, ''); if (v !== null) restock(m.id, -(parseFloat(v) || 0)); }}>
                      <ChevronDown size={14} /> Kurangi
                    </button>
                    <button onClick={() => { setForm(m); setEditing(true); }}><Edit3 size={14} /></button>
                    <button className="red" onClick={() => deleteMaterial(m.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {editing && (
            <div className="stock-editor card">
              <h3>{form.id ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}</h3>
              <label>Nama Bahan<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Biji kopi, susu, dst." /></label>
              <label>Satuan<input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="kg, liter, pcs, sachet" /></label>
              <label>Stok Saat Ini<input type="number" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: parseFloat(e.target.value) || 0 })} /></label>
              <label>Minimum Stok (alert)<input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })} /></label>
              <label>Harga Beli per {form.unit || 'unit'}<input type="number" value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: parseFloat(e.target.value) || 0 })} /></label>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="primary" onClick={saveMaterial}>{form.id ? 'Simpan' : 'Tambah'}</button>
                <button onClick={resetForm}>Batal</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'ingredients' && (
        <div className="ingredient-body">
          <div className="ingredient-add card">
            <h3>Tautan Produk → Bahan Baku</h3>
            <p>Atur berapa banyak bahan baku berkurang setiap 1 produk terjual.</p>
            <div className="ingredient-form">
              <select value={linkProductId} onChange={e => setLinkProductId(e.target.value)}>
                <option value="">-- Pilih Produk --</option>
                {db.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={linkMaterialId} onChange={e => setLinkMaterialId(e.target.value)}>
                <option value="">-- Pilih Bahan Baku --</option>
                {db.rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
              </select>
              <input type="number" placeholder="Jumlah per penjualan" value={linkAmount} onChange={e => setLinkAmount(e.target.value)} step="0.001" />
              <button className="primary" onClick={addIngredientLink}><Plus size={14} /> Simpan Tautan</button>
            </div>
          </div>

          <div className="ingredient-list">
            {db.productIngredients.length === 0 ? (
              <Empty title="Belum ada tautan" text="Tautan produk-bahan baku belum diatur." />
            ) : (
              db.productIngredients.map((pi, idx) => {
                const prod = db.products.find(p => p.id === pi.productId);
                const mat  = db.rawMaterials.find(m => m.id === pi.materialId);
                return (
                  <div className="ingredient-row" key={idx}>
                    <span><b>{prod?.name || pi.productId}</b></span>
                    <span>→ {mat?.name || pi.materialId}</span>
                    <span>{pi.amountPerSale} {mat?.unit}</span>
                    <button className="red" onClick={() => removeIngredientLink(pi.productId, pi.materialId)}><Trash2 size={14} /></button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── HISTORY PAGE ─────────────────────────────────────────────────────────────

function HistoryPage({ db, printTransaction }: { db: Db; printTransaction: (t: Transaction) => void }) {
  return (
    <section className="page-full card list-page history-page">
      <div className="page-title">
        <div><h2>Riwayat Transaksi</h2><p>Mulai dari 0. Transaksi muncul setelah pembayaran selesai.</p></div>
      </div>
      {db.transactions.length === 0 ? (
        <Empty title="Belum ada transaksi" text="Riwayat masih kosong. Buat transaksi dari halaman POS dulu." />
      ) : (
        <div className="table">
          {db.transactions.map(t => (
            <div className="tr" key={t.id}>
              <b>{t.invoice}</b>
              <span>{fmt(t.createdAt)}</span>
              <span>{t.orderType}{t.tableNumber ? ` • Meja ${t.tableNumber}` : ''}</span>
              <span>{t.method.toUpperCase()}</span>
              <strong>{money(t.total)}</strong>
              <em className={t.status}>{t.status === 'paid' ? 'LUNAS' : 'PENDING'}</em>
              <button onClick={() => printTransaction(t)}><Printer /> Cetak</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── SALES PAGE (EXPANDED) ────────────────────────────────────────────────────

function SalesPage({ db }: { db: Db }) {
  const [selectedDate, setSelectedDate] = React.useState(todayISO());

  const paid = db.transactions.filter(t => t.status === 'paid');

  // Filtered transactions for selected date
  const dayTrx = paid.filter(t => t.createdAt.slice(0, 10) === selectedDate);

  // Overall stats
  const totalRev  = paid.reduce((s, t) => s + t.total, 0);
  const totalTrx  = paid.length;
  const avgOrder  = totalTrx ? Math.round(totalRev / totalTrx) : 0;

  // Daily stats
  const dayRev   = dayTrx.reduce((s, t) => s + t.total, 0);
  const dayCount = dayTrx.length;

  // ── Top produk per hari ────────────────────────────────────────────────────

  // Build map: date → { productName → qty }
  const dailyProductMap = new Map<string, Map<string, number>>();
  paid.forEach(t => {
    const d = t.createdAt.slice(0, 10);
    if (!dailyProductMap.has(d)) dailyProductMap.set(d, new Map());
    const dayMap = dailyProductMap.get(d)!;
    t.items.forEach(i => dayMap.set(i.name, (dayMap.get(i.name) || 0) + i.qty));
  });

  // Top product for selected day
  const dayProductMap = dailyProductMap.get(selectedDate) || new Map<string, number>();
  const dayRanking = [...dayProductMap.entries()].sort((a, b) => b[1] - a[1]);

  // Top product for ALL days (for weekly recap)
  const byProduct = new Map<string, number>();
  paid.forEach(t => t.items.forEach(i => byProduct.set(i.name, (byProduct.get(i.name) || 0) + i.qty)));
  const allRanking = [...byProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const allMax = allRanking[0]?.[1] || 1;

  // Revenue chart (daily for last 7 days)
  const last7: { date: string; label: string; rev: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    const rev = paid.filter(t => t.createdAt.slice(0, 10) === iso).reduce((s, t) => s + t.total, 0);
    last7.push({ date: iso, label, rev });
  }
  const maxRev = Math.max(...last7.map(x => x.rev), 1);

  // Payment method breakdown (all time)
  const cashCount = paid.filter(t => t.method === 'cash').length;
  const qrisCount = paid.filter(t => t.method === 'qris').length;

  // Get all transaction dates for nav
  const allDates = [...new Set(paid.map(t => t.createdAt.slice(0, 10)))].sort().reverse();

  return (
    <section className="page-full card list-page sales-page">
      <div className="page-title">
        <div><h2>Laporan Penjualan</h2><p>Rekap penjualan, produk terlaris per hari, dan grafik pendapatan.</p></div>
      </div>

      {/* ── Overall Stats ── */}
      <div className="stats">
        <span><b>{money(totalRev)}</b><small>Total Penjualan</small></span>
        <span><b>{totalTrx}</b><small>Total Transaksi</small></span>
        <span><b>{money(avgOrder)}</b><small>Rata-rata Order</small></span>
        <span><b>{allRanking[0]?.[0] || '-'}</b><small>Best Seller All-time</small></span>
      </div>

      {/* ── Revenue Chart 7 hari ── */}
      <div className="sales-section">
        <h3 className="section-title"><TrendingUp size={16} /> Pendapatan 7 Hari Terakhir</h3>
        {paid.length === 0 ? (
          <Empty title="Laporan masih kosong" text="Belum ada penjualan." />
        ) : (
          <div className="bars-wrap">
            {last7.map(d => (
              <div key={d.date} className={`bar-item ${d.date === selectedDate ? 'bar-selected' : ''}`}
                onClick={() => setSelectedDate(d.date)}>
                <div className="bar-col">
                  <div className="bar-inner" style={{ height: `${20 + (d.rev / maxRev) * 160}px` }}>
                    {d.rev > 0 && <span className="bar-val">{money(d.rev).replace('Rp\u00a0', 'Rp').replace(/\.000$/, 'k').replace(/000$/, 'k')}</span>}
                  </div>
                </div>
                <small>{d.label}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Daily Recap & Top Product ── */}
      <div className="sales-two-col">

        {/* Rekap Harian */}
        <div className="sales-section">
          <h3 className="section-title">
            <ClipboardList size={16} /> Rekap Harian
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              style={{ marginLeft: 'auto', fontSize: 13, padding: '4px 8px', borderRadius: 8, border: '1px solid #d9c4b0' }} />
          </h3>

          <div className="recap-stats">
            <div className="recap-item"><span>Pendapatan</span><b>{money(dayRev)}</b></div>
            <div className="recap-item"><span>Transaksi</span><b>{dayCount}</b></div>
            <div className="recap-item"><span>Cash</span><b>{dayTrx.filter(t => t.method === 'cash').length}</b></div>
            <div className="recap-item"><span>QRIS</span><b>{dayTrx.filter(t => t.method === 'qris').length}</b></div>
            <div className="recap-item"><span>Rata-rata</span><b>{dayCount ? money(Math.round(dayRev / dayCount)) : '-'}</b></div>
            <div className="recap-item"><span>Subtotal</span><b>{money(dayTrx.reduce((s, t) => s + t.subtotal, 0))}</b></div>
            <div className="recap-item"><span>Service</span><b>{money(dayTrx.reduce((s, t) => s + t.service, 0))}</b></div>
            <div className="recap-item"><span>Pajak</span><b>{money(dayTrx.reduce((s, t) => s + t.tax, 0))}</b></div>
          </div>

          {dayTrx.length === 0 && <p style={{ color: '#a89080', textAlign: 'center', marginTop: 16 }}>Tidak ada transaksi pada tanggal ini.</p>}
        </div>

        {/* Top Produk per Hari */}
        <div className="sales-section">
          <h3 className="section-title"><Trophy size={16} /> Produk Terlaris — {selectedDate}</h3>
          {dayRanking.length === 0 ? (
            <p style={{ color: '#a89080', textAlign: 'center', marginTop: 20 }}>Tidak ada data untuk tanggal ini.</p>
          ) : (
            <div className="top-products">
              {dayRanking.map(([name, qty], idx) => (
                <div className="top-prod-row" key={name}>
                  <span className={`rank rank-${idx + 1}`}>{idx + 1}</span>
                  <span className="tp-name">{name}</span>
                  <div className="tp-bar-wrap">
                    <div className="tp-bar" style={{ width: `${(qty / (dayRanking[0]?.[1] || 1)) * 100}%` }} />
                  </div>
                  <b>{qty} pcs</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── All-time Top 10 ── */}
      <div className="sales-section">
        <h3 className="section-title"><BarChart3 size={16} /> Top 10 Produk All-time</h3>
        {allRanking.length === 0 ? (
          <Empty title="Belum ada data" text="Buat transaksi dulu." />
        ) : (
          <div className="all-top-list">
            {allRanking.map(([name, qty], idx) => (
              <div className="all-top-row" key={name}>
                <span className={`rank rank-${Math.min(idx + 1, 4)}`}>{idx + 1}</span>
                <span>{name}</span>
                <div className="tp-bar-wrap">
                  <div className="tp-bar" style={{ width: `${(qty / allMax) * 100}%`, background: idx === 0 ? '#c77b3a' : idx === 1 ? '#8b9e6d' : idx === 2 ? '#7b9ab5' : '#c4a882' }} />
                </div>
                <b>{qty} pcs</b>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Metode Pembayaran ── */}
      <div className="sales-section payment-split">
        <h3 className="section-title"><WalletCards size={16} /> Metode Pembayaran (All-time)</h3>
        <div className="payment-bars">
          <div className="pay-bar-item">
            <span>Cash</span>
            <div className="pay-track">
              <div className="pay-fill cash" style={{ width: totalTrx ? `${(cashCount / totalTrx) * 100}%` : '0%' }} />
            </div>
            <b>{cashCount} trx</b>
          </div>
          <div className="pay-bar-item">
            <span>QRIS</span>
            <div className="pay-track">
              <div className="pay-fill qris" style={{ width: totalTrx ? `${(qrisCount / totalTrx) * 100}%` : '0%' }} />
            </div>
            <b>{qrisCount} trx</b>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────

function SettingsPage({ db, patchDb }: { db: Db; patchDb: (fn: (d: Db) => Db) => void }) {
  const [s, setS] = React.useState<SettingsData>({ ...defaultDb.settings, ...db.settings });
  const [pinText, setPinText] = React.useState('');
  const [serviceText, setServiceText] = React.useState(numberToText(db.settings.servicePercent));
  const [taxText, setTaxText] = React.useState(numberToText(db.settings.taxPercent));

  const saveSettings = () => {
    if (pinText && pinText.length < 4) { alert('PIN minimal 4 digit.'); return; }
    const fixedSettings: SettingsData = { ...s, servicePercent: parsePercent(serviceText), taxPercent: parsePercent(taxText) };
    patchDb(d => ({ ...d, settings: fixedSettings, operator: { ...d.operator, name: fixedSettings.operatorName, pin: pinText ? pinText : d.operator.pin } }));
    setS(fixedSettings); setPinText('');
    alert('Pengaturan berhasil disimpan.');
  };

  return (
    <section className="page-full card settings-page">
      <div className="page-title">
        <div><h2>Pengaturan Cafe</h2><p>Atur data cafe, nama operator, PIN, struk, pajak, service, dan printer.</p></div>
      </div>
      <div className="settings-grid">
        {[
          ['Nama Cafe', 'storeName', 'Galaksi Aromatica', 'Nama cafe yang tampil di aplikasi dan struk.'],
          ['Tagline Cafe', 'subtitle', 'Coffee & Eatery', 'Teks kecil di bawah nama cafe.'],
          ['Nama Operator / Kasir', 'operatorName', 'Lutfi Ibnu Maulana', 'Nama ini tampil di header aplikasi dan di struk.'],
          ['Nomor Telepon', 'phone', '(021) 1234-5678', 'Nomor telepon yang tampil di struk.'],
          ['Footer Struk', 'footer', 'Terima kasih atas kunjungan Anda', 'Kalimat penutup di bagian bawah struk.'],
        ].map(([label, key, placeholder, hint]) => (
          <div className="field" key={key}>
            <label>{label}</label>
            <input value={(s as any)[key]} onChange={e => setS({ ...s, [key]: e.target.value })} placeholder={placeholder} />
            <small>{hint}</small>
          </div>
        ))}

        <div className="field">
          <label>Ganti PIN Login</label>
          <input type="password" inputMode="numeric" value={pinText} onChange={e => setPinText(e.target.value.replace(/\D/g, ''))} placeholder="Kosongkan kalau tidak diganti" />
          <small>PIN disimpan lokal di browser.</small>
        </div>

        <div className="field">
          <label>Alamat Cafe</label>
          <textarea value={s.address} onChange={e => setS({ ...s, address: e.target.value })} placeholder="Jl. Bintang Terang No. 18, Jakarta" />
          <small>Alamat yang tampil di struk.</small>
        </div>

        <div className="field">
          <label>Ukuran Kertas Struk</label>
          <select value={s.receiptSize} onChange={e => setS({ ...s, receiptSize: e.target.value as '58mm' | '80mm' })}>
            <option>80mm</option><option>58mm</option>
          </select>
          <small>Pilih ukuran printer thermal yang dipakai.</small>
        </div>

        <div className="field">
          <label>Service Charge (%)</label>
          <input type="text" inputMode="decimal" value={serviceText} onChange={e => setServiceText(cleanPercentText(e.target.value))} placeholder="Contoh: 5 atau 2,5" />
          <small>Isi kosong kalau tidak dipakai.</small>
        </div>

        <div className="field">
          <label>Pajak (%)</label>
          <input type="text" inputMode="decimal" value={taxText} onChange={e => setTaxText(cleanPercentText(e.target.value))} placeholder="Contoh: 10 atau 2,5" />
          <small>Pajak bisa pakai koma. Contoh: 2,5 berarti 2,5%.</small>
        </div>
      </div>

      <div style={{ marginTop: 26, width: '100%' }}>
        <button type="button" onClick={saveSettings}
          style={{ width:'100%', minHeight:64, padding:'16px 24px', borderRadius:18, border:'none',
            background:'linear-gradient(135deg, #8b4a1f, #5a2b12)', color:'#fff7ea', fontSize:18,
            fontWeight:900, cursor:'pointer', boxShadow:'0 14px 32px rgba(90,43,18,.22)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
          Simpan Perubahan
        </button>
      </div>
    </section>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-page">
      <Coffee />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

// ─── RECEIPT ──────────────────────────────────────────────────────────────────

function Receipt({ trx, settings }: { trx: Transaction | null; settings: SettingsData }) {
  if (!trx) return null;
  return (
    <div className={`receipt receipt-${settings.receiptSize.replace('mm', '')}`}>
      <div className="receipt-brand">
        <Logo compact />
        <h3>{settings.storeName}</h3>
        <p>{settings.subtitle}</p>
        <small>by lutfiibnm</small>
      </div>
      <p>{settings.address}<br />{settings.phone}</p>
      <hr />
      <h3>INVOICE PELANGGAN</h3>
      <b>{trx.invoice}</b>
      <div className="rrow"><span>Tipe Pesanan</span><b>{trx.orderType}</b></div>
      {trx.tableNumber    && <div className="rrow"><span>No. Meja</span><b>{trx.tableNumber}</b></div>}
      {trx.customerName   && <div className="rrow"><span>Pelanggan</span><b>{trx.customerName}</b></div>}
      <div className="rrow"><span>Operator</span><b>{trx.operator}</b></div>
      <div className="rrow"><span>Tanggal</span><b>{fmt(trx.createdAt)}</b></div>
      <hr />
      {trx.items.map(i => (
        <div className="ritem" key={i.cartId}>
          <span>{i.name}{i.note && <small>Catatan: {i.note}</small>}</span>
          <b>{i.qty} x {money(i.price)}</b>
          <strong>{money(i.price * i.qty)}</strong>
        </div>
      ))}
      <hr />
      <div className="rrow"><span>Subtotal</span><b>{money(trx.subtotal)}</b></div>
      <div className="rrow"><span>Service</span><b>{money(trx.service)}</b></div>
      <div className="rrow"><span>Pajak</span><b>{money(trx.tax)}</b></div>
      <div className="rgrand"><span>TOTAL</span><b>{money(trx.total)}</b></div>
      {trx.amountPaid !== undefined && <div className="rrow"><span>Bayar</span><b>{money(trx.amountPaid)}</b></div>}
      {trx.change    !== undefined && <div className="rrow"><span>Kembalian</span><b>{money(trx.change)}</b></div>}
      <div className="rrow"><span>Metode Pembayaran</span><b>{trx.method.toUpperCase()}</b></div>
      <div className="rrow"><span>Status Pembayaran</span><b className="paid">LUNAS</b></div>
      <hr />
      <p><b>{settings.footer}</b></p>
      <small>by lutfiibnm</small>
    </div>
  );
}

function KitchenReceipt({ trx, settings }: { trx: Transaction | null; settings: SettingsData }) {
  if (!trx) return null;
  return (
    <div className={`receipt kitchen-receipt receipt-${settings.receiptSize.replace('mm', '')}`}
      style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
      <div className="receipt-brand">
        <Logo compact />
        <h3>CATATAN BARISTA / KOKI</h3>
        <p>{settings.storeName}</p>
        <small>Order untuk bar / dapur</small>
      </div>
      <hr />
      <div className="rrow"><span>Invoice</span><b>{trx.invoice}</b></div>
      <div className="rrow"><span>Tipe Pesanan</span><b>{trx.orderType}</b></div>
      {trx.tableNumber  && <div className="rrow"><span>No. Meja</span><b>{trx.tableNumber}</b></div>}
      {trx.customerName && <div className="rrow"><span>Pelanggan</span><b>{trx.customerName}</b></div>}
      <div className="rrow"><span>Operator</span><b>{trx.operator}</b></div>
      <div className="rrow"><span>Waktu</span><b>{fmt(trx.createdAt)}</b></div>
      <hr />
      <h3>DAFTAR PESANAN</h3>
      {trx.items.map(i => (
        <div className="kitchen-item" key={i.cartId}
          style={{ textAlign: 'left', borderBottom: '1px dashed #111', padding: '8px 0' }}>
          <b>{i.qty}x {i.name}</b>
          {i.note && <small>Catatan: {i.note}</small>}
        </div>
      ))}
      <hr />
      <p><b>Mohon proses sesuai urutan pesanan.</b></p>
      <small>Dicetak otomatis dari Galaksi Aromatica</small>
    </div>
  );
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/kasirr/sw.js').catch(() => {});
  });
}
