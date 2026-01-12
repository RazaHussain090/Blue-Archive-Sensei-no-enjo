import './App.css'
import { StudentList } from './components/StudentList'

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Blue Archive Sensei no Enjo</h1>
      </header>
      <main>
        <p>Welcome to the fan tool. Select a module to begin.</p>
        <StudentList />
      </main>
    </div>
  )
}

export default App
