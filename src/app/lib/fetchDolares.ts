export interface DolarInfo {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export async function fetchDolares(): Promise<DolarInfo[]> {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares', {
      next: { revalidate: 3600 } // Revalidar cada hora
    });

    if (!response.ok) {
      throw new Error('Error al obtener los datos de los dólares');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener datos del dólar:', error);
    // Valores de fallback en caso de error
    return [];
  }
}
