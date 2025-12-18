export const motivationalQuotes = [
  { text: "Die einzige schlechte Trainingseinheit ist die, die nicht stattgefunden hat.", author: "Unbekannt" },
  { text: "Es ist nicht wichtig, wie langsam du gehst, solange du nicht stehen bleibst.", author: "Konfuzius" },
  { text: "Erfolg ist die Summe kleiner Anstrengungen, Tag für Tag wiederholt.", author: "Robert Collier" },
  { text: "Die größte Entdeckung meiner Generation ist, dass Menschen ihr Leben ändern können, indem sie ihre Einstellung ändern.", author: "William James" },
  { text: "Der Körper erreicht, was der Geist glaubt.", author: "Unbekannt" },
  { text: "Du musst nicht großartig sein, um zu starten, aber du musst starten, um großartig zu werden.", author: "Zig Ziglar" },
  { text: "Stärke kommt nicht aus körperlicher Fähigkeit. Sie entspringt einem unbeugsamen Willen.", author: "Mahatma Gandhi" },
  { text: "Der Schmerz, den du heute fühlst, wird die Stärke sein, die du morgen spürst.", author: "Unbekannt" },
  { text: "Disziplin ist die Brücke zwischen Zielen und Erfolg.", author: "Jim Rohn" },
  { text: "Jeder Champion war einmal ein Anfänger, der sich geweigert hat aufzugeben.", author: "Rocky Balboa" },
  { text: "Hindernisse sind die Dinge, die du siehst, wenn du dein Ziel aus den Augen verlierst.", author: "Henry Ford" },
  { text: "Die einzige Art, großartige Arbeit zu leisten, ist zu lieben, was man tut.", author: "Steve Jobs" },
  { text: "Das Geheimnis des Erfolgs ist anzufangen.", author: "Mark Twain" },
  { text: "Die beste Zeit, einen Baum zu pflanzen, war vor 20 Jahren. Die zweitbeste ist jetzt.", author: "Chinesisches Sprichwort" },
  { text: "Du bist nie zu alt, um dir ein neues Ziel zu setzen oder einen neuen Traum zu träumen.", author: "C.S. Lewis" },
  { text: "Fortschritt, nicht Perfektion.", author: "Unbekannt" },
  { text: "Glaube an dich selbst und all das, was du bist.", author: "Norman Vincent Peale" },
  { text: "Gewinner finden einen Weg, Verlierer finden Ausreden.", author: "Unbekannt" },
  { text: "Was dich nicht umbringt, macht dich stärker.", author: "Friedrich Nietzsche" },
  { text: "Träume nicht dein Leben, lebe deinen Traum.", author: "Unbekannt" },
  { text: "Motivation bringt dich in Gang, Gewohnheit bringt dich weiter.", author: "Jim Ryun" },
  { text: "Der einzige Mensch, mit dem du dich vergleichen solltest, ist der, der du gestern warst.", author: "Unbekannt" },
  { text: "Heute ist ein guter Tag, um ein guter Tag zu sein.", author: "Unbekannt" },
  { text: "Nichts ist unmöglich, das Wort selbst sagt 'Ich bin möglich'.", author: "Audrey Hepburn" },
  { text: "Der Wille zu gewinnen bedeutet nichts ohne den Willen, sich vorzubereiten.", author: "Juma Ikangaa" },
  { text: "Wer aufhört, besser zu werden, hat aufgehört, gut zu sein.", author: "Philip Rosenthal" },
  { text: "Ausdauer wird früher oder später belohnt – meistens aber später.", author: "Wilhelm Busch" },
  { text: "Die Komfortzone ist ein schöner Ort, aber dort wächst nichts.", author: "Unbekannt" },
  { text: "Jeder Tag ist eine neue Chance, das zu werden, was du sein möchtest.", author: "Unbekannt" },
  { text: "Sei du selbst die Veränderung, die du in der Welt sehen willst.", author: "Mahatma Gandhi" }
];

export function getRandomQuote() {
  // Use date-based seed for daily rotation
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % motivationalQuotes.length;
  return motivationalQuotes[index];
}

export function getQuoteForSession() {
  // Get different quote each session based on session storage
  const storedIndex = sessionStorage.getItem('quoteIndex');
  if (storedIndex !== null) {
    return motivationalQuotes[parseInt(storedIndex)];
  }
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  sessionStorage.setItem('quoteIndex', randomIndex.toString());
  return motivationalQuotes[randomIndex];
}
