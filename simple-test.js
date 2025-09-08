// Simple test to check if the server is responding

async function testServer() {
  try {
    console.log('Testing server at http://localhost:4173...');
    const response = await fetch('http://localhost:4173');
    console.log('Server response status:', response.status);
    
    if (response.ok) {
      const html = await response.text();
      console.log('HTML length:', html.length);
      console.log('Contains mountain-list:', html.includes('mountain-list'));
      console.log('✓ Server is responding correctly');
    } else {
      console.log('✗ Server returned error status');
    }
  } catch (error) {
    console.error('✗ Failed to connect to server:', error.message);
  }
}

testServer();