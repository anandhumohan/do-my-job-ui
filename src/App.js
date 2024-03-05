import React, { useState, useRef, useCallback } from 'react';
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
import {Box, Button} from "@mui/material";

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

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
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
                type,
                position,
                data: { label: `${type}` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance],
    );

    const clearFlow = () => {
        setNodes([...initialNodes]); // Spread into a new array to trigger state update
        setEdges([]);
        setSelectedNode(null);
        id = initialNodes.length;
    };

    const submitFlow = () => {
        // Implement your submit logic here
        // For demonstration, logging to console
        console.log("Submitting", { nodes, edges });
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
                    <Box sx={{ position: 'absolute', right: 360, bottom: 16, '& > *': { m: 1 } }}>
                        <Button variant="contained"  onClick={clearFlow}>Clear</Button>
                        <Button variant="contained" onClick={submitFlow}>Submit</Button>
                    </Box>
                </div>
                <Sidebar selectedNode={selectedNode} updateNodeData={updateNodeData} />

            </ReactFlowProvider>
        </div>
    );
};

export default App;
