import { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Scale, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import type { WorkoutRecord, BodyMeasurement } from '../types';

export function CalendarPage() {
  const { darkMode } = useTheme();
  const { getWorkoutsForDate, getMeasurementsForDate, workoutHistory, bodyMeasurements, deleteWorkout } = useWorkout();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState<WorkoutRecord[]>([]);
  const [selectedMeasurements, setSelectedMeasurements] = useState<BodyMeasurement[]>([]);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
        onClose={() => {
          setSelectedDate(null);
          setExpandedWorkout(null);
        }}
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
                  Training ({selectedWorkouts.length})
                </h3>
              </div>
              {selectedWorkouts.map(workout => (
                <div
                  key={workout.id}
                  className={`rounded-lg mb-2 overflow-hidden ${
                    darkMode ? 'bg-dark-border' : 'bg-gray-100'
                  }`}
                >
                  {/* Workout Header */}
                  <div 
                    className={`p-4 cursor-pointer ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    }`}
                    onClick={() => setExpandedWorkout(
                      expandedWorkout === workout.id ? null : workout.id
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {workout.planName || 'Freies Training'}
                        </h4>
                        {workout.dayName && (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {workout.dayName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {workout.duration} Min.
                        </span>
                        {expandedWorkout === workout.id ? (
                          <ChevronUp size={18} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                        ) : (
                          <ChevronDown size={18} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                        )}
                      </div>
                    </div>
                    
                    {/* Summary Stats */}
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {workout.exercises.length} Übungen
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)} Sätze
                      </span>
                      {workout.totalWeight && workout.totalWeight > 0 && (
                        <span className="text-primary font-medium">
                          {workout.totalWeight.toLocaleString()} kg
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedWorkout === workout.id && (
                    <div className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <div className="p-4 space-y-3">
                        {workout.exercises.map(ex => (
                          <div
                            key={ex.id}
                            className={`p-3 rounded ${darkMode ? 'bg-dark-card' : 'bg-white'}`}
                          >
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {ex.exerciseName}
                            </p>
                            {ex.gadget && (
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {ex.gadget}
                              </p>
                            )}
                            <div className="mt-2 space-y-1">
                              {ex.sets.filter(s => s.completed).map(set => (
                                <div
                                  key={set.id}
                                  className={`text-sm flex justify-between ${
                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                  }`}
                                >
                                  <span>Satz {set.setNumber}</span>
                                  <span>
                                    {set.reps} Wdh.
                                    {set.weight && ` × ${set.weight}kg`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delete Button */}
                      <div className="p-4 pt-0">
                        {confirmDelete === workout.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              fullWidth
                              onClick={() => setConfirmDelete(null)}
                            >
                              Abbrechen
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              fullWidth
                              onClick={async () => {
                                await deleteWorkout(workout.id);
                                setSelectedWorkouts(prev => prev.filter(w => w.id !== workout.id));
                                setConfirmDelete(null);
                                if (selectedWorkouts.length <= 1 && selectedMeasurements.length === 0) {
                                  setSelectedDate(null);
                                }
                              }}
                            >
                              Löschen bestätigen
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            fullWidth
                            onClick={() => setConfirmDelete(workout.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                            Training löschen
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
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
                  <div className="grid grid-cols-2 gap-2">
                    {measurement.weight && (
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-sm">Gewicht</span>
                        <p className="font-medium">{measurement.weight} kg</p>
                      </div>
                    )}
                    {measurement.height && (
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-sm">Größe</span>
                        <p className="font-medium">{measurement.height} cm</p>
                      </div>
                    )}
                    {measurement.bodyFat && (
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-sm">Körperfett</span>
                        <p className="font-medium">{measurement.bodyFat} %</p>
                      </div>
                    )}
                    {measurement.chest && (
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-sm">Brust</span>
                        <p className="font-medium">{measurement.chest} cm</p>
                      </div>
                    )}
                    {measurement.arms && (
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-sm">Arme</span>
                        <p className="font-medium">{measurement.arms} cm</p>
                      </div>
                    )}
                    {measurement.waist && (
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-sm">Taille</span>
                        <p className="font-medium">{measurement.waist} cm</p>
                      </div>
                    )}
                    {measurement.legs && (
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-sm">Beine</span>
                        <p className="font-medium">{measurement.legs} cm</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
