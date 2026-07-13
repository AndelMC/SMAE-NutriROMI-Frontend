'use client';

import React, { useState, useEffect } from 'react';
import { Search, Activity, Stethoscope, ChevronRight, Loader2, ChevronDown, Check, Leaf, Apple, Wheat, Bean, Beef, Milk, Droplet, Candy, Coffee, Wine, ListFilter, Calculator, Plus, Minus, Trash2, ShoppingCart, X, Beaker, Pill, Code } from 'lucide-react';
import Image from 'next/image';
import SideDrawer from '@/components/SideDrawer';
import logo from './logo.png';

// Tipos basados en la estructura esperada
type Alimento = {
  Grupo: string;
  Alimento: string;
  'Cant.': string;
  Unidad: string;
  'Energía (kcal)': string;
  'Proteína (g)': string;
  'Lípidos (g)': string;
  'Hidratos de carbono (g)': string;
  [key: string]: any;
};

// Tipos para el carrito/calculadora
type CartItem = {
  item: Alimento;
  quantity: number;
};

// Lista estática de grupos con Iconos de Lucide
const GRUPOS_SMAE = [
  { value: "Verduras", label: "Verduras", icon: Leaf },
  { value: "Frutas", label: "Frutas", icon: Apple },
  { value: "Cereales y tubérculos", label: "Cereales y tubérculos", icon: Wheat },
  { value: "Leguminosas", label: "Leguminosas", icon: Bean },
  { value: "Alimentos de Origen Animal", label: "Alimentos de Origen Animal", icon: Beef },
  { value: "Leche", label: "Leche", icon: Milk },
  { value: "Aceites y grasas", label: "Aceites y grasas", icon: Droplet },
  { value: "Azúcares", label: "Azúcares", icon: Candy },
  { value: "Alimentos libres de energía", label: "Alimentos libres de energía", icon: Coffee },
  { value: "Bebidas alcohólicas", label: "Bebidas alcohólicas", icon: Wine }
];

