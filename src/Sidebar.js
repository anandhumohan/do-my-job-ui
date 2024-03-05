import React from 'react';
import { TextField, Button, Typography, Paper, Box } from '@mui/material';
//import './Sidebar.css'; // You might need to adjust your CSS after adding Material-UI components

const Sidebar = ({ selectedNode }) => {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const renderNodeDetails = (node) => {
        if (!node) {
            return <Typography></Typography>;
        }

        switch (node.type) {
            case 'initialTask':
                return (
                    <Box>
                        <TextField label="Name" variant="outlined" fullWidth margin="normal" placeholder="Enter name" />
                    </Box>
                );
            case 'email':
                return (
                    <Box>
                        <TextField label="From" variant="outlined" fullWidth margin="normal" placeholder="From" />
                        <TextField label="To" variant="outlined" fullWidth margin="normal" placeholder="To" />
                        <TextField label="Subject" variant="outlined" fullWidth margin="normal" placeholder="Subject" />
                    </Box>
                );
            case 'dbUpdate':
                return (
                    <Box>
                        <TextField label="DB Name" variant="outlined" fullWidth margin="normal" placeholder="Enter DB name" />
                    </Box>
                );
            default:
                return <Typography>Select a node to edit its details.</Typography>;
        }
    };

    return (
        <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
            <Typography variant="h6" gutterBottom>
                You can drag these tasks to the pane on the left.
            </Typography>
            <div>
            <Button variant="contained" color="secondary" style={{ margin: '10px 0' }} onDragStart={(event) => onDragStart(event, 'dbUpdate')} draggable>
                DB Update
            </Button>
            </div><div>
            <Button variant="contained"  color="secondary" style={{ margin: '10px 0' }} onDragStart={(event) => onDragStart(event, 'email')} draggable>
                Email
            </Button></div>
            {renderNodeDetails(selectedNode)}
        </Paper>
    );
};

export default Sidebar;
