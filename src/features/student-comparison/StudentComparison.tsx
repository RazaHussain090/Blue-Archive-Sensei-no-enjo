import React, { useState, useEffect, useRef } from 'react';
import { fetchStudents, SCHALE_IMAGE_URL } from '../../data/students';
import type { Student } from '../../data/students';
import './StudentComparison.css';

interface ComparisonSlot {
  student: Student | null;
  level: number;
  skillLevel: number;
}

interface StudentComparisonProps {
  onClose?: () => void;
}

// Equipment slot types and their stat bonuses
const EQUIPMENT_TYPES: Record<string, { name: string; statBonus: string; maxTier: number }> = {
  Hat: { name: 'Hat', statBonus: 'MaxHP', maxTier: 9 },
  Gloves: { name: 'Gloves', statBonus: 'AttackPower', maxTier: 9 },
  Shoes: { name: 'Shoes', statBonus: 'HealPower', maxTier: 9 },
  Bag: { name: 'Bag', statBonus: 'DefensePower', maxTier: 9 },
  Badge: { name: 'Badge', statBonus: 'CriticalPoint', maxTier: 9 },
  Hairpin: { name: 'Hairpin', statBonus: 'CriticalDamageRate', maxTier: 9 },
  Charm: { name: 'Charm', statBonus: 'AccuracyPoint', maxTier: 9 },
  Watch: { name: 'Watch', statBonus: 'DodgePoint', maxTier: 9 },
  Necklace: { name: 'Necklace', statBonus: 'Range', maxTier: 9 },
};

// Base equipment stat bonuses per tier (simplified approximation)
const EQUIPMENT_TIER_MULTIPLIER = [0, 50, 120, 200, 300, 420, 560, 720, 900, 1100];

