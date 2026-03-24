const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function classifyText(text) {
  const response = await fetch(`${BASE_URL}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${response.status}`);
  }
  return response.json();
}

export async function checkHealth() {
  const response = await fetch(`${BASE_URL}/health`);
  return response.ok;
}
