describe('module boundaries', () => {
  it('capture directory exists', async () => {
    const mod = await import('../capture');
    expect(mod).toBeDefined();
  });

  it('processing directory exists', async () => {
    const mod = await import('../processing');
    expect(mod).toBeDefined();
  });

  it('storage directory exists', async () => {
    const mod = await import('../storage');
    expect(mod).toBeDefined();
  });

  it('albums directory exists', async () => {
    const mod = await import('../albums');
    expect(mod).toBeDefined();
  });
});
