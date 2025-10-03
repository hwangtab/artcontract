Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(() => true),
});
