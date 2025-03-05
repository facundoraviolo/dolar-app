import { DolarInfo } from '@/app/lib/fetchDolares';

// Servicio reactivo para manejar las consultas de dólares
export class DolarService {
  private static instance: DolarService;
  private listeners: (() => void)[] = [];
  private cachedData: DolarInfo[] | null = null;
  private lastFetchTime: number = 0;
  private isFetching: boolean = false;

  // Patrón Singleton
  public static getInstance(): DolarService {
    if (!DolarService.instance) {
      DolarService.instance = new DolarService();
    }
    return DolarService.instance;
  }

  // Método para obtener datos actualizados
  public async fetchDolares(forceRefresh: boolean = false): Promise<DolarInfo[]> {
    // Si tenemos datos en caché y no forzamos actualización, los devolvemos
    const now = Date.now();
    if (
      this.cachedData &&
      !forceRefresh &&
      now - this.lastFetchTime < 60000 // 1 minuto de caché
    ) {
      return this.cachedData;
    }

    // Si ya hay una petición en curso, esperamos
    if (this.isFetching) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (!this.isFetching && this.cachedData) {
            resolve(this.cachedData);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.isFetching = true;

    try {
      const response = await fetch('https://dolarapi.com/v1/dolares', {
        cache: forceRefresh ? 'no-store' : 'default'
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos del dólar');
      }

      const data = await response.json();
      this.cachedData = data;
      this.lastFetchTime = now;
      this.notifyListeners();

      return data;
    } catch (error) {
      console.error('Error al obtener datos del dólar:', error);
      // Si hubo un error pero tenemos caché, devolvemos eso
      if (this.cachedData) return this.cachedData;

      // Fallback values como última opción
      return [
        {
          moneda: "USD",
          casa: "blue",
          nombre: "Blue",
          compra: 1210,
          venta: 1230,
          fechaActualizacion: new Date().toISOString()
        }
      ];
    } finally {
      this.isFetching = false;
    }
  }

  // Suscribe un listener para actualizaciones
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notifica a todos los listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Exportamos una instancia singleton
export const dolarService = DolarService.getInstance();
