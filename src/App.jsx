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
  getDoc,
  setDoc,
} from 'firebase/firestore';

const translations = {
  en: {
    myInvoices: 'My invoices',
    noInvoiceYet: 'No invoice saved yet.',
    invoiceDetails: 'Invoice details',
    invoiceNo: 'Invoice no',
    currency: 'Currency',
    date: 'Date',
    dueDate: 'Due date',
    senderYou: 'Sender (you)',
    client: 'Client',
    lineItems: 'Line items',
    vatRate: 'VAT rate (%)',
    notesBank: 'Notes / Bank details',
    saveToClients: 'Save to clients',
    clickClientBelow: 'Click a client below to fill',
    loadingClients: 'Loading clients...',
    noClientsYet: 'No saved clients yet. Save one above.',
    loadingInvoices: 'Loading...',
    serviceDescriptionPlaceholder: 'Service description',
    serviceDescriptionPreview: 'Enter service description...',
    subtotal: 'Subtotal',
    total: 'TOTAL',
    billTo: 'Bill to:',
    noteLabel: 'Note:',
    // NEW:
    newInvoiceBtn: 'New invoice',
    saveBtn: 'Save',
    downloadPdfBtn: 'Download PDF',
    invoiceTitle: 'INVOICE',
    description: 'Description',
    quantity: 'Quantity',
    price: 'Price',
    unitPrice: 'Unit price',
    vatShort: 'VAT',
    addNewLine: 'Add new line',
    clientNamePlaceholder: 'Client name',
    createdWithBillcraft: 'Created with BillCraft',
    saveCompanyInfo: 'Save as default company info',
        clientNameCompanyPlaceholder: 'Client name / Company',
    clientEmailPlaceholder: 'Client email',
    defaultNote: 'Payment must be made within 7 business days. Thank you!',

  },
  tr: {
    myInvoices: 'Faturalarım',
    noInvoiceYet: 'Henüz kayıtlı fatura yok.',
    invoiceDetails: 'Fatura detayları',
    invoiceNo: 'Fatura no',
    currency: 'Para birimi',
    date: 'Tarih',
    dueDate: 'Vade tarihi',
    senderYou: 'Gönderen (siz)',
    client: 'Müşteri',
    lineItems: 'Kalemler',
    vatRate: 'KDV oranı (%)',
    notesBank: 'Notlar / Banka bilgileri',
    saveToClients: 'Müşterilere kaydet',
    clickClientBelow: 'Aşağıdan bir müşteri seçin',
    loadingClients: 'Müşteriler yükleniyor...',
    noClientsYet: 'Henüz kayıtlı müşteri yok. Yukarıdan ekleyin.',
    loadingInvoices: 'Yükleniyor...',
    serviceDescriptionPlaceholder: 'Hizmet açıklaması',
    serviceDescriptionPreview: 'Hizmet açıklaması girin...',
    subtotal: 'Ara toplam',
    total: 'TOPLAM',
    billTo: 'Fatura edilen:',
    noteLabel: 'Not:',
    // NEW:
    newInvoiceBtn: 'Yeni fatura',
    saveBtn: 'Kaydet',
    downloadPdfBtn: 'PDF indir',
    invoiceTitle: 'FATURA',
    description: 'Açıklama',
    quantity: 'Adet',
    price: 'Fiyat',
    unitPrice: 'Birim fiyat',
    vatShort: 'KDV',
    addNewLine: 'Yeni satır ekle',
    clientNamePlaceholder: 'Müşteri adı',
    createdWithBillcraft: 'BillCraft ile oluşturuldu',
    saveCompanyInfo: 'Varsayılan şirket bilgisi olarak kaydet',
        clientNameCompanyPlaceholder: 'Müşteri adı / Şirket',
    clientEmailPlaceholder: 'Müşteri e-posta',
    defaultNote: 'Ödeme 7 iş günü içinde yapılmalıdır. Teşekkürler!',

  },
  hu: {
  myInvoices: 'Számláim',
  noInvoiceYet: 'Nincs még elmentett számla.',
  invoiceDetails: 'Számla adatai',
  invoiceNo: 'Számlaszám',
  currency: 'Pénznem',
  date: 'Dátum',
  dueDate: 'Fizetési határidő',
  senderYou: 'Kibocsátó (Ön)',
  client: 'Ügyfél',
  lineItems: 'Tételek',
  vatRate: 'ÁFA (%)',
  notesBank: 'Megjegyzések / Banki adatok',
  saveToClients: 'Mentés ügyfelekhez',
  clickClientBelow: 'Válasszon ügyfelet alul',
  loadingClients: 'Ügyfelek betöltése...',
  noClientsYet: 'Még nincs mentett ügyfél.',
  loadingInvoices: 'Betöltés...',
  serviceDescriptionPlaceholder: 'Szolgáltatás leírása',
  serviceDescriptionPreview: 'Írja be a szolgáltatás leírását...',
  subtotal: 'Részösszeg',
  total: 'ÖSSZESEN',
  billTo: 'Számlázva:',
  noteLabel: 'Megjegyzés:',
  
  newInvoiceBtn: 'Új számla',
  saveBtn: 'Mentés',
  downloadPdfBtn: 'PDF letöltése',
  invoiceTitle: 'SZÁMLA',
  description: 'Leírás',
  quantity: 'Mennyiség',
  price: 'Ár',
  unitPrice: 'Egységár',
  vatShort: 'ÁFA',
  addNewLine: 'Új tétel hozzáadása',
  clientNamePlaceholder: 'Ügyfél neve',
  createdWithBillcraft: 'Készült a BillCraft segítségével',
  saveCompanyInfo: 'Mentés alapértelmezett cégadatként',

  clientNameCompanyPlaceholder: 'Ügyfél neve / Cég',
  clientEmailPlaceholder: 'Ügyfél email',
  defaultNote: 'A fizetésnek 7 munkanapon belül kell megtörténnie. Köszönjük!',
},
fr: {
  myInvoices: 'Mes factures',
  noInvoiceYet: 'Aucune facture enregistrée.',
  invoiceDetails: 'Détails de la facture',
  invoiceNo: 'N° facture',
  currency: 'Devise',
  date: 'Date',
  dueDate: 'Date d’échéance',
  senderYou: 'Émetteur (vous)',
  client: 'Client',
  lineItems: 'Éléments',
  vatRate: 'TVA (%)',
  notesBank: 'Notes / Coordonnées bancaires',
  saveToClients: 'Enregistrer dans les clients',
  clickClientBelow: 'Cliquez sur un client ci-dessous',
  loadingClients: 'Chargement des clients...',
  noClientsYet: 'Aucun client enregistré.',
  loadingInvoices: 'Chargement...',
  serviceDescriptionPlaceholder: 'Description du service',
  serviceDescriptionPreview: 'Saisissez la description du service...',
  subtotal: 'Sous-total',
  total: 'TOTAL',
  billTo: 'Facturé à :',
  noteLabel: 'Note :',
  
  newInvoiceBtn: 'Nouvelle facture',
  saveBtn: 'Enregistrer',
  downloadPdfBtn: 'Télécharger PDF',
  invoiceTitle: 'FACTURE',
  description: 'Description',
  quantity: 'Quantité',
  price: 'Prix',
  unitPrice: 'Prix unitaire',
  vatShort: 'TVA',
  addNewLine: 'Ajouter une ligne',
  clientNamePlaceholder: 'Nom du client',
  createdWithBillcraft: 'Créé avec BillCraft',
  saveCompanyInfo: 'Enregistrer comme infos par défaut',

  clientNameCompanyPlaceholder: 'Nom du client / Société',
  clientEmailPlaceholder: 'Email du client',
  defaultNote: 'Le paiement doit être effectué dans les 7 jours ouvrables. Merci!',
},
it: {
  myInvoices: 'Le mie fatture',
  noInvoiceYet: 'Nessuna fattura salvata.',
  invoiceDetails: 'Dettagli fattura',
  invoiceNo: 'Numero fattura',
  currency: 'Valuta',
  date: 'Data',
  dueDate: 'Data di scadenza',
  senderYou: 'Emittente (tu)',
  client: 'Cliente',
  lineItems: 'Articoli',
  vatRate: 'IVA (%)',
  notesBank: 'Note / Dati bancari',
  saveToClients: 'Salva nei clienti',
  clickClientBelow: 'Seleziona un cliente qui sotto',
  loadingClients: 'Caricamento clienti...',
  noClientsYet: 'Nessun cliente salvato.',
  loadingInvoices: 'Caricamento...',
  serviceDescriptionPlaceholder: 'Descrizione del servizio',
  serviceDescriptionPreview: 'Inserisci la descrizione del servizio...',
  subtotal: 'Subtotale',
  total: 'TOTALE',
  billTo: 'Fatturato a:',
  noteLabel: 'Nota:',
  
  newInvoiceBtn: 'Nuova fattura',
  saveBtn: 'Salva',
  downloadPdfBtn: 'Scarica PDF',
  invoiceTitle: 'FATTURA',
  description: 'Descrizione',
  quantity: 'Quantità',
  price: 'Prezzo',
  unitPrice: 'Prezzo unitario',
  vatShort: 'IVA',
  addNewLine: 'Aggiungi una riga',
  clientNamePlaceholder: 'Nome cliente',
  createdWithBillcraft: 'Creato con BillCraft',
  saveCompanyInfo: 'Salva come info aziendali predefinite',

  clientNameCompanyPlaceholder: 'Nome cliente / Azienda',
  clientEmailPlaceholder: 'Email cliente',
  defaultNote: 'Il pagamento deve essere effettuato entro 7 giorni lavorativi. Grazie!',
},
de: {
  myInvoices: 'Meine Rechnungen',
  noInvoiceYet: 'Noch keine Rechnung gespeichert.',
  invoiceDetails: 'Rechnungsdetails',
  invoiceNo: 'Rechnungsnummer',
  currency: 'Währung',
  date: 'Datum',
  dueDate: 'Fälligkeitsdatum',
  senderYou: 'Absender (Sie)',
  client: 'Kunde',
  lineItems: 'Positionen',
  vatRate: 'MwSt (%)',
  notesBank: 'Notizen / Bankdaten',
  saveToClients: 'Zum Kunden speichern',
  clickClientBelow: 'Klicken Sie unten auf einen Kunden',
  loadingClients: 'Kunden werden geladen...',
  noClientsYet: 'Keine gespeicherten Kunden.',
  loadingInvoices: 'Wird geladen...',
  serviceDescriptionPlaceholder: 'Leistungsbeschreibung',
  serviceDescriptionPreview: 'Beschreibung eingeben...',
  subtotal: 'Zwischensumme',
  total: 'GESAMT',
  billTo: 'Rechnung an:',
  noteLabel: 'Notiz:',
  
  newInvoiceBtn: 'Neue Rechnung',
  saveBtn: 'Speichern',
  downloadPdfBtn: 'PDF herunterladen',
  invoiceTitle: 'RECHNUNG',
  description: 'Beschreibung',
  quantity: 'Menge',
  price: 'Preis',
  unitPrice: 'Stückpreis',
  vatShort: 'MwSt',
  addNewLine: 'Neue Zeile hinzufügen',
  clientNamePlaceholder: 'Kundenname',
  createdWithBillcraft: 'Erstellt mit BillCraft',
  saveCompanyInfo: 'Als Standard Firmendaten speichern',

  clientNameCompanyPlaceholder: 'Kundenname / Firma',
  clientEmailPlaceholder: 'Kunden-E-Mail',
  defaultNote: 'Die Zahlung muss innerhalb von 7 Werktagen erfolgen. Danke!',
},
es: {
  myInvoices: 'Mis facturas',
  noInvoiceYet: 'Aún no hay facturas guardadas.',
  invoiceDetails: 'Detalles de la factura',
  invoiceNo: 'Nº factura',
  currency: 'Moneda',
  date: 'Fecha',
  dueDate: 'Fecha de vencimiento',
  senderYou: 'Emisor (tú)',
  client: 'Cliente',
  lineItems: 'Conceptos',
  vatRate: 'IVA (%)',
  notesBank: 'Notas / Datos bancarios',
  saveToClients: 'Guardar en clientes',
  clickClientBelow: 'Haz clic en un cliente abajo',
  loadingClients: 'Cargando clientes...',
  noClientsYet: 'No hay clientes guardados.',
  loadingInvoices: 'Cargando...',
  serviceDescriptionPlaceholder: 'Descripción del servicio',
  serviceDescriptionPreview: 'Ingresa la descripción del servicio...',
  subtotal: 'Subtotal',
  total: 'TOTAL',
  billTo: 'Facturado a:',
  noteLabel: 'Nota:',
  
  newInvoiceBtn: 'Nueva factura',
  saveBtn: 'Guardar',
  downloadPdfBtn: 'Descargar PDF',
  invoiceTitle: 'FACTURA',
  description: 'Descripción',
  quantity: 'Cantidad',
  price: 'Precio',
  unitPrice: 'Precio unitario',
  vatShort: 'IVA',
  addNewLine: 'Agregar línea',
  clientNamePlaceholder: 'Nombre del cliente',
  createdWithBillcraft: 'Creado con BillCraft',
  saveCompanyInfo: 'Guardar como datos predeterminados',

  clientNameCompanyPlaceholder: 'Nombre del cliente / Empresa',
  clientEmailPlaceholder: 'Correo del cliente',
  defaultNote: 'El pago debe realizarse dentro de 7 días hábiles. ¡Gracias!',
},

};


