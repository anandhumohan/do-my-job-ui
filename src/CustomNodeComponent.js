// CustomNodeComponent.js
import React from 'react';

const CustomNodeComponent = ({data}) => {
    const handleClick = () => {
        // Handle click event
        console.log('Node clicked', data);
    };

    return (
        <div onClick={handleClick} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 5 }}>
            {data.label}
        </div>
    );
};

export default CustomNodeComponent;
