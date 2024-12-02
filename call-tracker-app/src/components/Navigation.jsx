import React from 'react';
import { Link } from 'react-router-dom';

const NavigationHeader = () => {
  return (
    <nav style={styles.nav}>
      <ul style={styles.ul}>
        <li style={styles.li}>
          <Link to="/CallsPage" style={styles.link}>Calls</Link>
        </li>
        <li style={styles.li}>
          <Link to="/UsersPage" style={styles.link}>Users</Link>
        </li>
        <li style={styles.li}>
          <Link to="/CrewsPage" style={styles.link}>Crews</Link>
        </li>
        <li style={styles.li}>
          <Link to="/" style={styles.link}>Logout</Link>
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#343a40',
    padding: '10px',
  },
  ul: {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  li: {
    marginRight: '20px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '18px',
  },
};

export default NavigationHeader;
