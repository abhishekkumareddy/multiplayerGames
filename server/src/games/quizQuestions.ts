export interface QuizQuestionItem {
  id: string;
  question: string;
  category: string;
  options: string[];
  correctOption: number;
  explanation: string;
  timeLimitSec: number;
}

export const QUIZ_QUESTIONS: QuizQuestionItem[] = [
  // Gaming
  {
    id: 'game-1',
    category: 'Gaming',
    question: 'What is the highest-selling video game of all time?',
    options: ['Grand Theft Auto V', 'Minecraft', 'Tetris', 'Wii Sports'],
    correctOption: 1,
    explanation: 'Minecraft has sold over 300 million copies worldwide across all platforms!',
    timeLimitSec: 12,
  },
  {
    id: 'game-2',
    category: 'Gaming',
    question: 'What was Mario’s original profession before he became a plumber?',
    options: ['Carpenter', 'Chef', 'Blacksmith', 'Sailor'],
    correctOption: 0,
    explanation: 'In the original 1981 Donkey Kong arcade game, Mario (named Jumpman) was a carpenter!',
    timeLimitSec: 12,
  },
  {
    id: 'game-3',
    category: 'Gaming',
    question: 'In Pokémon, which starter Pokémon is Grass-type in the Kanto region?',
    options: ['Charmander', 'Squirtle', 'Bulbasaur', 'Chikorita'],
    correctOption: 2,
    explanation: 'Bulbasaur is Pokémon #001 and the classic Gen 1 Grass/Poison starter.',
    timeLimitSec: 12,
  },
  {
    id: 'game-4',
    category: 'Gaming',
    question: 'Which legendary game studio created Half-Life, Portal, and Steam?',
    options: ['Epic Games', 'Valve', 'Blizzard', 'id Software'],
    correctOption: 1,
    explanation: 'Valve Corporation was founded by Gabe Newell and Mike Harrington in 1996.',
    timeLimitSec: 12,
  },
  {
    id: 'game-5',
    category: 'Gaming',
    question: 'What is the iconic cheat code: Up Up Down Down Left Right Left Right B A?',
    options: ['The Blizzard Code', 'The Capcom Code', 'The Konami Code', 'The Sega Genesis Code'],
    correctOption: 2,
    explanation: 'The Konami Code was created by Kazuhisa Hashimoto for Gradius on the NES in 1986.',
    timeLimitSec: 12,
  },

  // Tech & Computing
  {
    id: 'tech-1',
    category: 'Tech',
    question: 'What does "HTTP" stand for in web browsing?',
    options: [
      'HyperText Transfer Protocol',
      'High-Speed Text Transmission Program',
      'Hyperlink Tagging Transport Platform',
      'Hybrid Transmission Text Path'
    ],
    correctOption: 0,
    explanation: 'HyperText Transfer Protocol (HTTP) is the foundational protocol used by the World Wide Web.',
    timeLimitSec: 12,
  },
  {
    id: 'tech-2',
    category: 'Tech',
    question: 'Who created the Linux operating system kernel?',
    options: ['Linus Torvalds', 'Steve Wozniak', 'Richard Stallman', 'Dennis Ritchie'],
    correctOption: 0,
    explanation: 'Linus Torvalds released the first version of Linux in 1991 while a student in Helsinki.',
    timeLimitSec: 12,
  },
  {
    id: 'tech-3',
    category: 'Tech',
    question: 'What programming language is widely known as the "language of the web"?',
    options: ['Python', 'C++', 'JavaScript', 'Ruby'],
    correctOption: 2,
    explanation: 'JavaScript was created in 10 days by Brendan Eich at Netscape in 1995!',
    timeLimitSec: 12,
  },
  {
    id: 'tech-4',
    category: 'Tech',
    question: 'What is the binary representation of the decimal number 10?',
    options: ['1010', '1001', '1100', '1110'],
    correctOption: 0,
    explanation: '8 + 2 = 10, which in 4-bit binary is 1010!',
    timeLimitSec: 12,
  },
  {
    id: 'tech-5',
    category: 'Tech',
    question: 'Which company acquired GitHub in 2018 for $7.5 billion?',
    options: ['Google', 'Microsoft', 'Amazon', 'Meta'],
    correctOption: 1,
    explanation: 'Microsoft acquired GitHub in June 2018 under CEO Satya Nadella.',
    timeLimitSec: 12,
  },

  // Science & Space
  {
    id: 'sci-1',
    category: 'Science',
    question: 'What is the closest planet to the Sun in our Solar System?',
    options: ['Venus', 'Mercury', 'Mars', 'Earth'],
    correctOption: 1,
    explanation: 'Mercury is the closest planet, orbiting the sun once every 88 Earth days.',
    timeLimitSec: 12,
  },
  {
    id: 'sci-2',
    category: 'Science',
    question: 'What is the chemical symbol for Gold on the periodic table?',
    options: ['Ag', 'Fe', 'Au', 'Gd'],
    correctOption: 2,
    explanation: 'Au comes from the Latin word "Aurum", meaning shining dawn!',
    timeLimitSec: 12,
  },
  {
    id: 'sci-3',
    category: 'Science',
    question: 'How fast does light travel in a vacuum approximately?',
    options: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '3,000 km/s'],
    correctOption: 0,
    explanation: 'Light travels at approximately 299,792 km per second (approx 300,000 km/s).',
    timeLimitSec: 12,
  },
  {
    id: 'sci-4',
    category: 'Science',
    question: 'Which gas makes up approximately 78% of Earth’s atmosphere?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
    correctOption: 2,
    explanation: 'Earth’s atmosphere is composed of roughly 78% Nitrogen and 21% Oxygen.',
    timeLimitSec: 12,
  },

  // Pop Culture & Fun
  {
    id: 'pop-1',
    category: 'Pop Culture',
    question: 'In the Marvel Cinematic Universe, what is Thor’s enchanted hammer named?',
    options: ['Stormbreaker', 'Mjolnir', 'Gungnir', 'Aegis'],
    correctOption: 1,
    explanation: 'Mjolnir was forged from the heart of a dying star in Nidavellir.',
    timeLimitSec: 12,
  },
  {
    id: 'pop-2',
    category: 'Pop Culture',
    question: 'What is the name of the fictional kingdom in Disney’s "Frozen"?',
    options: ['Corona', 'Arendelle', 'DunBroch', 'Genovia'],
    correctOption: 1,
    explanation: 'Arendelle is the Scandinavian-inspired kingdom ruled by Elsa and Anna.',
    timeLimitSec: 12,
  },
  {
    id: 'pop-3',
    category: 'Pop Culture',
    question: 'Which actor played Iron Man (Tony Stark) in the MCU from 2008 to 2019?',
    options: ['Chris Evans', 'Robert Downey Jr.', 'Mark Ruffalo', 'Chris Hemsworth'],
    correctOption: 1,
    explanation: 'Robert Downey Jr. launched the Marvel Cinematic Universe with 2008’s Iron Man.',
    timeLimitSec: 12,
  },
  {
    id: 'pop-4',
    category: 'Pop Culture',
    question: 'In "The Matrix", what color pill does Neo take to wake up in the real world?',
    options: ['Blue', 'Red', 'Green', 'Yellow'],
    correctOption: 1,
    explanation: 'Morpheus offers the blue pill to stay in the dream or the red pill to see the truth.',
    timeLimitSec: 12,
  },
  {
    id: 'pop-5',
    category: 'Pop Culture',
    question: 'What is the name of Batman’s faithful butler and guardian?',
    options: ['Jarvis', 'Alfred Pennyworth', 'Lucius Fox', 'Jim Gordon'],
    correctOption: 1,
    explanation: 'Alfred Pennyworth has looked after Bruce Wayne since childhood.',
    timeLimitSec: 12,
  },
];
