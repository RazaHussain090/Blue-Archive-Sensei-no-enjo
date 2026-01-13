import React, { useState } from 'react';
import { fetchStudents, SCHALE_IMAGE_URL } from '../../data/students';
import type { Student } from '../../data/students';
import { TeamStatsCalculator } from './TeamStatsCalculator';
import './TeamBuilder.css';

interface TeamSlot {
  id: number;
  student: Student | null;
  squadType: 'main' | 'support';
}

interface TeamBuilderProps {
  onClose?: () => void;
}

export const TeamBuilder: React.FC<TeamBuilderProps> = ({ onClose }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [team, setTeam] = useState<TeamSlot[]>([
    { id: 1, student: null, squadType: 'main' },
    { id: 2, student: null, squadType: 'main' },
    { id: 3, student: null, squadType: 'main' },
    { id: 4, student: null, squadType: 'main' },
    { id: 5, student: null, squadType: 'support' },
    { id: 6, student: null, squadType: 'support' },
  ]);
  const [selectedTerrain, setSelectedTerrain] = useState<'Street' | 'Outdoor' | 'Indoor'>('Street');

  React.useEffect(() => {
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

  const addStudentToTeam = (student: Student, slotId: number) => {
    setTeam(prevTeam =>
      prevTeam.map(slot => {
        if (slot.id === slotId) {
          // Check if student can be placed in this slot based on squad type
          if (slot.squadType === 'main' && student.SquadType !== 'Main') {
            return slot; // Can't place Support student in Main slot
          }
          if (slot.squadType === 'support' && student.SquadType !== 'Support') {
            return slot; // Can't place Main student in Support slot
          }
          return { ...slot, student };
        }
        return slot;
      })
    );
  };

  const removeStudentFromTeam = (slotId: number) => {
    setTeam(prevTeam =>
      prevTeam.map(slot =>
        slot.id === slotId ? { ...slot, student: null } : slot
      )
    );
  };

  const getPositionIcon = (slot: TeamSlot) => {
    if (slot.student) {
      // Use the student's actual Position from the data
      const position = slot.student.Position;
      switch (position) {
        case 'Front': return '⚔️';
        case 'Middle': return '🎯';
        case 'Back': return '🏹';
        default: return '⚔️';
      }
    } else {
      // Empty slot - show squad type icon
      return slot.squadType === 'main' ? '⚔️' : '🛡️';
    }
  };

  const getPositionLabel = (slot: TeamSlot) => {
    if (slot.student) {
      // Use the student's actual Position from the data
      const position = slot.student.Position;
      if (slot.squadType === 'support') {
        return 'Support';
      }
      return position || 'Main';
    } else {
      // Empty slot - show squad type
      return slot.squadType === 'main' ? 'Main' : 'Support';
    }
  };

  const getAttackTypeCounts = () => {
    const counts: { [key: string]: number } = {};
    team.filter(slot => slot.student).forEach(slot => {
      const type = slot.student!.BulletType;
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).sort(([,a], [,b]) => b - a);
  };

  const getArmorTypeCounts = () => {
    const counts: { [key: string]: number } = {};
    team.filter(slot => slot.student).forEach(slot => {
      const type = slot.student!.ArmorType;
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).sort(([,a], [,b]) => b - a);
  };

  const getSchoolCounts = () => {
    const counts: { [key: string]: number } = {};
    team.filter(slot => slot.student).forEach(slot => {
      const school = slot.student!.School;
      counts[school] = (counts[school] || 0) + 1;
    });
    return Object.entries(counts).sort(([,a], [,b]) => b - a);
  };

  if (loading) {
    return <div className="team-builder-loading">Loading team builder...</div>;
  }

  return (
    <div className="team-builder-container">
      <div className="team-builder-header">
        <h2>Team Formation</h2>
        {onClose && (
          <button onClick={onClose} className="close-btn">✕</button>
        )}
      </div>

      <div className="team-builder-content">
        {/* Team Formation Section */}
        <div className="team-formation">
          <h3>Current Team</h3>
          <div className="team-slots">
            {team.map((slot) => (
              <div key={slot.id} className={`team-slot ${slot.squadType}`}>
                <div className="slot-header">
                  <span className="position-icon">{getPositionIcon(slot)}</span>
                  <span className="position-label">{getPositionLabel(slot)}</span>
                </div>
                <div className="slot-content">
                  {slot.student ? (
                    <div className="slot-student" onClick={() => removeStudentFromTeam(slot.id)}>
                      <img
                        src={`${SCHALE_IMAGE_URL.icon}/${slot.student.Id}.webp`}
                        alt={slot.student.Name}
                        className="slot-avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=?';
                        }}
                      />
                      <div className="slot-info">
                        <h4>{slot.student.Name}</h4>
                        <div className="slot-tags">
                          <span className={`tag ${slot.student.BulletType.toLowerCase()}`}>
                            {slot.student.BulletType}
                          </span>
                          <span className={`tag ${slot.student.ArmorType.toLowerCase()}`}>
                            {slot.student.ArmorType.replace('Armor', '')}
                          </span>
                        </div>
                      </div>
                      <button className="remove-btn" onClick={(e) => {
                        e.stopPropagation();
                        removeStudentFromTeam(slot.id);
                      }}>
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="empty-slot">
                      <span>Empty</span>
                      <small>Click student below to add</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Team Stats Section */}
          <div className="team-stats">
            <h4>Team Composition</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Team Size:</span>
                <span className="stat-value">{team.filter(s => s.student).length}/6 (4 Striker + 2 Special)</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Squad Types:</span>
                <div className="stat-badges">
                  <span className="stat-badge main-squad">
                    Striker ({team.filter(s => s.student && s.squadType === 'main').length})
                  </span>
                  <span className="stat-badge support-squad">
                    Special ({team.filter(s => s.student && s.squadType === 'support').length})
                  </span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">Attack Types:</span>
                <div className="stat-badges">
                  {getAttackTypeCounts().map(([type, count]) => (
                    <span key={type} className={`stat-badge ${type.toLowerCase()}`}>
                      {type} ({count})
                    </span>
                  ))}
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">Armor Types:</span>
                <div className="stat-badges">
                  {getArmorTypeCounts().map(([type, count]) => (
                    <span key={type} className={`stat-badge ${type.toLowerCase()}`}>
                      {type.replace('Armor', '')} ({count})
                    </span>
                  ))}
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">Schools:</span>
                <div className="stat-badges">
                  {getSchoolCounts().map(([school, count]) => (
                    <span key={school} className="stat-badge school">
                      {school} ({count})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Statistics Calculator */}
          <div className="terrain-selector" style={{ marginBottom: '1rem' }}>
            <h4>Battle Environment</h4>
            <div className="terrain-buttons" style={{ display: 'flex', gap: '10px' }}>
              {(['Street', 'Outdoor', 'Indoor'] as const).map(terrain => (
                <button
                  key={terrain}
                  className={`terrain-btn ${selectedTerrain === terrain ? 'active' : ''}`}
                  onClick={() => setSelectedTerrain(terrain)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid #ccc',
                    background: selectedTerrain === terrain ? '#4CAF50' : 'white',
                    color: selectedTerrain === terrain ? 'white' : 'black',
                    cursor: 'pointer'
                  }}
                >
                  {terrain}
                </button>
              ))}
            </div>
          </div>
          <TeamStatsCalculator team={team} terrain={selectedTerrain} />
        </div>

        {/* Student Selection Section */}
        <div className="student-selection">
          <div className="selection-header">
            <h3>Available Students</h3>
            <div className="search-section">
              <input
                type="text"
                placeholder="Search students..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
              <div className="count">Found: {filteredStudents.length}</div>
            </div>
          </div>

          <div className="student-grid">
            {filteredStudents.map((student) => {
              const isInTeam = team.some(slot => slot.student?.Id === student.Id);
              const compatibleSlots = team.filter(slot =>
                !slot.student &&
                ((slot.squadType === 'main' && student.SquadType === 'Main') ||
                 (slot.squadType === 'support' && student.SquadType === 'Support'))
              );
              const canPlace = compatibleSlots.length > 0 && !isInTeam;

              return (
                <div
                  key={student.Id}
                  className={`student-card ${isInTeam ? 'in-team' : ''} ${canPlace ? 'can-place' : 'cannot-place'}`}
                  onClick={() => {
                    if (canPlace) {
                      // Find first compatible empty slot
                      const emptySlot = compatibleSlots[0];
                      if (emptySlot) {
                        addStudentToTeam(student, emptySlot.id);
                      }
                    }
                  }}
                >
                  <img
                    src={`${SCHALE_IMAGE_URL.icon}/${student.Id}.webp`}
                    alt={student.Name}
                    className="student-avatar"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/60x60?text=?';
                    }}
                  />
                  <div className="student-info">
                    <h4>{student.Name}</h4>
                    <p className="school">{student.School}</p>
                    <div className="tags">
                      <span className={`tag ${student.BulletType.toLowerCase()}`}>
                        {student.BulletType}
                      </span>
                      <span className={`tag ${student.ArmorType.toLowerCase()}`}>
                        {student.ArmorType.replace('Armor', '')}
                      </span>
                    </div>
                  </div>
                  {isInTeam && <div className="in-team-indicator">✓</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};