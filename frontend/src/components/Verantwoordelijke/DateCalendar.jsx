import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DateCalendar({ selectedDates, setSelectedDates }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const monthNames = [
    "Januari", "Februari", "Maart", "April", "Mei", "Juni",
    "Juli", "Augustus", "September", "Oktober", "November", "December"
  ];

  const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

  const formatDate = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const isSelected = (day) => {
    const dateStr = formatDate(day);
    return selectedDates.includes(dateStr);
  };

  const toggleDate = (day) => {
    const dateStr = formatDate(day);
    if (isSelected(day)) {
      // Deselect - but keep at least one date
      if (selectedDates.length > 1) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
      } else {
        alert("Je moet minimaal één datum selecteren");
      }
    } else {
      // Select
      setSelectedDates([...selectedDates, dateStr].sort());
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Generate calendar grid
  const calendarDays = [];

  // Empty cells before first day of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-8"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const selected = isSelected(day);
    const today = new Date();
    const isToday =
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear();

    calendarDays.push(
      <button
        key={day}
        onClick={() => toggleDate(day)}
        className={`h-8 w-full rounded text-xs font-medium transition ${
          selected
            ? "bg-[#582F5B] text-white"
            : isToday
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "bg-white hover:bg-gray-100 border border-gray-200"
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="border rounded p-3 bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={previousMonth}
          className="p-1 hover:bg-gray-100 rounded"
          title="Vorige maand"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={goToToday}
            className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Vandaag
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded"
          title="Volgende maand"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-xs font-medium text-gray-600">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays}
      </div>

      {/* Selected dates summary */}
      <div className="mt-3 pt-3 border-t text-xs text-gray-600">
        <strong>{selectedDates.length}</strong> datum{selectedDates.length !== 1 ? "s" : ""} geselecteerd
      </div>
    </div>
  );
}
