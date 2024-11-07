import {useRef } from 'react';
import * as fabric from 'fabric';

class TreeNode {
  constructor(id, options = {}) {
    this.id = id;
    this.options = options;
    this.children = [];
    this.fabricObject = null;
  }

  createFabricObject() {
    this.fabricObject = new fabric.Rect({
      left: this.options.x || 0,
      top: this.options.y || 0,
      width: this.options.width || 50,
      height: this.options.height || 50,
      fill: this.options.color || 'blue',
      strokeWidth: this.options.borderSize || 2,
      stroke: this.options.borderColor || 'black'
    });
    return this.fabricObject;
  }
}

class Tree {
  constructor(canvas) {
    this.root = null;
    this.nodes = {};
    this.canvas = canvas;
  }

  setRoot(id, options) {
    const rootNode = new TreeNode(id, options);
    rootNode.createFabricObject();
    this.canvas.add(rootNode.fabricObject);
    this.root = rootNode;
    this.nodes[id] = rootNode;
  }

  addNode(parentId, id, options) {
    const parentNode = this.nodes[parentId];
    if (!parentNode) {
      console.error("Parent node not found");
      return;
    }

    const childNode = new TreeNode(id, options);
    parentNode.children.push(childNode);
    this.nodes[id] = childNode;

    childNode.createFabricObject();
    this.canvas.add(childNode.fabricObject);
    childNode.fabricObject.left = parentNode.fabricObject.left + 60;
    childNode.fabricObject.top = parentNode.fabricObject.top + 60;
    this.canvas.renderAll();
  }

  deleteNode(id) {
    const node = this.nodes[id];
    if (!node) {
      console.error("Node not found");
      return;
    }
  
    // Recursively delete children
    const recursiveDelete = (n) => {
      for (let i = n.children.length - 1; i >= 0; i--) {
        this.deleteNode(n.children[i].id);
      }
    };
  
    recursiveDelete(node);
  
    // Remove the target node from the canvas and the nodes object
    this.canvas.remove(node.fabricObject);
    delete this.nodes[id];
  
    // Remove the target node from its parent's children array
    if (node.parent) {
      node.parent.children = node.parent.children.filter(child => child.id !== id);
    }
  
    this.canvas.renderAll();
  }

  printTree() {
    const result = [];
  
    const traverse = (node) => {
      if (!this.nodes[node.id]) {
        return null;
      }
  
      const nodeRepresentation = {
        id: node.id,
        options: node.options,
        children: []
      };
  
      for (let child of node.children) {
        const childRepresentation = traverse(child);
        if (childRepresentation) {
          nodeRepresentation.children.push(childRepresentation);
        }
      }
  
      return nodeRepresentation;
    };
  
    if (this.root) {
      const rootRepresentation = traverse(this.root);
      if (rootRepresentation) {
        result.push(rootRepresentation);
      }
    }
  
    console.log(JSON.stringify(result, null, 2));
  }
}

const TreeVisualization = () => {
  const canvasRef = useRef(null);
  const treeRef = useRef(null);

  // Initialize the canvas and tree instances
  const canvas = new fabric.Canvas('canvasElementId');
  const tree = new Tree(canvas);
  canvasRef.current = canvas;
  treeRef.current = tree;

  // Set up the initial tree structure
  tree.setRoot('root', { x: 100, y: 100, width: 80, height: 80, color: 'green', borderSize: 3 });
  tree.addNode('root', 'child1', { x: 0, y: 0, width: 50, height: 50, color: 'red' });
  tree.addNode('root', 'child2', { x: 0, y: 0, width: 50, height: 50, color: 'yellow' });
  tree.addNode('child1', 'subChild1', { x: 0, y: 0, width: 40, height: 40, color: 'blue' });
  tree.deleteNode('child1');

  const logTree = () => {
    const tree = treeRef.current;
    tree.printTree();
  };

  return (
    <div>
      <canvas id="canvasElementId" width="600" height="400"></canvas>
      <button onClick={logTree}>Log Tree</button>
    </div>
  );
};

export default TreeVisualization;