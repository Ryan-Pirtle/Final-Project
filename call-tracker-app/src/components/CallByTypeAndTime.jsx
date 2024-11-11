import React, { useEffect, useState } from 'react';
import axios from 'axios';

const callType = 'Water Leak'; // Replace with the desired call type
const startDate = '2022-01-01'; // Replace with the desired start date
const endDate = '2024-12-31'; // Replace with the desired end date


const CallsList = () => {
    const [calls, setCalls] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:5000/api/calls-by-type-and-time', {
            params: {
                callType: callType,
                time_dispatched: startDate,
                time_completed: endDate
            }
        })
            .then(response => {setCalls(response.data.data)
                console.log("Response from database", response)
            })
            .catch(error => console.error('Error fetching calls:', error));
    }, []);

    return (
        <div>
            <h1>Specific Call Logs</h1>
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