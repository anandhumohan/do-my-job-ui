import React, { useState, useRef, useCallback } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, TextField } from "@mui/material";
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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

const initialNodes = [{ id: '1', type: 'input', data: { label: '' }, position: { x: 250, y: 5 } }];

const App = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [scheduleType, setScheduleType] = useState('one-time');
    const [scheduleDateTime, setScheduleDateTime] = useState(new Date());

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
    const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);
    const onDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newNode = { id: `dndnode_${nodes.length}`, type, position, data: { label: `${type}` } };
        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, nodes.length]);

    const saveFlow = async () => {
        const jobChain = { workflowName: "My Workflow", scheduleTime: new Date().toISOString(), tasks: nodes.map(node => ({ type: node.type, ...node.data })) };
        try {
            const response = await fetch('http://localhost:8080/api/tasks/schedule', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jobChain),
            });
            if (!response.ok) throw new Error('Network response was not ok.');
            console.log("JobChain saved successfully");
        } catch (error) {
            console.error("Failed to save JobChain:", error);
        }
    };

    const updateNodeData = (nodeId, newData) => setNodes((prevNodes) => prevNodes.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node));
    const onNodeClick = useCallback((event, node) => setSelectedNode(nodes.find(n => n.id === node.id)), [nodes]);

    return (
        <div className="dndflow" style={{ width: '100%', height: '900px' }}>
            <ReactFlowProvider>
                <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                        onConnect={onConnect} onInit={setReactFlowInstance} onDrop={onDrop} onDragOver={onDragOver}
                        onNodeClick={onNodeClick} fitView>
                        <Controls />
                    </ReactFlow>
                    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DialogTitle>Choose Schedule Type</DialogTitle>
                            <DialogContent>
                                <RadioGroup aria-label="schedule-type" name="scheduleType" value={scheduleType} onChange={(e) => setScheduleType(e.target.value)}>
                                    <FormControlLabel value="one-time" control={<Radio />} label="One-time" />
                                    {scheduleType === 'one-time' && (
                                        <DateTimePicker renderInput={(props) => <TextField {...props} />} label="Schedule Date and Time" value={scheduleDateTime} onChange={setScheduleDateTime} />
                                    )}
                                    <FormControlLabel value="repeated" control={<Radio />} label="Repeated" />
                                </RadioGroup>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                                <Button onClick={() => { setOpenDialog(false); saveFlow(); }}>OK</Button>
                            </DialogActions>
                        </LocalizationProvider>
                    </Dialog>
                    <Box sx={{ position: 'absolute', right: 360, bottom: 16, '& > *': { m: 1 } }}>
                        <Button variant="contained" onClick={() => setNodes([...initialNodes]) && setEdges([]) && setSelectedNode(null)}>Clear</Button>
                        <Button variant="contained" onClick={() => setOpenDialog(true)}>Submit</Button>
                    </Box>
                </div>
                <Sidebar selectedNode={selectedNode} updateNodeData={updateNodeData} />
            </ReactFlowProvider>
        </div>
    );
};

export default App;
