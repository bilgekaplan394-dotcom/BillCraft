import React, { useState, useRef } from 'react';
import { Download, Plus, Trash2, FileText, Settings, Crown, Printer, Send, Hash, Calendar, User, Briefcase, Mail } from 'lucide-react';

export default function BillCraftApp() {
  // Fatura Verileri State'i
  const [invoice, setInvoice] = useState({
    number: 'INV-2024-001',
    date: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    sender: { name: '', email: '', address: '' },
    client: { name: '', email: '', address: '' },
    currency: '₺',
    taxRate: 20,
    note: 'Ödeme 7 iş günü içinde yapılmalıdır. Teşekkürler!'
  });

  const [items, setItems] = useState([
    { id: 1, description: 'Web Tasarım Hizmeti', quantity: 1, price: 5000 },
    { id: 2, description: 'Logo Tasarımı', quantity: 1, price: 1500 },
  ]);

  const [showProModal, setShowProModal] = useState(false);

  // Hesaplamalar
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Para formatı
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: 2 
    }).format(amount).replace('₺', invoice.currency);
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
          <button 
            onClick={() => setShowProModal(true)}
            className="text-xs font-bold bg-amber-100 text-amber-600 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-amber-200 transition-colors"
          >
            <Crown size={12} /> PRO
          </button>
        </div>

        <div className="p-6 space-y-8 flex-1">
          
          {/* Fatura Detayları */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Fatura Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Fatura No</label>
                <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-2">
                  <Hash size={14} className="text-slate-400" />
                  <input 
                    type="text" 
                    value={invoice.number} 
                    onChange={e => setInvoice({...invoice, number: e.target.value})}
                    className="bg-transparent w-full outline-none text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Para Birimi</label>
                <select 
                  className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none"
                  value={invoice.currency}
                  onChange={e => setInvoice({...invoice, currency: e.target.value})}
                >
                  <option value="₺">₺ (TL)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Tarih</label>
                <input 
                  type="date" 
                  value={invoice.date} 
                  onChange={e => setInvoice({...invoice, date: e.target.value})}
                  className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Son Ödeme</label>
                <input 
                  type="date" 
                  value={invoice.dueDate} 
                  onChange={e => setInvoice({...invoice, dueDate: e.target.value})}
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
                onChange={e => setInvoice({...invoice, sender: {...invoice.sender, name: e.target.value}})}
              />
               <input 
                placeholder="E-posta Adresi" 
                className="w-full border-b border-slate-200 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                value={invoice.sender.email}
                onChange={e => setInvoice({...invoice, sender: {...invoice.sender, email: e.target.value}})}
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
                onChange={e => setInvoice({...invoice, client: {...invoice.client, name: e.target.value}})}
              />
              <input 
                placeholder="Müşteri E-postası" 
                className="w-full border-b border-slate-200 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                value={invoice.client.email}
                onChange={e => setInvoice({...invoice, client: {...invoice.client, email: e.target.value}})}
              />
            </div>
          </section>

          {/* Hizmetler */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Hizmet Kalemleri</h3>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 group relative">
                  <input 
                    placeholder="Hizmet açıklaması" 
                    className="w-full bg-transparent font-medium text-sm outline-none mb-2"
                    value={item.description}
                    onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Adet</label>
                      <input 
                        type="number" 
                        min="1"
                        className="w-full bg-white border rounded px-2 py-1 text-sm outline-none"
                        value={item.quantity}
                        onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Birim Fiyat</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-white border rounded px-2 py-1 text-sm outline-none"
                        value={item.price}
                        onChange={e => handleItemChange(item.id, 'price', parseFloat(e.target.value))}
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
               <label className="text-xs font-medium text-slate-500">KDV Oranı (%)</label>
               <input 
                 type="number" 
                 className="w-20 ml-2 bg-slate-50 border rounded-lg px-2 py-1 text-sm outline-none"
                 value={invoice.taxRate}
                 onChange={e => setInvoice({...invoice, taxRate: parseFloat(e.target.value)})}
               />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Notlar / Banka Bilgileri</label>
              <textarea 
                className="w-full bg-slate-50 border rounded-lg p-3 text-sm outline-none h-24 resize-none"
                value={invoice.note}
                onChange={e => setInvoice({...invoice, note: e.target.value})}
              ></textarea>
            </div>
          </section>

        </div>
      </div>

      {/* SAĞ PANEL: ÖNİZLEME */}
      <div className="w-full md:w-2/3 bg-slate-200 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Arka Plan Deseni */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        {/* Toolbar */}
        <div className="absolute top-6 right-8 flex gap-3">
          <button className="bg-white p-2.5 rounded-full shadow-lg text-slate-600 hover:text-indigo-600 transition-colors" title="Yazdır">
            <Printer size={20} />
          </button>
          <button onClick={() => setShowProModal(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2">
            <Download size={18} /> İndir PDF
          </button>
        </div>

        {/* A4 KAĞIT */}
        <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl rounded-sm p-12 text-slate-800 relative transition-all scale-75 md:scale-90 lg:scale-100 origin-top">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-slate-300">
                <span className="text-xs text-slate-400 font-medium text-center px-1">Logo Yükle</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">FATURA</h1>
              <p className="text-slate-400 font-medium mt-1">#{invoice.number}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-lg mb-1">{invoice.sender.name || 'Şirket Adınız'}</h3>
              <p className="text-sm text-slate-500 max-w-[200px] ml-auto">{invoice.sender.email}</p>
              <p className="text-sm text-slate-500 mt-4 font-medium">Tarih: {invoice.date}</p>
              <p className="text-sm text-slate-500">Son Ödeme: {invoice.dueDate}</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-12">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sayın:</h4>
            <h2 className="text-xl font-bold text-slate-800">{invoice.client.name || 'Müşteri Adı'}</h2>
            <p className="text-slate-500 text-sm">{invoice.client.email}</p>
          </div>

          {/* Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">Açıklama</th>
                <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Miktar</th>
                <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Fiyat</th>
                <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 text-sm font-medium">{item.description || 'Hizmet açıklaması giriniz...'}</td>
                  <td className="py-4 text-sm text-right text-slate-500">{item.quantity}</td>
                  <td className="py-4 text-sm text-right text-slate-500">{formatMoney(item.price)}</td>
                  <td className="py-4 text-sm text-right font-bold text-slate-700">{formatMoney(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

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
            <span className="font-bold text-slate-800">Not:</span> {invoice.note}
          </div>

          {/* Branding Watermark */}
          <div className="absolute bottom-8 left-0 w-full text-center opacity-30 pointer-events-none">
            <p className="text-xs font-bold flex items-center justify-center gap-1">
              <Settings size={12} /> BillCraft ile oluşturuldu
            </p>
          </div>

        </div>
      </div>

      {/* PRO MODAL */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowProModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
               <span className="text-2xl">&times;</span>
            </button>
            
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100 rounded-full blur-3xl"></div>
            
            <div className="text-center mb-6 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 text-white">
                <Crown size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">BillCraft PRO</h2>
              <p className="text-slate-500 mt-2">Markanızın değerini artırın.</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <div className="bg-green-100 p-1 rounded text-green-600"><Settings size={14} /></div>
                "BillCraft ile oluşturuldu" yazısını kaldır
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <div className="bg-indigo-100 p-1 rounded text-indigo-600"><FileText size={14} /></div>
                Sınırsız Şablon & Renk Seçeneği
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <div className="bg-purple-100 p-1 rounded text-purple-600"><Mail size={14} /></div>
                Tek tıkla müşteriye e-posta gönder
              </li>
            </ul>

            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Ömür Boyu Lisans Al (₺149)
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">Tek seferlik ödeme. Abonelik yok.</p>
          </div>
        </div>
      )}

    </div>
  );
}