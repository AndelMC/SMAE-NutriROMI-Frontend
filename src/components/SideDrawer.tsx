'use client';

import React, { useEffect } from 'react';
import { X, Beaker, Pill, Leaf, Droplet, Flame, Plus } from 'lucide-react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onAdd?: () => void;
}

export default function SideDrawer({ isOpen, onClose, data, onAdd }: SideDrawerProps) {
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatValue = (value: any, suffix: string = '') => {
    if (value === undefined || value === null || value === '' || value === 'NaN' || value === 'ND') {
      return 'Sin dato';
    }
    return `${value} ${suffix}`.trim();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="p-8">
          <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{data?.Alimento || 'Detalles Nutricionales'}</h2>
              <p className="text-sm font-medium text-blue-600 mt-1">{data?.Grupo}</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {data ? (
            <div className="space-y-6">
              {/* Aportaciones Cards (Diseño web original) */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg flex items-center flex-wrap gap-2 text-slate-800">
                    Aportaciones Totales de 
                    <span className="bg-black text-white px-3 py-1 rounded-md text-base shadow-sm">
                      {formatValue(data['Cant.'], data.Unidad)}
                    </span>
                  </h3>
                  {onAdd && (
                    <button 
                      onClick={onAdd}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Añadir
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[#f49e6d] text-white rounded-xl p-3 flex flex-col justify-between shadow-sm">
                    <div className="text-sm font-medium">Energía</div>
                    <div className="font-bold text-2xl mt-1 leading-tight">{formatValue(data['Energía (kcal)'])}</div>
                    <div className="text-xs mt-3 opacity-90 font-medium">kcal</div>
                  </div>
                  <div className="bg-[#eb7140] text-white rounded-xl p-3 flex flex-col justify-between shadow-sm">
                    <div className="text-sm font-medium">Proteína</div>
                    <div className="font-bold text-2xl mt-1 leading-tight">{formatValue(data['Proteína (g)'])}</div>
                    <div className="text-xs mt-3 opacity-90 font-medium">g</div>
                  </div>
                  <div className="bg-[#abc57a] text-white rounded-xl p-3 flex flex-col justify-between shadow-sm">
                    <div className="text-sm font-medium">Lípidos</div>
                    <div className="font-bold text-2xl mt-1 leading-tight">{formatValue(data['Lípidos (g)'])}</div>
                    <div className="text-xs mt-3 opacity-90 font-medium">g</div>
                  </div>
                  <div className="bg-[#4b7933] text-white rounded-xl p-3 flex flex-col justify-between shadow-sm">
                    <div className="text-sm font-medium">H de C</div>
                    <div className="font-bold text-2xl mt-1 leading-tight">{formatValue(data['Hidratos de carbono (g)'])}</div>
                    <div className="text-xs mt-3 opacity-90 font-medium">g</div>
                  </div>
                </div>
              </div>

              {/* Equivalencias Table (Diseño web original) */}
              <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-100 shadow-sm mt-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Equivalencias por Grupo</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="py-2 font-semibold text-slate-700 whitespace-nowrap">Equivalentes</th>
                        <th className="py-2 font-semibold text-slate-700 whitespace-nowrap px-4">Grupo</th>
                        <th className="py-2 font-semibold text-slate-700 whitespace-nowrap">Subgrupo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-4 text-slate-700">{formatValue(data.Equivalentes)}</td>
                        <td className="py-4 text-slate-700 px-4">{data.Grupo}</td>
                        <td className="py-4 text-slate-700">{formatValue(data.Subgrupo)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Micronutrients */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Beaker size={16} /> Micronutrientes
                </h3>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <ul className="divide-y divide-gray-100">
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Sodio</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Sodio (mg)'], 'mg')}</span>
                    </li>
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Potasio</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Potasio (mg)'], 'mg')}</span>
                    </li>
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Calcio</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Calcio (mg)'], 'mg')}</span>
                    </li>
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Fósforo</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Fósforo (mg)'], 'mg')}</span>
                    </li>
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Hierro</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Hierro (mg)'], 'mg')}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Vitamins */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Pill size={16} /> Vitaminas
                </h3>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <ul className="divide-y divide-gray-100">
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Vitamina A</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Vitamina A (µg RE)'], 'µg')}</span>
                    </li>
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Ácido Ascórbico</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Acido Ascórbico (mg)'], 'mg')}</span>
                    </li>
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Ácido Fólico</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Acido Fólico (mg)'], 'mg')}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Additional Details */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Leaf size={16} /> Otros Detalles
                </h3>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <ul className="divide-y divide-gray-100">
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Peso Bruto</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Peso bruto redondeado (g)'], 'g')}</span>
                    </li>
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Fibra</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Fibra (g)'], 'g')}</span>
                    </li>
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Azúcar</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Azúcar (g)'], 'g')}</span>
                    </li>
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Índice Glicémico (IG)</span>
                      <span className="font-medium text-slate-800">{formatValue(data.IG)}</span>
                    </li>
                    <li className="p-3 flex justify-between text-sm">
                      <span className="text-slate-600">Colesterol</span>
                      <span className="font-medium text-slate-800">{formatValue(data['Colesterol (mg)'], 'mg')}</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          ) : (
            <p className="text-slate-500">No hay datos disponibles.</p>
          )}
        </div>
      </div>
    </>
  );
}
