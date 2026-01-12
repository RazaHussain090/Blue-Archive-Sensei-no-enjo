export interface Student {
  id: string;
  name: string;
  school: string;
  role: 'Striker' | 'Special';
  attackType: 'Explosive' | 'Piercing' | 'Mystic' | 'Sonic';
  armorType: 'Light' | 'Heavy' | 'Special' | 'Elastic';
  avatarUrl: string; // Placeholder for now
}

export const students: Student[] = [
  {
    id: '1',
    name: 'Shiroko',
    school: 'Abydos',
    role: 'Striker',
    attackType: 'Explosive',
    armorType: 'Light',
    avatarUrl: 'https://placehold.co/100x100?text=Shiroko',
  },
  {
    id: '2',
    name: 'Hoshino',
    school: 'Abydos',
    role: 'Striker',
    attackType: 'Piercing',
    armorType: 'Heavy',
    avatarUrl: 'https://placehold.co/100x100?text=Hoshino',
  },
  {
    id: '3',
    name: 'Aru',
    school: 'Gehenna',
    role: 'Striker',
    attackType: 'Explosive',
    armorType: 'Light',
    avatarUrl: 'https://placehold.co/100x100?text=Aru',
  },
   {
    id: '4',
    name: 'Hina',
    school: 'Gehenna',
    role: 'Striker',
    attackType: 'Explosive',
    armorType: 'Heavy',
    avatarUrl: 'https://placehold.co/100x100?text=Hina',
  },
  {
    id: '5',
    name: 'Mika',
    school: 'Trinity',
    role: 'Striker',
    attackType: 'Piercing',
    armorType: 'Heavy',
    avatarUrl: 'https://placehold.co/100x100?text=Mika',
  },
];
