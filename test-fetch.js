const https = require('https');

https.get('https://github-contributions-api.deno.dev/dhruv-mavani.json', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    console.log(data.slice(0, 500));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
