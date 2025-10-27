import ReactFlow, { Background, Controls, Panel, MiniMap } from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import data from "../family_trees.json";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Tutorial from './Tutorial';

// Add a default color for unlisted houses
const defaultHouseColor = {
    primary: '#4299E1',   // A nice blue
    secondary: '#63B3ED',
    background: '#EBF8FF'
};

// Constants for common color combinations
const blues = {
    primary: '#4299E1',
    secondary: '#63B3ED',
    background: '#EBF8FF'
};

const greens = {
    primary: '#2E7D32',
    secondary: '#43A047',
    background: '#E8F5E9'
};

const reds = {
    primary: '#E53E3E',
    secondary: '#F56565',
    background: '#FEEFE6'
};

const purples = {
    primary: '#805AD5',
    secondary: '#A78BFA',
    background: '#F9F5FF'
};

const oranges = {
    primary: '#F59E0B',
    secondary: '#FACC15',
    background: '#FEF3C7'
};

const yellows = {
    primary: '#F59E0B',
    secondary: '#FACC15',
    background: '#FEF3C7'
};

const pinks = {
    primary: '#F472B6',
    secondary: '#F9A8D0',
    background: '#FCE7F3'
};

// House colors with lighter variants for children
const houseColors = {
    'House Champagne': blues,
    'House Pearson': greens,
    "House Golden": oranges,
    "House Gellman": pinks,
    "House Landis": greens,
    "House Keltner": yellows,
    "House Schoewe": purples,
    "House Fodiman": blues,
    "House Kaplan": reds,
    "House Johnson": yellows,
    "House Goyal": greens,
    'House Herzog': purples,
    'House Patel': blues,
    "House Jones": reds,
    "House Feltes": purples,
    "House Somera": oranges,
    "House Wolfe": greens,
    "House Lewin": blues,
    "House Dollins": pinks,
    "House Wasik": yellows,
    "House Rodriguez": reds,
    "House Cvern": purples,
    "House Desh": greens,
    "House Kaplan 2": reds,
}

// Initialize dagre graph
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 80;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// Update getHouseFromName to handle all houses but return default color if not major
const getHouseFromName = (name) => {
    // Check if the name contains any house name (including non-major houses)
    const houseName = name.includes('House') ? name.split(' ').slice(0, 2).join(' ') : null;
    return houseName;
};

const createNodesAndEdges = (data, parentId = null, level = 0, parentHouse = null) => {
    const nodes = [];
    const edges = [];

    const id = `${data.name}-${level}`;
    const currentHouse = getHouseFromName(data.name);
    const house = currentHouse || parentHouse;
    const colors = houseColors[house] || defaultHouseColor;

    nodes.push({
        id,
        data: {
            label: (
                <>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{data.name}</div>
                    <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{house || 'Member'}</div>
                </>
            ),
            house: house
        },
        position: { x: 0, y: 0 },
        style: {
            background: colors.background,
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            padding: '10px',
            width: nodeWidth,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            fontSize: '12px',
            transition: 'all 0.3s ease'
        },
    });

    // Only create edges if it's not the root node ("Great Houses of DSP")
    if (parentId && data.name !== "Great Houses of DSP") {
        edges.push({
            id: `e${parentId}-${id}`,
            source: parentId,
            target: id,
            type: 'smoothstep',
            animated: true,
            style: {
                stroke: colors.primary,
                strokeWidth: 2,
                transition: 'all 0.3s ease'
            },
        });
    }

    if (data.children) {
        data.children.forEach((child) => {
            const { nodes: childNodes, edges: childEdges } = createNodesAndEdges(
                child,
                id,
                level + 1,
                house
            );
            nodes.push(...childNodes);
            edges.push(...childEdges);
        });
    }

    return { nodes, edges };
};

