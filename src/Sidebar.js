import React, { useState, useEffect } from 'react';
import { TextField, Typography, Paper, Box, Button } from '@mui/material';

const Sidebar = ({ selectedNode, updateNodeData }) => {
    const [label, setLabel] = useState('');
    const [emailFrom, setEmailFrom] = useState('');
    const [emailTo, setEmailTo] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label || '');
            setEmailFrom(selectedNode.data.from || '');
            setEmailTo(selectedNode.data.to || '');
            setEmailSubject(selectedNode.data.subject || '');
            setEmailBody(selectedNode.data.body || '');
        } else {
            setLabel('');
            setEmailFrom('');
            setEmailTo('');
            setEmailSubject('');
            setEmailBody('');
        }
    }, [selectedNode]);

    const handleInputChange = (value, field) => {
        switch (field) {
            case 'label':
                setLabel(value);
                break;
            case 'from':
                setEmailFrom(value);
                break;
            case 'to':
                setEmailTo(value);
                break;
            case 'subject':
                setEmailSubject(value);
                break;
            case 'body':
                setEmailBody(value);
                break;
            default:
                break;
        }

        if (selectedNode) {
            const updatedData = { ...selectedNode.data, [field]: value };
            updateNodeData(selectedNode.id, updatedData);
        }
    };

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const renderPropertiesForm = () => {
        switch (selectedNode?.type) {
            case 'Email':
                return (
                    <>
                        <TextField label="From" fullWidth margin="normal" value={emailFrom} onChange={(e) => handleInputChange(e.target.value, 'from')} />
                        <TextField label="To" fullWidth margin="normal" value={emailTo} onChange={(e) => handleInputChange(e.target.value, 'to')} />
                        <TextField label="Subject" fullWidth margin="normal" value={emailSubject} onChange={(e) => handleInputChange(e.target.value, 'subject')} />
                        <TextField label="Body" fullWidth multiline rows={4} margin="normal" value={emailBody} onChange={(e) => handleInputChange(e.target.value, 'body')} />
                    </>
                );
            default:
                return (
                    <TextField label="Work flow name" fullWidth margin="normal" value={label} onChange={(e) => handleInputChange(e.target.value, 'label')} />
                );
        }
    };

    return (
        <Paper elevation={3} style={{ padding: '30px', margin: '20px', width: '250px' }}>
            <Box mt={2}>
                <Button variant="contained" color="secondary" fullWidth onDragStart={(event) => onDragStart(event, 'DB Update')} draggable>
                    DB Update
                </Button>
                <Button variant="contained" color="secondary" fullWidth onDragStart={(event) => onDragStart(event, 'Email')} draggable style={{ marginTop: '5px' }}>
                    Email
                </Button>
            </Box>
            <Typography mt={12} variant="h6" gutterBottom>Task Properties</Typography>
            <Box mt={2}>
                {renderPropertiesForm()}
            </Box>
        </Paper>
    );
};

export default Sidebar;
