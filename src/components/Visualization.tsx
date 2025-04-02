import React, { useRef, useEffect, useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Handle,
  Position,
  NodeTypes,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Modal, Button } from 'antd';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';

// Interfaces for devices and links
export interface DraggableImage {
  id: number;
  name: string;
  src: string;
  x: number;
  y: number;
}

export interface Link {
  from: number;
  to: number;
}

// Define a custom interface for our node's data
interface CustomNodeData {
  label: string;
  src: string;
  onDelete: (id: string) => void; 
  onDetails: () => void;
}

// Define our custom node type
type CustomNodeType = Node<CustomNodeData, 'custom'>;

// Custom node component with handles and a top-centered toolbar
const CustomNode = ({ id, data }: { id: string; data: CustomNodeData }) => {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 5,
        background: 'none',
        position: 'relative',
      }}
    >
      {/* Incoming handle */}
      <Handle type="target" position={Position.Left} style={{ top: '50%', transform: 'translateY(-50%) translateX(+500%)', zIndex: -1, border: 'none', background: 'none' }} />
      
      <img src={data.src} alt={data.label} style={{ width: 50, height: 50 }} />
      <div style={{ textAlign: 'center' }}>{data.label}</div>
      
      {/* Outgoing handle */}
      <Handle type="source" position={Position.Right} style={{ top: '50%', transform: 'translateY(-50%) translateX(-500%)', zIndex: -1, border: 'none', background: 'none' }} />
      
      {/* Toolbar with Delete and Details icon buttons, centered at the top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: '4px',
        }}
      >
        <Button type="text" icon={<DeleteOutlined />} onClick={() => data.onDelete(id)} />
        <Button type="text" icon={<InfoCircleOutlined />} onClick={data.onDetails} />
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface VisualizationProps {
  devices: DraggableImage[];
  links: Link[];
}

const Visualization: React.FC<VisualizationProps> = ({ devices, links }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // State for the details modal; when a device is selected, its info is stored here.
  const [selectedDevice, setSelectedDevice] = useState<{
    id: string;
    label: string;
    src: string;
  } | null>(null);

  // Use our custom node type with React Flow state hooks.
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  // Callback to delete a node (and remove connected edges)
  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    },
    [setNodes, setEdges]
  );

  // Callback to show device details in a modal.
  const handleDetails = useCallback((id: string, label: string, src: string) => {
    setSelectedDevice({ id, label, src });
  }, []);

  // Build nodes from devices and attach callbacks.
  useEffect(() => {
    setNodes(
      devices.map((device): Node<CustomNodeData, 'custom'> => ({
        id: device.id.toString(),
        type: 'custom',
        data: {
          label: device.name,
          src: device.src,
          onDelete: handleDeleteNode,
          onDetails: () =>
            handleDetails(device.id.toString(), device.name, device.src),
        },
        position: { x: device.x, y: device.y },
      }))
    );
  }, [devices, handleDeleteNode, handleDetails, setNodes]);

  // Build edges from links; set edge type to "straight".
  useEffect(() => {
    setEdges(
      links.map((link, index) => ({
        id: `e${index}`,
        source: link.from.toString(),
        target: link.to.toString(),
        type: 'straight',
        animated: true,
      }))
    );
  }, [links, setEdges]);

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          // Remove fitView so the coordinates remain as provided:
          defaultEdgeOptions={{ style: { strokeWidth: 3, stroke: '#222' } }}
          style={{ background: '#f0f0f0' }}
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div> 
      {/* Modal to display device details */}
      <Modal
        title="Device Details"
        visible={!!selectedDevice}
        onCancel={() => setSelectedDevice(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedDevice(null)}>
            Close
          </Button>,
        ]}
      >
        {selectedDevice && (
          <div style={{ textAlign: 'center' }}>
            <img src={selectedDevice.src} alt={selectedDevice.label} style={{ width: 100, height: 100 }} />
            <p>ID: {selectedDevice.id}</p>
            <p>Name: {selectedDevice.label}</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Visualization;
