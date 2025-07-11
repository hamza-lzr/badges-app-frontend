import React from 'react';
import GridLayout from '../components/GridLayout';
import '../styles/index.css';

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <h1>Admin Interface Home</h1>
            <GridLayout>
                {/* Home specific content goes here */}
                <></>
            </GridLayout>
        </div>
    );
};

export default Home;