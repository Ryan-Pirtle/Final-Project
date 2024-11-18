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
  // const [otherData, setOtherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const loginAndFetchData = async () => {
      if (!token) {
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
          console.log("details ",userDetails)

          // const otherDataResponse = await axios.get('http://localhost:5000/api/other-data', {
          //   headers: { Authorization: `Bearer ${fetchedToken}` },
          // });
          // setOtherData(otherDataResponse.data);
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