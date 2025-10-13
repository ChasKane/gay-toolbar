export const dropTargetForElements = jest.fn(() => ({
  destroy: jest.fn(),
}));

export const monitorForElements = jest.fn(() => ({
  destroy: jest.fn(),
}));

export default {
  dropTargetForElements,
  monitorForElements,
};
