import React, { useState } from 'react';
import type { Student } from '../data/students';
import { SCHALE_IMAGE_URL } from '../data/students';
import './CharacterDetails.css';

interface CharacterDetailsProps {
  student: Student | null;
  onClose: () => void;
}

export const CharacterDetails: React.FC<CharacterDetailsProps> = ({ student, onClose }) => {
  const [studentLevel, setStudentLevel] = useState(1);
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [skillLevel, setSkillLevel] = useState(1);
  const [bondLevel, setBondLevel] = useState(1);

  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    combatStats: true,
    weapon: false,
    combatType: false,
    skills: false,
    bio: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!student) return null;

  const getStarRating = (stars: number) => {
    return '★'.repeat(stars);
  };

  const formatStatValue = (value: number) => {
    return value.toLocaleString();
  };

  const interpolateSkillDesc = (desc: string, parameters: (string | number)[][] | undefined, skillLevel: number) => {
    let result = desc;

    result = result.replace(/<([bds]):([^>]+)>/g, (_, type, content) => {
      switch (type) {
        case 'b':
          return `<strong>${content}</strong>`;
        case 'd':
          return `<span class="debuff">[${content}]</span>`;
        case 's':
          return `<span class="special">⟨${content}⟩</span>`;
        default:
          return content;
      }
    });

    if (parameters && parameters.length) {
      result = result.replace(/<\?([^>\s]+)>?/g, (_, content) => {
        if (/^\d+$/.test(content)) {
          const paramIndex = parseInt(content, 10) - 1;
          if (paramIndex >= 0 && paramIndex < parameters.length) {
            const paramArray = parameters[paramIndex];
            const value = paramArray[Math.min(skillLevel - 1, paramArray.length - 1)] ?? paramArray[paramArray.length - 1];
            return String(value);
          }
        }
        return content;
      });
    }

    return result;
  };

  const calculateStat = (level1Value: number, level100Value: number, level: number) => {
    if (level === 1) return level1Value;
    if (level === 100) return level100Value;

    const ratio = (level - 1) / 99;
    return Math.round(level1Value + (level100Value - level1Value) * ratio);
  };

  const calculateBondBonus = (baseStat: number, bondLevel: number) => {
    // Bond levels provide percentage bonuses to HP, ATK, and Heal
    // Each bond level gives approximately 0.5% bonus (this is an approximation)
    const bondMultiplier = 1 + (bondLevel - 1) * 0.005; // 0.5% per level
    return Math.round(baseStat * bondMultiplier);
  };

  return (
    <div className="character-details-sidebar">
      <div className="sidebar-header">
        <div className="character-basic">
          <h2 className="character-name">{student.Name}</h2>
          <div className="character-stars">{getStarRating(student.StarGrade)}</div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="character-image-section">
        <img
          src={`${SCHALE_IMAGE_URL.collection}/${student.Id}.webp`}
          alt={`${student.Name} full body`}
          className="character-full-body"
          onError={(e) => {
            // Fallback to portrait if collection image fails
            (e.target as HTMLImageElement).src = `${SCHALE_IMAGE_URL.portrait}/${student.Id}.webp`;
          }}
          onErrorCapture={(e) => {
            // Final fallback to icon
            const target = e.target as HTMLImageElement;
            if (target.src.includes('collection') || target.src.includes('portrait')) {
              target.src = `${SCHALE_IMAGE_URL.icon}/${student.Id}.webp`;
            }
          }}
        />
      </div>

      <div className="collapsible-section">
        <button
          className="section-toggle"
          onClick={() => toggleSection('basicInfo')}
        >
          <h3 className="section-title">Basic Information</h3>
          <span className={`toggle-icon ${expandedSections.basicInfo ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        <div className={`section-content ${expandedSections.basicInfo ? 'expanded' : 'collapsed'}`}>
          <div className="basic-info-section">
            <div className="info-row">
              <span className="info-label">School:</span>
              <span className="info-value">{student.School}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role:</span>
              <span className="info-value">{student.TacticRole}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Position:</span>
              <span className="info-value">{student.Position}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Age:</span>
              <span className="info-value">{student.CharacterAge}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Height:</span>
              <span className="info-value">{student.CharHeightMetric}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Birthday:</span>
              <span className="info-value">{student.Birthday}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="collapsible-section">
        <button
          className="section-toggle"
          onClick={() => toggleSection('combatStats')}
        >
          <h3 className="section-title">Combat Stats</h3>
          <span className={`toggle-icon ${expandedSections.combatStats ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        <div className={`section-content ${expandedSections.combatStats ? 'expanded' : 'collapsed'}`}>
          <div className="stats-section">
            <div className="level-control">
              <label htmlFor="student-level-slider" className="level-label">
                Student Level: {studentLevel}
              </label>
              <input
                id="student-level-slider"
                type="range"
                min="1"
                max="100"
                value={studentLevel}
                onChange={(e) => setStudentLevel(Number(e.target.value))}
                className="level-slider"
              />
              <div className="level-marks">
                <span>1</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <div className="bond-level-control">
              <label htmlFor="bond-level-slider" className="level-label">
                Bond Level: {bondLevel}
              </label>
              <input
                id="bond-level-slider"
                type="range"
                min="1"
                max="50"
                value={bondLevel}
                onChange={(e) => setBondLevel(Number(e.target.value))}
                className="level-slider"
              />
              <div className="level-marks">
                <span>1</span>
                <span>25</span>
                <span>50</span>
              </div>
            </div>

            <div className="current-stats">
              <h4>Student Level {studentLevel} Stats (Bond Level {bondLevel})</h4>
              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-label">HP:</span>
                  <span className="stat-value">{formatStatValue(calculateBondBonus(calculateStat(student.MaxHP1, student.MaxHP100, studentLevel), bondLevel))}</span>
                  <small className="stat-subtext">(Base: {formatStatValue(calculateStat(student.MaxHP1, student.MaxHP100, studentLevel))})</small>
                </div>
                <div className="stat-item">
                  <span className="stat-label">ATK:</span>
                  <span className="stat-value">{formatStatValue(calculateBondBonus(calculateStat(student.AttackPower1, student.AttackPower100, studentLevel), bondLevel))}</span>
                  <small className="stat-subtext">(Base: {formatStatValue(calculateStat(student.AttackPower1, student.AttackPower100, studentLevel))})</small>
                </div>
                <div className="stat-item">
                  <span className="stat-label">DEF:</span>
                  <span className="stat-value">{formatStatValue(calculateStat(student.DefensePower1, student.DefensePower100, studentLevel))}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">HEAL:</span>
                  <span className="stat-value">{formatStatValue(calculateBondBonus(calculateStat(student.HealPower1, student.HealPower100, studentLevel), bondLevel))}</span>
                  <small className="stat-subtext">(Base: {formatStatValue(calculateStat(student.HealPower1, student.HealPower100, studentLevel))})</small>
                </div>
              </div>
            </div>

            <div className="combat-attributes">
              <div className="attribute-item">
                <span className="attr-label">Accuracy:</span>
                <span className="attr-value">{student.AccuracyPoint}</span>
              </div>
              <div className="attribute-item">
                <span className="attr-label">Critical:</span>
                <span className="attr-value">{student.CriticalPoint}%</span>
              </div>
              <div className="attribute-item">
                <span className="attr-label">Dodge:</span>
                <span className="attr-value">{student.DodgePoint}</span>
              </div>
              <div className="attribute-item">
                <span className="attr-label">Range:</span>
                <span className="attr-value">{student.Range}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="collapsible-section">
        <button
          className="section-toggle"
          onClick={() => toggleSection('weapon')}
        >
          <h3 className="section-title">Weapon</h3>
          <span className={`toggle-icon ${expandedSections.weapon ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        <div className={`section-content ${expandedSections.weapon ? 'expanded' : 'collapsed'}`}>
          <div className="weapon-section">
            <div className="weapon-display">
              <div className="weapon-image-container">
                <img
                  src={`${SCHALE_IMAGE_URL.weapon}/${student.WeaponImg}.webp`}
                  alt={`${student.Name}'s weapon`}
                  className="weapon-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/120x120?text=Weapon';
                  }}
                />
              </div>

              <div className="weapon-level-control">
                <label htmlFor="weapon-level-slider" className="level-label">
                  Weapon Level: {weaponLevel}
                </label>
                <input
                  id="weapon-level-slider"
                  type="range"
                  min="1"
                  max="100"
                  value={weaponLevel}
                  onChange={(e) => setWeaponLevel(Number(e.target.value))}
                  className="level-slider"
                />
                <div className="level-marks">
                  <span>1</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              <div className="weapon-details">
                <div className="weapon-header">
                  <h4>{student.WeaponType}</h4>
                  <div className="weapon-level">Level: {weaponLevel}</div>
                </div>
                <div className="weapon-stats">
                  <div className="weapon-stat">
                    <span className="stat-label">Stability:</span>
                    <span className="stat-value">{formatStatValue(calculateStat(student.StabilityPoint, student.StabilityPoint * 1.5, weaponLevel))}</span>
                  </div>
                  <div className="weapon-stat">
                    <span className="stat-label">Accuracy:</span>
                    <span className="stat-value">{formatStatValue(calculateStat(student.AccuracyPoint * 0.8, student.AccuracyPoint, weaponLevel))}</span>
                  </div>
                  <div className="weapon-stat">
                    <span className="stat-label">Critical:</span>
                    <span className="stat-value">{formatStatValue(calculateStat(student.CriticalPoint * 0.8, student.CriticalPoint, weaponLevel))}%</span>
                  </div>
                  <div className="weapon-stat">
                    <span className="stat-label">Range:</span>
                    <span className="stat-value">{student.Range}</span>
                  </div>
                  <div className="weapon-stat">
                    <span className="stat-label">Ammo:</span>
                    <span className="stat-value">{student.AmmoCount}</span>
                  </div>
                  <div className="weapon-stat">
                    <span className="stat-label">Regen Cost:</span>
                    <span className="stat-value">{student.RegenCost}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="collapsible-section">
        <button
          className="section-toggle"
          onClick={() => toggleSection('combatType')}
        >
          <h3 className="section-title">Combat Type</h3>
          <span className={`toggle-icon ${expandedSections.combatType ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        <div className={`section-content ${expandedSections.combatType ? 'expanded' : 'collapsed'}`}>
          <div className="combat-type-section">
            <div className="type-tags">
              <span className={`type-tag bullet ${student.BulletType.toLowerCase()}`}>
                {student.BulletType}
              </span>
              <span className={`type-tag armor ${student.ArmorType.toLowerCase()}`}>
                {student.ArmorType.replace('Armor', '')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {student.Skills && (
        <div className="collapsible-section">
          <button
            className="section-toggle"
            onClick={() => toggleSection('skills')}
          >
            <h3 className="section-title">Skills</h3>
            <span className={`toggle-icon ${expandedSections.skills ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          <div className={`section-content ${expandedSections.skills ? 'expanded' : 'collapsed'}`}>
            <div className="skills-section">
              <div className="skill-level-control">
                <label htmlFor="skill-level-slider" className="level-label">
                  Skill Level: {skillLevel}
                </label>
                <input
                  id="skill-level-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(Number(e.target.value))}
                  className="level-slider"
                />
                <div className="level-marks">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div className="skills-grid">
                {student.Skills.Normal && (
                  <div className="skill-card">
                    <div className="skill-header">
                      <div className="skill-icon">
                        <img
                          src={`https://schaledb.com/images/skill/${student.Skills.Normal.Icon || 'COMMON_SKILLICON_NORMAL'}.png`}
                          alt="Normal Attack"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=NORMAL';
                          }}
                        />
                      </div>
                      <div className="skill-info">
                        <h4>Normal Attack</h4>
                        <span className="skill-type">Basic</span>
                      </div>
                    </div>
                    <div className="skill-details">
                      {student.Skills.Normal.Effects && student.Skills.Normal.Effects.length > 0 && (
                        <div className="skill-effect">
                          <span className="skill-label">Effect:</span>
                          <span className="skill-value">{student.Skills.Normal.Effects[0].Type}</span>
                        </div>
                      )}
                      {student.Skills.Normal.Frames && (
                        <>
                          <div className="skill-effect">
                            <span className="skill-label">Attack Duration:</span>
                            <span className="skill-value">{student.Skills.Normal.Frames.AttackEnterDuration + student.Skills.Normal.Frames.AttackStartDuration + student.Skills.Normal.Frames.AttackIngDuration} frames</span>
                          </div>
                          <div className="skill-effect">
                            <span className="skill-label">Reload Time:</span>
                            <span className="skill-value">{student.Skills.Normal.Frames.AttackReloadDuration} frames</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {student.Skills.Ex && (
                  <div className="skill-card">
                    <div className="skill-header">
                      <div className="skill-icon">
                        <img
                          src={`https://schaledb.com/images/skill/${student.Skills.Ex.Icon}.png`}
                          alt={student.Skills.Ex.Name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=EX';
                          }}
                        />
                      </div>
                      <div className="skill-info">
                        <h4>{student.Skills.Ex.Name}</h4>
                        <span className="skill-type ex">EX Skill</span>
                      </div>
                    </div>
                    <p className="skill-desc" dangerouslySetInnerHTML={{
                      __html: interpolateSkillDesc(student.Skills.Ex.Desc, student.Skills.Ex.Parameters || [], skillLevel)
                    }}></p>
                  </div>
                )}

                {student.Skills.Passive && (
                  <div className="skill-card">
                    <div className="skill-header">
                      <div className="skill-icon">
                        <img
                          src={`https://schaledb.com/images/skill/${student.Skills.Passive.Icon}.png`}
                          alt={student.Skills.Passive.Name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=PASSIVE';
                          }}
                        />
                      </div>
                      <div className="skill-info">
                        <h4>{student.Skills.Passive.Name}</h4>
                        <span className="skill-type passive">Passive</span>
                      </div>
                    </div>
                    <p className="skill-desc" dangerouslySetInnerHTML={{
                      __html: interpolateSkillDesc(student.Skills.Passive.Desc, student.Skills.Passive.Parameters || [], skillLevel)
                    }}></p>
                  </div>
                )}

                {student.Skills.WeaponPassive && (
                  <div className="skill-card">
                    <div className="skill-header">
                      <div className="skill-icon">
                        <img
                          src={`https://schaledb.com/images/skill/${student.Skills.WeaponPassive.Icon}.png`}
                          alt={student.Skills.WeaponPassive.Name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=WEAPON';
                          }}
                        />
                      </div>
                      <div className="skill-info">
                        <h4>{student.Skills.WeaponPassive.Name}</h4>
                        <span className="skill-type weapon">Weapon Passive</span>
                      </div>
                    </div>
                    <p className="skill-desc" dangerouslySetInnerHTML={{
                      __html: interpolateSkillDesc(student.Skills.WeaponPassive.Desc, student.Skills.WeaponPassive.Parameters || [], skillLevel)
                    }}></p>
                  </div>
                )}

                {student.Skills.Public && (
                  <div className="skill-card">
                    <div className="skill-header">
                      <div className="skill-icon">
                        <img
                          src={`https://schaledb.com/images/skill/${student.Skills.Public.Icon || 'COMMON_SKILLICON_PUBLIC'}.png`}
                          alt={student.Skills.Public.Name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=PUBLIC';
                          }}
                        />
                      </div>
                      <div className="skill-info">
                        <h4>{student.Skills.Public.Name}</h4>
                        <span className="skill-type public">Public</span>
                      </div>
                    </div>
                    <p className="skill-desc" dangerouslySetInnerHTML={{
                      __html: interpolateSkillDesc(student.Skills.Public.Desc, student.Skills.Public.Parameters || [], skillLevel)
                    }}></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {student.ProfileIntroduction && (
        <div className="collapsible-section">
          <button
            className="section-toggle"
            onClick={() => toggleSection('bio')}
          >
            <h3 className="section-title">Profile</h3>
            <span className={`toggle-icon ${expandedSections.bio ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          <div className={`section-content ${expandedSections.bio ? 'expanded' : 'collapsed'}`}>
            <div className="bio-section">
              <div className="bio-content">
                {student.ProfileIntroduction.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};