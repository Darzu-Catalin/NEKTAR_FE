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
import { Modal, Button, Popconfirm, Space, Typography, Avatar } from 'antd';  
import { DeleteOutlined } from '@ant-design/icons';
import { DraggableImage, InterfaceDetails, Link } from '../types'; // Import shared types

// Define a custom interface for our node's data
interface CustomNodeData {
  label: string;
  src: string;
  onDelete: (id: string) => void;
  onDetails: () => void;
  // Add new characteristics from the Python script
  type: string;
  coordinates: string;
  power_on: boolean;
  interface: InterfaceDetails;
}

// Define our custom node type
type CustomNodeType = Node<CustomNodeData, 'custom'>;

// Custom node component with handles and a top-centered toolbar
// Modifications:
// 1. Removed the Info button.
// 2. Added an onDoubleClick to open the details modal.
// 3. Wrapped the delete button in a toolbar that is hidden by default and visible on hover.
// 4. The delete button now confirms before deleting.
const CustomNode = ({ id, data }: { id: string; data: CustomNodeData }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the double-click
    if (window.confirm('Are you sure you want to delete this node?')) {
      data.onDelete(id);
    }
  };

  return (
    <div
      className="custom-node"
      onDoubleClick={() => data.onDetails()}
      style={{
        padding: 10,
        borderRadius: 5,
        background: 'none',
        position: 'relative',
      }}
    >
      {/* Incoming handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          top: '50%',
          transform: 'translateY(-50%) translateX(+500%)',
          zIndex: -1,
          border: 'none',
          background: 'none',
        }}
      />
      
      <img src={data.src} alt={data.label} style={{ width: 50, height: 50 }} />
      <div style={{ textAlign: 'center' }}>{data.label}</div>
      
      {/* Outgoing handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          top: '50%',
          transform: 'translateY(-50%) translateX(-500%)',
          zIndex: -1,
          border: 'none',
          background: 'none',
        }}
      />
      
      {/* Toolbar with Delete icon button, visible only on hover */}
      <div
        className="node-toolbar"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: '4px',
        }}
      >
        <Popconfirm
          title="Are you sure you want to delete this node?"
          onConfirm={() => data.onDelete(id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      </div>
      <style>
        {`
          .custom-node .node-toolbar {
            opacity: 0;
            transition: opacity 0.3s;
          }
          .custom-node:hover .node-toolbar {
            opacity: 1;
          }
        `}
      </style>
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
    type: string;
    coordinates: string;
    power_on: boolean;
    interface: InterfaceDetails;
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
  const handleDetails = useCallback(
    (id: string, label: string, src: string, type: string, coordinates: string, power_on: boolean, interfaceDetails: InterfaceDetails) => {
      setSelectedDevice({ id, label, src, type, coordinates, power_on, interface: interfaceDetails });
    },
    []
  );

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
            handleDetails(
              device.id.toString(),
              device.name,
              device.src,
              device.type || 'unknown',
              device.coordinates || `${device.x} ${device.y}`,
              device.power_on || false,
              device.interface || { name: 'FastEthernet0', ip: '0.0.0.0', bandwidth: 0 }
            ),
          // Add the new characteristics
          type: device.type || 'unknown',
          coordinates: device.coordinates || `${device.x} ${device.y}`,
          power_on: device.power_on || false,
          interface: device.interface || { name: 'FastEthernet0', ip: '0.0.0.0', bandwidth: 0 },
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
        width={400} // Make the modal smaller (default is 520px)
        footer={[
          <Button
            key="close"
            onClick={() => setSelectedDevice(null)}
            style={{
              backgroundColor: 'transparent',
              color: '#007AFF', // Apple blue for the button
              border: 'none',
              fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
              fontWeight: 500,
            }}
          >
            Close
          </Button>,
        ]}
        style={{
          borderRadius: '12px', // Slightly smaller radius for a compact look
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // Softer shadow
        }}
        styles={{
          header: {
            backgroundColor: '#FFFFFF', // Solid white background
            borderBottom: '1px solid #E5E5EA', // Light gray border
            padding: '12px 16px', // Slightly less padding for a compact header
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            color: '#1D1D1F',
            fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
            fontWeight: 600,
            fontSize: '16px', // Smaller title font size
          },
          body: {
            backgroundColor: '#FFFFFF', // Solid white background
            padding: '16px', // Reduced padding for a compact feel
            color: '#1D1D1F',
            fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
          },
          footer: {
            backgroundColor: '#FFFFFF', // Solid white background
            borderTop: '1px solid #E5E5EA',
            padding: '12px 16px', // Reduced padding
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            textAlign: 'center',
          },
          content: {
            backgroundColor: '#FFFFFF',
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly darker overlay for contrast
          },
        }}
      >
        {selectedDevice && (
          <Space
            direction="vertical"
            align="center"
            size="small" // Smaller spacing between elements for a compact layout
            style={{
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Avatar
              src={selectedDevice.src}
              alt={selectedDevice.label}
              size={80} // Smaller image size for a compact modal
              style={{
                borderRadius: '8px',
                border: '1px solid #E5E5EA',
              }}
            />
            <Typography.Title
              level={4} // Smaller heading for the device name
              style={{
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
                color: '#1D1D1F',
                fontWeight: 600,
              }}
            >
              {selectedDevice.label}
            </Typography.Title>
            <Typography.Text
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
                fontSize: '14px', // Smaller font size for details
                color: '#6E6E73', // Lighter color for secondary text
              }}
            >
              ID: {selectedDevice.id}
            </Typography.Text>
            <Typography.Text
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
                fontSize: '14px',
                color: '#6E6E73',
              }}
            >
              Type: {selectedDevice.type}
            </Typography.Text>
            <Typography.Text
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
                fontSize: '14px',
                color: '#6E6E73',
              }}
            >
              Coordinates: {selectedDevice.coordinates}
            </Typography.Text>
            <Typography.Text
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
                fontSize: '14px',
                color: '#6E6E73',
              }}
            >
              Power On: {selectedDevice.power_on ? 'Yes' : 'No'}
            </Typography.Text>
            <Typography.Text
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
                fontSize: '14px',
                color: '#6E6E73',
              }}
            >
              Interface: {selectedDevice.interface.name}
            </Typography.Text>
            <Typography.Text
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
                fontSize: '14px',
                color: '#6E6E73',
              }}
            >
              IP: {selectedDevice.interface.ip}
            </Typography.Text>
            <Typography.Text
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif',
                fontSize: '14px',
                color: '#6E6E73',
              }}
            >
              Bandwidth: {selectedDevice.interface.bandwidth} Mbps
            </Typography.Text>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default Visualization;
