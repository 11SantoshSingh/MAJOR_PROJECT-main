(async () => {
  const base = 'http://localhost:5001';
  const registerBody = { name: 'Test User', email: 'testuser+smoke@example.com', password: 'Password123!', age: 30, phone: '1234567890', location: 'TestCity', pincode: 123456 };

  const regResp = await fetch(`${base}/api/patients/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerBody),
  });
  console.log('Register status', regResp.status);
  const regText = await regResp.text();
  console.log('Register body text:', regText);
  const setCookie = regResp.headers.get('set-cookie');
  console.log('Set-Cookie header:', setCookie);
  // If registration didn't set cookie (user exists), login to get cookie
  let cookie = null;
  if (!setCookie) {
    const loginResp = await fetch(`${base}/api/patients/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registerBody.email, password: registerBody.password }),
    });
    console.log('Login status', loginResp.status);
    const loginText = await loginResp.text();
    console.log('Login body text:', loginText);
    const loginSet = loginResp.headers.get('set-cookie');
    console.log('Login Set-Cookie:', loginSet);
    if (loginSet) {
      const m = loginSet.match(/(^|; )token=([^;]+)/);
      if (m) cookie = `token=${m[2]}`;
    }
  } else {
    const m = setCookie.match(/(^|; )token=([^;]+)/);
    if (m) cookie = `token=${m[2]}`;
  }
  console.log('Using cookie:', cookie);

  // Try profile
  const profileResp = await fetch(`${base}/api/patients/profile`, { headers: cookie ? { Cookie: cookie } : {} });
  console.log('Profile status', profileResp.status);
  try { const p = await profileResp.json(); console.log('Profile body:', p); } catch(e){}

  // Post a dummy prediction
  const predResp = await fetch(`${base}/api/patients/predict-result`, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, cookie ? { Cookie: cookie } : {}),
    body: JSON.stringify({ result: { prediction: 'Normal', confidence: 0.95 } }),
  });
  console.log('Predict-result status', predResp.status);
  try { const pr = await predResp.json(); console.log('Predict result body:', pr); } catch(e){}

  // Get my appointments
  const myAppt = await fetch(`${base}/api/appointments/my-appointments`, { headers: cookie ? { Cookie: cookie } : {} });
  console.log('My appointments status', myAppt.status);
  try { const ma = await myAppt.json(); console.log('My appointments body:', ma); } catch(e){}
})();
