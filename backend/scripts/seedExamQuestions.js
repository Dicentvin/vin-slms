/**
 * seedExamQuestions.js
 * Seeds 3 exams (Biology, Chemistry, Physics) with 20 MCQ questions each.
 *
 * Usage:
 *   node scripts/seedExamQuestions.js
 *
 * Requirements:
 *   - .env with MONGO_URI set
 *   - An admin user must already exist in DB (script finds the first admin)
 */

import "dotenv/config";
import mongoose from "mongoose";
import Exam from "../models/Exam.js";
import User from "../models/User.js";

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error("❌  MONGODB_URL not set in .env");
  process.exit(1);
}

// ─── Biology Questions ────────────────────────────────────────────────────────
const biologyQuestions = [
  {
    text: "Which organelle is known as the 'powerhouse of the cell'?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Nucleus" },
      { id: "b", text: "Ribosome" },
      { id: "c", text: "Mitochondria" },
      { id: "d", text: "Golgi apparatus" },
    ],
    correctAnswer: "c",
    explanation: "Mitochondria produce ATP via cellular respiration, earning the nickname 'powerhouse of the cell'.",
  },
  {
    text: "The process by which plants make their own food using sunlight is called:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Respiration" },
      { id: "b", text: "Photosynthesis" },
      { id: "c", text: "Transpiration" },
      { id: "d", text: "Fermentation" },
    ],
    correctAnswer: "b",
    explanation: "Photosynthesis converts CO₂ and water into glucose and oxygen using light energy.",
  },
  {
    text: "Which of the following is NOT a component of blood?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Red blood cells" },
      { id: "b", text: "White blood cells" },
      { id: "c", text: "Platelets" },
      { id: "d", text: "Nephrons" },
    ],
    correctAnswer: "d",
    explanation: "Nephrons are the functional units of the kidney, not components of blood.",
  },
  {
    text: "DNA is located primarily in the:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Cytoplasm" },
      { id: "b", text: "Cell membrane" },
      { id: "c", text: "Nucleus" },
      { id: "d", text: "Ribosome" },
    ],
    correctAnswer: "c",
    explanation: "The nucleus houses the cell's genetic material (DNA) in the form of chromosomes.",
  },
  {
    text: "Which vitamin is produced when the skin is exposed to sunlight?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Vitamin A" },
      { id: "b", text: "Vitamin B12" },
      { id: "c", text: "Vitamin C" },
      { id: "d", text: "Vitamin D" },
    ],
    correctAnswer: "d",
    explanation: "UV-B radiation from sunlight triggers Vitamin D synthesis in the skin.",
  },
  {
    text: "The basic unit of heredity is called a:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Chromosome" },
      { id: "b", text: "Gene" },
      { id: "c", text: "Allele" },
      { id: "d", text: "Gamete" },
    ],
    correctAnswer: "b",
    explanation: "A gene is a segment of DNA that encodes a functional product such as a protein.",
  },
  {
    text: "Which part of the human brain controls balance and coordination?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Cerebrum" },
      { id: "b", text: "Medulla oblongata" },
      { id: "c", text: "Cerebellum" },
      { id: "d", text: "Hypothalamus" },
    ],
    correctAnswer: "c",
    explanation: "The cerebellum coordinates voluntary movements and maintains balance.",
  },
  {
    text: "Osmosis is best described as the movement of:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Solutes from high to low concentration" },
      { id: "b", text: "Water through a semi-permeable membrane from low to high solute concentration" },
      { id: "c", text: "Gases across a cell membrane" },
      { id: "d", text: "Nutrients from the gut into the bloodstream" },
    ],
    correctAnswer: "b",
    explanation: "Osmosis is the passive diffusion of water molecules across a semi-permeable membrane.",
  },
  {
    text: "Which type of cell division produces gametes (sperm and egg cells)?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Mitosis" },
      { id: "b", text: "Binary fission" },
      { id: "c", text: "Meiosis" },
      { id: "d", text: "Budding" },
    ],
    correctAnswer: "c",
    explanation: "Meiosis reduces the chromosome number by half to produce haploid gametes.",
  },
  {
    text: "Which organ produces insulin in the human body?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Liver" },
      { id: "b", text: "Kidney" },
      { id: "c", text: "Spleen" },
      { id: "d", text: "Pancreas" },
    ],
    correctAnswer: "d",
    explanation: "The beta cells of the islets of Langerhans in the pancreas secrete insulin.",
  },
  {
    text: "Chlorophyll in plants is responsible for absorbing which colour of light most efficiently?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Green" },
      { id: "b", text: "Red and Blue" },
      { id: "c", text: "Yellow" },
      { id: "d", text: "Ultraviolet" },
    ],
    correctAnswer: "b",
    explanation: "Chlorophyll absorbs red (~680 nm) and blue (~430 nm) light most effectively.",
  },
  {
    text: "The structural and functional unit of the kidney is the:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Alveolus" },
      { id: "b", text: "Neuron" },
      { id: "c", text: "Nephron" },
      { id: "d", text: "Villus" },
    ],
    correctAnswer: "c",
    explanation: "Each kidney contains about 1 million nephrons that filter blood to form urine.",
  },
  {
    text: "Which blood group is considered the universal donor?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "AB+" },
      { id: "b", text: "O-" },
      { id: "c", text: "A+" },
      { id: "d", text: "B-" },
    ],
    correctAnswer: "b",
    explanation: "O- red blood cells lack A, B, and Rh antigens and can be given to any recipient.",
  },
  {
    text: "Transpiration in plants mainly occurs through the:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Roots" },
      { id: "b", text: "Stem" },
      { id: "c", text: "Stomata" },
      { id: "d", text: "Flowers" },
    ],
    correctAnswer: "c",
    explanation: "Stomata are tiny pores on leaves through which water vapour is released.",
  },
  {
    text: "Which macromolecule serves as the primary source of energy for the body?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Proteins" },
      { id: "b", text: "Lipids" },
      { id: "c", text: "Carbohydrates" },
      { id: "d", text: "Vitamins" },
    ],
    correctAnswer: "c",
    explanation: "Carbohydrates are broken down to glucose, the body's preferred energy currency.",
  },
  {
    text: "Which gas is produced as a byproduct of photosynthesis?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Carbon dioxide" },
      { id: "b", text: "Nitrogen" },
      { id: "c", text: "Oxygen" },
      { id: "d", text: "Hydrogen" },
    ],
    correctAnswer: "c",
    explanation: "Oxygen is released during the light-dependent reactions when water is split (photolysis).",
  },
  {
    text: "In which phase of mitosis do chromosomes line up at the cell equator?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Prophase" },
      { id: "b", text: "Metaphase" },
      { id: "c", text: "Anaphase" },
      { id: "d", text: "Telophase" },
    ],
    correctAnswer: "b",
    explanation: "During metaphase, chromosomes align at the metaphase plate (cell equator).",
  },
  {
    text: "The theory of evolution by natural selection was proposed by:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Gregor Mendel" },
      { id: "b", text: "Louis Pasteur" },
      { id: "c", text: "Charles Darwin" },
      { id: "d", text: "Robert Hooke" },
    ],
    correctAnswer: "c",
    explanation: "Charles Darwin published 'On the Origin of Species' in 1859, outlining natural selection.",
  },
  {
    text: "Which part of the eye is responsible for adjusting the amount of light entering?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Cornea" },
      { id: "b", text: "Retina" },
      { id: "c", text: "Lens" },
      { id: "d", text: "Iris" },
    ],
    correctAnswer: "d",
    explanation: "The iris controls the size of the pupil, regulating the amount of light that enters the eye.",
  },
  {
    text: "Enzymes are biological catalysts that are made up of:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Carbohydrates" },
      { id: "b", text: "Lipids" },
      { id: "c", text: "Proteins" },
      { id: "d", text: "Nucleic acids" },
    ],
    correctAnswer: "c",
    explanation: "Enzymes are proteins whose 3D structure creates a specific active site for substrates.",
  },
];

