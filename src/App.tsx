import './App.css'
import { useState } from 'react'
import { StudentList } from './components/StudentList'
import { TeamBuilder } from './features/team-builder/TeamBuilder'

function App() {
  const [currentView, setCurrentView] = useState<'student-list' | 'team-builder'>('student-list')

  return (
    <div className="app-container">
      <header>
        <h1>Blue Archive Sensei no Enjo</h1>
        <nav className="view-toggle">
          <button
            className={`nav-btn ${currentView === 'student-list' ? 'active' : ''}`}
            onClick={() => setCurrentView('student-list')}
          >
            Student Database
          </button>
          <button
            className={`nav-btn ${currentView === 'team-builder' ? 'active' : ''}`}
            onClick={() => setCurrentView('team-builder')}
          >
            Team Builder
          </button>
        </nav>
      </header>
      <main>
        {currentView === 'student-list' ? (
          <>
            <p>Welcome to the fan tool. Browse students and build your perfect team.</p>
            <StudentList />
          </>
        ) : (
          <TeamBuilder onClose={() => setCurrentView('student-list')} />
        )}
      </main>
    </div>
  )
}

export default App
