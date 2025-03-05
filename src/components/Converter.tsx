'use client';

import { useState, useEffect } from 'react';
import CurrencyInput from './CurrencyInput';
import { ArrowsRightLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ConverterProps {
  dolarMepValue: number;
  fechaActualizacion: string;
}

export default function Converter({ dolarMepValue, fechaActualizacion }: ConverterProps) {
  const [pesosValue, setPesosValue] = useState('');
  const [dolaresValue, setDolaresValue] = useState('');
  const [lastEdited, setLastEdited] = useState<'pesos' | 'dolares'>('pesos');
  const [isPesosFirst, setIsPesosFirst] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [buttonRotation, setButtonRotation] = useState(0);

  // Cargar la configuración guardada cuando el componente se monta
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('conversorConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setIsPesosFirst(config.isPesosFirst);
        setButtonRotation(config.buttonRotation);
      }
    } catch (error) {
      console.error('Error al cargar la configuración guardada:', error);
    }
  }, []);

  // Guardar configuración cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem('conversorConfig', JSON.stringify({
        isPesosFirst,
        buttonRotation
      }));
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
    }
  }, [isPesosFirst, buttonRotation]);

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
    if (!pesos || isNaN(parseFloat(pesos)) || dolarMepValue <= 0) return '';
    const result = parseFloat(pesos) / dolarMepValue;
    return result.toFixed(2);
  };

  // Convierte de dólares a pesos
  const convertDolaresToPesos = (dolares: string) => {
    if (!dolares || isNaN(parseFloat(dolares)) || dolarMepValue <= 0) return '';
    const result = parseFloat(dolares) * dolarMepValue;
    return result.toFixed(2);
  };

  // Actualiza los valores cuando cambia un input
  useEffect(() => {
    if (lastEdited === 'pesos') {
      setDolaresValue(convertPesosToDolares(pesosValue));
    } else {
      setPesosValue(convertDolaresToPesos(dolaresValue));
    }
  }, [pesosValue, dolaresValue, lastEdited, dolarMepValue]);

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

  // Simula una actualización de los datos
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 rounded-3xl shadow-2xl border border-emerald-700"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-3">
            Conversor Dólar MEP
          </h1>
          <div className="flex justify-center items-center mb-2">
            <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-emerald-500">
              ${dolarMepValue.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <span className="text-sm">
              Actualizado: {formatFecha(fechaActualizacion)}
            </span>
            <button
              onClick={handleRefresh}
              className="text-gray-300 hover:text-green-400 transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Contenedor principal con altura aumentada para más espacio */}
        <div className="relative" style={{ height: "280px" }}>
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
                  label="Dólares MEP"
                  value={dolaresValue}
                  onChange={(value) => {
                    setDolaresValue(value);
                    setLastEdited('dolares');
                  }}
                  symbol="U$D"
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
                  label="Dólares MEP"
                  value={dolaresValue}
                  onChange={(value) => {
                    setDolaresValue(value);
                    setLastEdited('dolares');
                  }}
                  symbol="U$D"
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

          {/* División visual en el centro para crear espacio para el botón */}
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-24 pointer-events-none"></div>
        </div>
      </motion.div>
    </div>
  );
}
