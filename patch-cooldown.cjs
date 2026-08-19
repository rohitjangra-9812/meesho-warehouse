const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const assignTarget = `    if (dock) {
      dock.status = req.body.status || 'Inbound Unloading';`;
const assignReplace = `    if (dock) {
      if (dock.lastReleasedAt && Date.now() - dock.lastReleasedAt < 20 * 60 * 1000) {
         const remaining = Math.ceil((20 * 60 * 1000 - (Date.now() - dock.lastReleasedAt)) / 60000);
         return res.status(400).json({error: \`Bay Cooldown Active: Please wait \${remaining} minutes before re-assigning this bay.\`});
      }
      dock.status = req.body.status || 'Inbound Unloading';`;

const releaseTarget = `      dock.status = 'Available';
      dock.vehicle = null;`;
const releaseReplace = `      dock.status = 'Available';
      dock.vehicle = null;
      dock.lastReleasedAt = Date.now();`;

code = code.replace(assignTarget, assignReplace);
code = code.replace(releaseTarget, releaseReplace);
fs.writeFileSync('server.ts', code);
