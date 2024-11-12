import React from 'react';
import CallsList from './components/CallsList';
import CallByTypeAndTime from './components/CallByTypeAndTime';
import LoginPage from './LoginPage';

function App() {
    return (
        <div>
            <h1>Jackson Purchase Energy Call Tracker</h1>
            <CallsList />
            <CallByTypeAndTime />
        </div>
    );
}

export default App;