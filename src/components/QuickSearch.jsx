import { useState, useMemo } from 'react';
import data from "../family_trees.json";
import { Link } from 'react-router-dom';
import './QuickSearch.css';

const QuickSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);

    // Pre-process all members for searching
    const allMembers = useMemo(() => {
        const members = [];
        const traverse = (node, parentHouse = null) => {
            // Get house from name or inherit from parent
            const currentHouse = node.name.includes('House') ?
                node.name.split(' ').slice(0, 2).join(' ') :
                parentHouse;

            members.push({
                name: node.name,
                house: currentHouse
            });

            // Pass current house to children
            node.children?.forEach(child => traverse(child, currentHouse));
        };
        traverse(data);
        return members;
    }, []);

    // Filter members based on search term
    const filteredMembers = useMemo(() => {
        if (!searchTerm) return [];
        return allMembers.filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10); // Limit to 10 results
    }, [searchTerm, allMembers]);

    return (
        <div className="quick-search-container">
            <div className="search-header">
                <Link to="/" className="back-button">
                    ← Back to Tree
                </Link>
                <h1 style={{ fontSize: '34px', fontWeight: 'bold', color: '#fff' }}>Quick Member Search</h1>
            </div>
            <div className="search-box">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Start typing a name..."
                    autoFocus
                />
                {filteredMembers.length > 0 && (
                    <div className="search-results">
                        {filteredMembers.map((member, index) => (
                            <div
                                key={index}
                                className="search-result-item"
                                onClick={() => {
                                    // Handle member selection
                                    setSelectedMember(member);
                                }}
                            >
                                <div className="member-name">{member.name}</div>
                                {member.house && (
                                    <div className="member-house">{member.house}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {selectedMember && (
                <>
                    <div className="overlay" onClick={() => setSelectedMember(null)} />
                    <MemberDetails
                        member={selectedMember}
                        onClose={() => setSelectedMember(null)}
                    />
                </>
            )}
        </div>
    );
};

const MemberDetails = ({ member, onClose }) => {
    const relationships = useMemo(() => {
        // Helper function to find a node by name
        const findNodeByName = (nodeName, currentNode) => {
            if (currentNode.name === nodeName) {
                return currentNode;
            }
            for (const child of (currentNode.children || [])) {
                const found = findNodeByName(nodeName, child);
                if (found) return found;
            }
            return null;
        };

        // Helper function to find relationships
        const findRelationships = (nodeName) => {
            const memberNode = findNodeByName(nodeName, data);
            if (!memberNode) return null;

            // Find parent node (big)
            const findParentNode = (targetName, currentNode, parent = null) => {
                if (currentNode.name === targetName) return parent;
                for (const child of (currentNode.children || [])) {
                    const found = findParentNode(targetName, child, currentNode);
                    if (found) return found;
                }
                return null;
            };

            const parentNode = findParentNode(nodeName, data);
            const grandparentNode = parentNode ? findParentNode(parentNode.name, data) : null;

            // Find siblings (nodes with same parent)
            const siblings = parentNode ?
                parentNode.children
                    .filter(child => child.name !== nodeName)
                    .map(child => child.name) :
                [];

            // Find children (littles)
            const children = memberNode.children ?
                memberNode.children.map(child => child.name) :
                [];

            // Find grandchildren
            const grandchildren = memberNode.children ?
                memberNode.children.flatMap(child =>
                    child.children ? child.children.map(grandchild => grandchild.name) : []
                ) :
                [];

            return {
                name: member.name,
                house: member.house,
                bigs: parentNode ? [parentNode.name] : [],
                littles: children,
                grandbigs: grandparentNode ? [grandparentNode.name] : [],
                grandlittles: grandchildren,
                siblings: siblings
            };
        };

        return findRelationships(member.name) || {
            name: member.name,
            house: member.house,
            bigs: [],
            littles: [],
            grandbigs: [],
            grandlittles: [],
            siblings: []
        };
    }, [member]);

    return (
        <div className="member-details">
            <div className="details-header">
                <h2>{member.name}</h2>
                <button onClick={onClose}>×</button>
            </div>
            <div className="details-content">
                <div className="detail-section">
                    <h3>House</h3>
                    <p>{member.house || 'Member'}</p>
                </div>
                {relationships.grandbigs.length > 0 && (
                    <div className="detail-section">
                        <h3>Grandbig</h3>
                        <ul>
                            {relationships.grandbigs.map(grandbig => (
                                <li key={grandbig}>{grandbig}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {relationships.bigs.length > 0 && (
                    <div className="detail-section">
                        <h3>Big</h3>
                        <ul>
                            {relationships.bigs.map(big => (
                                <li key={big}>{big}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {relationships.siblings.length > 0 && (
                    <div className="detail-section">
                        <h3>Siblings</h3>
                        <ul>
                            {relationships.siblings.map(sibling => (
                                <li key={sibling}>{sibling}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {relationships.littles.length > 0 && (
                    <div className="detail-section">
                        <h3>Littles</h3>
                        <ul>
                            {relationships.littles.map(little => (
                                <li key={little}>{little}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {relationships.grandlittles.length > 0 && (
                    <div className="detail-section">
                        <h3>Grandlittles</h3>
                        <ul>
                            {relationships.grandlittles.map(grandlittle => (
                                <li key={grandlittle}>{grandlittle}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickSearch; 