// ─── Chemistry Questions ──────────────────────────────────────────────────────
const chemistryQuestions = [
  {
    text: "The atomic number of an element represents the number of:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Neutrons in the nucleus" },
      { id: "b", text: "Protons in the nucleus" },
      { id: "c", text: "Electrons in the outer shell" },
      { id: "d", text: "Nucleons in the nucleus" },
    ],
    correctAnswer: "b",
    explanation: "The atomic number equals the number of protons (and electrons in a neutral atom).",
  },
  {
    text: "Which of the following is a physical change?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Burning wood" },
      { id: "b", text: "Rusting iron" },
      { id: "c", text: "Melting ice" },
      { id: "d", text: "Cooking an egg" },
    ],
    correctAnswer: "c",
    explanation: "Melting ice is reversible and involves no change in chemical composition.",
  },
  {
    text: "What is the chemical formula of water?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "H₂O₂" },
      { id: "b", text: "HO" },
      { id: "c", text: "H₂O" },
      { id: "d", text: "H₃O" },
    ],
    correctAnswer: "c",
    explanation: "Water consists of two hydrogen atoms covalently bonded to one oxygen atom.",
  },
  {
    text: "Which element is represented by the symbol 'Fe'?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Fluorine" },
      { id: "b", text: "Iron" },
      { id: "c", text: "Francium" },
      { id: "d", text: "Fermium" },
    ],
    correctAnswer: "b",
    explanation: "Fe comes from the Latin 'ferrum', meaning iron.",
  },
  {
    text: "Which type of bond involves the sharing of electron pairs between atoms?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Ionic bond" },
      { id: "b", text: "Metallic bond" },
      { id: "c", text: "Covalent bond" },
      { id: "d", text: "Hydrogen bond" },
    ],
    correctAnswer: "c",
    explanation: "Covalent bonds form when atoms share one or more pairs of electrons.",
  },
  {
    text: "The pH of a neutral solution at 25°C is:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "0" },
      { id: "b", text: "7" },
      { id: "c", text: "14" },
      { id: "d", text: "10" },
    ],
    correctAnswer: "b",
    explanation: "Pure water has a pH of 7 because [H⁺] = [OH⁻] = 1 × 10⁻⁷ mol/L.",
  },
  {
    text: "Which gas is produced when zinc reacts with dilute hydrochloric acid?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Chlorine" },
      { id: "b", text: "Oxygen" },
      { id: "c", text: "Hydrogen" },
      { id: "d", text: "Carbon dioxide" },
    ],
    correctAnswer: "c",
    explanation: "Zn + 2HCl → ZnCl₂ + H₂↑. Hydrogen gas is released, burning with a squeaky pop.",
  },
  {
    text: "Avogadro's number (6.022 × 10²³) refers to the number of particles in:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "1 gram of any substance" },
      { id: "b", text: "1 litre of any gas" },
      { id: "c", text: "1 mole of any substance" },
      { id: "d", text: "1 kilogram of any element" },
    ],
    correctAnswer: "c",
    explanation: "One mole of any substance contains exactly 6.022 × 10²³ representative particles.",
  },
  {
    text: "Which of the following is an example of a homogeneous mixture?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Sand and water" },
      { id: "b", text: "Oil and water" },
      { id: "c", text: "Salt dissolved in water" },
      { id: "d", text: "Iron filings and sulfur" },
    ],
    correctAnswer: "c",
    explanation: "Salt water is a uniform (homogeneous) solution where solute is evenly distributed.",
  },
  {
    text: "The process of converting a liquid to gas at its boiling point is called:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Sublimation" },
      { id: "b", text: "Condensation" },
      { id: "c", text: "Evaporation" },
      { id: "d", text: "Vaporisation" },
    ],
    correctAnswer: "d",
    explanation: "Vaporisation (specifically boiling) occurs when liquid reaches its boiling point and becomes gas.",
  },
  {
    text: "Which of the following elements belongs to the halogen group?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Sodium (Na)" },
      { id: "b", text: "Chlorine (Cl)" },
      { id: "c", text: "Calcium (Ca)" },
      { id: "d", text: "Argon (Ar)" },
    ],
    correctAnswer: "b",
    explanation: "Chlorine is in Group 17 (halogens), known for their high reactivity and 7 valence electrons.",
  },
  {
    text: "The law that states 'the volume of a fixed mass of gas is inversely proportional to its pressure at constant temperature' is:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Charles's Law" },
      { id: "b", text: "Gay-Lussac's Law" },
      { id: "c", text: "Boyle's Law" },
      { id: "d", text: "Dalton's Law" },
    ],
    correctAnswer: "c",
    explanation: "Boyle's Law: P₁V₁ = P₂V₂ at constant temperature.",
  },
  {
    text: "An atom that has gained or lost electrons is called a(n):",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Isotope" },
      { id: "b", text: "Ion" },
      { id: "c", text: "Molecule" },
      { id: "d", text: "Allotrope" },
    ],
    correctAnswer: "b",
    explanation: "Ions are charged particles formed when atoms gain electrons (anions) or lose electrons (cations).",
  },
  {
    text: "Which product is formed at the cathode during electrolysis of dilute sulfuric acid?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Oxygen" },
      { id: "b", text: "Sulfur dioxide" },
      { id: "c", text: "Hydrogen" },
      { id: "d", text: "Sulfuric acid" },
    ],
    correctAnswer: "c",
    explanation: "H⁺ ions migrate to the cathode (negative electrode) and are discharged as hydrogen gas.",
  },
  {
    text: "What is the oxidation state of oxygen in most compounds?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "+2" },
      { id: "b", text: "0" },
      { id: "c", text: "-2" },
      { id: "d", text: "-1" },
    ],
    correctAnswer: "c",
    explanation: "Oxygen typically has an oxidation state of -2 (except in peroxides and F₂O).",
  },
  {
    text: "The reaction between an acid and a base is called:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Decomposition" },
      { id: "b", text: "Neutralisation" },
      { id: "c", text: "Combustion" },
      { id: "d", text: "Displacement" },
    ],
    correctAnswer: "b",
    explanation: "Neutralisation: acid + base → salt + water. The H⁺ and OH⁻ ions combine to form water.",
  },
  {
    text: "Which allotrope of carbon is used as a lubricant?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Diamond" },
      { id: "b", text: "Fullerene" },
      { id: "c", text: "Graphite" },
      { id: "d", text: "Coal" },
    ],
    correctAnswer: "c",
    explanation: "Graphite's layered structure allows layers to slide over each other, making it a good lubricant.",
  },
  {
    text: "Which type of reaction involves a substance combining with oxygen to release heat and light?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Reduction" },
      { id: "b", text: "Combustion" },
      { id: "c", text: "Hydrolysis" },
      { id: "d", text: "Precipitation" },
    ],
    correctAnswer: "b",
    explanation: "Combustion is an exothermic oxidation reaction producing heat and usually light.",
  },
  {
    text: "The smallest particle of an element that retains the chemical properties of that element is a(n):",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Molecule" },
      { id: "b", text: "Ion" },
      { id: "c", text: "Atom" },
      { id: "d", text: "Electron" },
    ],
    correctAnswer: "c",
    explanation: "The atom is the fundamental unit of an element that retains its chemical identity.",
  },
  {
    text: "Which of the following is a property of metals?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "They are poor conductors of electricity" },
      { id: "b", text: "They are generally brittle" },
      { id: "c", text: "They have high melting points and are malleable" },
      { id: "d", text: "They are transparent" },
    ],
    correctAnswer: "c",
    explanation: "Metals are typically good conductors, malleable, ductile, lustrous, and have high melting points.",
  },
];

