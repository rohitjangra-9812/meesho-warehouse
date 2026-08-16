console.log("Checking API");
fetch('http://localhost:3000/api/cross-docking')
  .then(res => res.json())
  .then(data => console.log('CrossDocking:', data.length))
  .catch(err => console.error(err));
