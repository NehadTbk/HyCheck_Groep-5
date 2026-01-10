import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useTranslation } from "../../i18n/useTranslation";
import { useLanguage } from "../../i18n/useLanguage";

export default function DateCalendar({ selectedDates, setSelectedDates }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { language, letLanguage } = useLanguage();
  const { t } = useTranslation();

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
      // Deselect
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
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

    // Check if this day is a weekend (0 = Sunday, 6 = Saturday)
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    calendarDays.push(
      <button
        key={day}
        onClick={() => !isWeekend && toggleDate(day)}
        disabled={isWeekend}
        className={`h-8 w-full rounded text-xs font-medium transition ${isWeekend
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : selected
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
          title={t("dateCalendar.previousMonth")}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {currentMonth.toLocaleDateString(language, {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={goToToday}
            className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded"
          >
            {t("dateCalendar.today")}
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded"
          title={t("dateCalendar.nextMonth")}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(2021, 7, i + 1); // willekeurige week
          return (
            <div
              key={i}
              className="text-center text-xs font-medium text-gray-600"
            >
              {date.toLocaleDateString(language, { weekday: "short" })}
            </div>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays}
      </div>

      {/* Selected dates summary */}
      <div className="mt-3 pt-3 border-t text-xs text-gray-600">
        <strong>{selectedDates.length}</strong>{" "} {t("dateCalendar.date")} {selectedDates.length !== 1 ? "s" : ""} {t("dateCalendar.selected")}
      </div>
    </div>
  );
}
