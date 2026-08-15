const https = require('https');
https.get('https://assets.mixkit.co/videos/preview/mixkit-workers-in-a-warehouse-moving-pallets-with-a-forklift-41716-large.mp4', res => console.log(res.statusCode));
