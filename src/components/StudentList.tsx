import React, { useState, useEffect } from 'react';
import { fetchStudents, SCHALE_IMAGE_URL } from '../data/students';
import type { Student } from '../data/students';
import './StudentList.css';

export const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchStudents();
      setStudents(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredStudents = students.filter(student =>
    student.Name.toLowerCase().includes(filter.toLowerCase()) ||
    student.School.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading student data...</div>;
  }

  return (
    <div className="student-list-container">
      <div className="controls">
        <input
          type="text"
          placeholder="Search students..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
        <div className="count">Found: {filteredStudents.length}</div>
      </div>
      <div className="grid">
        {filteredStudents.map((student) => (
          <div key={student.Id} className="student-card">
            <img 
              src={`${SCHALE_IMAGE_URL}/${student.Id}.webp`} 
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
    </div>
  );
};
