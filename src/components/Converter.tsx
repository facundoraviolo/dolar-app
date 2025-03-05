'use client';

import { useState, useEffect, useCallback } from 'react';
import CurrencyInput from './CurrencyInput';
import DolarSelector from './DolarSelector';
import { ArrowsRightLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { DolarInfo } from '@/app/lib/fetchDolares';
import { dolarService } from '@/app/services/dolarService';

interface ConverterProps {
  initialDolares: DolarInfo[];
}

export default function Converter({ initialDolares }: ConverterProps) {
  const [dolares, setDolares] = useState<DolarInfo[]>(initialDolares);
  const [pesosValue, setPesosValue] = useState('');
  const [dolaresValue, setDolaresValue] = useState('');
  const [lastEdited, setLastEdited] = useState<'pesos' | 'dolares'>('pesos');
  const [isPesosFirst, setIsPesosFirst] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [buttonRotation, setButtonRotation] = useState(0);

  // Estado para el tipo de dólar seleccionado
  const [selectedDolar, setSelectedDolar] = useState<DolarInfo>(
    // Default al dólar Blue o al primer elemento si no existe Blue
    dolares.find(d => d.casa === 'blue' || d.casa === 'bolsa') || dolares[0]
  );

  const getDolarDisplayName = (dolar: DolarInfo | null | undefined): string => {
    if (!dolar) return '';
    return dolar.casa === 'contadoconliqui' ? 'CCL' : dolar.nombre;
  };

  // Actualizar el selectedDolar cuando cambian los dolares para mantener la misma casa
  useEffect(() => {
    if (selectedDolar && dolares.length > 0) {
      const updatedDolar = dolares.find(d => d.casa === selectedDolar.casa);
      if (updatedDolar) {
        setSelectedDolar(updatedDolar);
      }
    }
  }, [dolares]);

  // Cargar configuración guardada
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('conversorConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setIsPesosFirst(config.isPesosFirst);
        setButtonRotation(config.buttonRotation);

        // Recuperar el tipo de dólar seleccionado
        if (config.selectedDolarCasa) {
          const savedDolar = dolares.find(d => d.casa === config.selectedDolarCasa);
          if (savedDolar) {
            setSelectedDolar(savedDolar);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar la configuración guardada:', error);
    }
  }, [dolares]);

  // Guardar configuración
  useEffect(() => {
    try {
      localStorage.setItem('conversorConfig', JSON.stringify({
        isPesosFirst,
        buttonRotation,
        selectedDolarCasa: selectedDolar?.casa
      }));
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
    }
  }, [isPesosFirst, buttonRotation, selectedDolar]);

  // Formatea la fecha de actualización
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Convierte de pesos a dólares
  const convertPesosToDolares = (pesos: string) => {
    if (!pesos || isNaN(parseFloat(pesos)) || !selectedDolar || selectedDolar.venta <= 0) return '';
    const result = parseFloat(pesos) / selectedDolar.venta;
    return result.toFixed(2);
  };

  // Convierte de dólares a pesos
  const convertDolaresToPesos = (dolares: string) => {
    if (!dolares || isNaN(parseFloat(dolares)) || !selectedDolar || selectedDolar.venta <= 0) return '';
    const result = parseFloat(dolares) * selectedDolar.venta;
    return result.toFixed(2);
  };

  // Actualiza los valores cuando cambia un input o el tipo de dólar
  useEffect(() => {
    if (lastEdited === 'pesos') {
      setDolaresValue(convertPesosToDolares(pesosValue));
    } else {
      setPesosValue(convertDolaresToPesos(dolaresValue));
    }
  }, [pesosValue, dolaresValue, lastEdited, selectedDolar]);

  // Intercambia la posición de los inputs con animación mejorada
  const handleSwap = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsPesosFirst(!isPesosFirst);

    // Alternar la rotación entre 0 y 180 grados
    setButtonRotation(prevRotation => prevRotation === 0 ? 180 : 0);

    // Restablece el estado de animación después de que termine
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  // Función para actualizar los datos de dólares (ahora realmente funciona!)
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      // Hacemos una petición forzada para obtener datos frescos
      const freshData = await dolarService.fetchDolares(true);
      setDolares(freshData);

      // Mostramos un mensaje de éxito (opcional)
      console.log('Cotizaciones actualizadas correctamente');
    } catch (error) {
      console.error('Error al actualizar las cotizaciones:', error);
    } finally {
      // Mantenemos el spinner por al menos 500ms para feedback visual
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  }, [refreshing]);

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 rounded-3xl shadow-2xl border border-emerald-700"
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-3">
            Conversor de Dólares
          </h1>

          {/* Selector de tipo de dólar */}
          {selectedDolar && (
            <DolarSelector
              dolares={dolares}
              selectedDolar={selectedDolar}
              onSelectDolar={setSelectedDolar}
            />
          )}

          <div className="flex items-center justify-center gap-2 text-gray-300 mt-2">
            <span className="text-sm">
              Actualizado: {selectedDolar ? formatFecha(selectedDolar.fechaActualizacion) : ''}
            </span>
            <button
              onClick={handleRefresh}
              className="text-gray-300 hover:text-green-400 transition-colors"
              disabled={refreshing}
              aria-label="Actualizar cotizaciones"
              title="Actualizar cotizaciones"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Contenedor principal con altura aumentada para más espacio */}
        <div className="relative" style={{ height: "260px" }}>
          {/* Inputs con AnimatePresence para manejar la salida */}
          <AnimatePresence mode="popLayout">
            {/* Primer input - posicionado más arriba y con más margen inferior */}
            <motion.div
              className="absolute top-0 left-0 right-0 z-10 pb-6"
              key={isPesosFirst ? "pesos-top" : "dolares-top"}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.3
              }}
            >
              {isPesosFirst ? (
                <CurrencyInput
                  label="Pesos Argentinos"
                  value={pesosValue}
                  onChange={(value) => {
                    setPesosValue(value);
                    setLastEdited('pesos');
                  }}
                  symbol="$"
                  placeholder="0.00"
                />
              ) : (
                <CurrencyInput
                  label={`Dólares (${getDolarDisplayName(selectedDolar)})`}
                  value={dolaresValue}
                  onChange={(value) => {
                    setDolaresValue(value);
                    setLastEdited('dolares');
                  }}
                  symbol="USD"
                  placeholder="0.00"
                />
              )}
            </motion.div>

            {/* Botón de intercambio - ahora con rotación persistente */}
            <motion.div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 rounded-full bg-emerald-900/40 p-3"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={handleSwap}
                disabled={isAnimating}
                whileTap={{ scale: 0.92 }}
                animate={{ rotate: buttonRotation }}
                transition={{
                  type: "spring",
                  duration: 0.4,
                  bounce: 0.2
                }}
                className="p-4 rounded-full bg-green-600 hover:bg-green-500 transition-colors shadow-lg shadow-green-700/30 focus:outline-none focus:ring-2 focus:ring-green-400 border border-green-500/30"
              >
                <ArrowsRightLeftIcon className="h-6 w-6 text-white" />
              </motion.button>
            </motion.div>

            {/* Segundo input - posicionado más abajo y con más margen superior */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-10 pt-6"
              key={isPesosFirst ? "dolares-bottom" : "pesos-bottom"}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.3
              }}
            >
              {isPesosFirst ? (
                <CurrencyInput
                  label={`Dólares (${getDolarDisplayName(selectedDolar)})`}
                  value={dolaresValue}
                  onChange={(value) => {
                    setDolaresValue(value);
                    setLastEdited('dolares');
                  }}
                  symbol="USD"
                  placeholder="0.00"
                />
              ) : (
                <CurrencyInput
                  label="Pesos Argentinos"
                  value={pesosValue}
                  onChange={(value) => {
                    setPesosValue(value);
                    setLastEdited('pesos');
                  }}
                  symbol="$"
                  placeholder="0.00"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
