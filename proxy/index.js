// api/proxy.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const {endpoint, params} = req.body;

    if (!endpoint || !params) {
      return res.status(400).json({
        error: 'Missing endpoint or params',
      });
    }

    const baseUrl = 'https://app.orderkuota.com/api/v2';
    const url = `${baseUrl}${endpoint}`;

    // Convert params object to URLSearchParams
    const formData = new URLSearchParams();
    Object.keys(params).forEach(key => {
      formData.append(key, params[key]);
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'okhttp/4.12.0',
      },
      body: formData.toString(),
      redirect: 'follow',
    });

    const responseText = await response.text();
    const httpCode = response.status;

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (e) {
      jsonResponse = {
        success: false,
        message: 'Invalid JSON from server',
        http_code: httpCode,
        raw: responseText,
      };
    }

    return res.status(httpCode).json(jsonResponse);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
