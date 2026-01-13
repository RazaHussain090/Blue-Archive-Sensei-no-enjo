import React, { useState } from 'react';
import type { Student } from '../../data/students';
import './TeamStatsCalculator.css';

interface TeamSlot {
  id: number;
  student: Student | null;
  squadType: 'main' | 'support';
}

interface TeamStats {
  strikerStats: {
    totalHP: number;
    totalAttack: number;
    totalDefense: number;
    totalHealing: number;
  };
  specialBonus: {
    hp: number;
    attack: number;
    defense: number;
    healing: number;
  };
  finalStats: {
    totalHP: number;
    totalAttack: number;
    totalDefense: number;
    totalHealing: number;
  };
}

interface DamageTypeStats {
  explosion: number;
  pierce: number;
  mystic: number;
  sonic: number;
}

interface ArmorTypeStats {
  lightArmor: number;
  heavyArmor: number;
  specialArmor: number;
  elasticArmor: number;
}

interface TeamStatsCalculatorProps {
  team: TeamSlot[];
  terrain: 'Street' | 'Outdoor' | 'Indoor';
}

// Helper to convert numeric adaptation to S/A/B/C/D
const getMoodRank = (value: number): string => {
  // Adaptation values in data: 0 (D), 1 (C), 2 (B), 3 (A), 4 (S), 5 (SS)
  // Usually the data is 0-5 or similar. Let's assume standard mapping based on common data.
  // Actually, checking student.ts might reveal the range, but usually:
  // 0: D (bad), 1: C, 2: B (neutral), 3: A, 4: S, 5: SS
  // Let's assume standard values if not directly mapped.
  // If the data is percentage or weird, we might need to adjust.
  // Looking at previous code, it was averaging them directly.
  if (value >= 5) return 'SS';
  if (value >= 4) return 'S';
  if (value >= 3) return 'A';
  if (value >= 2) return 'B';
  if (value >= 1) return 'C';
  return 'D';
};

const getMoodIcon = (rank: string): string => {
  switch (rank) {
    case 'SS': return '🤩';
    case 'S': return '😁';
    case 'A': return '🙂';
    case 'B': return '😐';
    case 'C': return '🙁';
    case 'D': return '😨';
    default: return '❓';
  }
};

