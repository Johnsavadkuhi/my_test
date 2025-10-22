async function bfs(root) {
const queue = [root];
root.visited = true;
while (queue.length > 0) {
const currentNode = queue[0];
highlightCurrentNode(currentNode);
// Process current node after delay
await delay(animationSpeed);
markNodeVisited(currentNode);
// Add children to queue
for (const childIndex of currentNode.children) {
const childNode = tree[childIndex];
if (!childNode.visited) {
childNode.visited = true;
queue.push(childIndex);
highlightQueuedNode(childNode);
}
}
// Remove current node from queue
queue.shift();
updateQueueDisplay(queue);
}
}
