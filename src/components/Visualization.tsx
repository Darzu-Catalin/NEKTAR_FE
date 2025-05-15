import React, { useRef, useEffect, useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Modal, Button, Popconfirm, Space, Typography, Avatar } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { DraggableImage, InterfaceDetails, Link } from '../types';

interface CustomNodeData {
  label: string;
  src: string;
  onDelete: (id: string) => void;
  onDetails: () => void;
  type: string;
  coordinates: string;
  power_on: boolean;
  interface: InterfaceDetails;
}

type CustomNodeType = Node<CustomNodeData, 'custom'>;

const CustomNode = ({ id, data }: { id: string; data: CustomNodeData }) => (
  <div
    className="custom-node"
    onDoubleClick={() => data.onDetails()}
    style={{ padding: 10, borderRadius: 5, background: 'none', position: 'relative' }}
  >
    <Handle
      type="target"
      position={Position.Left}
      style={{ top: '50%', transform: 'translateY(-50%) translateX(+500%)', zIndex: -1, border: 'none', background: 'none' }}
    />

    <img src={data.src} alt={data.label} style={{ width: 50, height: 50 }} />
    <div style={{ textAlign: 'center' }}>{data.label}</div>

    <Handle
      type="source"
      position={Position.Right}
      style={{ top: '50%', transform: 'translateY(-50%) translateX(-500%)', zIndex: -1, border: 'none', background: 'none' }}
    />

    <div className="node-toolbar" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', gap: 4 }}>
      <Popconfirm title="Delete this node?" onConfirm={() => data.onDelete(id)} okText="Yes" cancelText="No">
        <Button type="text" icon={<DeleteOutlined />} />
      </Popconfirm>
    </div>

    <style>{`.custom-node .node-toolbar{opacity:0;transition:opacity .3s}.custom-node:hover .node-toolbar{opacity:1}`}</style>
  </div>
);

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface VisualizationProps {
  devices: DraggableImage[];
  links: Link[];
}

const VisualizationInner: React.FC<VisualizationProps> = ({ devices, links }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const [selectedDevice, setSelectedDevice] = useState<null | {
    id: string;
    label: string;
    src: string;
    type: string;
    coordinates: string;
    power_on: boolean;
    interface: InterfaceDetails;
  }>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [pointerCoords, setPointerCoords] = useState<{ x: number; y: number } | null>(null);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const showDetails = useCallback((d: DraggableImage) => {
    setSelectedDevice({
      id: d.id.toString(),
      label: d.name,
      src: d.src,
      type: d.type || 'unknown',
      coordinates: d.coordinates || `${d.x} ${d.y}`,
      power_on: d.power_on || false,
      interface: d.interface || { name: 'FastEthernet0', ip: '0.0.0.0', bandwidth: 0 },
    });
  }, []);

  useEffect(() => {
    setNodes(
      devices.map((dev): CustomNodeType => ({
        id: dev.id.toString(),
        type: 'custom',
        data: {
          label: dev.name,
          src: dev.src,
          onDelete: deleteNode,
          onDetails: () => showDetails(dev),
          type: dev.type || 'unknown',
          coordinates: dev.coordinates || `${dev.x} ${dev.y}`,
          power_on: dev.power_on || false,
          interface: dev.interface || { name: 'FastEthernet0', ip: '0.0.0.0', bandwidth: 0 },
        },
        position: { x: dev.x, y: dev.y },
      }))
    );
  }, [devices, deleteNode, showDetails]);

  useEffect(() => {
    setEdges(
      links.map((lnk, i) => ({ id: `e${i}`, source: lnk.from.toString(), target: lnk.to.toString(), type: 'straight', animated: true }))
    );
  }, [links]);

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const point = project({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setPointerCoords({ x: Math.round(point.x), y: Math.round(point.y) });
      }}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ style: { strokeWidth: 3, stroke: 'white' } }}
        style={{ background: '#1C1C1E' }}
      >
        <Background gap={25} size={1} color="#444" />
      </ReactFlow>

      {pointerCoords && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', padding: '4px 10px', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 12, borderRadius: 6, fontFamily: 'monospace', zIndex: 10 }}>
          x: {pointerCoords.x} y: {pointerCoords.y}
        </div>
      )}

      <Modal title="Device Details" open={!!selectedDevice} onCancel={() => setSelectedDevice(null)} footer={[<Button key="c" onClick={() => setSelectedDevice(null)}>Close</Button>]}> 
        {selectedDevice && (
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Avatar src={selectedDevice.src} size={80} />
            <Typography.Title level={4}>{selectedDevice.label}</Typography.Title>
            <Typography.Text>ID: {selectedDevice.id}</Typography.Text>
            <Typography.Text>Type: {selectedDevice.type}</Typography.Text>
            <Typography.Text>Coordinates: {selectedDevice.coordinates}</Typography.Text>
            <Typography.Text>Power On: {selectedDevice.power_on ? 'Yes' : 'No'}</Typography.Text>
            <Typography.Text>Interface: {selectedDevice.interface.name}</Typography.Text>
            <Typography.Text>IP: {selectedDevice.interface.ip}</Typography.Text>
            <Typography.Text>Bandwidth: {selectedDevice.interface.bandwidth} Mbps</Typography.Text>
          </Space>
        )}
      </Modal>
    </div>
  );
};

const Visualization: React.FC<VisualizationProps> = (props) => (
  <ReactFlowProvider>
    <VisualizationInner {...props} />
  </ReactFlowProvider>
);

export default Visualization;
