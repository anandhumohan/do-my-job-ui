import React, { useState, useRef, useCallback } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, TextField } from "@mui/material";


import { DatePicker} from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // Import LocalizationProvider
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from './Sidebar';

import './index.css';

const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: '' },
        position: { x: 250, y: 5 },
    },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const App = () => {
    let initialId = 0;
    const getId = () => `dndnode_${initialId++}`;
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null); // State for tracking the selected node
    const [openDialog, setOpenDialog] = useState(false);
    const [scheduleType, setScheduleType] = useState('one-time');
    const [scheduleDateTime, setScheduleDateTime] = useState(new Date());

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (typeof type === 'undefined' || !type) {
            return;
        }
        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        const newNode = {
            id: getId(),
            type: type,
            position,
            data: {
                label: `${type}`,
                // Example specific properties for an "EmailTask"
                from: '',
                to: '',
                subject: '',
                body: ''
            },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance]);


    const clearFlow = () => {
        setNodes([...initialNodes]); // Spread into a new array to trigger state update
        setEdges([]);
        setSelectedNode(null);
        id = initialNodes.length;
    };

    const saveFlow = async () => {
        // Placeholder values - you might want to create UI elements to capture these
        const workflowName = "My Workflow";
        const scheduleTime = new Date().toISOString();
        const tasks = nodes.map(node => {
            // Default task structure
            let task = {
                type: node.type,
                label: node.data.label,
            };

            if (node.type === 'Email') {
                task = {
                    ...task,
                    from: node.data.from,
                    to: node.data.to,
                    subject: node.data.subject,
                    body: node.data.body,
                };
            }
            return task;
        });

        const jobChain = {
            workflowName: workflowName,
            scheduleTime: scheduleTime,
            tasks: tasks,
        };


        try {
            const response = await fetch('http://localhost:8080/api/tasks/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobChain),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            console.log("JobChain saved successfully");
        } catch (error) {
            console.error("Failed to save JobChain:", error);
        }
    };



    const updateNodeData = (nodeId, newData) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };



// Ensure onNodeClick updates selectedNode with the latest node data
    const onNodeClick = useCallback((event, node) => {
        const updatedNode = nodes.find(n => n.id === node.id);
        setSelectedNode(updatedNode);
    }, [nodes]);


    return (
        <div className="dndflow" style={{ width: '100%', height: '900px' }}>
            <ReactFlowProvider>
                <AppBar >
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Do My Job
                        </Typography>
                        {/* Place additional navigation items here if needed */}
                    </Toolbar>
                </AppBar>
                <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={(event, node) => setSelectedNode(node)} // Handling node click to set the selected node
                        fitView
                    >
                        <Controls />
                    </ReactFlow>
                    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DialogTitle>Choose Schedule Type</DialogTitle>
                        <DialogContent>
                            <RadioGroup
                                aria-label="schedule-type"
                                name="scheduleType"
                                value={scheduleType}
                                onChange={(e) => setScheduleType(e.target.value)}
                            >
                                <FormControlLabel value="one-time" control={<Radio />} label="One-time" />
                                {scheduleType === 'one-time' && (
                                    <DateTimePicker
                                        renderInput={(props) => <TextField {...props} />}
                                        label="Schedule Date and Time"
                                        value={scheduleDateTime}
                                        onChange={(newValue) => {
                                            setScheduleDateTime(newValue);
                                        }}
                                    />
                                )}
                                <FormControlLabel value="repeated" control={<Radio />} label="Repeated" />
                            </RadioGroup>

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button onClick={() => {
                                setOpenDialog(false);
                                saveFlow(); // Now saveFlow should include logic to use scheduleDateTime
                            }}>OK</Button>
                        </DialogActions>
                        </LocalizationProvider>
                    </Dialog>


                    <Box sx={{ position: 'absolute', right: 360, bottom: 16, '& > *': { m: 1 } }}>
                        <Button variant="contained"  onClick={clearFlow}>Clear</Button>
                        <Button variant="contained" style={{ marginLeft: '5px' }} onClick={() => setOpenDialog(true)}>Submit</Button>
                    </Box>
                </div>
                <Sidebar selectedNode={selectedNode} updateNodeData={updateNodeData} />

            </ReactFlowProvider>
        </div>
    );
};

export default App;