const DetailPanel = ({ node, nodes, edges, onClose, setHighlightedPaths }) => {
    const nodeData = useMemo(() => {
        if (!node) return null;

        const children = nodes.filter(n =>
            edges.some(e => e.source === node.id && e.target === n.id)
        );

        const grandchildren = nodes.filter(n =>
            children.some(child =>
                edges.some(e => e.source === child.id && e.target === n.id)
            )
        );

        const parents = nodes.filter(n =>
            edges.some(e => e.target === node.id && e.source === n.id)
        );

        const grandparents = nodes.filter(n =>
            parents.some(p =>
                edges.some(e => e.target === p.id && e.source === n.id)
            )
        );

        const siblings = nodes.filter(n =>
            n.id !== node.id &&
            parents.some(p =>
                edges.some(e => e.source === p.id && e.target === n.id)
            )
        );

        return {
            name: node.data.label.props.children[0].props.children,
            house: node.data.house,
            children: children.map(n => n.data.label.props.children[0].props.children),
            grandchildren: grandchildren.map(n => n.data.label.props.children[0].props.children),
            parents: parents.map(n => n.data.label.props.children[0].props.children),
            grandparents: grandparents.map(n => n.data.label.props.children[0].props.children),
            siblings: siblings.map(n => n.data.label.props.children[0].props.children)
        };
    }, [node, nodes, edges]);

    if (!nodeData) return null;

    const colors = houseColors[nodeData.house] || defaultHouseColor;

    return (
        <div className="detail-panel">
            <div className="detail-header" style={{ background: colors.primary }}>
                <h2>{nodeData.name}</h2>
                <button onClick={() => {
                    setHighlightedPaths({ up: new Set(), down: new Set() });
                    onClose();
                }} className="close-button">×</button>
            </div>
            <div className="detail-content">
                <div className="detail-section">
                    <h3>House</h3>
                    <p>{nodeData.house || 'Member'}</p>
                </div>
                {nodeData.grandparents.length > 0 && (
                    <div className="detail-section">
                        <h3>Grandbig</h3>
                        <ul>
                            {nodeData.grandparents.map(gp => (
                                <li key={gp}>{gp}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {nodeData.parents.length > 0 && (
                    <div className="detail-section">
                        <h3>Big</h3>
                        <ul>
                            {nodeData.parents.map(parent => (
                                <li key={parent}>{parent}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {nodeData.siblings.length > 0 && (
                    <div className="detail-section">
                        <h3>Siblings</h3>
                        <ul>
                            {nodeData.siblings.map(sibling => (
                                <li key={sibling}>{sibling}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {nodeData.children.length > 0 && (
                    <div className="detail-section">
                        <h3>Littles</h3>
                        <ul>
                            {nodeData.children.map(child => (
                                <li key={child}>{child}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {nodeData.grandchildren.length > 0 && (
                    <div className="detail-section">
                        <h3>Grandlittles</h3>
                        <ul>
                            {nodeData.grandchildren.map(gc => (
                                <li key={gc}>{gc}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

DetailPanel.propTypes = {
    node: PropTypes.shape({
        id: PropTypes.string.isRequired,
        data: PropTypes.shape({
            label: PropTypes.shape({
                props: PropTypes.shape({
                    children: PropTypes.arrayOf(
                        PropTypes.shape({
                            props: PropTypes.shape({
                                children: PropTypes.any
                            })
                        })
                    )
                })
            }),
            house: PropTypes.string
        })
    }),
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    edges: PropTypes.arrayOf(PropTypes.object).isRequired,
    onClose: PropTypes.func.isRequired,
    setHighlightedPaths: PropTypes.func.isRequired
};

const HOUSE_OPTIONS = [
    { value: 'all', label: 'All Houses' },
    { value: 'House Champagne', label: 'House Champagne' },
    { value: 'House Pearson', label: 'House Pearson' },
    { value: 'House Golden', label: 'House Golden' },
    { value: 'House Gellman', label: 'House Gellman' },
    { value: 'House Landis', label: 'House Landis' },
    { value: 'House Keltner', label: 'House Keltner' },
    { value: 'House Schoewe', label: 'House Schoewe' },
    { value: 'House Fodiman', label: 'House Fodiman' },
    { value: 'House Kaplan', label: 'House Kaplan' },
    { value: 'House Herzog', label: 'House Herzog' },
    { value: 'House Patel', label: 'House Patel' },
    { value: 'House Jones', label: 'House Jones' },
    { value: 'House Feltes', label: 'House Feltes' },
    { value: 'House Somera', label: 'House Somera' },
    { value: 'House Wolfe', label: 'House Wolfe' },
    { value: 'House Lewin', label: 'House Lewin' },
    { value: 'House Dollins', label: 'House Dollins' },
    { value: 'House Wasik', label: 'House Wasik' },
    { value: 'House Rodriguez', label: 'House Rodriguez' },
    { value: 'House Cvern', label: 'House Cvern' },
    { value: 'House Desh', label: 'House Desh' },
    { value: 'House Kaplan 2', label: 'House Kaplan 2' },
];

const Tree = () => {
    const [direction, setDirection] = useState('LR');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHouse, setSelectedHouse] = useState('all');
    const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(data);
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [selectedNode, setSelectedNode] = useState(null);
    const [highlightedPaths, setHighlightedPaths] = useState({ up: new Set(), down: new Set() });
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    const [showTutorial, setShowTutorial] = useState(true);

    // Update layout when direction changes
    useEffect(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            direction
        );
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
    }, [direction]);

    // Update layout when search filters nodes
    useEffect(() => {
        const filteredNodes = initialNodes.filter(node => {
            const matchesSearch = node.data.label.props.children[0].props.children
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesHouse = selectedHouse === 'all' || node.data.house === selectedHouse;
            return matchesSearch && matchesHouse;
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            filteredNodes,
            edges,
            direction
        );
        setNodes([...layoutedNodes]);
    }, [searchTerm, selectedHouse]);

    // Update onNodeClick
    const onNodeClick = useCallback((_, node) => {
        setSelectedNode(prevNode => {
            if (prevNode?.id === node.id) {
                setHighlightedPaths({ up: new Set(), down: new Set() });
                return null;
            }
            const upwardPaths = getConnectedPaths(node.id, 'up');
            const downwardPaths = getConnectedPaths(node.id, 'down');
            setHighlightedPaths({ up: upwardPaths, down: downwardPaths });
            return node;
        });
    }, [edges]);

    const onNodeMouseEnter = useCallback((_, node) => {
        const house = node.data?.house;
        const colors = houseColors[house] || defaultHouseColor;

        setNodes(nds =>
            nds.map(n => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        style: {
                            ...n.style,
                            background: `${colors.secondary}22`,
                            boxShadow: `0 12px 20px -2px ${colors.primary}33`,
                            borderWidth: '3px',
                            transition: 'all 0.3s ease'
                        }
                    };
                }
                return n;
            })
        );
    }, []);

    const onNodeMouseLeave = useCallback((_, node) => {
        const house = node.data?.house;
        const colors = houseColors[house] || defaultHouseColor;

        setNodes(nds =>
            nds.map(n => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        style: {
                            ...n.style,
                            background: colors.background,
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            borderWidth: '2px',
                            transition: 'all 0.3s ease'
                        }
                    };
                }
                return n;
            })
        );
    }, []);

    const getConnectedPaths = (nodeId, direction = 'up') => {
        const paths = new Set([nodeId]);
        let nodesToCheck = [nodeId];

        while (nodesToCheck.length > 0) {
            const currentId = nodesToCheck.pop();
            edges.forEach(edge => {
                if (direction === 'up' && edge.target === currentId) {
                    paths.add(edge.source);
                    nodesToCheck.push(edge.source);
                } else if (direction === 'down' && edge.source === currentId) {
                    paths.add(edge.target);
                    nodesToCheck.push(edge.target);
                }
            });
        }
        return paths;
    };

    const getNodeStyle = (node) => {
        const house = node.data?.house;
        const colors = houseColors[house] || defaultHouseColor;
        const isInUpwardPath = highlightedPaths.up.has(node.id);
        const isInDownwardPath = highlightedPaths.down.has(node.id);

        return {
            ...node.style,
            background: isInUpwardPath ? `${colors.primary}22` :
                isInDownwardPath ? `${colors.secondary}22` :
                    colors.background,
            borderColor: isInUpwardPath ? colors.primary :
                isInDownwardPath ? colors.secondary :
                    colors.primary,
            borderWidth: (isInUpwardPath || isInDownwardPath) ? '3px' : '2px',
            boxShadow: (isInUpwardPath || isInDownwardPath) ?
                `0 4px 12px -2px ${colors.primary}44` :
                '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            opacity: (highlightedPaths.up.size > 0 || highlightedPaths.down.size > 0) ?
                (isInUpwardPath || isInDownwardPath ? 1 : 0.4) : 1,
            transition: 'all 0.3s ease'
        };
    };

    const getEdgeStyle = (edge) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const colors = houseColors[sourceNode?.data?.house] || defaultHouseColor;
        const isInUpwardPath = highlightedPaths.up.has(edge.source) && highlightedPaths.up.has(edge.target);
        const isInDownwardPath = highlightedPaths.down.has(edge.source) && highlightedPaths.down.has(edge.target);

        return {
            ...edge.style,
            stroke: isInUpwardPath ? colors.primary :
                isInDownwardPath ? colors.secondary :
                    colors.primary,
            strokeWidth: (isInUpwardPath || isInDownwardPath) ? 3 : 2,
            opacity: (highlightedPaths.up.size > 0 || highlightedPaths.down.size > 0) ?
                (isInUpwardPath || isInDownwardPath ? 1 : 0.2) : 1,
            transition: 'all 0.3s ease'
        };
    };

    return (
        <div className="flow-container">
            <ReactFlow
                nodes={nodes.map(node => ({
                    ...node,
                    style: getNodeStyle(node)
                }))}
                edges={edges.map(edge => ({
                    ...edge,
                    style: getEdgeStyle(edge)
                }))}
                fitView
                minZoom={0.1}
                maxZoom={1.5}
                defaultViewport={{ zoom: 0.3 }}
                onNodeClick={onNodeClick}
                onNodeMouseEnter={onNodeMouseEnter}
                onNodeMouseLeave={onNodeMouseLeave}
                fitViewOptions={{
                    padding: 0.5,
                    maxZoom: 0.3
                }}
                style={{ background: '#f8fafc' }}
            >
                <Background
                    color="#aaa"
                    gap={16}
                    size={1}
                    style={{ width: '100%', height: '100%' }}
                />
                <Controls />
                <MiniMap
                    nodeColor={node => {
                        const house = node.data?.house;
                        return houseColors[house]?.primary || defaultHouseColor.primary;
                    }}
                    maskColor="rgb(0, 0, 0, 0.1)"
                />
                <Panel className={`control-panel ${isPanelVisible ? 'panel-visible' : 'panel-hidden'}`}>
                    <div className="control-panel-header" onClick={() => setIsPanelVisible(!isPanelVisible)}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            color: '#2196F3',
                            fontWeight: '500'
                        }}>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{
                                    transform: isPanelVisible ? 'rotate(0deg)' : 'rotate(180deg)',
                                    transition: 'transform 0.3s ease'
                                }}
                            >
                                <path d="M19 9l-7 7-7-7" />
                            </svg>
                            Controls
                        </div>
                    </div>
                    {isPanelVisible && (
                        <div className="control-panel-content">
                            <Link
                                to="/search"
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    background: 'white',
                                    color: '#2196F3',
                                    textDecoration: 'none',
                                    textAlign: 'center',
                                    border: '1px solid #2196F3',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Quick Search
                            </Link>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Filter by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        width: '200px',
                                        fontSize: '14px',
                                        backgroundColor: '#f8fafc',
                                        color: '#334155',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#2196F3';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                    }}
                                />
                                <button
                                    onClick={() => setDirection(d => d === 'TB' ? 'LR' : 'TB')}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(to right, #2196F3, #1976D2)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        boxShadow: '0 2px 4px rgba(33, 150, 243, 0.2)',
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseEnter={e => {
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 6px rgba(33, 150, 243, 0.25)';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 4px rgba(33, 150, 243, 0.2)';
                                    }}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        {direction === 'LR' ? (
                                            // Vertical layout icon
                                            <path d="M12 5v14M5 12h14" />
                                        ) : (
                                            // Horizontal layout icon
                                            <path d="M4 12h16M7 8l-3 4 3 4M17 8l3 4-3 4" />
                                        )}
                                    </svg>
                                    {direction === 'LR' ? 'Vertical' : 'Horizontal'} Layout
                                </button>
                            </div>
                            <select
                                value={selectedHouse}
                                onChange={(e) => setSelectedHouse(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    width: '100%',
                                    fontSize: '14px',
                                    backgroundColor: '#f8fafc',
                                    color: '#334155',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#2196F3';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                }}
                            >
                                {HOUSE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </Panel>
            </ReactFlow>
            {selectedNode && (
                <DetailPanel
                    node={selectedNode}
                    nodes={nodes}
                    edges={edges}
                    onClose={() => setSelectedNode(null)}
                    setHighlightedPaths={setHighlightedPaths}
                />
            )}
            {showTutorial && (
                <Tutorial onComplete={() => setShowTutorial(false)} />
            )}
        </div>
    );
};

export default Tree; 