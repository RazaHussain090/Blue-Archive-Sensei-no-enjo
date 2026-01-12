export interface Student {
  Id: number;
  Name: string;
  School: string;
  SquadType: 'Main' | 'Support';
  TacticRole: string; // DamageDealer, Tank, etc.
  BulletType: 'Explosion' | 'Pierce' | 'Mystic' | 'Sonic' | 'Normal';
  ArmorType: 'LightArmor' | 'HeavyArmor' | 'SpecialArmor' | 'ElasticArmor';
  PathName: string;
  Icon?: string;
  StarGrade: number;
  IsReleased: boolean[]; // [Jp, Global, Cn]
}

export const SCHALE_IMAGE_URL = 'https://schaledb.com/images/student/icon';

export async function fetchStudents(): Promise<Student[]> {
  try {
    const response = await fetch('/data/students.json');
    if (!response.ok) {
      throw new Error('Failed to load student data');
    }
    const data: Record<string, Student> = await response.json();
    return Object.values(data).filter(s => s.IsReleased[1]); // Only global released students? Or all? Let's show all for now, maybe filter later.
    // Actually, usually IsReleased[1] is Global.
  } catch (error) {
    console.error(error);
    return [];
  }
}
