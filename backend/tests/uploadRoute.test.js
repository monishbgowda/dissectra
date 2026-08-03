const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const express = require('express');

test('upload route accepts multipart image with inspectionId', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'dissectra-upload-test-'));
  process.env.UPLOAD_ROOT = tempRoot;
  process.env.MAX_UPLOAD_BYTES = '10485760';
  delete require.cache[require.resolve('../routes/scanRoutes')];
  const scanRoutes = require('../routes/scanRoutes');

  const app = express();
  app.use('/api', scanRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const form = new global.FormData();
    form.append('image', new Blob([Buffer.from('not-a-real-image')], { type: 'image/png' }), 'sample.png');
    form.append('inspectionId', 'test-inspection');

    const response = await fetch(`http://127.0.0.1:${port}/api/upload`, {
      method: 'POST',
      body: form,
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.inspectionId, 'test-inspection');
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});