export const StudentComparison: React.FC<StudentComparisonProps> = ({ onClose }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);
  const [slots, setSlots] = useState<ComparisonSlot[]>([
    { student: null, level: 80, skillLevel: 7 },
    { student: null, level: 80, skillLevel: 7 },
  ]);
  const [equipmentTiers, setEquipmentTiers] = useState<number[][]>([
    [1, 1, 1], // Current equipment for slot 1
    [1, 1, 1], // Current equipment for slot 2
  ]);
  const [potentialTiers, setPotentialTiers] = useState<number[][]>([
    [9, 9, 9], // Potential equipment for slot 1
    [9, 9, 9], // Potential equipment for slot 2
  ]);

  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchStudents();
      setStudents(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredStudents = students.filter(student =>
    searchText === '' ||
    student.Name.toLowerCase().includes(searchText.toLowerCase()) ||
    student.School.toLowerCase().includes(searchText.toLowerCase()) ||
    student.TacticRole.toLowerCase().includes(searchText.toLowerCase())
  );

  const calculateStat = (level1Value: number, level100Value: number, level: number) => {
    if (level === 1) return level1Value;
    if (level === 100) return level100Value;
    const ratio = (level - 1) / 99;
    return Math.round(level1Value + (level100Value - level1Value) * ratio);
  };

  const getStatWithEquipment = (
    baseStat: number, 
    equipmentType: string, 
    studentEquipment: string[], 
    currentTiers: number[]
  ) => {
    let bonus = 0;
    studentEquipment.forEach((eqType, index) => {
      const tier = currentTiers[index] || 1;
      if (eqType === equipmentType || EQUIPMENT_TYPES[eqType]?.statBonus === equipmentType) {
        bonus += EQUIPMENT_TIER_MULTIPLIER[tier] || 0;
      }
    });
    return baseStat + bonus;
  };

  const handleDragStart = (e: React.DragEvent, student: Student) => {
    setDraggedStudent(student);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', student.Id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    if (draggedStudent) {
      setSlots(prev => prev.map((slot, i) => 
        i === slotIndex 
          ? { ...slot, student: draggedStudent }
          : slot
      ));
    }
    setDraggedStudent(null);
  };

  const handleDragEnd = () => {
    setDraggedStudent(null);
  };

  const removeStudent = (slotIndex: number) => {
    setSlots(prev => prev.map((slot, i) => 
      i === slotIndex 
        ? { ...slot, student: null }
        : slot
    ));
  };

  const updateSlotLevel = (slotIndex: number, level: number) => {
    setSlots(prev => prev.map((slot, i) => 
      i === slotIndex 
        ? { ...slot, level }
        : slot
    ));
  };

  const updateSlotSkillLevel = (slotIndex: number, skillLevel: number) => {
    setSlots(prev => prev.map((slot, i) => 
      i === slotIndex 
        ? { ...slot, skillLevel }
        : slot
    ));
  };

  const getStatDifference = (stat1: number, stat2: number) => {
    if (stat1 === stat2) return { diff: 0, percent: 0, winner: 'tie' };
    const diff = stat1 - stat2;
    const percent = ((stat1 - stat2) / Math.max(stat1, stat2)) * 100;
    return { 
      diff, 
      percent: Math.abs(percent), 
      winner: diff > 0 ? 'left' : 'right' 
    };
  };

  const getUpgradePriority = (student: Student) => {
    const priorities: { category: string; reason: string; priority: 'high' | 'medium' | 'low' }[] = [];

    // Check based on role
    if (student.TacticRole === 'DamageDealer' || student.TacticRole === 'Attacker') {
      priorities.push({
        category: 'Attack',
        reason: 'Primary damage dealer - maximize ATK',
        priority: 'high'
      });
      priorities.push({
        category: 'Critical',
        reason: 'Crit stats boost damage output',
        priority: 'medium'
      });
    }

    if (student.TacticRole === 'Tanker' || student.TacticRole === 'Tank') {
      priorities.push({
        category: 'HP',
        reason: 'Tank role - maximize survivability',
        priority: 'high'
      });
      priorities.push({
        category: 'Defense',
        reason: 'Reduce incoming damage',
        priority: 'high'
      });
    }

    if (student.TacticRole === 'Healer' || student.TacticRole === 'Support') {
      priorities.push({
        category: 'Heal Power',
        reason: 'Support role - maximize healing',
        priority: 'high'
      });
      priorities.push({
        category: 'HP',
        reason: 'Survivability to keep healing',
        priority: 'medium'
      });
    }

    // Skills always important
    priorities.push({
      category: 'Skills',
      reason: 'EX and Passive skills scale with levels',
      priority: student.TacticRole === 'DamageDealer' ? 'high' : 'medium'
    });

    // Equipment is universally important
    priorities.push({
      category: 'Equipment',
      reason: 'Equipment provides significant stat boosts',
      priority: 'medium'
    });

    return priorities;
  };

  const estimateDamageProjection = (student: Student, level: number, skillLevel: number) => {
    const atk = calculateStat(student.AttackPower1, student.AttackPower100, level);
    const critRate = student.CriticalPoint / 100;
    const critDamage = student.CriticalDamageRate / 100;
    
    // Basic damage estimation (simplified)
    const baseDamage = atk;
    const avgDamage = baseDamage * (1 + critRate * (critDamage - 1));
    
    // Skill multiplier estimation (higher skill level = more damage)
    const skillMultiplier = 1 + (skillLevel - 1) * 0.1;
    
    return {
      baseDamage: Math.round(baseDamage),
      avgDamage: Math.round(avgDamage * skillMultiplier),
      critDamage: Math.round(baseDamage * critDamage * skillMultiplier),
    };
  };

  const renderStatBar = (
    label: string, 
    value1: number, 
    value2: number, 
    maxValue: number,
    showDiff: boolean = true
  ) => {
    const { diff, percent, winner } = getStatDifference(value1, value2);
    const bar1Width = (value1 / maxValue) * 100;
    const bar2Width = (value2 / maxValue) * 100;

    return (
      <div className="stat-comparison-row">
        <div className="stat-bar-container left">
          <div className="stat-bar-wrapper">
            <div 
              className={`stat-bar ${winner === 'left' ? 'winner' : ''}`}
              style={{ width: `${Math.min(bar1Width, 100)}%` }}
            />
          </div>
          <span className={`stat-value ${winner === 'left' ? 'winner' : ''}`}>
            {value1.toLocaleString()}
          </span>
        </div>
        
        <div className="stat-label-center">
          <span className="stat-name">{label}</span>
          {showDiff && diff !== 0 && (
            <span className={`stat-diff ${winner}`}>
              {winner === 'left' ? '+' : '-'}{Math.abs(diff).toLocaleString()} ({percent.toFixed(1)}%)
            </span>
          )}
        </div>
        
        <div className="stat-bar-container right">
          <span className={`stat-value ${winner === 'right' ? 'winner' : ''}`}>
            {value2.toLocaleString()}
          </span>
          <div className="stat-bar-wrapper">
            <div 
              className={`stat-bar ${winner === 'right' ? 'winner' : ''}`}
              style={{ width: `${Math.min(bar2Width, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="comparison-loading">Loading comparison tool...</div>;
  }

  const bothStudentsSelected = slots[0].student && slots[1].student;

  return (
    <div className="student-comparison-container">
      <div className="comparison-header">
        <h2>⚔️ Student Comparison Tool</h2>
        <p className="comparison-subtitle">Drag students to compare their stats side-by-side</p>
        {onClose && (
          <button onClick={onClose} className="close-btn">✕</button>
        )}
      </div>

      <div className="comparison-content">
        {/* Comparison Slots */}
        <div className="comparison-slots">
          {slots.map((slot, index) => (
            <div 
              key={index}
              className={`comparison-slot ${draggedStudent ? 'drop-target' : ''} ${slot.student ? 'filled' : 'empty'}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              ref={index === 0 ? dragRef : null}
            >
              {slot.student ? (
                <div className="slot-student-info">
                  <button 
                    className="remove-student-btn"
                    onClick={() => removeStudent(index)}
                  >
                    ×
                  </button>
                  <img
                    src={`${SCHALE_IMAGE_URL.collection}/${slot.student.Id}.webp`}
                    alt={slot.student.Name}
                    className="slot-portrait"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `${SCHALE_IMAGE_URL.icon}/${slot.student!.Id}.webp`;
                    }}
                  />
                  <h3>{slot.student.Name}</h3>
                  <div className="student-meta">
                    <span className="stars">{'★'.repeat(slot.student.StarGrade)}</span>
                    <span className="role">{slot.student.TacticRole}</span>
                  </div>
                  <div className="type-badges">
                    <span className={`badge attack ${slot.student.BulletType.toLowerCase()}`}>
                      {slot.student.BulletType}
                    </span>
                    <span className={`badge armor ${slot.student.ArmorType.toLowerCase()}`}>
                      {slot.student.ArmorType.replace('Armor', '')}
                    </span>
                  </div>
                  
                  {/* Level Controls */}
                  <div className="slot-controls">
                    <div className="control-group">
                      <label>Level: {slot.level}</label>
                      <input
                        type="range"
                        min="1"
                        max="90"
                        value={slot.level}
                        onChange={(e) => updateSlotLevel(index, Number(e.target.value))}
                      />
                    </div>
                    <div className="control-group">
                      <label>Skill Lvl: {slot.skillLevel}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={slot.skillLevel}
                        onChange={(e) => updateSlotSkillLevel(index, Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-slot-prompt">
                  <div className="drop-icon">📥</div>
                  <span>Drop Student Here</span>
                  <small>Drag from the list below</small>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats Comparison */}
        {bothStudentsSelected && (
          <div className="stats-comparison-section">
            <h3>📊 Stats Comparison</h3>
            
            <div className="stats-comparison-grid">
              {renderStatBar(
                'HP',
                calculateStat(slots[0].student!.MaxHP1, slots[0].student!.MaxHP100, slots[0].level),
                calculateStat(slots[1].student!.MaxHP1, slots[1].student!.MaxHP100, slots[1].level),
                50000
              )}
              {renderStatBar(
                'ATK',
                calculateStat(slots[0].student!.AttackPower1, slots[0].student!.AttackPower100, slots[0].level),
                calculateStat(slots[1].student!.AttackPower1, slots[1].student!.AttackPower100, slots[1].level),
                10000
              )}
              {renderStatBar(
                'DEF',
                calculateStat(slots[0].student!.DefensePower1, slots[0].student!.DefensePower100, slots[0].level),
                calculateStat(slots[1].student!.DefensePower1, slots[1].student!.DefensePower100, slots[1].level),
                500
              )}
              {renderStatBar(
                'HEAL',
                calculateStat(slots[0].student!.HealPower1, slots[0].student!.HealPower100, slots[0].level),
                calculateStat(slots[1].student!.HealPower1, slots[1].student!.HealPower100, slots[1].level),
                10000
              )}
              {renderStatBar(
                'Accuracy',
                slots[0].student!.AccuracyPoint,
                slots[1].student!.AccuracyPoint,
                3000
              )}
              {renderStatBar(
                'Critical',
                slots[0].student!.CriticalPoint,
                slots[1].student!.CriticalPoint,
                1000
              )}
              {renderStatBar(
                'Crit DMG',
                slots[0].student!.CriticalDamageRate,
                slots[1].student!.CriticalDamageRate,
                30000
              )}
              {renderStatBar(
                'Dodge',
                slots[0].student!.DodgePoint,
                slots[1].student!.DodgePoint,
                1000
              )}
              {renderStatBar(
                'Range',
                slots[0].student!.Range,
                slots[1].student!.Range,
                1500
              )}
            </div>
          </div>
        )}

        {/* Skill Comparison */}
        {bothStudentsSelected && (
          <div className="skills-comparison-section">
            <h3>⚡ Skills & Damage Projection</h3>
            <div className="skills-grid">
              {slots.map((slot, index) => {
                if (!slot.student) return null;
                const damage = estimateDamageProjection(slot.student, slot.level, slot.skillLevel);
                return (
                  <div key={index} className="skill-panel">
                    <h4>{slot.student.Name}</h4>
                    
                    {/* Damage Projections */}
                    <div className="damage-projections">
                      <div className="damage-stat">
                        <span className="damage-label">Base Damage</span>
                        <span className="damage-value">{damage.baseDamage.toLocaleString()}</span>
                      </div>
                      <div className="damage-stat highlight">
                        <span className="damage-label">Avg Damage (w/ Crit)</span>
                        <span className="damage-value">{damage.avgDamage.toLocaleString()}</span>
                      </div>
                      <div className="damage-stat crit">
                        <span className="damage-label">Crit Damage</span>
                        <span className="damage-value">{damage.critDamage.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Skills List */}
                    <div className="skills-list">
                      {slot.student.Skills?.Ex && (
                        <div className="skill-item ex">
                          <div className="skill-header">
                            <img 
                              src={`https://schaledb.com/images/skill/${slot.student.Skills.Ex.Icon}.png`}
                              alt="EX"
                              className="skill-icon"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/32x32?text=EX';
                              }}
                            />
                            <div>
                              <span className="skill-name">{slot.student.Skills.Ex.Name}</span>
                              <span className="skill-type-badge ex">EX</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {slot.student.Skills?.Passive && (
                        <div className="skill-item passive">
                          <div className="skill-header">
                            <img 
                              src={`https://schaledb.com/images/skill/${slot.student.Skills.Passive.Icon}.png`}
                              alt="Passive"
                              className="skill-icon"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/32x32?text=P';
                              }}
                            />
                            <div>
                              <span className="skill-name">{slot.student.Skills.Passive.Name}</span>
                              <span className="skill-type-badge passive">Passive</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {slot.student.Skills?.Public && (
                        <div className="skill-item public">
                          <div className="skill-header">
                            <img 
                              src={`https://schaledb.com/images/skill/${slot.student.Skills.Public.Icon || 'COMMON_SKILLICON_PUBLIC'}.png`}
                              alt="Sub"
                              className="skill-icon"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/32x32?text=S';
                              }}
                            />
                            <div>
                              <span className="skill-name">{slot.student.Skills.Public.Name}</span>
                              <span className="skill-type-badge public">Sub</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Equipment Comparison */}
        {bothStudentsSelected && (
          <div className="equipment-comparison-section">
            <h3>🎒 Equipment Comparison</h3>
            <div className="equipment-grid">
              {slots.map((slot, slotIndex) => {
                if (!slot.student) return null;
                return (
                  <div key={slotIndex} className="equipment-panel">
                    <h4>{slot.student.Name}</h4>
                    <div className="equipment-slots">
                      {slot.student.Equipment.map((eq, eqIndex) => (
                        <div key={eqIndex} className="equipment-slot">
                          <div className="equipment-info">
                            <span className="equipment-name">{eq}</span>
                            <span className="equipment-stat">
                              +{EQUIPMENT_TYPES[eq]?.statBonus || 'Unknown'}
                            </span>
                          </div>
                          <div className="equipment-tiers">
                            <div className="tier-row">
                              <label>Current T{equipmentTiers[slotIndex][eqIndex]}</label>
                              <input
                                type="range"
                                min="1"
                                max="9"
                                value={equipmentTiers[slotIndex][eqIndex]}
                                onChange={(e) => {
                                  const newTiers = [...equipmentTiers];
                                  newTiers[slotIndex][eqIndex] = Number(e.target.value);
                                  setEquipmentTiers(newTiers);
                                }}
                              />
                            </div>
                            <div className="tier-comparison">
                              <span className="current-bonus">
                                +{EQUIPMENT_TIER_MULTIPLIER[equipmentTiers[slotIndex][eqIndex]]}
                              </span>
                              <span className="arrow">→</span>
                              <span className="potential-bonus">
                                +{EQUIPMENT_TIER_MULTIPLIER[9]} (T9)
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upgrade Priority Recommendations */}
        {bothStudentsSelected && (
          <div className="upgrade-priority-section">
            <h3>📈 Upgrade Priority Recommendations</h3>
            <div className="priority-grid">
              {slots.map((slot, index) => {
                if (!slot.student) return null;
                const priorities = getUpgradePriority(slot.student);
                return (
                  <div key={index} className="priority-panel">
                    <h4>{slot.student.Name}</h4>
                    <div className="priority-list">
                      {priorities.map((p, pIndex) => (
                        <div key={pIndex} className={`priority-item ${p.priority}`}>
                          <div className="priority-header">
                            <span className={`priority-badge ${p.priority}`}>
                              {p.priority.toUpperCase()}
                            </span>
                            <span className="priority-category">{p.category}</span>
                          </div>
                          <p className="priority-reason">{p.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Student Selection Pool */}
        <div className="student-pool">
          <div className="pool-header">
            <h3>📚 Student Pool</h3>
            <div className="search-section">
              <input
                type="text"
                placeholder="Search students..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
              <span className="count">Found: {filteredStudents.length}</span>
            </div>
          </div>
          
          <div className="student-grid">
            {filteredStudents.map((student) => {
              const isSelected = slots.some(s => s.student?.Id === student.Id);
              return (
                <div
                  key={student.Id}
                  className={`draggable-student ${isSelected ? 'selected' : ''}`}
                  draggable={!isSelected}
                  onDragStart={(e) => handleDragStart(e, student)}
                  onDragEnd={handleDragEnd}
                >
                  <img
                    src={`${SCHALE_IMAGE_URL.icon}/${student.Id}.webp`}
                    alt={student.Name}
                    className="student-avatar"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/50x50?text=?';
                    }}
                  />
                  <div className="student-info">
                    <span className="student-name">{student.Name}</span>
                    <span className="student-school">{student.School}</span>
                    <div className="student-tags">
                      <span className={`mini-tag ${student.BulletType.toLowerCase()}`}>
                        {student.BulletType}
                      </span>
                      <span className={`mini-tag ${student.ArmorType.toLowerCase()}`}>
                        {student.ArmorType.replace('Armor', '')}
                      </span>
                    </div>
                  </div>
                  {isSelected && <div className="selected-indicator">✓</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
