import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CallsList = () => {
    const [calls, setCalls] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/calls')
            .then(response => setCalls(response.data.data))
            .catch(error => console.error('Error fetching calls:', error));
    }, []);

    return (
        <div>
            <h1>Call Logs</h1>
            <ul>
                {calls.map(call => (
                    <li key={call.id}>
                        {call.customer_name} reported a {call.call_type} - {call.issue_reported}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CallsList;