// ========================
// TOP LEVEL APP (AUTH + BILLCRAFT)
// ========================
export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Listen user
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
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="animate-pulse text-sm">Loading BillCraft...</div>
      </div>
    );
  }

  // No user: Auth screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BillCraft</h1>
              <p className="text-xs text-slate-400">
                Simple & fast invoicing tool
              </p>
            </div>
          </div>

          <div className="flex mb-6 border border-slate-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 text-sm font-medium ${
                mode === 'signin'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-900 text-slate-500'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-medium ${
                mode === 'signup'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-900 text-slate-500'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="example@mail.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="At least 6 characters"
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
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>

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
              Continue with Google
            </button>

            <p className="text-[10px] text-slate-500 text-center mt-3">
              By continuing, you accept the terms of use.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // User exists: main app
  return (
    <div className="relative">
      {/* Top user bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="text-xs text-slate-300">
          Signed in as:{' '}
          <span className="font-medium text-white">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="pt-10">
        <BillCraftApp user={user} />
      </div>
    </div>
  );
}

// ========================
// BILLCRAFT MAIN UI
// ========================
function BillCraftApp({ user }) {
  const MIN_SIDEBAR_WIDTH = 260;
  const MAX_SIDEBAR_WIDTH = 600;

  // Language
  const [language, setLanguage] = useState('en');
  const t = (key) =>
    (translations[language] && translations[language][key]) ||
    translations.en[key] ||
    key;

  // Resizable sidebar, default max width
  const [sidebarWidth, setSidebarWidth] = useState(MAX_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  // Auto invoice number config
  const [invoiceNumberConfig, setInvoiceNumberConfig] = useState({
    prefix: 'INV-2024-',
    next: 1,
  });

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
    note: language === 'tr'
        ? translations.tr.defaultNote
        : translations.en.defaultNote,
    logoDataUrl: null,
  });

  const [items, setItems] = useState([
    { id: 1, description: 'Web design service', quantity: 1, price: 5000 },
    { id: 2, description: 'Logo design', quantity: 1, price: 1500 },
  ]);

  const [showProModal, setShowProModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  const invoiceRef = useRef(null);

  const [savedInvoices, setSavedInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  // Clients state
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setInvoice((prev) => ({
        ...prev,
        logoDataUrl: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Load user settings (default sender, currency, tax, logo, language, invoice number config)
  useEffect(() => {
    if (!user) return;

    const fetchUserSettings = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();

          setInvoice((prev) => ({
            ...prev,
            sender: data.sender
              ? { ...prev.sender, ...data.sender }
              : prev.sender,
            currency: data.defaultCurrency || prev.currency,
            taxRate:
              typeof data.defaultTaxRate === 'number'
                ? data.defaultTaxRate
                : prev.taxRate,
            logoDataUrl: data.logoDataUrl || prev.logoDataUrl,
          }));

          if (data.language === 'tr' || data.language === 'en') {
            setLanguage(data.language);
          }

          setInvoiceNumberConfig((prev) => ({
            prefix: data.invoicePrefix || prev.prefix,
            next:
              typeof data.nextInvoiceNumber === 'number'
                ? data.nextInvoiceNumber
                : prev.next,
          }));
        }
      } catch (err) {
        console.error('Error fetching user settings:', err);
      }
    };

    fetchUserSettings();
  }, [user]);

  // Sidebar resizing events
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = Math.min(
        MAX_SIDEBAR_WIDTH,
        Math.max(MIN_SIDEBAR_WIDTH, e.clientX)
      );
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH]);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Listen invoices from Firestore
  useEffect(() => {
    if (!user) return;

    const qInvoices = query(
      collection(db, 'invoices'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      qInvoices,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setSavedInvoices(list);
        setInvoicesLoading(false);
      },
      (error) => {
        console.error('Error fetching invoices:', error);
        setInvoicesLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // Listen clients from Firestore
  useEffect(() => {
    if (!user) return;

    const qClients = query(
      collection(db, 'clients'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      qClients,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setClients(list);
        setClientsLoading(false);
      },
      (error) => {
        console.error('Error fetching clients:', error);
        setClientsLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // Auto invoice number
  const generateAndSaveNextInvoiceNumber = async () => {
    const { prefix, next } = invoiceNumberConfig;

    const newNumber = `${prefix}${String(next).padStart(3, '0')}`;

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            invoicePrefix: prefix,
            nextInvoiceNumber: next + 1,
          },
          { merge: true }
        );
        setInvoiceNumberConfig((prev) => ({
          ...prev,
          next: next + 1,
        }));
      } catch (err) {
        console.error('Error updating invoice number counter:', err);
      }
    }

    return newNumber;
  };

  const resetInvoiceForm = async () => {
    const newNumber = await generateAndSaveNextInvoiceNumber();

    setInvoice({
      number: newNumber,
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      sender: { name: '', email: '', address: '' },
      client: { name: '', email: '', address: '' },
      currency: '₺',
      taxRate: 20,
      note: language === 'tr'
          ? translations.tr.defaultNote
          : translations.en.defaultNote,
      logoDataUrl: null,
    });
    setItems([
      {
        id: 1,
        description: 'Web design service',
        quantity: 1,
        price: 5000,
      },
      {
        id: 2,
        description: 'Logo design',
        quantity: 1,
        price: 1500,
      },
    ]);
    setSelectedInvoiceId(null);
  };

  const handleSaveInvoice = async () => {
    if (!user) return;

    try {
      let currentId = selectedInvoiceId;

      if (currentId) {
        const ref = doc(db, 'invoices', currentId);
        await updateDoc(ref, {
          invoice,
          items,
          subtotal,
          taxAmount,
          total,
        });
        alert('Invoice updated ✅');
      } else {
        const docRef = await addDoc(collection(db, 'invoices'), {
          userId: user.uid,
          invoice,
          items,
          subtotal,
          taxAmount,
          total,
          createdAt: serverTimestamp(),
        });
        currentId = docRef.id;
        setSelectedInvoiceId(docRef.id);
        alert('Invoice saved ✅');
      }

      if (saveAsDefault) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(
            userRef,
            {
              sender: invoice.sender,
              defaultCurrency: invoice.currency,
              defaultTaxRate: invoice.taxRate,
              logoDataUrl: invoice.logoDataUrl || null,
              language,
            },
            { merge: true }
          );
        } catch (err) {
          console.error('Error saving default company info:', err);
        }
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
      alert('Invoice could not be saved ❌');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!user) return;
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this invoice?'
    );
    if (!confirmDelete) return;

    try {
      const ref = doc(db, 'invoices', id);
      await deleteDoc(ref);

      if (selectedInvoiceId === id) {
        resetInvoiceForm();
      }
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('Invoice could not be deleted ❌');
    }
  };

  // Save current client
  const handleSaveClient = async () => {
    if (!user) return;
    const { name, email, address } = invoice.client;

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedName) {
      alert('Client name is required');
      return;
    }

    const alreadyExists = clients.some((c) => {
      const cName = (c.name || '').trim().toLowerCase();
      const cEmail = (c.email || '').trim().toLowerCase();
      return cName === trimmedName.toLowerCase() && cEmail === trimmedEmail;
    });

    if (alreadyExists) {
      alert('This client already exists ✅');
      return;
    }

    try {
      await addDoc(collection(db, 'clients'), {
        userId: user.uid,
        name: trimmedName,
        email: trimmedEmail,
        address: (address || '').trim(),
        createdAt: serverTimestamp(),
      });
      alert('Client saved ✅');
    } catch (err) {
      console.error('Error saving client:', err);
      alert('Client could not be saved ❌');
    }
  };

  const handleSelectClient = (client) => {
    setInvoice((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        name: client.name || '',
        email: client.email || '',
        address: client.address || '',
      },
    }));
  };

  const handleDeleteClient = async (id) => {
    if (!user) return;
    const ok = window.confirm('Delete this client?');
    if (!ok) return;

    try {
      const ref = doc(db, 'clients', id);
      await deleteDoc(ref);
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Client could not be deleted ❌');
    }
  };

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;

    const element = invoiceRef.current;

    const opt = {
      margin: 0,
      filename: `${invoice.number || 'invoice'}.pdf`,
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
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col md:flex-row items-stretch">
      {/* LEFT PANEL: EDITOR */}
      <div
        className="bg-slate-900 border-r border-slate-800 overflow-y-auto flex flex-col shadow-xl z-10 w-full md:flex-none"
        style={{ width: sidebarWidth }}
      >
        <div className="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 sticky top-0 bg-slate-900 z-20">

          <div className="flex items-center gap-2 text-indigo-400">
            <div className="bg-indigo-900/60 p-2 rounded-lg">
              <FileText size={24} />
            </div>
            <h1 className="text-xl font-bold text-white">BillCraft</h1>
          </div>

          {/* Right actions */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {/* Language selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="hidden sm:block text-[11px] bg-slate-900 border border-slate-700 rounded-full px-3 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="en">EN</option>
              <option value="tr">TR</option>
              <option value="hu">HU</option>
  <option value="fr">FR</option>
  <option value="it">IT</option>
  <option value="de">DE</option>
  <option value="es">ES</option>
            </select>
            {/* New + Save group (desktop) */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-full px-4 py-2 shadow-sm border border-slate-700">
              <button
                onClick={resetInvoiceForm}
                className="text-[11px] font-semibold px-4 py-1 rounded-full text-slate-100 hover:bg-slate-700 transition-colors mr-4"
              >
                {t('newInvoiceBtn')}
              </button>

              <button
                onClick={handleSaveInvoice}
                className="text-[11px] font-semibold px-4 py-1 rounded-full text-slate-900 bg-emerald-400 hover:bg-emerald-300 flex items-center gap-1 transition-colors"
              >
                <Download size={12} /> {t('saveBtn')}
              </button>
            </div>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              className="text-xs sm:text-sm font-semibold bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} /> {t('downloadPdfBtn')}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8 flex-1 pb-10">
          {/* My invoices */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('myInvoices')}
            </h3>

            {invoicesLoading && (
              <p className="text-[11px] text-slate-500">
                {t('loadingInvoices')}
              </p>
            )}

            {!invoicesLoading && savedInvoices.length === 0 && (
              <p className="text-[11px] text-slate-500">{t('noInvoiceYet')}</p>
            )}

            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {savedInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      loadInvoiceFromDb(inv);
                      setSelectedInvoiceId(inv.id);
                    }}
                    className="flex-1 text-left text-[11px] px-2 py-1 rounded-lg border border-slate-700 hover:border-indigo-400 hover:bg-slate-800 transition-colors"
                  >
                    <div className="font-semibold text-slate-100">
                      {inv.invoice?.number || '(No number)'}
                    </div>
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>{inv.invoice?.date}</span>
                      <span>
                        {inv.total?.toLocaleString('tr-TR')}{' '}
                        {inv.invoice?.currency}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDeleteInvoice(inv.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Invoice details */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              {t('invoiceDetails')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  {t('invoiceNo')}
                </label>
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                  <Hash size={14} className="text-slate-400" />
                  <input
                    type="text"
                    value={invoice.number}
                    onChange={(e) =>
                      setInvoice({ ...invoice, number: e.target.value })
                    }
                    className="bg-transparent w-full outline-none text-sm font-medium text-slate-100"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  {t('currency')}
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-100"
                  value={invoice.currency}
                  onChange={(e) =>
                    setInvoice({ ...invoice, currency: e.target.value })
                  }
                >
                  <option value="₺">₺ (TRY)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  {t('date')}
                </label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) =>
                    setInvoice({ ...invoice, date: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  {t('dueDate')}
                </label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) =>
                    setInvoice({ ...invoice, dueDate: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none text-slate-100"
                />
              </div>
            </div>
          </section>

          {/* Sender & Client */}
          <section className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={14} /> {t('senderYou')}
              </h3>
              <input
                placeholder="Company / Full name"
                className="w-full border-b border-slate-700 py-2 text-sm focus:border-indigo-500 outline-none transition-colors bg-transparent text-slate-100"
                value={invoice.sender.name}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    sender: { ...invoice.sender, name: e.target.value },
                  })
                }
              />
              <input
                placeholder="Email address"
                className="w-full border-b border-slate-700 py-2 text-sm focus:border-indigo-500 outline-none transition-colors bg-transparent text-slate-100"
                value={invoice.sender.email}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    sender: { ...invoice.sender, email: e.target.value },
                  })
                }
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="save-default-sender"
                  type="checkbox"
                  className="w-3 h-3 accent-indigo-500"
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                />
                <label
                  htmlFor="save-default-sender"
                  className="text-[11px] text-slate-400"
                >
                  {t('saveCompanyInfo')}
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> {t('client')}
              </h3>
              <input
                placeholder={t('clientNameCompanyPlaceholder')}
                className="w-full border-b border-slate-700 py-2 text-sm focus:border-indigo-500 outline-none transition-colors bg-transparent text-slate-100"
                value={invoice.client.name}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    client: { ...invoice.client, name: e.target.value },
                  })
                }
              />
              <input
                placeholder={t('clientEmailPlaceholder')}
                className="w-full border-b border-slate-700 py-2 text-sm focus:border-indigo-500 outline-none transition-colors bg-transparent text-slate-100"
                value={invoice.client.email}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    client: { ...invoice.client, email: e.target.value },
                  })
                }
              />

              {/* Client actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSaveClient}
                  className="text-[11px] px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700"
                >
                  {t('saveToClients')}
                </button>
                <span className="text-[11px] text-slate-500">
                  {t('clickClientBelow')}
                </span>
              </div>

              {/* Client list */}
              <div className="mt-2 max-h-32 overflow-y-auto pr-1 space-y-1 text-[11px]">
                {clientsLoading && (
                  <p className="text-slate-500">{t('loadingClients')}</p>
                )}
                {!clientsLoading && clients.length === 0 && (
                  <p className="text-slate-600">{t('noClientsYet')}</p>
                )}
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center gap-1 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectClient(client)}
                      className="flex-1 px-2 py-1 rounded-lg border border-slate-700 hover:border-indigo-400 hover:bg-slate-800 text-left transition-colors"
                    >
                      <div className="font-semibold text-slate-100 truncate">
                        {client.name}
                      </div>
                      {client.email && (
                        <div className="text-[10px] text-slate-400 truncate">
                          {client.email}
                        </div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Line items */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              {t('lineItems')}
            </h3>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800 p-3 rounded-lg border border-slate-700 group relative"
                >
                  <input
                    placeholder={t('serviceDescriptionPlaceholder')}
                    className="w-full bg-transparent font-medium text-sm outline-none mb-2 text-slate-100"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(item.id, 'description', e.target.value)
                    }
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">
                        {t('quantity')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm outline-none text-slate-100"
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
                        {t('unitPrice')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm outline-none text-slate-100"
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
                    className="absolute -top-2 -right-2 bg-rose-900 text-rose-200 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-800"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={addItem}
                className="w-full py-2 border-2 border-dashed border-slate-700 rounded-lg text-slate-300 text-sm font-medium hover:border-indigo-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> {t('addNewLine')}
              </button>
            </div>
          </section>

          {/* Tax & notes */}
          <section className="space-y-4">
            <div className="flex items-center">
              <label className="text-xs font-medium text-slate-300">
                {t('vatRate')}
              </label>
              <input
                type="number"
                className="w-20 ml-2 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm outline-none text-slate-100"
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
              <label className="text-xs font-medium text-slate-300 block mb-1">
                {t('notesBank')}
              </label>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none h-24 resize-none text-slate-100"
                value={invoice.note}
                onChange={(e) =>
                  setInvoice({ ...invoice, note: e.target.value })
                }
              ></textarea>
            </div>
          </section>
        </div>
      </div>

      {/* RESIZE HANDLE (desktop only) */}
      <div
        className="hidden md:block cursor-col-resize"
        onMouseDown={startResizing}
      >
        <div className="w-1 h-screen bg-slate-900/80 border-r border-slate-800" />
      </div>

      {/* RIGHT PANEL: PREVIEW */}
      <div className="flex-1 bg-slate-950 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        <div className="transition-all scale-75 md:scale-90 lg:scale-100 origin-top">
          <div
            ref={invoiceRef}
            className="bg-white w-full max-w-[210mm] shadow-2xl rounded-sm p-12 text-slate-800 relative"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <div className="mb-4">
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer overflow-hidden"
                  >
                    {invoice.logoDataUrl ? (
                      <img
                        src={invoice.logoDataUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[9px] text-slate-400 font-medium text-center px-1">
                        Upload logo
                      </span>
                    )}
                  </label>
                </div>

                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  {t('invoiceTitle')}
                </h1>
                <p className="text-slate-400 font-medium mt-1">
                  #{invoice.number}
                </p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-lg mb-1">
                  {invoice.sender.name || 'Your company name'}
                </h3>
                <p className="text-sm text-slate-500 max-w-[200px] ml-auto">
                  {invoice.sender.email}
                </p>
                <p className="text-sm text-slate-500 mt-4 font-medium">
                  {t('date')}: {invoice.date}
                </p>
                <p className="text-sm text-slate-500">
                  {t('dueDate')}: {invoice.dueDate}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-12">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('billTo')}
              </h4>
              <h2 className="text-xl font-bold text-slate-800">
                {invoice.client.name || t('clientNamePlaceholder')}
              </h2>
              <p className="text-slate-500 text-sm">{invoice.client.email}</p>
            </div>

            {/* Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">
  {t('description')}
</th>
<th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
  {t('quantity')}
</th>
<th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
  {t('price')}
</th>
<th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
  {t('total')}
</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 text-sm font-medium">
                      {item.description || t('serviceDescriptionPreview')}
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
                    <span>{t('subtotal')}</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>{t('vatShort')} ({invoice.taxRate}%)</span>
                    <span>{formatMoney(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-indigo-600 border-t border-slate-200 pt-3">
                    <span>{t('total')}</span>
                    <span>{formatMoney(total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600">
                <span className="font-bold text-slate-800">
                  {t('noteLabel')}
                </span>{' '}
                {invoice.note}
              </div>
            </div>

            {/* Branding Watermark */}
            <div className="absolute bottom-8 left-0 w-full text-center opacity-30 pointer-events-none">
              <p className="text-xs font-bold flex items-center justify-center gap-1">
                <Settings size={12} /> {t('createdWithBillcraft')}
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
                Take your brand to the next level.
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <div className="bg-green-100 p-1 rounded text-green-600">
                  <Settings size={14} />
                </div>
                Remove the "Created with BillCraft" watermark
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <div className="bg-indigo-100 p-1 rounded text-indigo-600">
                  <FileText size={14} />
                </div>
                Unlimited templates & color options
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <div className="bg-purple-100 p-1 rounded text-purple-600">
                  <Mail size={14} />
                </div>
                Send invoice to client with one click
              </li>
            </ul>

            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Get lifetime license (₺149)
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
              One-time payment. No subscription.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
