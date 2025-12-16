import { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Scale } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { Modal } from '../components/Modal';
import type { WorkoutRecord, BodyMeasurement } from '../types';

export function CalendarPage() {
  const { darkMode } = useTheme();
  const { getWorkoutsForDate, getMeasurementsForDate, workoutHistory, bodyMeasurements } = useWorkout();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState<WorkoutRecord[]>([]);
  const [selectedMeasurements, setSelectedMeasurements] = useState<BodyMeasurement[]>([]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const workouts = getWorkoutsForDate(clickedDate);
    const measurements = getMeasurementsForDate(clickedDate);

    if (workouts.length > 0 || measurements.length > 0) {
      setSelectedDate(clickedDate);
      setSelectedWorkouts(workouts);
      setSelectedMeasurements(measurements);
    }
  };

  const hasWorkout = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return workoutHistory.some(w => {
      const workoutDate = new Date(w.date);
      return workoutDate.toDateString() === checkDate.toDateString();
    });
  };

  const hasMeasurement = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return bodyMeasurements.some(m => {
      const measurementDate = new Date(m.date);
      return measurementDate.toDateString() === checkDate.toDateString();
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'bg-dark' : 'bg-light'}`}>
      {/* Header */}
      <div className={`p-6 ${darkMode ? 'bg-dark-card' : 'bg-light-card'}`}>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Kalender
        </h1>
      </div>

      {/* Calendar */}
      <div className="p-4">
        <div className={`rounded-xl overflow-hidden ${
          darkMode ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border'
        }`}>
          {/* Month Navigation */}
          <div className={`flex justify-between items-center p-4 border-b ${
            darkMode ? 'border-dark-border' : 'border-light-border'
          }`}>
            <button
              onClick={() => navigateMonth('prev')}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'hover:bg-dark-border text-gray-400' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'hover:bg-dark-border text-gray-400' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Day Names */}
          <div className={`grid grid-cols-7 border-b ${
            darkMode ? 'border-dark-border' : 'border-light-border'
          }`}>
            {dayNames.map(day => (
              <div
                key={day}
                className={`p-2 text-center text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: adjustedFirstDay }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const hasWorkoutToday = hasWorkout(day);
              const hasMeasurementToday = hasMeasurement(day);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square p-1 relative flex flex-col items-center justify-center transition-colors ${
                    hasWorkoutToday || hasMeasurementToday
                      ? 'cursor-pointer hover:bg-primary/20'
                      : ''
                  }`}
                >
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                      isTodayDate
                        ? 'bg-primary text-white font-bold'
                        : hasWorkoutToday
                        ? darkMode
                          ? 'text-white font-medium'
                          : 'text-gray-900 font-medium'
                        : darkMode
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </span>

                  {/* Indicators */}
                  <div className="flex gap-1 mt-1">
                    {hasWorkoutToday && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    {hasMeasurementToday && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className={`mt-4 flex gap-6 justify-center text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Körpermaße</span>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      <Modal
        isOpen={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        title={selectedDate?.toLocaleDateString('de-DE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      >
        <div className="space-y-4">
          {/* Workouts */}
          {selectedWorkouts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell size={20} className="text-primary" />
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Training
                </h3>
              </div>
              {selectedWorkouts.map(workout => (
                <div
                  key={workout.id}
                  className={`p-4 rounded-lg mb-2 ${
                    darkMode ? 'bg-dark-border' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {workout.planName || 'Freies Training'}
                      </h4>
                      {workout.dayName && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {workout.dayName}
                        </p>
                      )}
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {workout.duration} Min.
                    </span>
                  </div>
                  <div className="space-y-1">
                    {workout.exercises.map(ex => (
                      <div
                        key={ex.id}
                        className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {ex.exerciseName} - {ex.sets.length} Sätze
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Measurements */}
          {selectedMeasurements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scale size={20} className="text-blue-500" />
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Körpermaße
                </h3>
              </div>
              {selectedMeasurements.map(measurement => (
                <div
                  key={measurement.id}
                  className={`p-4 rounded-lg ${
                    darkMode ? 'bg-dark-border' : 'bg-gray-100'
                  }`}
                >
                  {measurement.weight && (
                    <div className={`flex justify-between ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <span>Gewicht</span>
                      <span className="font-medium">{measurement.weight} kg</span>
                    </div>
                  )}
                  {measurement.height && (
                    <div className={`flex justify-between ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <span>Größe</span>
                      <span className="font-medium">{measurement.height} cm</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
