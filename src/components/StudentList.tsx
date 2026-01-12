import React, { useState, useEffect } from 'react';
import { fetchStudents, SCHALE_IMAGE_URL } from '../data/students';
import type { Student } from '../data/students';
import { CharacterDetails } from './CharacterDetails';
import './StudentList.css';

export const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Filter states
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedStarGrade, setSelectedStarGrade] = useState<string>('');
  const [selectedSquadType, setSelectedSquadType] = useState<string>('');
  const [selectedTacticRole, setSelectedTacticRole] = useState<string>('');
  const [selectedBulletType, setSelectedBulletType] = useState<string>('');
  const [selectedArmorType, setSelectedArmorType] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchStudents();
      setStudents(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Helper functions to get unique values for filters
  const getUniqueSchools = () => [...new Set(students.map(s => s.School))].sort();
  const getUniqueTacticRoles = () => [...new Set(students.map(s => s.TacticRole))].sort();
  const getUniqueBulletTypes = () => ['Explosion', 'Pierce', 'Mystic', 'Sonic', 'Normal'];
  const getUniqueArmorTypes = () => ['LightArmor', 'HeavyArmor', 'SpecialArmor', 'ElasticArmor'];

  const filteredStudents = students.filter(student => {
    // Text search (name, school, club)
    const matchesText = searchText === '' ||
      student.Name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.School.toLowerCase().includes(searchText.toLowerCase()) ||
      student.Club.toLowerCase().includes(searchText.toLowerCase());

    // School filter
    const matchesSchool = selectedSchool === '' || student.School === selectedSchool;

    // Star grade filter
    const matchesStarGrade = selectedStarGrade === '' || student.StarGrade.toString() === selectedStarGrade;

    // Squad type filter
    const matchesSquadType = selectedSquadType === '' || student.SquadType === selectedSquadType;

    // Tactic role filter
    const matchesTacticRole = selectedTacticRole === '' || student.TacticRole === selectedTacticRole;

    // Bullet type filter
    const matchesBulletType = selectedBulletType === '' || student.BulletType === selectedBulletType;

    // Armor type filter
    const matchesArmorType = selectedArmorType === '' || student.ArmorType === selectedArmorType;

    return matchesText && matchesSchool && matchesStarGrade && matchesSquadType &&
           matchesTacticRole && matchesBulletType && matchesArmorType;
  });

  if (loading) {
    return <div className="loading">Loading student data...</div>;
  }

  return (
    <div className={`student-list-container ${selectedStudent ? 'has-sidebar' : ''}`}>
      <div className="controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name, school, or club..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
          <div className="count">Found: {filteredStudents.length}</div>
        </div>

        <div className="filters-section">
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="filter-select"
          >
            <option value="">All Schools</option>
            {getUniqueSchools().map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>

          <select
            value={selectedStarGrade}
            onChange={(e) => setSelectedStarGrade(e.target.value)}
            className="filter-select"
          >
            <option value="">All Rarities</option>
            <option value="1">★</option>
            <option value="2">★★</option>
            <option value="3">★★★</option>
          </select>

          <select
            value={selectedSquadType}
            onChange={(e) => setSelectedSquadType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Squad Types</option>
            <option value="Main">Main</option>
            <option value="Support">Support</option>
          </select>

          <select
            value={selectedTacticRole}
            onChange={(e) => setSelectedTacticRole(e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            {getUniqueTacticRoles().map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={selectedBulletType}
            onChange={(e) => setSelectedBulletType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Attack Types</option>
            {getUniqueBulletTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={selectedArmorType}
            onChange={(e) => setSelectedArmorType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Armor Types</option>
            {getUniqueArmorTypes().map(type => (
              <option key={type} value={type}>{type.replace('Armor', '')}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchText('');
              setSelectedSchool('');
              setSelectedStarGrade('');
              setSelectedSquadType('');
              setSelectedTacticRole('');
              setSelectedBulletType('');
              setSelectedArmorType('');
            }}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      </div>
      <div className="grid">
        {filteredStudents.map((student) => (
          <div
            key={student.Id}
            className={`student-card ${selectedStudent?.Id === student.Id ? 'selected' : ''}`}
            onClick={() => setSelectedStudent(selectedStudent?.Id === student.Id ? null : student)}
          >
            <img
              src={`${SCHALE_IMAGE_URL.icon}/${student.Id}.webp`}
              alt={student.Name}
              className="student-avatar"
              loading="lazy"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=?';
              }}
            />
            <div className="student-info">
              <h3>{student.Name}</h3>
              <p className="school">{student.School}</p>
              <div className="tags">
                <span className={`tag ${student.BulletType.toLowerCase()}`}>{student.BulletType}</span>
                <span className={`tag ${student.ArmorType.toLowerCase()}`}>{student.ArmorType.replace('Armor', '')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Character Details Sidebar */}
      <CharacterDetails
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
};
