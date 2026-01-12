import React, { useState } from 'react';
import { students, Student } from '../data/students';
import './StudentList.css';

export const StudentList: React.FC = () => {
  const [filter, setFilter] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(filter.toLowerCase()) ||
    student.school.toLowerCase().includes(filter.toLowerCase())
  );

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
      </div>
      <div className="grid">
        {filteredStudents.map((student) => (
          <div key={student.id} className="student-card">
            <img src={student.avatarUrl} alt={student.name} className="student-avatar" />
            <div className="student-info">
              <h3>{student.name}</h3>
              <p className="school">{student.school}</p>
              <div className="tags">
                <span className={`tag ${student.attackType.toLowerCase()}`}>{student.attackType}</span>
                <span className={`tag ${student.armorType.toLowerCase()}`}>{student.armorType}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
