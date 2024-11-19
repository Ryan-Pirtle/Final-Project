import React, { useEffect, useState } from 'react';
import axios from 'axios';

// import {
//   MDBBtn,
//   MDBContainer,
//   MDBRow,
//   MDBCol,
//   MDBCard,
//   MDBCardBody,
//   MDBInput,
//   MDBIcon
// }
// from 'mdb-react-ui-kit';


function LoginPage() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userDetails, setUserDetails] = useState(null);
  const [data, setOtherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const loginAndFetchData = async () => {
      if (token) {
        try {
          // Login API Request
          const loginResponse = await axios.post('http://localhost:5000/api/login', {
            email: "rpirdsaftle@jpec.org",
            password: "password",
          });
          const fetchedToken = loginResponse.data.token;
          setToken(fetchedToken);
          localStorage.setItem('token', fetchedToken);

          // Subsequent API Requests (Only if login is successful)
          const userDetailsResponse = await axios.get('http://localhost:5000/api/protected', {
            headers: { Authorization: `Bearer ${fetchedToken}` },
          });
          console.log(userDetailsResponse);
          setUserDetails(userDetailsResponse.message);

          const otherDataResponse = await axios.get('http://localhost:5000/api/calls', {
            headers: { Authorization: `Bearer ${fetchedToken}` },
          });
          console.log("Calls data ", otherDataResponse)
          console.log("Calls data.data ", otherDataResponse.data.data)
          setOtherData(otherDataResponse.data.data);
        } catch (error) {
          setErrorMessage('Failed to log in or fetch data.');
          console.error('Error:', error.response?.data || error.message);
        }
      }
    };

    loginAndFetchData();
  }, [token]);

  return (
    <div>
    {token ? <p>Logged in successfully! Token: {token}</p> : <p>Logging in...</p>}
    <input id= "one" type="text" />
    <input id= "two" type="text" />
    <h1>User List</h1>
      <ul>
        {/* {otherData.data} */}
        {/* {userDetails} */}
        <h1>Call Records</h1>
        
      {data && data.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Caller Name</th>
              <th>Caller Address</th>
              <th>Call Type</th>
              <th>Crew Assigned</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.caller_name}</td>
                <td>{item.caller_address}</td>
                <td>{item.call_type}</td>
                <td>{item.crew_assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available.</p>
      )}
      </ul>
    </div>
    

    // <MDBContainer fluid>

    //   <MDBRow className='d-flex justify-content-center align-items-center h-100'>
    //     <MDBCol col='12'>

    //       <MDBCard className='bg-dark text-white my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '400px'}}>
    //         <MDBCardBody className='p-5 d-flex flex-column align-items-center mx-auto w-100'>

    //           <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
    //           <p className="text-white-50 mb-5">Please enter your login and password!</p>

    //           <MDBInput wrapperClass='mb-4 mx-5 w-100' labelClass='text-white' label='Email address' id='formControlLg' type='email' size="lg"/>
    //           <MDBInput wrapperClass='mb-4 mx-5 w-100' labelClass='text-white' label='Password' id='formControlLg' type='password' size="lg"/>

    //           <p className="small mb-3 pb-lg-2"><a class="text-white-50" href="#!">Forgot password?</a></p>
    //           <MDBBtn outline className='mx-2 px-5' color='white' size='lg'>
    //             Login
    //           </MDBBtn>

    //           <div className='d-flex flex-row mt-3 mb-5'>
    //             <MDBBtn tag='a' color='none' className='m-3' style={{ color: 'white' }}>
    //               <MDBIcon fab icon='facebook-f' size="lg"/>
    //             </MDBBtn>

    //             <MDBBtn tag='a' color='none' className='m-3' style={{ color: 'white' }}>
    //               <MDBIcon fab icon='twitter' size="lg"/>
    //             </MDBBtn>

    //             <MDBBtn tag='a' color='none' className='m-3' style={{ color: 'white' }}>
    //               <MDBIcon fab icon='google' size="lg"/>
    //             </MDBBtn>
    //           </div>

    //           <div>
    //             <p className="mb-0">Don't have an account? <a href="#!" class="text-white-50 fw-bold">Sign Up</a></p>

    //           </div>
    //         </MDBCardBody>
    //       </MDBCard>

    //     </MDBCol>
    //   </MDBRow>

    // </MDBContainer>
  );
}

export default LoginPage;