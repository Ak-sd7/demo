import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { SketchPicker } from 'react-color'; // Import the color picker component

const FabricCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectangle, setRectangle] = useState(null);
  const [originX, setOriginX] = useState(0);
  const [originY, setOriginY] = useState(0);
  const [activeMode, setActiveMode] = useState(null);
  const [layers, setLayers] = useState([]); // To track layers (objects) on the canvas
  const [selectedColor, setSelectedColor] = useState('#000'); // State to hold the selected color

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = new fabric.Canvas('fabric-canvas', {
        selection: true,
      });
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        const activeObject = canvasRef.current.getActiveObject();
        if (activeObject) {
          canvasRef.current.remove(activeObject);
          setLayers((prevLayers) =>
            prevLayers.filter((layer) => layer.id !== activeObject.id)
          );
          canvasRef.current.renderAll();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMouseDown = (event) => {
    if (activeMode !== 'rectangle' || canvasRef.current.getActiveObject()) {
      return;
    }

    const id = uuidv4();
    const pointer = canvasRef.current.getPointer(event.e);
    setOriginX(pointer.x);
    setOriginY(pointer.y);

    const newRectangle = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      originX: 'left',
      originY: 'top',
      width: 0,
      height: 0,
      fill: selectedColor, // Use the selected color
      stroke: 'black',
      strokeWidth: 2,
      selectable: true,
      hasControls: true,
      id,
    });

    canvasRef.current.add(newRectangle);
    setRectangle(newRectangle);
    setLayers((prevLayers) => [
      ...prevLayers,
      { id, type: 'rectangle', object: newRectangle },
    ]);
    setIsDrawing(true);
  };

  const handleMouseMove = (event) => {
    if (isDrawing && rectangle) {
      const pointer = canvasRef.current.getPointer(event.e);
      rectangle.set({
        width: Math.abs(originX - pointer.x),
        height: Math.abs(originY - pointer.y),
      });

      if (originX > pointer.x) {
        rectangle.set({ left: pointer.x });
      }
      if (originY > pointer.y) {
        rectangle.set({ top: pointer.y });
      }

      canvasRef.current.renderAll();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setRectangle(null);
    if (canvasRef?.current) {
      canvasRef.current.defaultCursor = 'default';
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.on('mouse:down', handleMouseDown);
      canvasRef.current.on('mouse:move', handleMouseMove);
      canvasRef.current.on('mouse:up', handleMouseUp);
    }

    return () => {
      if (canvasRef.current) {
        canvasRef.current.off('mouse:down', handleMouseDown);
        canvasRef.current.off('mouse:move', handleMouseMove);
        canvasRef.current.off('mouse:up', handleMouseUp);
      }
    };
  }, [isDrawing, rectangle, originX, originY, handleMouseMove, activeMode]);

  const activateRectangleMode = () => {
    setActiveMode('rectangle');
  };

  const deactivateModes = () => {
    setActiveMode(null); // Deactivate all modes
  };

  const handleLayerClick = (id) => {
    const selectedLayer = layers.find((layer) => layer.id === id);
    if (selectedLayer) {
      canvasRef.current.setActiveObject(selectedLayer.object);
      canvasRef.current.renderAll();
    }
  };

  const handleDeleteLayer = (id) => {
    const selectedLayer = layers.find((layer) => layer.id === id);
    if (selectedLayer) {
      canvasRef.current.remove(selectedLayer.object);
      setLayers((prevLayers) => prevLayers.filter((layer) => layer.id !== id));
      canvasRef.current.renderAll();
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color.hex); // Update the selected color
    const activeObject = canvasRef.current.getActiveObject();
    if (activeObject) {
      activeObject.set('fill', color.hex); // Change the color of the selected object
      canvasRef.current.renderAll();
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <button onClick={activateRectangleMode}>
          {activeMode === 'rectangle' ? 'Rectangle Mode Active' : 'Draw Rectangle'}
        </button>
        <button onClick={deactivateModes}>Close</button>
        <SketchPicker color={selectedColor} onChange={handleColorChange} />
        <canvas id="fabric-canvas" width={800} height={600} />
      </div>
      <div style={{ marginLeft: '20px', maxHeight: '600px', overflowY: 'auto' }}>
        <h3>Layers</h3>
        <ul>
          {layers.map((layer, index) => (
            <li key={layer.id} style={{ marginBottom: '10px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '150px',
                  cursor: 'pointer',
                }}
                onClick={() => handleLayerClick(layer.id)}
              >
                {layer.type} {index + 1}
              </span>
              <button onClick={() => handleDeleteLayer(layer.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FabricCanvas;
