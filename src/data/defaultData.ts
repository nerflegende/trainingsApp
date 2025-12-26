import type { Exercise, Gadget } from '../types';

export const defaultExercises: Exercise[] = [
  // Chest
  {
    id: 'bench-press',
    name: 'Bankdrücken',
    description: 'Klassische Brustübung mit der Langhantel auf der Flachbank.',
    muscles: ['Brust', 'Trizeps', 'Schultern'],
    gadgets: ['Langhantel', 'Hantelbank'],
    isCustom: false
  },
  {
    id: 'incline-bench-press',
    name: 'Schrägbankdrücken',
    description: 'Brustübung auf der Schrägbank für die obere Brust.',
    muscles: ['Obere Brust', 'Trizeps', 'Schultern'],
    gadgets: ['Langhantel', 'Schrägbank'],
    isCustom: false
  },
  {
    id: 'dumbbell-flyes',
    name: 'Kurzhantel Flys',
    description: 'Isolationsübung für die Brustmuskulatur.',
    muscles: ['Brust'],
    gadgets: ['Kurzhanteln', 'Hantelbank'],
    isCustom: false
  },
  {
    id: 'push-ups',
    name: 'Liegestütze',
    description: 'Grundübung für Brust, Schultern und Trizeps mit dem eigenen Körpergewicht.',
    muscles: ['Brust', 'Trizeps', 'Schultern', 'Core'],
    gadgets: [],
    isCustom: false
  },
  {
    id: 'dips',
    name: 'Dips',
    description: 'Übung am Barren für Brust und Trizeps.',
    muscles: ['Brust', 'Trizeps', 'Schultern'],
    gadgets: ['Dip-Barren'],
    isCustom: false
  },

  // Back
  {
    id: 'deadlift',
    name: 'Kreuzheben',
    description: 'Grundübung für die gesamte hintere Kette.',
    muscles: ['Unterer Rücken', 'Beinbeuger', 'Gesäß', 'Trapezius'],
    gadgets: ['Langhantel'],
    isCustom: false
  },
  {
    id: 'pull-ups',
    name: 'Klimmzüge',
    description: 'Grundübung für den Latissimus und Bizeps.',
    muscles: ['Latissimus', 'Bizeps', 'Unterarme'],
    gadgets: ['Klimmzugstange'],
    isCustom: false
  },
  {
    id: 'barbell-row',
    name: 'Langhantelrudern',
    description: 'Ruderübung für den oberen Rücken.',
    muscles: ['Latissimus', 'Trapezius', 'Bizeps', 'Rhomboiden'],
    gadgets: ['Langhantel'],
    isCustom: false
  },
  {
    id: 'lat-pulldown',
    name: 'Latzug',
    description: 'Kabelzugübung für den Latissimus.',
    muscles: ['Latissimus', 'Bizeps'],
    gadgets: ['Kabelzug'],
    isCustom: false
  },
  {
    id: 'seated-cable-row',
    name: 'Kabelrudern',
    description: 'Ruderübung am Kabelzug.',
    muscles: ['Latissimus', 'Trapezius', 'Bizeps', 'Rhomboiden'],
    gadgets: ['Kabelzug'],
    isCustom: false
  },

  // Legs
  {
    id: 'squat',
    name: 'Kniebeugen',
    description: 'Grundübung für die Beinmuskulatur.',
    muscles: ['Quadrizeps', 'Gesäß', 'Beinbeuger', 'Core'],
    gadgets: ['Langhantel', 'Squat Rack'],
    isCustom: false
  },
  {
    id: 'leg-press',
    name: 'Beinpresse',
    description: 'Maschinenübung für die Beine.',
    muscles: ['Quadrizeps', 'Gesäß', 'Beinbeuger'],
    gadgets: ['Beinpresse'],
    isCustom: false
  },
  {
    id: 'leg-curl',
    name: 'Beincurls',
    description: 'Isolationsübung für die Beinbeuger.',
    muscles: ['Beinbeuger'],
    gadgets: ['Beincurl-Maschine'],
    isCustom: false
  },
  {
    id: 'leg-extension',
    name: 'Beinstrecker',
    description: 'Isolationsübung für den Quadrizeps.',
    muscles: ['Quadrizeps'],
    gadgets: ['Beinstrecker-Maschine'],
    isCustom: false
  },
  {
    id: 'calf-raises',
    name: 'Wadenheben',
    description: 'Übung für die Wadenmuskulatur.',
    muscles: ['Waden'],
    gadgets: ['Wadenheben-Maschine'],
    isCustom: false
  },
  {
    id: 'pistol-squat',
    name: 'Pistol Squat',
    description: 'Einbeinige Kniebeuge - anspruchsvolle Calisthenics-Übung.',
    muscles: ['Quadrizeps', 'Gesäß', 'Balance'],
    gadgets: [],
    isCustom: false
  },

  // Shoulders
  {
    id: 'overhead-press',
    name: 'Schulterdrücken',
    description: 'Grundübung für die Schultern.',
    muscles: ['Schultern', 'Trizeps'],
    gadgets: ['Langhantel'],
    isCustom: false
  },
  {
    id: 'lateral-raises',
    name: 'Seitheben',
    description: 'Isolationsübung für die seitliche Schulter.',
    muscles: ['Seitliche Schulter'],
    gadgets: ['Kurzhanteln'],
    isCustom: false
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    description: 'Übung am Kabelzug für die hintere Schulter.',
    muscles: ['Hintere Schulter', 'Trapezius'],
    gadgets: ['Kabelzug'],
    isCustom: false
  },
  {
    id: 'handstand-push-ups',
    name: 'Handstand Liegestütze',
    description: 'Fortgeschrittene Calisthenics-Übung für die Schultern.',
    muscles: ['Schultern', 'Trizeps', 'Core'],
    gadgets: [],
    isCustom: false
  },

  // Arms
  {
    id: 'bicep-curls',
    name: 'Bizeps Curls',
    description: 'Isolationsübung für den Bizeps.',
    muscles: ['Bizeps'],
    gadgets: ['Kurzhanteln'],
    isCustom: false
  },
  {
    id: 'hammer-curls',
    name: 'Hammer Curls',
    description: 'Variation der Bizeps Curls für den Brachialis.',
    muscles: ['Bizeps', 'Brachialis'],
    gadgets: ['Kurzhanteln'],
    isCustom: false
  },
  {
    id: 'tricep-pushdown',
    name: 'Trizeps Pushdown',
    description: 'Isolationsübung für den Trizeps am Kabelzug.',
    muscles: ['Trizeps'],
    gadgets: ['Kabelzug'],
    isCustom: false
  },
  {
    id: 'skull-crushers',
    name: 'Skull Crushers',
    description: 'Trizepsübung mit der Langhantel.',
    muscles: ['Trizeps'],
    gadgets: ['Langhantel', 'Hantelbank'],
    isCustom: false
  },

  // Core
  {
    id: 'plank',
    name: 'Plank',
    description: 'Statische Übung für die Core-Stabilität.',
    muscles: ['Core', 'Schultern'],
    gadgets: [],
    isCustom: false
  },
  {
    id: 'crunches',
    name: 'Crunches',
    description: 'Klassische Bauchübung.',
    muscles: ['Bauch'],
    gadgets: [],
    isCustom: false
  },
  {
    id: 'leg-raises',
    name: 'Beinheben',
    description: 'Übung für den unteren Bauch.',
    muscles: ['Unterer Bauch'],
    gadgets: ['Klimmzugstange'],
    isCustom: false
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    description: 'Rotationsübung für die seitliche Bauchmuskulatur.',
    muscles: ['Seitliche Bauchmuskeln'],
    gadgets: ['Medizinball'],
    isCustom: false
  },
  {
    id: 'l-sit',
    name: 'L-Sit',
    description: 'Statische Calisthenics-Übung für Core und Trizeps.',
    muscles: ['Core', 'Trizeps', 'Hüftbeuger'],
    gadgets: ['Parallettes'],
    isCustom: false
  },

  // Calisthenics
  {
    id: 'muscle-up',
    name: 'Muscle Up',
    description: 'Fortgeschrittene Übung, die Klimmzug und Dip kombiniert.',
    muscles: ['Latissimus', 'Brust', 'Trizeps', 'Schultern'],
    gadgets: ['Klimmzugstange', 'Ringe'],
    isCustom: false
  },
  {
    id: 'front-lever',
    name: 'Front Lever',
    description: 'Fortgeschrittene statische Halteübung.',
    muscles: ['Latissimus', 'Core', 'Schultern'],
    gadgets: ['Klimmzugstange', 'Ringe'],
    isCustom: false
  },
  {
    id: 'back-lever',
    name: 'Back Lever',
    description: 'Fortgeschrittene statische Halteübung in Rücklage.',
    muscles: ['Schultern', 'Core', 'Bizeps'],
    gadgets: ['Ringe'],
    isCustom: false
  },
  {
    id: 'human-flag',
    name: 'Human Flag',
    description: 'Fortgeschrittene Calisthenics-Übung an der Stange.',
    muscles: ['Seitliche Bauchmuskeln', 'Schultern', 'Latissimus'],
    gadgets: ['Vertikale Stange'],
    isCustom: false
  },
  {
    id: 'planche',
    name: 'Planche',
    description: 'Eine der anspruchsvollsten Calisthenics-Übungen.',
    muscles: ['Schultern', 'Trizeps', 'Core'],
    gadgets: ['Parallettes'],
    isCustom: false
  }
];