// Componente Custom Select para soportar iconos SVG
function CustomGroupSelect({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = GRUPOS_SMAE.find(g => g.value === value);
  const SelectedIcon = selectedOption ? selectedOption.icon : ListFilter;

  return (
    <div className="relative w-full sm:w-64">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full pl-3 pr-4 py-2.5 text-base border-slate-200 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50 hover:bg-white transition-all text-slate-700"
      >
        <div className="flex items-center gap-2 truncate">
          <SelectedIcon className="h-4 w-4 text-slate-500 flex-shrink-0" />
          <span className="truncate">{selectedOption ? selectedOption.label : "Todos los grupos"}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 ml-2" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto py-1 text-sm">
            <button
              onClick={() => { onChange(""); setIsOpen(false); }}
              className={`flex items-center w-full px-3 py-2.5 hover:bg-slate-50 transition-colors ${value === "" ? "bg-blue-50/50 text-blue-700 font-medium" : "text-slate-700"}`}
            >
              <ListFilter className={`h-4 w-4 mr-2 ${value === "" ? "text-blue-600" : "text-slate-400"}`} />
              <span className="flex-1 text-left">Todos los grupos</span>
              {value === "" && <Check className="h-4 w-4 text-blue-600" />}
            </button>
            {GRUPOS_SMAE.map((g) => {
              const Icon = g.icon;
              const isSelected = value === g.value;
              return (
                <button
                  key={g.value}
                  onClick={() => { onChange(g.value); setIsOpen(false); }}
                  className={`flex items-center w-full px-3 py-2.5 hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/50 text-blue-700 font-medium" : "text-slate-700"}`}
                >
                  <Icon className={`h-4 w-4 mr-2 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="flex-1 text-left">{g.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'alimentos' | 'platillos'>('alimentos');
  const [data, setData] = useState<Alimento[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [grupo, setGrupo] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Estado del Drawer
  const [selectedItem, setSelectedItem] = useState<Alimento | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Calculadora
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Búsqueda independiente para la calculadora
  const [calcSearch, setCalcSearch] = useState('');
  const [calcDebouncedSearch, setCalcDebouncedSearch] = useState('');
  const [calcSearchResults, setCalcSearchResults] = useState<Alimento[]>([]);
  const [isCalcSearching, setIsCalcSearching] = useState(false);

  // Tab de desarrolladores
  const [activeDevTab, setActiveDevTab] = useState<'js' | 'react' | 'python'>('js');

  useEffect(() => {
    const timer = setTimeout(() => {
      setCalcDebouncedSearch(calcSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [calcSearch]);

  useEffect(() => {
    if (!calcDebouncedSearch) {
      setCalcSearchResults([]);
      return;
    }
    const fetchCalcData = async () => {
      setIsCalcSearching(true);
      try {
        const response = await fetch(`https://smae-nutri-romi-api.vercel.app/api/alimentos?q=${calcDebouncedSearch}&limit=10`);
        if (response.ok) {
          const result = await response.json();
          setCalcSearchResults(result.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsCalcSearching(false);
      }
    };
    fetchCalcData();
  }, [calcDebouncedSearch]);

  const addToCalculator = (alimento: Alimento) => {
    setCartItems(prev => {
      const existing = prev.find(p => p.item.Alimento === alimento.Alimento);
      if (existing) {
        return prev.map(p => p.item.Alimento === alimento.Alimento ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { item: alimento, quantity: 1 }];
    });
  };

  const updateQuantity = (alimentoName: string, delta: number) => {
    setCartItems(prev => prev.map(p => {
      if (p.item.Alimento === alimentoName) {
        const newQ = p.quantity + delta;
        return newQ > 0 ? { ...p, quantity: newQ } : p;
      }
      return p;
    }));
  };

  const setExactQuantity = (alimentoName: string, exactQty: number) => {
    setCartItems(prev => prev.map(p => {
      if (p.item.Alimento === alimentoName) {
        return exactQty >= 0 ? { ...p, quantity: exactQty } : p;
      }
      return p;
    }));
  };

  const removeFromCalculator = (alimentoName: string) => {
    setCartItems(prev => prev.filter(p => p.item.Alimento !== alimentoName));
  };

  const parseNum = (val: string | undefined | null) => {
    if (!val || val === 'NaN' || val === 'ND') return 0;
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  const totals = cartItems.reduce((acc, curr) => {
    acc.energia += parseNum(curr.item['Energía (kcal)']) * curr.quantity;
    acc.proteina += parseNum(curr.item['Proteína (g)']) * curr.quantity;
    acc.lipidos += parseNum(curr.item['Lípidos (g)']) * curr.quantity;
    acc.carbs += parseNum(curr.item['Hidratos de carbono (g)']) * curr.quantity;
    
    // Micronutrientes
    acc.sodio += parseNum(curr.item['Sodio (mg)']) * curr.quantity;
    acc.potasio += parseNum(curr.item['Potasio (mg)']) * curr.quantity;
    acc.calcio += parseNum(curr.item['Calcio (mg)']) * curr.quantity;
    acc.fosforo += parseNum(curr.item['Fósforo (mg)']) * curr.quantity;
    acc.hierro += parseNum(curr.item['Hierro (mg)']) * curr.quantity;
    
    // Vitaminas
    acc.vitA += parseNum(curr.item['Vitamina A (µg RE)']) * curr.quantity;
    acc.vitC += parseNum(curr.item['Acido Ascórbico (mg)']) * curr.quantity;
    acc.acFolico += parseNum(curr.item['Acido Fólico (mg)']) * curr.quantity;
    
    // Otros
    acc.pesoBruto += parseNum(curr.item['Peso bruto redondeado (g)']) * curr.quantity;
    acc.fibra += parseNum(curr.item['Fibra (g)']) * curr.quantity;
    acc.azucar += parseNum(curr.item['Azúcar (g)']) * curr.quantity;
    acc.colesterol += parseNum(curr.item['Colesterol (mg)']) * curr.quantity;

    return acc;
  }, { 
    energia: 0, proteina: 0, lipidos: 0, carbs: 0,
    sodio: 0, potasio: 0, calcio: 0, fosforo: 0, hierro: 0,
    vitA: 0, vitC: 0, acFolico: 0,
    pesoBruto: 0, fibra: 0, azucar: 0, colesterol: 0
  });

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle group change
  const handleGrupoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGrupo(e.target.value);
    setPage(1); // Reset page on new filter
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        const endpoint = activeTab === 'platillos' ? 'platillos' : 'alimentos';
        if (debouncedSearch) queryParams.append('q', debouncedSearch);
        if (grupo) {
          if (activeTab === 'platillos') queryParams.append('clasificacion', grupo);
          else queryParams.append('grupo', grupo);
        }
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        
        // Usamos la API de producción en Vercel
        const response = await fetch(`https://smae-nutri-romi-api.vercel.app/api/${endpoint}?${queryParams.toString()}`);
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
          setTotalPages(result.totalPages || 1);
          setTotalItems(result.total || 0);
        } else {
          console.error('Error fetching data');
        }
      } catch (error) {
        console.error('Network error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearch, grupo, page, limit, activeTab]);

  const handleRowClick = (item: Alimento) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header Original Centrado */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center justify-center relative">
          
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0 bg-white">
              <Image 
                src={logo}
                alt="SMAE-NutriROMI Logo"
                fill
                style={{ objectFit: 'contain', padding: '6px' }}
                priority
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                SMAE<span className="text-blue-600">-NutriROMI</span>
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Sistema Mexicano de Alimentos Equivalentes
              </p>
            </div>
          </div>
          
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Descripción del Proyecto */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 md:p-8 rounded-2xl shadow-sm border border-blue-100 mb-8 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 p-8 opacity-5 pointer-events-none">
            <Activity className="w-40 h-40 text-blue-900 transform rotate-12" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-extrabold text-blue-900 mb-3 flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              SMAE-NutriROMI
            </h1>
            <p className="text-slate-700 leading-relaxed text-justify max-w-5xl text-sm md:text-base">
              <strong>SMAE-NutriROMI</strong> es una herramienta integral diseñada para facilitar el control riguroso de aportes nutrimentales. Utilizando como núcleo central la extensa base de datos clínica de la plataforma <strong>SMAE (Sistema Mexicano de Alimentos Equivalentes)</strong>, este sistema permite realizar cálculos precisos de macronutrientes, vitaminas y minerales en tiempo real. Destaca por su gran versatilidad arquitectónica: puede ser consultada de forma totalmente independiente como un portal de apoyo para estructurar planes alimenticios, o bien, ser integrada fluidamente como un módulo analítico dentro de otros proyectos y sistemas de <strong>terceros</strong>. Nuestro objetivo es optimizar la evaluación dietética mediante una interfaz moderna, escalable y altamente confiable.
            </p>
          </div>
        </div>

        {/* Tabs de Navegación Principales */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button 
            onClick={() => { setActiveTab('alimentos'); setPage(1); setSearch(''); setGrupo(''); }}
            className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'alimentos' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Alimentos Equivalentes
          </button>
          <button 
            onClick={() => { setActiveTab('platillos'); setPage(1); setSearch(''); setGrupo(''); }}
            className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'platillos' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Platillos (Recetas)
          </button>
        </div>

        {/* Sección de la Calculadora (Independiente) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 transition-all">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
            
            {/* Buscador y Lista de Alimentos */}
            <div className="flex-1 w-full space-y-5">
              <div className="mb-1">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1.5">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Calculadora de Ingesta
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed text-justify">
                  Calcula el total de nutrientes que has consumido en una comida (ej. un desayuno). Puedes usar las porciones sugeridas usando los botones <span className="font-semibold px-1 bg-slate-100 rounded">[-]</span> y <span className="font-semibold px-1 bg-slate-100 rounded">[+]</span>, o escribir la cantidad exacta que comiste en el recuadro blanco (ej. 50 piezas de papas o 850 g de carne).
                </p>
              </div>
              
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Search className="h-4 w-4 text-slate-400" />
                 </div>
                 <input 
                   type="text" 
                   value={calcSearch} 
                   onChange={(e) => setCalcSearch(e.target.value)} 
                   placeholder="Buscar alimento para agregar a la calculadora..." 
                   className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                 />
                 {calcSearch && (
                   <div className="absolute z-40 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                     {isCalcSearching ? (
                       <div className="p-4 text-center text-sm text-slate-500 flex justify-center items-center gap-2">
                         <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> Buscando...
                       </div>
                     ) : calcSearchResults.length === 0 ? (
                       <div className="p-4 text-center text-sm text-slate-500">No se encontraron resultados</div>
                     ) : (
                       calcSearchResults.map(item => (
                         <button 
                           key={item.Alimento}
                           onClick={() => { addToCalculator(item); setCalcSearch(''); }}
                           className="w-full text-left px-4 py-3 hover:bg-blue-50/50 border-b border-slate-100 last:border-0 transition-colors group"
                         >
                           <div className="flex justify-between items-center">
                             <div className="font-medium text-sm text-slate-800 group-hover:text-blue-700">{item.Alimento}</div>
                             <Plus className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                           </div>
                           <div className="text-xs text-slate-500 mt-0.5">{item['Cant.']} {item.Unidad} • {item.Grupo}</div>
                         </button>
                       ))
                     )}
                   </div>
                 )}
              </div>

              {cartItems.length === 0 ? (
                <div className="text-sm text-slate-400 text-center py-8 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center gap-2">
                  <ShoppingCart className="h-8 w-8 text-slate-300 mb-1" />
                  <p>Busca alimentos en la barra de arriba y añádelos aquí.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map(c => {
                    const baseAmount = parseNum(c.item['Cant.']) || 1;
                    const currentAmount = c.quantity * baseAmount;

                    return (
                      <div key={c.item.Alimento} className="flex flex-col bg-white shadow-sm p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-2">
                            <div className="text-sm font-semibold text-slate-800 leading-tight">{c.item.Alimento}</div>
                            <div className="text-xs text-slate-400 mt-0.5">Porción base: {c.item['Cant.']} {c.item.Unidad}</div>
                          </div>
                          <button onClick={() => removeFromCalculator(c.item.Alimento)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {/* Botones de Porciones */}
                          <div className="flex-1 flex items-stretch bg-white rounded-md border border-slate-200 h-10 overflow-hidden">
                            <button onClick={() => updateQuantity(c.item.Alimento, -1)} className="px-3 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors bg-slate-50/50"><Minus className="h-3.5 w-3.5" /></button>
                            <div className="flex-1 text-xs font-bold text-center text-slate-700 flex flex-col justify-center items-center leading-none border-x border-slate-100">
                              <span>{Number(c.quantity.toFixed(2))}</span>
                              <span className="text-[9px] font-normal text-slate-400 mt-0.5">porc.</span>
                            </div>
                            <button onClick={() => updateQuantity(c.item.Alimento, 1)} className="px-3 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors bg-slate-50/50"><Plus className="h-3.5 w-3.5" /></button>
                          </div>

                          <div className="text-slate-300 font-bold text-sm shrink-0">=</div>

                          {/* Input de Cantidad Exacta */}
                          <div className="flex-1 flex items-stretch bg-white rounded-md border border-slate-200 overflow-hidden h-10">
                            <input 
                              type="number" 
                              className="flex-1 w-full text-center text-sm font-bold bg-transparent outline-none text-blue-700"
                              value={currentAmount === 0 ? '' : Number(currentAmount.toFixed(2))}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) {
                                  setExactQuantity(c.item.Alimento, val / baseAmount);
                                } else {
                                  setExactQuantity(c.item.Alimento, 0);
                                }
                              }}
                            />
                            <span className="text-xs text-slate-500 font-medium bg-slate-50 flex items-center justify-center px-3 border-l border-slate-100 truncate min-w-[70px] max-w-[90px]" title={c.item.Unidad}>
                              {c.item.Unidad}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="w-full lg:w-[340px] shrink-0 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col h-auto lg:h-[450px]">
              <h3 className="font-bold text-slate-600 text-xs mb-4 uppercase tracking-wider flex items-center gap-2 shrink-0">
                Totales Calculados
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5 pb-2">
                {/* Macros */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f49e6d]/10 px-4 py-3 rounded-xl border border-[#f49e6d]/20">
                    <div className="text-xs text-[#d97c47] font-semibold mb-1">Energía</div>
                    <div className="font-bold text-[#eb7140] text-xl leading-none">{totals.energia.toFixed(1)} <span className="text-xs font-normal">kcal</span></div>
                  </div>
                  <div className="bg-[#eb7140]/10 px-4 py-3 rounded-xl border border-[#eb7140]/20">
                    <div className="text-xs text-[#d96131] font-semibold mb-1">Proteína</div>
                    <div className="font-bold text-[#eb7140] text-xl leading-none">{totals.proteina.toFixed(1)} <span className="text-xs font-normal">g</span></div>
                  </div>
                  <div className="bg-[#abc57a]/10 px-4 py-3 rounded-xl border border-[#abc57a]/20">
                    <div className="text-xs text-[#8ca85a] font-semibold mb-1">Lípidos</div>
                    <div className="font-bold text-[#abc57a] text-xl leading-none">{totals.lipidos.toFixed(1)} <span className="text-xs font-normal">g</span></div>
                  </div>
                  <div className="bg-[#4b7933]/10 px-4 py-3 rounded-xl border border-[#4b7933]/20">
                    <div className="text-xs text-[#396323] font-semibold mb-1">H de C</div>
                    <div className="font-bold text-[#4b7933] text-xl leading-none">{totals.carbs.toFixed(1)} <span className="text-xs font-normal">g</span></div>
                  </div>
                </div>

                {/* Micronutrientes */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Beaker className="h-3.5 w-3.5"/> Micronutrientes</h4>
                  <ul className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm shadow-sm">
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Sodio</span><span className="font-semibold text-slate-800">{totals.sodio.toFixed(1)} mg</span></li>
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Potasio</span><span className="font-semibold text-slate-800">{totals.potasio.toFixed(1)} mg</span></li>
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Calcio</span><span className="font-semibold text-slate-800">{totals.calcio.toFixed(1)} mg</span></li>
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Fósforo</span><span className="font-semibold text-slate-800">{totals.fosforo.toFixed(1)} mg</span></li>
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Hierro</span><span className="font-semibold text-slate-800">{totals.hierro.toFixed(1)} mg</span></li>
                  </ul>
                </div>

                {/* Vitaminas */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Pill className="h-3.5 w-3.5"/> Vitaminas</h4>
                  <ul className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm shadow-sm">
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Vitamina A</span><span className="font-semibold text-slate-800">{totals.vitA.toFixed(1)} µg</span></li>
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Ác. Ascórbico</span><span className="font-semibold text-slate-800">{totals.vitC.toFixed(1)} mg</span></li>
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Ác. Fólico</span><span className="font-semibold text-slate-800">{totals.acFolico.toFixed(1)} mg</span></li>
                  </ul>
                </div>

                {/* Otros Detalles */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Leaf className="h-3.5 w-3.5"/> Otros Detalles</h4>
                  <ul className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm shadow-sm">
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Peso Bruto</span><span className="font-semibold text-slate-800">{totals.pesoBruto.toFixed(1)} g</span></li>
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Fibra</span><span className="font-semibold text-slate-800">{totals.fibra.toFixed(1)} g</span></li>
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Azúcar</span><span className="font-semibold text-slate-800">{totals.azucar.toFixed(1)} g</span></li>
                    <li className="flex justify-between p-2 px-3"><span className="text-slate-600">Colesterol</span><span className="font-semibold text-slate-800">{totals.colesterol.toFixed(1)} mg</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Control */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          
          <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <label className="text-sm font-medium text-slate-600 whitespace-nowrap">
              Buscar por nombre:
            </label>
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                placeholder="Ej. Manzana, Pollo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
            <label htmlFor="grupo" className="text-sm font-medium text-slate-600 whitespace-nowrap">
              Filtrar por Grupo:
            </label>
            <CustomGroupSelect 
              value={grupo}
              onChange={(val) => {
                setGrupo(val);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-blue-700">Consultando base de datos...</span>
              </div>
            </div>
          )}

          {/* Paginación Arriba */}
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando {data.length} de {totalItems} resultados
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Mostrar:</span>
                <select 
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="text-xs border border-slate-200 rounded-lg bg-white px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-600 font-medium px-3 bg-white py-1.5 rounded-lg border border-slate-200">
                Página {page} de {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>

          <div className="overflow-auto max-h-[650px] relative custom-scrollbar">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Alimento</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Porción</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell bg-slate-50">Energía</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell bg-slate-50">Proteína</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell bg-slate-50">Lípidos</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell bg-slate-50">Carbs</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Detalles</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {!loading && data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No se encontraron alimentos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => {
                    const isPlatillo = activeTab === 'platillos';
                    return (
                    <tr 
                      key={idx} 
                      onClick={() => handleRowClick(item)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{isPlatillo ? item.Platillo : item.Alimento}</div>
                        <div className="text-xs text-slate-500 mt-1">{isPlatillo ? item.Clasificacion_Busqueda : item.Grupo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {isPlatillo ? '1 porción' : `${item['Cant.']} ${item.Unidad}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium hidden md:table-cell">
                        {isPlatillo ? item.Energia_kcal : item['Energía (kcal)']} kcal
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium hidden lg:table-cell">
                        {isPlatillo ? item.Proteina_g : item['Proteína (g)']} g
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium hidden lg:table-cell">
                        {isPlatillo ? item.Lipidos_g : item['Lípidos (g)']} g
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium hidden xl:table-cell">
                        {isPlatillo ? item.H_de_C_g : item['Hidratos de carbono (g)']} g
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center text-blue-600 group-hover:text-blue-800 transition-colors cursor-pointer">
                          <span className="sr-only">Ver detalles</span>
                          <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección para Desarrolladores */}
        <div className="mt-16 bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Code className="w-64 h-64 text-blue-500 transform rotate-12" />
          </div>
          <div className="relative z-10 p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-4">
              <Code className="h-8 w-8 text-blue-400" />
              Para Developers: Integración API SMAE-NutriROMI
            </h2>
            <p className="text-slate-300 max-w-4xl leading-relaxed mb-8 text-sm md:text-base">
              Nuestra base de datos clínica está expuesta mediante una API REST rápida y accesible. 
              Puedes integrar la búsqueda, paginación y filtrado de los más de 2,900 alimentos en cualquier proyecto, aplicación móvil o sistema de terceros. Los parámetros soportados son <code>q</code> (búsqueda), <code>grupo</code>, <code>page</code> y <code>limit</code>. Aquí te mostramos cómo hacerlo en los lenguajes y frameworks más populares:
            </p>

            {/* Menú de Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
              <button 
                onClick={() => setActiveDevTab('js')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeDevTab === 'js' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" alt="JS" className={`w-4 h-4 rounded-sm ${activeDevTab !== 'js' && 'opacity-60 grayscale'}`} />
                Vanilla JS / HTML
              </button>
              <button 
                onClick={() => setActiveDevTab('react')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeDevTab === 'react' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="React" className={`w-4 h-4 ${activeDevTab !== 'react' && 'opacity-60 grayscale'}`} />
                React / Next.js
              </button>
              <button 
                onClick={() => setActiveDevTab('python')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeDevTab === 'python' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" alt="Python" className={`w-4 h-4 ${activeDevTab !== 'python' && 'opacity-60 grayscale'}`} />
                Python
              </button>
            </div>

            {/* Contenedor de Código */}
            <div className="bg-[#0d1117] rounded-xl border border-slate-700 overflow-hidden shadow-lg w-full">
              {activeDevTab === 'js' && (
                <div className="flex flex-col">
                  <div className="bg-slate-800/80 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700 flex items-center gap-2">
                    <div className="flex gap-1.5 mr-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" alt="JS" className="w-3.5 h-3.5 rounded-sm" />
                    <span className="text-slate-300">script.js</span>
                  </div>
                  <pre className="p-5 text-sm text-green-400 overflow-x-auto custom-scrollbar">
{`// ⚠️ IMPORTANTE: Cuando subas el backend a producción (ej. Vercel, Render, AWS),
// cambia esta URL por tu dominio real.
const API_URL = 'https://smae-nutri-romi-api.vercel.app/api/alimentos'; 
// const API_URL = 'https://api.tu-proyecto-nutricion.com/api/alimentos';

fetch(\`\${API_URL}?q=manzana&limit=5\`)
  .then(response => response.json())
  .then(data => {
    console.log('Total encontrados:', data.total);
    console.log('Resultados:', data.data);
  })
  .catch(error => console.error('Error:', error));`}
                  </pre>
                </div>
              )}

              {activeDevTab === 'react' && (
                <div className="flex flex-col">
                  <div className="bg-slate-800/80 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700 flex items-center gap-2">
                    <div className="flex gap-1.5 mr-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="React" className="w-3.5 h-3.5" />
                    <span className="text-slate-300">NutriSearch.tsx</span>
                  </div>
                  <pre className="p-5 text-sm text-blue-300 overflow-x-auto custom-scrollbar">
{`import { useEffect, useState } from 'react';

// ⚠️ IMPORTANTE: Es mejor usar Variables de Entorno (.env) para esto.
// En Next.js puedes usar process.env.NEXT_PUBLIC_API_URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smae-nutri-romi-api.vercel.app';

export default function NutriSearch() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSMAE = async () => {
      const res = await fetch(\`\${API_URL}/api/alimentos?grupo=Frutas\`);
      const json = await res.json();
      setData(json.data);
    };
    fetchSMAE();
  }, []);

  return (
    <ul>
      {data.map(item => (
        <li key={item.Alimento}>
          {item.Alimento} - {item['Energía (kcal)']} kcal
        </li>
      ))}
    </ul>
  );
}`}
                  </pre>
                </div>
              )}

              {activeDevTab === 'python' && (
                <div className="flex flex-col">
                  <div className="bg-slate-800/80 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700 flex items-center gap-2">
                    <div className="flex gap-1.5 mr-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" alt="Python" className="w-3.5 h-3.5" />
                    <span className="text-slate-300">api_client.py</span>
                  </div>
                  <pre className="p-5 text-sm text-yellow-300 overflow-x-auto custom-scrollbar">
{`import requests
import os

# ⚠️ IMPORTANTE: Usa tu dominio real de producción aquí.
API_URL = os.environ.get("SMAE_API_URL", "https://smae-nutri-romi-api.vercel.app/api/alimentos")
# API_URL = "https://api.tu-proyecto-nutricion.com/api/alimentos"

params = {
    "q": "pollo",
    "page": 1,
    "limit": 10
}

try:
    response = requests.get(API_URL, params=params)
    response.raise_for_status()
    data = response.json()
    
    print(f"Página {data['page']} de {data['totalPages']}")
    for alimento in data.get("data", []):
        print(f"➜ {alimento['Alimento']}: {alimento['Proteína (g)']}g de Proteína")
        
except requests.exceptions.RequestException as e:
    print(f"Error conectando a la API: {e}")`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Side Drawer para Detalles */}
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        data={selectedItem} 
      />
      
    </div>
  );
}
