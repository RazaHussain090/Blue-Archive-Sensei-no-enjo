export interface Student {
  Id: number;
  IsReleased: boolean[];
  DefaultOrder: number;
  PathName: string;
  DevName: string;
  Name: string;
  Icon: string;
  SearchTags: string[];
  School: string;
  Club: string;
  StarGrade: number;
  SquadType: 'Main' | 'Support';
  TacticRole: string;
  Summons: any[];
  Position: string;
  BulletType: 'Explosion' | 'Pierce' | 'Mystic' | 'Sonic' | 'Normal';
  ArmorType: 'LightArmor' | 'HeavyArmor' | 'SpecialArmor' | 'ElasticArmor';
  StreetBattleAdaptation: number;
  OutdoorBattleAdaptation: number;
  IndoorBattleAdaptation: number;
  WeaponType: string;
  WeaponImg: string;
  Cover: boolean;
  Size: string;
  Equipment: string[];
  CollectionBG: string;
  FamilyName: string;
  PersonalName: string;
  SchoolYear: string;
  CharacterAge: string;
  Birthday: string;
  CharacterSSRNew: string;
  ProfileIntroduction: string;
  Hobby: string;
  CharacterVoice: string;
  BirthDay: string;
  Illustrator: string;
  Designer: string;
  CharHeightMetric: string;
  CharHeightImperial: string;
  StabilityPoint: number;
  AttackPower1: number;
  AttackPower100: number;
  MaxHP1: number;
  MaxHP100: number;
  DefensePower1: number;
  DefensePower100: number;
  HealPower1: number;
  HealPower100: number;
  DodgePoint: number;
  AccuracyPoint: number;
  CriticalPoint: number;
  CriticalDamageRate: number;
  AmmoCount: number;
  AmmoCost: number;
  Range: number;
  SightPoint: number;
  RegenCost: number;
  Skills?: {
    Normal?: any;
    Ex?: {
      Name: string;
      Desc: string;
      Parameters?: (string | number)[][];
      Icon?: string;
    };
    Passive?: {
      Name: string;
      Desc: string;
      Parameters?: (string | number)[][];
      Icon?: string;
    };
    WeaponPassive?: {
      Name: string;
      Desc: string;
      Parameters?: (string | number)[][];
      Icon?: string;
    };
    Public?: {
      Name: string;
      Desc: string;
      Parameters?: (string | number)[][];
      Icon?: string;
    };
  };
}

export const SCHALE_IMAGE_URL = {
  icon: 'https://schaledb.com/images/student/icon',
  portrait: 'https://schaledb.com/images/student/portrait',
  collection: 'https://schaledb.com/images/student/collection',
  lobby: 'https://schaledb.com/images/student/lobby',
  weapon: 'https://schaledb.com/images/weapon'
} as const;

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