export const defaultGadgets: Gadget[] = [
  {
    id: 'barbell',
    name: 'Langhantel',
    description: 'Standardhantel für Grundübungen.',
    isCustom: false
  },
  {
    id: 'dumbbells',
    name: 'Kurzhanteln',
    description: 'Paar Kurzhanteln für isolierte Übungen.',
    isCustom: false
  },
  {
    id: 'pull-up-bar',
    name: 'Klimmzugstange',
    description: 'Stange für Klimmzüge und hängende Übungen.',
    isCustom: false
  },
  {
    id: 'dip-bars',
    name: 'Dip-Barren',
    description: 'Parallele Stangen für Dips.',
    isCustom: false
  },
  {
    id: 'bench',
    name: 'Hantelbank',
    description: 'Flachbank für verschiedene Übungen.',
    isCustom: false
  },
  {
    id: 'incline-bench',
    name: 'Schrägbank',
    description: 'Verstellbare Bank für Schrägbankübungen.',
    isCustom: false
  },
  {
    id: 'squat-rack',
    name: 'Squat Rack',
    description: 'Gestell für Kniebeugen und andere Übungen.',
    isCustom: false
  },
  {
    id: 'cable-machine',
    name: 'Kabelzug',
    description: 'Maschine mit Seilzügen für verschiedene Übungen.',
    isCustom: false
  },
  {
    id: 'leg-press-machine',
    name: 'Beinpresse',
    description: 'Maschine für Beinpresse.',
    isCustom: false
  },
  {
    id: 'leg-curl-machine',
    name: 'Beincurl-Maschine',
    description: 'Maschine für Beincurls.',
    isCustom: false
  },
  {
    id: 'leg-extension-machine',
    name: 'Beinstrecker-Maschine',
    description: 'Maschine für Beinstrecker.',
    isCustom: false
  },
  {
    id: 'calf-raise-machine',
    name: 'Wadenheben-Maschine',
    description: 'Maschine für Wadenheben.',
    isCustom: false
  },
  {
    id: 'rings',
    name: 'Ringe',
    description: 'Turnringe für Calisthenics-Übungen.',
    isCustom: false
  },
  {
    id: 'parallettes',
    name: 'Parallettes',
    description: 'Kleine parallele Stangen für Bodenübungen.',
    isCustom: false
  },
  {
    id: 'resistance-bands',
    name: 'Widerstandsbänder',
    description: 'Elastische Bänder für Unterstützung oder Widerstand.',
    isCustom: false
  },
  {
    id: 'medicine-ball',
    name: 'Medizinball',
    description: 'Gewichteter Ball für Core-Übungen.',
    isCustom: false
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell',
    description: 'Kugelhantel für dynamische Übungen.',
    isCustom: false
  },
  {
    id: 'ez-bar',
    name: 'EZ-Stange',
    description: 'Gebogene Stange für Bizeps-Übungen.',
    isCustom: false
  },
  {
    id: 'foam-roller',
    name: 'Faszienrolle',
    description: 'Rolle für Selbstmassage und Mobilität.',
    isCustom: false
  },
  {
    id: 'ab-wheel',
    name: 'Bauchroller',
    description: 'Rad für Core-Übungen.',
    isCustom: false
  }
];

