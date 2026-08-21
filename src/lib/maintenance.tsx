import React, { createContext, useContext, useState, useEffect } from 'react';

export interface MaintenanceContextType {
  isMaintenance: boolean;
  isSimulated: boolean;
  toggleSimulation: () => void;
  setSimulation: (active: boolean) => void;
  currentIstTime: string;
  istHours: number;
  istMinutes: number;
  istSeconds: number;
  secondsRemaining: number;
  formattedRemaining: string;
  checkAndBlockAction: (actionName?: string) => boolean;
}

export function computeIstTime(baseDate = new Date(), forceSimulated = false) {
  if (forceSimulated) {
    // If simulated, set to 1:07:30 PM IST (in the middle of the 1:00 PM - 1:15 PM window)
    const simulatedDate = new Date();
    // Return simulated state inside maintenance window
    return {
      hours: 13,
      minutes: 7,
      seconds: Math.floor((Date.now() / 1000) % 60),
      isMaintenance: true,
      istString: `01:07:${Math.floor((Date.now() / 1000) % 60).toString().padStart(2, '0')} PM IST`,
      secondsRemaining: (15 - 7) * 60 - Math.floor((Date.now() / 1000) % 60)
    };
  }

  // Real IST is UTC + 5 hours 30 minutes
  const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + (3600000 * 5.5));
  
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const seconds = istDate.getSeconds();
  
  // Scheduled maintenance is 1:00 PM to 1:15 PM IST (13:00 to 13:14:59)
  const isMaintenance = (hours === 13 && minutes >= 0 && minutes < 15);
  
  let secondsRemaining = 0;
  if (isMaintenance) {
    secondsRemaining = ((14 - minutes) * 60) + (60 - seconds);
  }

  const hours12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const istString = `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm} IST`;

  return {
    hours,
    minutes,
    seconds,
    isMaintenance,
    istString,
    secondsRemaining
  };
}

export const MaintenanceContext = createContext<MaintenanceContextType>({
  isMaintenance: false,
  isSimulated: false,
  toggleSimulation: () => {},
  setSimulation: () => {},
  currentIstTime: '',
  istHours: 0,
  istMinutes: 0,
  istSeconds: 0,
  secondsRemaining: 0,
  formattedRemaining: '00m 00s',
  checkAndBlockAction: () => false
});

export function useMaintenance() {
  return useContext(MaintenanceContext);
}

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [isSimulated, setIsSimulated] = useState<boolean>(() => {
    return localStorage.getItem('meesho_wms_simulated_maintenance') === 'true';
  });

  const [clockState, setClockState] = useState(() => computeIstTime(new Date(), isSimulated));

  useEffect(() => {
    const timer = setInterval(() => {
      setClockState(computeIstTime(new Date(), isSimulated));
    }, 1000);
    return () => clearInterval(timer);
  }, [isSimulated]);

  const toggleSimulation = () => {
    setIsSimulated(prev => {
      const next = !prev;
      localStorage.setItem('meesho_wms_simulated_maintenance', next ? 'true' : 'false');
      setClockState(computeIstTime(new Date(), next));
      return next;
    });
  };

  const setSimulation = (active: boolean) => {
    setIsSimulated(active);
    localStorage.setItem('meesho_wms_simulated_maintenance', active ? 'true' : 'false');
    setClockState(computeIstTime(new Date(), active));
  };

  const mins = Math.floor(clockState.secondsRemaining / 60);
  const secs = clockState.secondsRemaining % 60;
  const formattedRemaining = `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;

  const checkAndBlockAction = (actionName = 'This action') => {
    if (clockState.isMaintenance) {
      alert(`⚠️ Scheduled Maintenance in Progress (1:00 PM – 1:15 PM IST)\n\n${actionName} is temporarily disabled to prevent data inconsistencies during database synchronization. Please try again after 1:15 PM IST.`);
      return true;
    }
    return false;
  };

  return (
    <MaintenanceContext.Provider
      value={{
        isMaintenance: clockState.isMaintenance,
        isSimulated,
        toggleSimulation,
        setSimulation,
        currentIstTime: clockState.istString,
        istHours: clockState.hours,
        istMinutes: clockState.minutes,
        istSeconds: clockState.seconds,
        secondsRemaining: clockState.secondsRemaining,
        formattedRemaining,
        checkAndBlockAction
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}
