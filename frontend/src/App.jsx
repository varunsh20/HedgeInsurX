import {Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Dashboard from './components/Dashboard/Dashboard';
import Insurance from './components/Insurance/Insurance';
import Bridge from './components/Bridge/Bridge';
import Strategies from './components/Dashboard/[Strategies]';
import MyPolicies from './components/Dashboard/MyPolicies';

function App() {
  return (
    <>
    <Navbar/>
    <Routes>
      <Route path = "/" element = {<Home/>}/>
      <Route path = "/home" element = {<Home/>}/>
      <Route path = "/dashboard" element = {<Dashboard/>}/>
      <Route path = "/insurance" element = {<Insurance/>}/>
      <Route path = "/bridge" element = {<Bridge/>}/>
      <Route path = "/strategies" element = {<Strategies/>}/>
      <Route path = "/myPolicies" element = {<MyPolicies/>}/>
      <Route path = "/strategies" element = {<Strategies/>}/>
    </Routes>
    </>
  )
}

export default App