// Default workout plan templates
export interface WorkoutPlanTemplate {
  id: string;
  name: string;
  description: string;
  days: {
    id: string;
    name: string;
    exercises: {
      id: string;
      exerciseId: string;
      exerciseName: string;
      sets: number;
      targetReps: number;
      gadget?: string;
    }[];
  }[];
}

export const defaultWorkoutPlans: WorkoutPlanTemplate[] = [
  {
    id: 'ppl-template',
    name: 'Push Pull Legs (PPL)',
    description: '3er Split für Fortgeschrittene',
    days: [
      {
        id: 'ppl-push',
        name: 'Push (Brust, Schultern, Trizeps)',
        exercises: [
          { id: 'ppl-p1', exerciseId: 'bench-press', exerciseName: 'Bankdrücken', sets: 4, targetReps: 8, gadget: 'Langhantel' },
          { id: 'ppl-p2', exerciseId: 'incline-bench-press', exerciseName: 'Schrägbankdrücken', sets: 3, targetReps: 10, gadget: 'Langhantel' },
          { id: 'ppl-p3', exerciseId: 'overhead-press', exerciseName: 'Schulterdrücken', sets: 4, targetReps: 8, gadget: 'Langhantel' },
          { id: 'ppl-p4', exerciseId: 'lateral-raises', exerciseName: 'Seitheben', sets: 3, targetReps: 12, gadget: 'Kurzhanteln' },
          { id: 'ppl-p5', exerciseId: 'tricep-pushdown', exerciseName: 'Trizeps Pushdown', sets: 3, targetReps: 12, gadget: 'Kabelzug' },
          { id: 'ppl-p6', exerciseId: 'dips', exerciseName: 'Dips', sets: 3, targetReps: 10, gadget: 'Dip-Barren' }
        ]
      },
      {
        id: 'ppl-pull',
        name: 'Pull (Rücken, Bizeps)',
        exercises: [
          { id: 'ppl-pu1', exerciseId: 'deadlift', exerciseName: 'Kreuzheben', sets: 4, targetReps: 6, gadget: 'Langhantel' },
          { id: 'ppl-pu2', exerciseId: 'pull-ups', exerciseName: 'Klimmzüge', sets: 4, targetReps: 8, gadget: 'Klimmzugstange' },
          { id: 'ppl-pu3', exerciseId: 'barbell-row', exerciseName: 'Langhantelrudern', sets: 4, targetReps: 8, gadget: 'Langhantel' },
          { id: 'ppl-pu4', exerciseId: 'lat-pulldown', exerciseName: 'Latzug', sets: 3, targetReps: 10, gadget: 'Kabelzug' },
          { id: 'ppl-pu5', exerciseId: 'face-pulls', exerciseName: 'Face Pulls', sets: 3, targetReps: 15, gadget: 'Kabelzug' },
          { id: 'ppl-pu6', exerciseId: 'bicep-curls', exerciseName: 'Bizeps Curls', sets: 3, targetReps: 12, gadget: 'Kurzhanteln' }
        ]
      },
      {
        id: 'ppl-legs',
        name: 'Legs (Beine)',
        exercises: [
          { id: 'ppl-l1', exerciseId: 'squat', exerciseName: 'Kniebeugen', sets: 4, targetReps: 8, gadget: 'Langhantel' },
          { id: 'ppl-l2', exerciseId: 'leg-press', exerciseName: 'Beinpresse', sets: 3, targetReps: 10, gadget: 'Beinpresse' },
          { id: 'ppl-l3', exerciseId: 'leg-curl', exerciseName: 'Beincurls', sets: 3, targetReps: 12, gadget: 'Beincurl-Maschine' },
          { id: 'ppl-l4', exerciseId: 'leg-extension', exerciseName: 'Beinstrecker', sets: 3, targetReps: 12, gadget: 'Beinstrecker-Maschine' },
          { id: 'ppl-l5', exerciseId: 'calf-raises', exerciseName: 'Wadenheben', sets: 4, targetReps: 15, gadget: 'Wadenheben-Maschine' }
        ]
      }
    ]
  },
  {
    id: 'fullbody-template',
    name: 'Ganzkörper',
    description: 'Ideal für Anfänger, 3x pro Woche',
    days: [
      {
        id: 'fb-day1',
        name: 'Ganzkörper A',
        exercises: [
          { id: 'fb-a1', exerciseId: 'squat', exerciseName: 'Kniebeugen', sets: 3, targetReps: 8, gadget: 'Langhantel' },
          { id: 'fb-a2', exerciseId: 'bench-press', exerciseName: 'Bankdrücken', sets: 3, targetReps: 8, gadget: 'Langhantel' },
          { id: 'fb-a3', exerciseId: 'barbell-row', exerciseName: 'Langhantelrudern', sets: 3, targetReps: 8, gadget: 'Langhantel' },
          { id: 'fb-a4', exerciseId: 'overhead-press', exerciseName: 'Schulterdrücken', sets: 3, targetReps: 10, gadget: 'Langhantel' },
          { id: 'fb-a5', exerciseId: 'bicep-curls', exerciseName: 'Bizeps Curls', sets: 2, targetReps: 12, gadget: 'Kurzhanteln' },
          { id: 'fb-a6', exerciseId: 'plank', exerciseName: 'Plank', sets: 3, targetReps: 45 }
        ]
      },
      {
        id: 'fb-day2',
        name: 'Ganzkörper B',
        exercises: [
          { id: 'fb-b1', exerciseId: 'deadlift', exerciseName: 'Kreuzheben', sets: 3, targetReps: 6, gadget: 'Langhantel' },
          { id: 'fb-b2', exerciseId: 'incline-bench-press', exerciseName: 'Schrägbankdrücken', sets: 3, targetReps: 8, gadget: 'Langhantel' },
          { id: 'fb-b3', exerciseId: 'pull-ups', exerciseName: 'Klimmzüge', sets: 3, targetReps: 8, gadget: 'Klimmzugstange' },
          { id: 'fb-b4', exerciseId: 'lateral-raises', exerciseName: 'Seitheben', sets: 3, targetReps: 12, gadget: 'Kurzhanteln' },
          { id: 'fb-b5', exerciseId: 'tricep-pushdown', exerciseName: 'Trizeps Pushdown', sets: 2, targetReps: 12, gadget: 'Kabelzug' },
          { id: 'fb-b6', exerciseId: 'leg-raises', exerciseName: 'Beinheben', sets: 3, targetReps: 12, gadget: 'Klimmzugstange' }
        ]
      }
    ]
  },
  {
    id: 'upper-lower-template',
    name: 'Oberkörper/Unterkörper',
    description: '4er Split, 2x Ober/Unterkörper pro Woche',
    days: [
      {
        id: 'ul-upper1',
        name: 'Oberkörper A',
        exercises: [
          { id: 'ul-ua1', exerciseId: 'bench-press', exerciseName: 'Bankdrücken', sets: 4, targetReps: 8, gadget: 'Langhantel' },
          { id: 'ul-ua2', exerciseId: 'barbell-row', exerciseName: 'Langhantelrudern', sets: 4, targetReps: 8, gadget: 'Langhantel' },
          { id: 'ul-ua3', exerciseId: 'overhead-press', exerciseName: 'Schulterdrücken', sets: 3, targetReps: 10, gadget: 'Langhantel' },
          { id: 'ul-ua4', exerciseId: 'lat-pulldown', exerciseName: 'Latzug', sets: 3, targetReps: 10, gadget: 'Kabelzug' },
          { id: 'ul-ua5', exerciseId: 'bicep-curls', exerciseName: 'Bizeps Curls', sets: 3, targetReps: 12, gadget: 'Kurzhanteln' },
          { id: 'ul-ua6', exerciseId: 'tricep-pushdown', exerciseName: 'Trizeps Pushdown', sets: 3, targetReps: 12, gadget: 'Kabelzug' }
        ]
      },
      {
        id: 'ul-lower1',
        name: 'Unterkörper A',
        exercises: [
          { id: 'ul-la1', exerciseId: 'squat', exerciseName: 'Kniebeugen', sets: 4, targetReps: 8, gadget: 'Langhantel' },
          { id: 'ul-la2', exerciseId: 'leg-press', exerciseName: 'Beinpresse', sets: 3, targetReps: 10, gadget: 'Beinpresse' },
          { id: 'ul-la3', exerciseId: 'leg-curl', exerciseName: 'Beincurls', sets: 3, targetReps: 12, gadget: 'Beincurl-Maschine' },
          { id: 'ul-la4', exerciseId: 'leg-extension', exerciseName: 'Beinstrecker', sets: 3, targetReps: 12, gadget: 'Beinstrecker-Maschine' },
          { id: 'ul-la5', exerciseId: 'calf-raises', exerciseName: 'Wadenheben', sets: 4, targetReps: 15, gadget: 'Wadenheben-Maschine' }
        ]
      },
      {
        id: 'ul-upper2',
        name: 'Oberkörper B',
        exercises: [
          { id: 'ul-ub1', exerciseId: 'incline-bench-press', exerciseName: 'Schrägbankdrücken', sets: 4, targetReps: 8, gadget: 'Langhantel' },
          { id: 'ul-ub2', exerciseId: 'pull-ups', exerciseName: 'Klimmzüge', sets: 4, targetReps: 8, gadget: 'Klimmzugstange' },
          { id: 'ul-ub3', exerciseId: 'dumbbell-flyes', exerciseName: 'Kurzhantel Flys', sets: 3, targetReps: 12, gadget: 'Kurzhanteln' },
          { id: 'ul-ub4', exerciseId: 'seated-cable-row', exerciseName: 'Kabelrudern', sets: 3, targetReps: 10, gadget: 'Kabelzug' },
          { id: 'ul-ub5', exerciseId: 'face-pulls', exerciseName: 'Face Pulls', sets: 3, targetReps: 15, gadget: 'Kabelzug' },
          { id: 'ul-ub6', exerciseId: 'hammer-curls', exerciseName: 'Hammer Curls', sets: 3, targetReps: 12, gadget: 'Kurzhanteln' }
        ]
      },
      {
        id: 'ul-lower2',
        name: 'Unterkörper B',
        exercises: [
          { id: 'ul-lb1', exerciseId: 'deadlift', exerciseName: 'Kreuzheben', sets: 4, targetReps: 6, gadget: 'Langhantel' },
          { id: 'ul-lb2', exerciseId: 'leg-press', exerciseName: 'Beinpresse', sets: 3, targetReps: 12, gadget: 'Beinpresse' },
          { id: 'ul-lb3', exerciseId: 'leg-curl', exerciseName: 'Beincurls', sets: 3, targetReps: 12, gadget: 'Beincurl-Maschine' },
          { id: 'ul-lb4', exerciseId: 'calf-raises', exerciseName: 'Wadenheben', sets: 4, targetReps: 15, gadget: 'Wadenheben-Maschine' },
          { id: 'ul-lb5', exerciseId: 'plank', exerciseName: 'Plank', sets: 3, targetReps: 60 }
        ]
      }
    ]
  },
  {
    id: 'calisthenics-template',
    name: 'Calisthenics Basics',
    description: 'Training mit dem eigenen Körpergewicht',
    days: [
      {
        id: 'cal-day1',
        name: 'Upper Body',
        exercises: [
          { id: 'cal-u1', exerciseId: 'push-ups', exerciseName: 'Liegestütze', sets: 4, targetReps: 15 },
          { id: 'cal-u2', exerciseId: 'pull-ups', exerciseName: 'Klimmzüge', sets: 4, targetReps: 8, gadget: 'Klimmzugstange' },
          { id: 'cal-u3', exerciseId: 'dips', exerciseName: 'Dips', sets: 3, targetReps: 10, gadget: 'Dip-Barren' },
          { id: 'cal-u4', exerciseId: 'handstand-push-ups', exerciseName: 'Handstand Liegestütze', sets: 3, targetReps: 5 },
          { id: 'cal-u5', exerciseId: 'plank', exerciseName: 'Plank', sets: 3, targetReps: 60 }
        ]
      },
      {
        id: 'cal-day2',
        name: 'Lower Body & Core',
        exercises: [
          { id: 'cal-l1', exerciseId: 'pistol-squat', exerciseName: 'Pistol Squat', sets: 3, targetReps: 5 },
          { id: 'cal-l2', exerciseId: 'leg-raises', exerciseName: 'Beinheben', sets: 4, targetReps: 12, gadget: 'Klimmzugstange' },
          { id: 'cal-l3', exerciseId: 'l-sit', exerciseName: 'L-Sit', sets: 3, targetReps: 20, gadget: 'Parallettes' },
          { id: 'cal-l4', exerciseId: 'russian-twists', exerciseName: 'Russian Twists', sets: 3, targetReps: 20 },
          { id: 'cal-l5', exerciseId: 'crunches', exerciseName: 'Crunches', sets: 3, targetReps: 20 }
        ]
      }
    ]
  }
];
