
import './App.css'
import Editor from './subcomponents/Editor'

function App() {
 

  return (
    <div className='h-screen grid' style={{gridTemplateColumns:"40% 60%"}}>
      <div>
       Question
      </div>
      <div className='w-full'>
      <Editor/>
      </div>
     
    </div>
  )
}

export default App