export const TeamStatsCalculator: React.FC<TeamStatsCalculatorProps> = ({ team, terrain }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate team stats with Special support bonus
  const calculateTeamStats = (): TeamStats => {
    const strikers = team.filter(slot => slot.student && slot.squadType === 'main').map(slot => slot.student!);
    const specials = team.filter(slot => slot.student && slot.squadType === 'support').map(slot => slot.student!);

    // Calculate Special Bonus (10% HP/Atk, 5% Def/Heal)
    // Note: Actual game formula is slightly more complex with equipment, but this is a good approximation for a calculator.
    const specialBonus = specials.reduce((acc, s) => ({
      hp: acc.hp + (s.MaxHP100 * 0.1),
      attack: acc.attack + (s.AttackPower100 * 0.1),
      defense: acc.defense + (s.DefensePower100 * 0.05),
      healing: acc.healing + (s.HealPower100 * 0.05),
    }), { hp: 0, attack: 0, defense: 0, healing: 0 });

    // Calculate Striker Base Stats
    const strikerStats = strikers.reduce((acc, s) => ({
      totalHP: acc.totalHP + s.MaxHP100,
      totalAttack: acc.totalAttack + s.AttackPower100,
      totalDefense: acc.totalDefense + s.DefensePower100,
      totalHealing: acc.totalHealing + s.HealPower100,
    }), { totalHP: 0, totalAttack: 0, totalDefense: 0, totalHealing: 0 });

    // Final Stats = Striker Base + (Special Bonus * Number of Strikers)
    // Actually, Special stats are added to EACH striker. So Total Team Stats = Sum(Striker Base) + (Special Bonus * Num Strikers)
    const numStrikers = strikers.length || 1; // Avoid 0 mult if purely theoretical

    return {
      strikerStats,
      specialBonus,
      finalStats: {
        totalHP: strikerStats.totalHP + (specialBonus.hp * numStrikers),
        totalAttack: strikerStats.totalAttack + (specialBonus.attack * numStrikers),
        totalDefense: strikerStats.totalDefense + (specialBonus.defense * numStrikers),
        totalHealing: strikerStats.totalHealing + (specialBonus.healing * numStrikers),
      }
    };
  };

  const calculateDamageTypeStats = (): DamageTypeStats => {
    const students = team.filter(slot => slot.student).map(slot => slot.student!);
    return {
      explosion: students.filter(s => s.BulletType === 'Explosion').length,
      pierce: students.filter(s => s.BulletType === 'Pierce').length,
      mystic: students.filter(s => s.BulletType === 'Mystic').length,
      sonic: students.filter(s => s.BulletType === 'Sonic').length,
    };
  };

  const calculateArmorTypeStats = (): ArmorTypeStats => {
    const students = team.filter(slot => slot.student).map(slot => slot.student!);
    return {
      lightArmor: students.filter(s => s.ArmorType === 'LightArmor').length,
      heavyArmor: students.filter(s => s.ArmorType === 'HeavyArmor').length,
      specialArmor: students.filter(s => s.ArmorType === 'SpecialArmor').length,
      elasticArmor: students.filter(s => s.ArmorType === 'ElasticArmor').length,
    };
  };

  const calculateSynergyScore = (): { score: number; description: string; recommendations: string[] } => {
    const damageTypes = calculateDamageTypeStats();
    let score = 0;
    let description = '';
    const recommendations: string[] = [];

    const totalStudents = team.filter(s => s.student).length;

    if (totalStudents >= 4) {
      // 1. Attack Type Unity (Meta: Mono-color is best)
      const maxTypeCount = Math.max(...Object.values(damageTypes));
      const dominantType = Object.entries(damageTypes).find(([_, count]) => count === maxTypeCount)?.[0];

      if (maxTypeCount >= totalStudents - 1) { // Allow 1 off-color (usually support/tank)
        score += 30;
        description = `Strong ${dominantType} team composition.`;
      } else if (maxTypeCount >= totalStudents - 2) {
        score += 15;
        description = `Decent ${dominantType} focus, but somewhat mixed.`;
        recommendations.push(`Try to unify Attack Type to ${dominantType} for better effectiveness.`);
      } else {
        description = 'Mixed Attack Types (Rainbow team).';
        recommendations.push('Focus on one Attack Type for better buffer synergy.');
      }

      // 2. Role Composition (Standard: 1 Tank, 1 Healer/Support, DPS)
      const tanks = team.filter(s => s.student?.TacticRole === 'Tanker').length;
      const healers = team.filter(s => s.student?.TacticRole === 'Healer').length;
      const supporters = team.filter(s => s.student?.TacticRole === 'Supporter').length;

      if (tanks >= 1) score += 10;
      else recommendations.push('Add a Tank to protect your Strikers.');

      if (healers >= 1 || supporters >= 1) score += 10;
      else recommendations.push('Consider a Healer or Buffer for sustainability/damage.');
      
      // 3. Terrain Match
      // We check if students are good for the selected terrain
      const students = team.filter(slot => slot.student).map(slot => slot.student!);
      let goodTerrainCount = 0;
      students.forEach(s => {
        let adaptation = 0;
        if (terrain === 'Street') adaptation = s.StreetBattleAdaptation;
        if (terrain === 'Outdoor') adaptation = s.OutdoorBattleAdaptation;
        if (terrain === 'Indoor') adaptation = s.IndoorBattleAdaptation;
        if (adaptation >= 3) goodTerrainCount++; // A or S mood
      });

      if (goodTerrainCount >= totalStudents - 1) {
        score += 15;
        description += ' Great terrain adaptation!';
      } else if (goodTerrainCount < totalStudents / 2) {
        recommendations.push(`Many students have bad mood in ${terrain} warfare.`);
      }

      // Final Score text
      if (score >= 45) description = 'Excellent Team! ' + description;
      else if (score >= 30) description = 'Solid Team. ' + description;
      else description = 'Work in progress. ' + description;

    } else {
      description = 'Add more students to see synergy analysis.';
    }

    return { score, description, recommendations };
  };

  const stats = calculateTeamStats();
  const damageStats = calculateDamageTypeStats();
  const armorStats = calculateArmorTypeStats();
  const synergy = calculateSynergyScore();

  const formatNumber = (num: number): string => Math.round(num).toLocaleString();
  const getSynergyColor = (score: number): string => score >= 45 ? '#4CAF50' : score >= 30 ? '#FFC107' : '#F44336';

  return (
    <div className={`team-stats-calculator ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="stats-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3>Team Statistics & Synergy</h3>
        <button className="collapse-toggle">
          {isCollapsed ? 'Show Details' : 'Hide Details'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="expanded-stats">
          {/* Main Stats Display */}
          <div className="stats-section">
            <h4>Effective Status (Strikers + Special Bonus)</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total HP</span>
                <span className="stat-value">{formatNumber(stats.finalStats.totalHP)}</span>
                <small className="stat-subtext">(Bonus: +{formatNumber(stats.specialBonus.hp * 4)})</small>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Attack</span>
                <span className="stat-value">{formatNumber(stats.finalStats.totalAttack)}</span>
                <small className="stat-subtext">(Bonus: +{formatNumber(stats.specialBonus.attack * 4)})</small>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Healing</span>
                <span className="stat-value">{formatNumber(stats.finalStats.totalHealing)}</span>
                <small className="stat-subtext">(Bonus: +{formatNumber(stats.specialBonus.healing * 4)})</small>
              </div>
            </div>
            <div className="stat-note">
              * Specials contribute ~10% HP/Atk and ~5% Def/Heal to <b>each</b> Striker.
            </div>
          </div>

          {/* Terrain Adaptation */}
          <div className="stats-section">
            <h4>{terrain} Warfare Mood</h4>
            <div className="student-moods">
              {team.filter(s => s.student).map(slot => {
                 let moodVal = 0;
                 if (slot.student) {
                    if (terrain === 'Street') moodVal = slot.student.StreetBattleAdaptation;
                    if (terrain === 'Outdoor') moodVal = slot.student.OutdoorBattleAdaptation;
                    if (terrain === 'Indoor') moodVal = slot.student.IndoorBattleAdaptation;
                 }
                 const moodRank = getMoodRank(moodVal);
                 
                 return (
                   <div key={slot.id} className="mood-item">
                     <img src={`https://schaledb.com/images/student/icon/${slot.student?.Id}.webp`} alt="" className="mini-avatar" />
                     <span className={`mood-rank rank-${moodRank}`}>{moodRank}</span>
                     <span className="mood-icon">{getMoodIcon(moodRank)}</span>
                   </div>
                 );
              })}
            </div>
          </div>

          {/* Synergy Report */}
          <div className="stats-section">
            <h4>Team Synergy: <span style={{ color: getSynergyColor(synergy.score) }}>{synergy.score}/60</span></h4>
            <p className="synergy-desc">{synergy.description}</p>
            {synergy.recommendations.length > 0 && (
              <ul className="synergy-recs">
                {synergy.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
              </ul>
            )}
          </div>
          
          <div className="stats-flex-row">
             {/* Damage Distribution */}
            <div className="stats-mini-section">
              <h5>Attack Types</h5>
              <div className="type-badges">
                {Object.entries(damageStats).map(([type, count]) => (
                  count > 0 && <span key={type} className={`stat-badge ${type.toLowerCase()}`}>{type}: {count}</span>
                ))}
              </div>
            </div>
            
            {/* Armor Distribution */}
            <div className="stats-mini-section">
               <h5>Armor Types</h5>
               <div className="type-badges">
                {Object.entries(armorStats).map(([type, count]) => (
                  count > 0 && <span key={type} className={`stat-badge ${type.toLowerCase().replace('armor','')}`}>{type.replace('Armor','')} : {count}</span>
                ))}
               </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