// ─── Physics Questions ────────────────────────────────────────────────────────
const physicsQuestions = [
  {
    text: "Which of the following is the SI unit of force?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Joule" },
      { id: "b", text: "Watt" },
      { id: "c", text: "Newton" },
      { id: "d", text: "Pascal" },
    ],
    correctAnswer: "c",
    explanation: "The newton (N) is the SI unit of force. 1 N = 1 kg·m/s².",
  },
  {
    text: "Newton's second law of motion states that force equals:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Mass ÷ acceleration" },
      { id: "b", text: "Mass × velocity" },
      { id: "c", text: "Mass × acceleration" },
      { id: "d", text: "Weight × time" },
    ],
    correctAnswer: "c",
    explanation: "F = ma: Force equals mass multiplied by acceleration.",
  },
  {
    text: "The speed of light in a vacuum is approximately:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "3 × 10⁶ m/s" },
      { id: "b", text: "3 × 10⁸ m/s" },
      { id: "c", text: "3 × 10¹⁰ m/s" },
      { id: "d", text: "3 × 10⁴ m/s" },
    ],
    correctAnswer: "b",
    explanation: "The speed of light in a vacuum is c ≈ 3 × 10⁸ m/s (299,792,458 m/s exactly).",
  },
  {
    text: "Which type of wave does NOT require a medium to travel?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Sound waves" },
      { id: "b", text: "Water waves" },
      { id: "c", text: "Electromagnetic waves" },
      { id: "d", text: "Seismic waves" },
    ],
    correctAnswer: "c",
    explanation: "Electromagnetic waves (including light) can propagate through a vacuum with no medium.",
  },
  {
    text: "The law of conservation of energy states that energy can be:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Created but not destroyed" },
      { id: "b", text: "Destroyed but not created" },
      { id: "c", text: "Neither created nor destroyed, only transformed" },
      { id: "d", text: "Created and destroyed in equal amounts" },
    ],
    correctAnswer: "c",
    explanation: "Energy is conserved: the total energy in an isolated system remains constant.",
  },
  {
    text: "Ohm's Law states that voltage (V) equals:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Current × Resistance (V = IR)" },
      { id: "b", text: "Current ÷ Resistance" },
      { id: "c", text: "Power × Time" },
      { id: "d", text: "Charge × Time" },
    ],
    correctAnswer: "a",
    explanation: "V = IR: voltage equals current multiplied by resistance.",
  },
  {
    text: "Which form of electromagnetic radiation has the shortest wavelength?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Radio waves" },
      { id: "b", text: "Visible light" },
      { id: "c", text: "Gamma rays" },
      { id: "d", text: "Infrared waves" },
    ],
    correctAnswer: "c",
    explanation: "Gamma rays have the shortest wavelengths (< 0.01 nm) and highest frequencies in the EM spectrum.",
  },
  {
    text: "A body is in equilibrium when the net force acting on it is:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Maximum" },
      { id: "b", text: "Equal to its weight" },
      { id: "c", text: "Zero" },
      { id: "d", text: "Constant and non-zero" },
    ],
    correctAnswer: "c",
    explanation: "Equilibrium requires the vector sum of all forces (and torques) to equal zero.",
  },
  {
    text: "The phenomenon of a ball bouncing back after hitting a wall is explained by Newton's:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "First Law" },
      { id: "b", text: "Second Law" },
      { id: "c", text: "Third Law" },
      { id: "d", text: "Law of Gravitation" },
    ],
    correctAnswer: "c",
    explanation: "Newton's Third Law: for every action there is an equal and opposite reaction.",
  },
  {
    text: "The unit of electrical power is:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Joule" },
      { id: "b", text: "Watt" },
      { id: "c", text: "Volt" },
      { id: "d", text: "Ampere" },
    ],
    correctAnswer: "b",
    explanation: "Power is measured in watts (W). P = IV = I²R = V²/R.",
  },
  {
    text: "Which type of mirror is used as a rear-view mirror in vehicles?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Concave mirror" },
      { id: "b", text: "Plane mirror" },
      { id: "c", text: "Convex mirror" },
      { id: "d", text: "Parabolic mirror" },
    ],
    correctAnswer: "c",
    explanation: "Convex mirrors give a wider field of view and always produce diminished, upright, virtual images.",
  },
  {
    text: "The acceleration due to gravity on the surface of the Earth is approximately:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "6.67 m/s²" },
      { id: "b", text: "9.8 m/s²" },
      { id: "c", text: "10.8 m/s²" },
      { id: "d", text: "8.9 m/s²" },
    ],
    correctAnswer: "b",
    explanation: "g ≈ 9.8 m/s² (often approximated as 10 m/s² in calculations).",
  },
  {
    text: "Which of the following is a scalar quantity?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Velocity" },
      { id: "b", text: "Acceleration" },
      { id: "c", text: "Force" },
      { id: "d", text: "Speed" },
    ],
    correctAnswer: "d",
    explanation: "Speed has only magnitude, not direction. Velocity, acceleration, and force are vectors.",
  },
  {
    text: "The bending of light as it passes from one medium to another is called:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Reflection" },
      { id: "b", text: "Diffraction" },
      { id: "c", text: "Refraction" },
      { id: "d", text: "Dispersion" },
    ],
    correctAnswer: "c",
    explanation: "Refraction occurs because light changes speed when entering a different optical medium.",
  },
  {
    text: "A transformer increases voltage. This type of transformer is called a:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Step-down transformer" },
      { id: "b", text: "Step-up transformer" },
      { id: "c", text: "Current transformer" },
      { id: "d", text: "Power transformer" },
    ],
    correctAnswer: "b",
    explanation: "Step-up transformers have more turns in the secondary coil than the primary coil.",
  },
  {
    text: "The Doppler effect describes the change in _____ due to relative motion between source and observer:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Speed of a wave" },
      { id: "b", text: "Amplitude of a wave" },
      { id: "c", text: "Frequency of a wave" },
      { id: "d", text: "Wavelength only" },
    ],
    correctAnswer: "c",
    explanation: "The Doppler effect: observed frequency increases as source approaches and decreases as it moves away.",
  },
  {
    text: "Radioactive decay where an electron is emitted from the nucleus is called:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Alpha decay" },
      { id: "b", text: "Beta decay" },
      { id: "c", text: "Gamma decay" },
      { id: "d", text: "Positron emission" },
    ],
    correctAnswer: "b",
    explanation: "Beta (β⁻) decay: a neutron converts to a proton plus an electron (beta particle) and antineutrino.",
  },
  {
    text: "Which formula correctly gives kinetic energy?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "KE = mgh" },
      { id: "b", text: "KE = ½mv²" },
      { id: "c", text: "KE = mv" },
      { id: "d", text: "KE = Fs" },
    ],
    correctAnswer: "b",
    explanation: "KE = ½mv², where m is mass in kg and v is velocity in m/s.",
  },
  {
    text: "The pressure exerted by a liquid at depth h is given by:",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "P = mgh" },
      { id: "b", text: "P = ρhg" },
      { id: "c", text: "P = ρg/h" },
      { id: "d", text: "P = hg/ρ" },
    ],
    correctAnswer: "b",
    explanation: "Liquid pressure P = ρgh, where ρ is density, g is gravitational acceleration, h is depth.",
  },
  {
    text: "Which particle carries a negative charge in an atom?",
    type: "mcq",
    marks: 1,
    options: [
      { id: "a", text: "Proton" },
      { id: "b", text: "Neutron" },
      { id: "c", text: "Electron" },
      { id: "d", text: "Nucleus" },
    ],
    correctAnswer: "c",
    explanation: "Electrons (charge = -1.6 × 10⁻¹⁹ C) orbit the nucleus and carry negative charge.",
  },
];

