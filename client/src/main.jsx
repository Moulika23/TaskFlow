import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/*
  main.jsx — The entry point of the React app.
  
  What this does:
  - Finds the <div id="root"> in index.html
  - Renders our entire React app inside it
  
  StrictMode is a React developer tool that shows extra warnings
  in the browser console during development. It doesn't affect production.
  It's a good habit to keep it on while learning.
*/
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
