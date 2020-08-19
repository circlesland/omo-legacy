import { ProcessState } from "./ProcessState";
import { IProcessContext } from "./IProcessContext";
import { v4 } from "uuid";

export class ProcessNode<TContext extends IProcessContext>
{
  id: string = v4();
  /**
   * If this node is a step (leaf), this property must be set.
   */
  stepId?: string;
  parentId: string | undefined;

  children: ProcessNode<TContext>[] = [];
  parent: ProcessNode<TContext> | null = null;
  state: ProcessState = ProcessState.Pristine;
  error: any;

  title?: string = "";
  description?: string = "";
  prompt?: string;
  submitButtonLabel: string = "Next";

  inputMap?: { localName: string; globalName: string }[];
  staticInputs?: { localName: string; value: any }[];
  outputMap?: { localName: string; globalName: string }[];

  quant?: string;
  quantData?: any;

  sideEffect?: string;

  isInteractive?: boolean;

  constructor(parent?: ProcessNode<TContext>) {
    this.parent = !parent ? null : parent;
    this.parentId = !this.parent ? undefined : this.parent.id;
  }

  static findActiveBranch(node: ProcessNode<IProcessContext>) {
    const activeLeaf = this.findActiveLeaf(node);
    if (!activeLeaf) {
      return [];
    }
    const path = this.path(activeLeaf);
    return path;
  }

  static findActiveLeaf(node: ProcessNode<IProcessContext>) {
    for (let currentNode of ProcessNode.flattenSequencial(node)) {
      if (!ProcessNode.isLeaf(currentNode)) {
        continue;
      }
      if (!ProcessNode.isActive(currentNode)) {
        continue;
      }

      return currentNode;
    }

    return null;
  }

  static flattenSequencial(node: ProcessNode<IProcessContext>) {
    const stack: ProcessNode<IProcessContext>[] = [];
    const array: ProcessNode<IProcessContext>[] = [];
    const hashMap = {};

    stack.push(node);

    while (stack.length !== 0) {
      var currentNode = stack.pop();
      if (!currentNode) {
        throw new Error("The stack returned an undefined element during the recursive iteration of a IProcessNode.");
      }
      if (currentNode.children.length == 0) {
        if (!hashMap[currentNode.id]) {
          hashMap[currentNode.id] = true;
          array.push(currentNode);
        }
      }
      else {
        for (var i = currentNode.children.length - 1; i >= 0; i--) {
          stack.push(currentNode.children[i]);
        }
      }
    }

    return array;
  }

  static findNextNode(node: ProcessNode<IProcessContext>, afterNodeId: string) {
    let next: boolean = false;

    for (let currentNode of ProcessNode.flattenSequencial(node)) {
      if (currentNode.id === afterNodeId) {
        next = true;
        continue;
      }
      if (next) {
        return currentNode;
      }
    }

    return null;
  }

  static findPreviousNode(node: ProcessNode<IProcessContext>, beforeNodeId: string) {
    let previous: ProcessNode<IProcessContext> | null = null;
    for (let currentNode of ProcessNode.flattenSequencial(node)) {
      if (beforeNodeId == currentNode.id) {
        return previous;
      }
      previous = currentNode;
    }

    return null;
  }

  static isLeaf(node: ProcessNode<IProcessContext>) {
    return node.children.length == 0;
  }

  static isActive(node: ProcessNode<IProcessContext>) {
    return node.state == ProcessState.Active || node.state == ProcessState.Working;
  }

  static path(node: ProcessNode<IProcessContext>) {
    const path: ProcessNode<IProcessContext>[] = [];
    let root: ProcessNode<IProcessContext> = node;

    path.unshift(root);

    while (root.parent) {
      root = root.parent;
      path.unshift(root);
    }

    return path;
  }

  static findById(node: ProcessNode<IProcessContext>, id: string) {
    let stack = [node];

    while (stack.length > 0) {
      let item = stack.pop();
      if (!item) {
        continue;
      }
      if (item.id == id)
        return item;

      item.children.forEach(child => stack.push(child));
    }
  }

  static root(node: ProcessNode<IProcessContext>) {
    const path = ProcessNode.path(node);
    return path[0];
  }

  private static visitNode(node, hashMap): ProcessNode<IProcessContext> | null {
    if (!hashMap[node.id]) {
      hashMap[node.id] = true;
      return node;
    }
    return null;
  }

  static restoreParentLinks(processNode) {
    let map = {};
    let stack = [processNode];

    while (stack.length > 0) {
      let item = stack.pop();
      map[item.id] = item;
      item.children.forEach(child => stack.push(child));
    }

    stack = [processNode];
    while (stack.length > 0) {
      let item = stack.pop();
      let parent = map[item.parentId];
      item.parent = parent;
      item.children.forEach(child => stack.push(child));
    }
  }
}
