import { useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { DolarInfo } from '@/app/lib/fetchDolares';

// Función auxiliar para obtener el nombre de visualización
const getDolarDisplayName = (dolar: DolarInfo): string => {
  return dolar.casa === 'contadoconliqui' ? 'CCL' : dolar.nombre;
};

interface DolarSelectorProps {
  dolares: DolarInfo[];
  selectedDolar: DolarInfo;
  onSelectDolar: (dolar: DolarInfo) => void;
}

export default function DolarSelector({
                                        dolares,
                                        selectedDolar,
                                        onSelectDolar
                                      }: DolarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (dolar: DolarInfo) => {
    onSelectDolar(dolar);
    setIsOpen(false);
  };

  // Ordenamos los tipos de dólar por nombre para mejor presentación
  const sortedDolares = [...dolares].sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="relative mb-6">
      <button
        onClick={toggleDropdown}
        className="w-full flex items-center justify-between px-4 py-3 bg-emerald-800/40 border border-emerald-700 rounded-xl text-white hover:bg-emerald-800/60 transition-colors"
      >
        <div className="flex items-center">
          {/* Aquí usamos el nombre abreviado */}
          <span className="font-medium">{getDolarDisplayName(selectedDolar)}</span>
          <span className="ml-2 text-sm text-green-300">${selectedDolar.venta.toFixed(2)}</span>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full bg-emerald-900 border border-emerald-700 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {sortedDolares.map((dolar) => (
                <button
                  key={dolar.casa}
                  onClick={() => handleSelect(dolar)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-emerald-800 flex items-center justify-between ${
                    selectedDolar.casa === dolar.casa ? 'bg-emerald-800/60' : ''
                  }`}
                >
                  <div>
                    {/* Aquí usamos el nombre abreviado en la lista desplegable */}
                    <span className="text-white font-medium">{getDolarDisplayName(dolar)}</span>
                    <div className="mt-0.5 text-xs flex space-x-2">
                      <span className="text-green-300">Compra: ${dolar.compra.toFixed(2)}</span>
                      <span className="text-green-300">Venta: ${dolar.venta.toFixed(2)}</span>
                    </div>
                  </div>

                  {selectedDolar.casa === dolar.casa && (
                    <CheckIcon className="w-5 h-5 text-green-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
