const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `  // --- NEW STREAMLINED APIS ---`;

const newApi = `
  const generateEmployees = () => {
    const depts = ["Packing Department", "Scanning / Intake", "Material Handling", "General Workers", "Security Guard / Loss Prevention", "Fleet Drivers / Logistics", "Management Team"];
    const states = ["Bihar", "UP", "Punjab", "Haryana"];
    const quals = ["10th Pass", "12th Pass", "ITI Diploma", "Graduate", "Post Graduate"];
    const exps = ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"];
    const statuses = ["Active", "On Leave", "Shift Active"];
    const firstNames = ["Amit", "Rahul", "Rajesh", "Suresh", "Ramesh", "Mukesh", "Vijay", "Ajay", "Sanjay", "Sunil", "Anil", "Manoj", "Vinod", "Pramod", "Deepak", "Vikas", "Sonu", "Monu", "Ravi", "Prakash"];
    const lastNames = ["Kumar", "Singh", "Yadav", "Sharma", "Verma", "Paswan", "Chauhan", "Gupta", "Mishra", "Pandey"];

    const emps = [];
    for(let i=1; i<=350; i++) {
      emps.push({
        id: i,
        empId: \`EMP-\${1000 + i}\`,
        name: \`\${firstNames[Math.floor(Math.random()*firstNames.length)]} \${lastNames[Math.floor(Math.random()*lastNames.length)]}\`,
        fathersName: \`\${firstNames[Math.floor(Math.random()*firstNames.length)]} \${lastNames[Math.floor(Math.random()*lastNames.length)]}\`,
        department: depts[Math.floor(Math.random()*depts.length)],
        age: Math.floor(Math.random() * (48 - 21 + 1)) + 21,
        qualification: quals[Math.floor(Math.random()*quals.length)],
        homeState: states[Math.floor(Math.random()*states.length)],
        experience: exps[Math.floor(Math.random()*exps.length)],
        salary: Math.floor(Math.random() * 25000) + 20000,
        phone: \`9\${Math.floor(100000000 + Math.random() * 900000000)}\`,
        emergencyContact: \`8\${Math.floor(100000000 + Math.random() * 900000000)}\`,
        status: statuses[Math.floor(Math.random()*statuses.length)]
      });
    }
    return emps;
  };
  let mockEmployees = generateEmployees();

  app.get("/api/employees/stats", requireAuth, (req, res) => {
    const total = mockEmployees.length;
    const depts = {};
    mockEmployees.forEach(e => {
      depts[e.department] = (depts[e.department] || 0) + 1;
    });
    res.json({ total, departments: depts });
  });

  app.get("/api/employees", requireAuth, (req, res) => {
    res.json(mockEmployees);
  });

  app.post("/api/employees", requireAuth, (req, res) => {
    const newEmp = {
      id: mockEmployees.length ? Math.max(...mockEmployees.map(e => e.id)) + 1 : 1,
      empId: \`EMP-\${1000 + (mockEmployees.length ? Math.max(...mockEmployees.map(e => parseInt(e.empId.split('-')[1]))) + 1 : 1)}\`,
      ...req.body
    };
    mockEmployees.unshift(newEmp);
    res.json(newEmp);
  });

  app.put("/api/employees/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const index = mockEmployees.findIndex(e => e.id === id);
    if (index !== -1) {
      mockEmployees[index] = { ...mockEmployees[index], ...req.body };
      res.json(mockEmployees[index]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  app.delete("/api/employees/:id", requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    mockEmployees = mockEmployees.filter(e => e.id !== id);
    res.json({ success: true });
  });
`;

code = code.replace(targetStr, targetStr + "\\n" + newApi);
fs.writeFileSync(file, code);