// ─── Seed function ────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGODB_URL);
  console.log("✅  Connected to MongoDB");

  // Find admin user
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("❌  No admin user found. Run seedAdmin.js first.");
    process.exit(1);
  }
  console.log(`👤  Using admin: ${admin.name} (${admin._id})`);

  const examsToCreate = [
    {
      title: "Biology — Core Concepts (SS3/WAEC)",
      description: "Covers cell biology, genetics, physiology, and ecology. 20 MCQ questions.",
      subject: "Biology",
      className: "WAEC",
      type: "mcq",
      duration: 30,
      passMark: 50,
      status: "draft",
      allowReview: true,
      shuffleQ: false,
      shuffleOpts: false,
      attemptsAllowed: 1,
      questions: biologyQuestions,
    },
    {
      title: "Chemistry — Core Concepts (SS3/WAEC)",
      description: "Covers atomic structure, bonding, reactions, and organic chemistry. 20 MCQ questions.",
      subject: "Chemistry",
      className: "WAEC",
      type: "mcq",
      duration: 30,
      passMark: 50,
      status: "draft",
      allowReview: true,
      shuffleQ: false,
      shuffleOpts: false,
      attemptsAllowed: 1,
      questions: chemistryQuestions,
    },
    {
      title: "Physics — Core Concepts (SS3/WAEC)",
      description: "Covers mechanics, waves, electricity, and modern physics. 20 MCQ questions.",
      subject: "Physics",
      className: "WAEC",
      type: "mcq",
      duration: 30,
      passMark: 50,
      status: "draft",
      allowReview: true,
      shuffleQ: false,
      shuffleOpts: false,
      attemptsAllowed: 1,
      questions: physicsQuestions,
    },
  ];

  let created = 0;
  for (const examData of examsToCreate) {
    // Avoid duplicates
    const exists = await Exam.findOne({ title: examData.title });
    if (exists) {
      console.log(`⏭️   Already exists: "${examData.title}" — skipping`);
      continue;
    }
    const exam = await Exam.create({
      ...examData,
      createdBy: admin._id,
      creatorName: admin.name,
    });
    console.log(`✅  Created exam: "${exam.title}" (${exam.questions.length} questions, ${exam.totalMarks} marks)`);
    created++;
  }

  console.log(`\n🎉  Done. ${created} exam(s) seeded. Activate them from the Admin Dashboard.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
