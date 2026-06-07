"use client";

import { useState, useEffect } from "react";

interface SpinnerDatePickerProps {
  value: string; // Formato "YYYY-MM-DD"
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export default function SpinnerDatePicker({ value, onChange, disabled }: SpinnerDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Local temporal state when modal is open
  const [tempDay, setTempDay] = useState(1);
  const [tempMonth, setTempMonth] = useState(1); // 1-indexed (1-12)
  const [tempYear, setTempYear] = useState(2000);

  // Initialize temp state when modal opens or value changes
  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        setTempYear(parseInt(parts[0]) || 2000);
        setTempMonth(parseInt(parts[1]) || 1);
        setTempDay(parseInt(parts[2]) || 1);
      }
    } else {
      const today = new Date();
      setTempYear(today.getFullYear());
      setTempMonth(today.getMonth() + 1);
      setTempDay(today.getDate());
    }
  }, [value, isOpen]);

  // Days in month calculator
  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m, 0).getDate();
  };

  const handleConfirm = () => {
    const formattedMonth = tempMonth.toString().padStart(2, "0");
    const formattedDay = tempDay.toString().padStart(2, "0");
    onChange(`${tempYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  // Day Adjusters
  const adjustDay = (direction: "up" | "down") => {
    const days = getDaysInMonth(tempMonth, tempYear);
    if (direction === "up") {
      setTempDay(prev => prev === 1 ? days : prev - 1);
    } else {
      setTempDay(prev => prev === days ? 1 : prev + 1);
    }
  };

  // Month Adjusters
  const adjustMonth = (direction: "up" | "down") => {
    let newMonth = tempMonth;
    if (direction === "up") {
      newMonth = tempMonth === 1 ? 12 : tempMonth - 1;
    } else {
      newMonth = tempMonth === 12 ? 1 : tempMonth + 1;
    }
    setTempMonth(newMonth);

    // Keep day in bounds
    const days = getDaysInMonth(newMonth, tempYear);
    if (tempDay > days) {
      setTempDay(days);
    }
  };

  // Year Adjusters
  const adjustYear = (direction: "up" | "down") => {
    let newYear = tempYear;
    if (direction === "up") {
      newYear = tempYear === 1940 ? 2026 : tempYear - 1;
    } else {
      newYear = tempYear === 2026 ? 1940 : tempYear + 1;
    }
    setTempYear(newYear);

    // Keep day in bounds
    const days = getDaysInMonth(tempMonth, newYear);
    if (tempDay > days) {
      setTempDay(days);
    }
  };

  // Format date for display on input
  const getDisplayDate = () => {
    if (!value) return "dd/mm/aaaa";
    const parts = value.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  };

  // Helper values for display in wheels
  const daysInCurrentMonth = getDaysInMonth(tempMonth, tempYear);
  const prevDay = tempDay === 1 ? daysInCurrentMonth : tempDay - 1;
  const nextDay = tempDay === daysInCurrentMonth ? 1 : tempDay + 1;

  const prevMonth = tempMonth === 1 ? 12 : tempMonth - 1;
  const nextMonth = tempMonth === 12 ? 1 : tempMonth + 1;

  const prevYear = tempYear === 1940 ? 2026 : tempYear - 1;
  const nextYear = tempYear === 2026 ? 1940 : tempYear + 1;

  return (
    <>
      <div 
        onClick={() => !disabled && setIsOpen(true)}
        className={`relative flex items-center justify-between w-full bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-primary-fixed/50 transition-colors select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className={`font-stat font-bold text-sm ${value ? "text-white" : "text-white/30"}`}>
          {getDisplayDate()}
        </span>
        <span className="material-symbols-outlined text-white/40">calendar_today</span>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-[320px] bg-[#1a1c1c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-6 pt-5 pb-2 text-center border-b border-white/5">
              <h3 className="text-white font-display font-black italic uppercase tracking-wider text-sm">
                Selecione a Data
              </h3>
            </div>

            {/* Spinner Wheels */}
            <div className="flex justify-between items-center gap-4 py-8 px-6 bg-black/15">
              
              {/* Day Spinner */}
              <div 
                onWheel={(e) => adjustDay(e.deltaY < 0 ? "up" : "down")}
                className="flex-1 flex flex-col items-center"
              >
                <span className="text-[10px] font-stat text-white/30 uppercase tracking-wider mb-2 select-none">Dia</span>
                <button 
                  type="button"
                  onClick={() => adjustDay("up")}
                  className="text-white/20 hover:text-white/50 text-sm font-stat py-1 select-none transition-colors"
                >
                  {prevDay.toString().padStart(2, "0")}
                </button>
                <div className="w-full border-y-2 border-primary-fixed py-2.5 my-1 text-center font-display font-black text-white text-xl select-none">
                  {tempDay.toString().padStart(2, "0")}
                </div>
                <button 
                  type="button"
                  onClick={() => adjustDay("down")}
                  className="text-white/20 hover:text-white/50 text-sm font-stat py-1 select-none transition-colors"
                >
                  {nextDay.toString().padStart(2, "0")}
                </button>
              </div>

              {/* Month Spinner */}
              <div 
                onWheel={(e) => adjustMonth(e.deltaY < 0 ? "up" : "down")}
                className="flex-1 flex flex-col items-center"
              >
                <span className="text-[10px] font-stat text-white/30 uppercase tracking-wider mb-2 select-none">Mês</span>
                <button 
                  type="button"
                  onClick={() => adjustMonth("up")}
                  className="text-white/20 hover:text-white/50 text-sm font-stat py-1 select-none transition-colors"
                >
                  {MONTHS[prevMonth - 1]}
                </button>
                <div className="w-full border-y-2 border-primary-fixed py-2.5 my-1 text-center font-display font-black text-white text-xl select-none">
                  {MONTHS[tempMonth - 1]}
                </div>
                <button 
                  type="button"
                  onClick={() => adjustMonth("down")}
                  className="text-white/20 hover:text-white/50 text-sm font-stat py-1 select-none transition-colors"
                >
                  {MONTHS[nextMonth - 1]}
                </button>
              </div>

              {/* Year Spinner */}
              <div 
                onWheel={(e) => adjustYear(e.deltaY < 0 ? "up" : "down")}
                className="flex-1 flex flex-col items-center"
              >
                <span className="text-[10px] font-stat text-white/30 uppercase tracking-wider mb-2 select-none">Ano</span>
                <button 
                  type="button"
                  onClick={() => adjustYear("up")}
                  className="text-white/20 hover:text-white/50 text-sm font-stat py-1 select-none transition-colors"
                >
                  {prevYear}
                </button>
                <div className="w-full border-y-2 border-primary-fixed py-2.5 my-1 text-center font-display font-black text-white text-xl select-none">
                  {tempYear}
                </div>
                <button 
                  type="button"
                  onClick={() => adjustYear("down")}
                  className="text-white/20 hover:text-white/50 text-sm font-stat py-1 select-none transition-colors"
                >
                  {nextYear}
                </button>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="grid grid-cols-2 border-t border-white/5 text-center">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="py-4 text-xs font-stat uppercase text-white/40 hover:text-white hover:bg-white/5 transition-all border-r border-white/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="py-4 text-xs font-stat font-bold uppercase text-primary-fixed hover:text-primary-fixed-dim hover:bg-white/5 transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
