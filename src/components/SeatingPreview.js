import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Nav } from 'react-bootstrap';

const SeatingPreview = ({ layout, tables = [], onTableClick }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [hoveredTable, setHoveredTable] = useState(null);
  const [activeFloorId, setActiveFloorId] = useState(null);

  // Initialize active floor
  useEffect(() => {
    if (layout?.floors?.length > 0) {
      setActiveFloorId(layout.floors[0].id);
    }
  }, [layout]);

  const activeFloor = useMemo(() => 
    layout?.floors?.find(f => f.id === activeFloorId) || 
    (layout?.tables ? { ...layout, id: 'legacy' } : null),
  [layout, activeFloorId]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && activeFloor) {
        // Set scale to 1 to show complete floor plan at full size
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout, activeFloor]);

  if (!layout) return <div className="p-4 text-center text-gray-500">Loading layout...</div>;
  if (!activeFloor) return <div className="p-4 text-center text-gray-500">No active floor layout</div>;

   const getStatusColor = (tableId) => {
    const table = tables.find(t => t.tableId === tableId);
    if (!table) return '#10b981'; // Default available if no status found
    switch (table.status) {
      case 'occupied': return '#ef4444';
      case 'reserved': return '#f59e0b';
      case 'cleaning': return '#3b82f6';
      case 'maintenance': return '#6c757d';
      case 'unavailable': return '#6c757d';
      default: return '#10b981';
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="seating-preview-container" 
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#e9ecef', // Match editor's canvas container background
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {layout.floors && layout.floors.length > 1 && (
        <div className="bg-white border-bottom p-2" style={{ zIndex: 10 }}>
          <Nav variant="pills" className="flex-nowrap overflow-auto hide-scrollbar">
            {layout.floors.map(floor => (
              <Nav.Item key={floor.id}>
                <Nav.Link 
                  active={activeFloorId === floor.id}
                  onClick={() => setActiveFloorId(floor.id)}
                  className="py-1 px-3 small rounded-pill me-1"
                  style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                >
                  {floor.name}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px' }}>
        <div 
          className="seating-preview-canvas" 
          style={{
            width: activeFloor.canvasWidth,
            height: activeFloor.canvasHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            backgroundColor: '#ffffff', // Editor's canvas background
            backgroundImage: activeFloor.backgroundImage ? `url(${activeFloor.backgroundImage})` : 'radial-gradient(var(--border-light, #dee2e6) 1px, transparent 1px)',
            backgroundSize: activeFloor.backgroundImage ? 'cover' : '20px 20px',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            minWidth: activeFloor.canvasWidth,
            minHeight: activeFloor.canvasHeight,
            border: '1px solid #dee2e6',
            borderRadius: '8px'
          }}
        >
          {activeFloor.tables && activeFloor.tables.map(table => {
              const statusColor = getStatusColor(table.id);
              const isHovered = hoveredTable === table.id;
              
              return (
                  <div
                      key={table.id}
                      onClick={() => onTableClick && onTableClick(table)}
                      onMouseEnter={() => setHoveredTable(table.id)}
                      onMouseLeave={() => setHoveredTable(null)}
                      style={{
                        position: 'absolute',
                        left: table.x,
                        top: table.y,
                        width: table.width,
                        height: table.height,
                        backgroundColor: statusColor,
                        border: isHovered ? '3px solid #2563eb' : '2px solid #374151',
                        borderRadius: table.shape === 'circle' ? '50%' : '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                    }}
                    title={`Click to manage ${table.label}`}
                >
                    <div style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{table.label}</div>
                </div>
            );
        })}
      </div>
    </div>
    </div>
  );
};

export default SeatingPreview;
