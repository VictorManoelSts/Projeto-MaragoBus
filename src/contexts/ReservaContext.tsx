import React, { createContext, useContext, useState } from 'react';
import type { Reserva } from '../types/Index';

interface ReservaState {
  reserva: Reserva | null;
  setReserva: (r: Reserva | null) => void;
}

const ReservaContext = createContext<ReservaState>({
  reserva: null,
  setReserva: () => {},
});

export const ReservaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reserva, setReserva] = useState<Reserva | null>(null);
  return (
    <ReservaContext.Provider value={{ reserva, setReserva }}>
      {children}
    </ReservaContext.Provider>
  );
};

export const useReserva = () => useContext(ReservaContext);
