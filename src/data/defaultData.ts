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
