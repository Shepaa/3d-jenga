export function buildTower(
    towerHeight, towerWidth, startX, startY, startZ, cubeSize, createBox) {
  for (let y = 0; y < towerHeight; y++) {
    for (let x = 0; x < towerWidth; x++) {
      const posX = startX + x * cubeSize;
      const posY = (startY + y * cubeSize) + 0.05;
      const posZ = startZ;

      createBox(cubeSize, cubeSize, cubeSize, {x: posX, y: posY, z: posZ});
    }
  }
}