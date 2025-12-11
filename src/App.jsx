// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';

import {
  Download,
  Plus,
  Trash2,
  FileText,
  Settings,
  Crown,
  Hash,
  User,
  Briefcase,
  Mail,
  LogOut,
  LogIn,
} from 'lucide-react';

import { auth, googleProvider, db } from './firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
} from 'firebase/auth';

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';

// ========================
// ÜST SEVİYE APP (AUTH + BILLCRAFT)
// ========================
export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Kullanıcıyı dinle
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // başarılı olunca onAuthStateChanged zaten user'ı set ediyor
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="animate-pulse text-sm">BillCraft yükleniyor...</div>
      </div>
    );
  }

  // Kullanıcı yoksa: Auth ekranı
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BillCraft</h1>
              <p className="text-xs text-slate-400">
                Basit ve hızlı fatura oluşturma aracı
              </p>
            </div>
          </div>

          <div className="flex mb-6 border border-slate-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 text-sm font-medium ${
                mode === 'signin'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-950 text-slate-500'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-medium ${
                mode === 'signup'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-950 text-slate-500'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">E-posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="ornek@mail.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Şifre</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="En az 6 karakter"
              />
            </div>

            {authError && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-700/40 rounded-lg px-3 py-2">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 mt-2"
            >
              <LogIn size={16} />
              {mode === 'signin' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>

            {/* Google ile giriş */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white/5 hover:bg-white/10 text-slate-100 font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-700 mt-3"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Google ile devam et
            </button>

            <p className="text-[10px] text-slate-500 text-center mt-3">
              Devam ederek kullanım şartlarını kabul etmiş olursun.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Kullanıcı varsa: BillCraft ana uygulama
  return (
    <div className="relative">
      {/* Üst user bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="text-xs text-slate-300">
          Giriş yapan:{' '}
          <span className="font-medium text-white">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
        >
          <LogOut size={14} /> Çıkış yap
        </button>
      </div>

      {/* Üst bar boşluğu */}
      <div className="pt-10">
        <BillCraftApp user={user} />
      </div>
    </div>
  );
}

// ========================
// BILLCRAFT ANA ARAYÜZ
// ========================
function BillCraftApp({ user }) {
  // Fatura Verileri State'i
  const [invoice, setInvoice] = useState({
    number: 'INV-2024-001',
    date: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    sender: { name: '', email: '', address: '' },
    client: { name: '', email: '', address: '' },
    currency: '₺',
    taxRate: 20,
    note: 'Ödeme 7 iş günü içinde yapılmalıdır. Teşekkürler!',
  });

  const [items, setItems] = useState([
    { id: 1, description: 'Web Tasarım Hizmeti', quantity: 1, price: 5000 },
    { id: 2, description: 'Logo Tasarımı', quantity: 1, price: 1500 },
  ]);

  const [showProModal, setShowProModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const invoiceRef = useRef(null);

  const [savedInvoices, setSavedInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  // Hesaplamalar
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount;

  // Firestore'dan faturaları dinle
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'invoices'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedInvoices(list);
        setInvoicesLoading(false);
      },
      (error) => {
        console.error('Faturalar çekilirken hata:', error);
        setInvoicesLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const handleSaveInvoice = async () => {
    if (!user) return;

    try {
      if (selectedInvoiceId) {
        // Var olan faturayı güncelle
        const ref = doc(db, 'invoices', selectedInvoiceId);
        await updateDoc(ref, {
          invoice,
          items,
          subtotal,
          taxAmount,
          total,
        });
        alert('Fatura güncellendi ✅');
      } else {
        // Yeni fatura oluştur
        const docRef = await addDoc(collection(db, 'invoices'), {
          userId: user.uid,
          invoice,
          items,
          subtotal,
          taxAmount,
          total,
          createdAt: serverTimestamp(),
        });
        setSelectedInvoiceId(docRef.id); // yeni oluşturulanı seçili yap
        alert('Fatura kaydedildi ✅');
      }
    } catch (err) {
      console.error('Fatura kaydedilirken hata:', err);
      alert('Fatura kaydedilemedi ❌');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!user) return;
    const confirmDelete = window.confirm(
      'Bu faturayı silmek istediğine emin misin?'
    );
    if (!confirmDelete) return;

    try {
      const ref = doc(db, 'invoices', id);
      await deleteDoc(ref);

      // Eğer şu an silinen fatura seçiliyse, formu sıfırla
      if (selectedInvoiceId === id) {
        setSelectedInvoiceId(null);
        setInvoice({
          number: 'INV-2024-001',
          date: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          sender: { name: '', email: '', address: '' },
          client: { name: '', email: '', address: '' },
          currency: '₺',
          taxRate: 20,
          note: 'Ödeme 7 iş günü içinde yapılmalıdır. Teşekkürler!',
        });
        setItems([
          {
            id: 1,
            description: 'Web Tasarım Hizmeti',
            quantity: 1,
            price: 5000,
          },
          {
            id: 2,
            description: 'Logo Tasarımı',
            quantity: 1,
            price: 1500,
          },
        ]);
      }
    } catch (err) {
      console.error('Fatura silinirken hata:', err);
      alert('Fatura silinemedi ❌');
    }
  };

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;

    const element = invoiceRef.current;

    const opt = {
      margin: 0,
      filename: `${invoice.number || 'fatura'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
  };

  const loadInvoiceFromDb = (docData) => {
    if (!docData) return;

    setInvoice(docData.invoice);
    setItems(docData.items || []);
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), description: '', quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Para formatı
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace('₺', invoice.currency);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col md:flex-row">
      {/* SOL PANEL: EDİTÖR */}
      <div className="w-full md:w-1/3 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FileText size={24} />
            </div>
            <h1 className="text-xl font-bold">BillCraft</h1>
          </div>

          {/* Sağ aksiyonlar */}
          <div className="flex items-center gap-4">
            {/* Yeni + Kaydet grubu (desktop) */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-50 rounded-full px-2 py-1 shadow-sm">
              <button
                onClick={() => {
                  setInvoice({
                    number: 'INV-2024-001',
                    date: new Date().toISOString().slice(0, 10),
                    dueDate: new Date(
                      Date.now() + 7 * 24 * 60 * 60 * 1000
                    )
                      .toISOString()
                      .slice(0, 10),
                    sender: { name: '', email: '', address: '' },
                    client: { name: '', email: '', address: '' },
                    currency: '₺',
                    taxRate: 20,
                    note: 'Ödeme 7 iş günü içinde yapılmalıdır. Teşekkürler!',
                  });
                  setItems([
                    {
                      id: 1,
                      description: 'Web Tasarım Hizmeti',
                      quantity: 1,
                      price: 5000,
                    },
                    {
                      id: 2,
                      description: 'Logo Tasarımı',
                      quantity: 1,
                      price: 1500,
                    },
                  ]);
                  setSelectedInvoiceId(null);
                }}
                className="text-[11px] font-semibold px-3 py-1 rounded-full text-slate-600 hover:bg-white transition-colors"
              >
                Yeni Fatura
              </button>

              <button
                onClick={handleSaveInvoice}
                className="text-[11px] font-semibold px-3 py-1 rounded-full text-emerald-700 bg-emerald-100 hover:bg-emerald-200 flex items-center gap-1 transition-colors"
              >
                <Download size={12} /> Kaydet
              </button>
            </div>

            {/* İndir PDF (her zaman görünür) */}
            <button
              onClick={handleDownloadPDF}
              className="text-xs sm:text-sm font-semibold bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} /> İndir PDF
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* Faturalarım */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faturalarım
            </h3>

            {invoicesLoading && (
              <p className="text-[11px] text-slate-400">Yükleniyor...</p>
            )}

            {!invoicesLoading && savedInvoices.length === 0 && (
              <p className="text-[11px] text-slate-400">
                Henüz kayıtlı fatura yok.
              </p>
            )}

            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {savedInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      loadInvoiceFromDb(inv);
                      setSelectedInvoiceId(inv.id);
                    }}
                    className="flex-1 text-left text-[11px] px-2 py-1 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-700">
                      {inv.invoice?.number || '(Numarasız)'}
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>{inv.invoice?.date}</span>
                      <span>
                        {inv.total?.toLocaleString('tr-TR')}{' '}
                        {inv.invoice?.currency}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDeleteInvoice(inv.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Fatura Detayları */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Fatura Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">
                  Fatura No
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-2">
                  <Hash size={14} className="text-slate-400" />
                  <input
                    type="text"
                    value={invoice.number}
                    onChange={(e) =>
                      setInvoice({ ...invoice, number: e.target.value })
                    }
                    className="bg-transparent w-full outline-none text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">
                  Para Birimi
                </label>
                <select
                  className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none"
                  value={invoice.currency}
                  onChange={(e) =>
                    setInvoice({ ...invoice, currency: e.target.value })
                  }
                >
                  <option value="₺">₺ (TL)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">
                  Tarih
                </label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) =>
                    setInvoice({ ...invoice, date: e.target.value })
                  }
                  className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">
                  Son Ödeme
                </label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) =>
                    setInvoice({ ...invoice, dueDate: e.target.value })
                  }
                  className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          </section>

          {/* Gönderen & Alıcı */}
          <section className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={14} /> Gönderen (Sen)
              </h3>
              <input
                placeholder="Şirket / Adın Soyadın"
                className="w-full border-b border-slate-200 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                value={invoice.sender.name}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    sender: { ...invoice.sender, name: e.target.value },
                  })
                }
              />
              <input
                placeholder="E-posta Adresi"
                className="w-full border-b border-slate-200 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                value={invoice.sender.email}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    sender: { ...invoice.sender, email: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> Müşteri
              </h3>
              <input
                placeholder="Müşteri Adı / Şirketi"
                className="w-full border-b border-slate-200 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                value={invoice.client.name}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    client: { ...invoice.client, name: e.target.value },
                  })
                }
              />
              <input
                placeholder="Müşteri E-postası"
                className="w-full border-b border-slate-200 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                value={invoice.client.email}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    client: { ...invoice.client, email: e.target.value },
                  })
                }
              />
            </div>
          </section>

          {/* Hizmetler */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Hizmet Kalemleri
            </h3>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 p-3 rounded-lg border border-slate-200 group relative"
                >
                  <input
                    placeholder="Hizmet açıklaması"
                    className="w-full bg-transparent font-medium text-sm outline-none mb-2"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(item.id, 'description', e.target.value)
                    }
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">
                        Adet
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-white border rounded px-2 py-1 text-sm outline-none"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'quantity',
                            parseFloat(e.target.value || '0')
                          )
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">
                        Birim Fiyat
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-white border rounded px-2 py-1 text-sm outline-none"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'price',
                            parseFloat(e.target.value || '0')
                          )
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-2 -right-2 bg-rose-100 text-rose-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-200"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={addItem}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-sm font-medium hover:border-indigo-500 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Yeni Kalem Ekle
              </button>
            </div>
          </section>

          {/* Dipnotlar & Vergi */}
          <section className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500">
                KDV Oranı (%)
              </label>
              <input
                type="number"
                className="w-20 ml-2 bg-slate-50 border rounded-lg px-2 py-1 text-sm outline-none"
                value={invoice.taxRate}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    taxRate: parseFloat(e.target.value || '0'),
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">
                Notlar / Banka Bilgileri
              </label>
              <textarea
                className="w-full bg-slate-50 border rounded-lg p-3 text-sm outline-none h-24 resize-none"
                value={invoice.note}
                onChange={(e) =>
                  setInvoice({ ...invoice, note: e.target.value })
                }
              ></textarea>
            </div>
          </section>
        </div>
      </div>

      {/* SAĞ PANEL: ÖNİZLEME */}
      <div className="w-full md:w-2/3 bg-slate-200 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Arka Plan Deseni */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#4f46e5 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        {/* A4 KAĞIT */}
        <div className="transition-all scale-75 md:scale-90 lg:scale-100 origin-top">
          <div
            ref={invoiceRef}
            className="bg-white w-full max-w-[210mm] shadow-2xl rounded-sm p-12 text-slate-800 relative"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-slate-300">
                  <span className="text-xs text-slate-400 font-medium text-center px-1">
                    Logo Yükle
                  </span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  FATURA
                </h1>
                <p className="text-slate-400 font-medium mt-1">
                  #{invoice.number}
                </p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-lg mb-1">
                  {invoice.sender.name || 'Şirket Adınız'}
                </h3>
                <p className="text-sm text-slate-500 max-w-[200px] ml-auto">
                  {invoice.sender.email}
                </p>
                <p className="text-sm text-slate-500 mt-4 font-medium">
                  Tarih: {invoice.date}
                </p>
                <p className="text-sm text-slate-500">
                  Son Ödeme: {invoice.dueDate}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-12">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Sayın:
              </h4>
              <h2 className="text-xl font-bold text-slate-800">
                {invoice.client.name || 'Müşteri Adı'}
              </h2>
              <p className="text-slate-500 text-sm">{invoice.client.email}</p>
            </div>

          {/* Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">
                  Açıklama
                </th>
                <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Toplam
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 text-sm font-medium">
                    {item.description || 'Hizmet açıklaması giriniz...'}
                  </td>
                  <td className="py-4 text-sm text-right text-slate-500">
                    {item.quantity}
                  </td>
                  <td className="py-4 text-sm text-right text-slate-500">
                    {formatMoney(item.price)}
                  </td>
                  <td className="py-4 text-sm text-right font-bold text-slate-700">
                    {formatMoney(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

<div style={{ pageBreakInside: 'avoid' }}>
          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-1/2 space-y-3">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Ara Toplam</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>KDV (%{invoice.taxRate})</span>
                <span>{formatMoney(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-indigo-600 border-t border-slate-200 pt-3">
                <span>GENEL TOPLAM</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600">
            <span className="font-bold text-slate-800">Not:</span>{' '}
            {invoice.note}
          </div>
          </div>
          

          {/* Branding Watermark */}
          <div className="absolute bottom-8 left-0 w-full text-center opacity-30 pointer-events-none">
            <p className="text-xs font-bold flex items-center justify-center gap-1">
              <Settings size={12} /> BillCraft ile oluşturuldu
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* PRO MODAL */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <span className="text-2xl">&times;</span>
            </button>

            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100 rounded-full blur-3xl"></div>

            <div className="text-center mb-6 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 text-white">
                <Crown size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                BillCraft PRO
              </h2>
              <p className="text-slate-500 mt-2">
                Markanızın değerini artırın.
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <div className="bg-green-100 p-1 rounded text-green-600">
                  <Settings size={14} />
                </div>
                "BillCraft ile oluşturuldu" yazısını kaldır
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <div className="bg-indigo-100 p-1 rounded text-indigo-600">
                  <FileText size={14} />
                </div>
                Sınırsız Şablon &amp; Renk Seçeneği
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <div className="bg-purple-100 p-1 rounded text-purple-600">
                  <Mail size={14} />
                </div>
                Tek tıkla müşteriye e-posta gönder
              </li>
            </ul>

            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Ömür Boyu Lisans Al (₺149)
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
              Tek seferlik ödeme. Abonelik yok.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
