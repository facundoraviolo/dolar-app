// Función para obtener la cotización del dólar MEP desde el servidor
export async function fetchDolarMep() {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/bolsa', {
      // Refrescar cada hora
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Error al obtener la cotización');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    // Valores por defecto en caso de error
    return {
      venta: 0,
      compra: 0,
      fechaActualizacion: new Date().toISOString()
    };
  }
}
