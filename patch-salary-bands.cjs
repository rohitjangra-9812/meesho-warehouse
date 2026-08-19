const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldGen = `const generateEmployees = () => {
    const depts = [
      { name: "Packing Department", salary: 23500 },
      { name: "Scanning / Intake", salary: 25000 },
      { name: "Material Handling", salary: 28000 },
      { name: "General Workers", salary: 21500 },
      { name: "Security Guard / Loss Prevention", salary: 22500 },
      { name: "Fleet Drivers / Logistics", salary: 32000 },
      { name: "Management Team", salary: 45000 }
    ];
    const states = ["Bihar", "UP", "Punjab", "Haryana"];
    const quals = ["10th Pass", "12th Pass", "ITI Diploma", "Graduate", "Post Graduate"];
    const exps = ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"];
    const statuses = ["Active", "On Leave", "Shift Active"];
    const firstNames = ["Amit", "Rahul", "Rajesh", "Suresh", "Ramesh", "Mukesh", "Vijay", "Ajay", "Sanjay", "Sunil", "Anil", "Manoj", "Vinod", "Pramod", "Deepak", "Vikas", "Sonu", "Monu", "Ravi", "Prakash"];
    const lastNames = ["Kumar", "Singh", "Yadav", "Sharma", "Verma", "Paswan", "Chauhan", "Gupta", "Mishra", "Pandey"];

    const emps = [];
    let id = 1;
    for (const dept of depts) {
      for(let i=1; i<=50; i++) {
        const fName = firstNames[Math.floor(Math.random()*firstNames.length)];
        const lName = lastNames[Math.floor(Math.random()*lastNames.length)];
        emps.push({
          id: id,
          empId: \`EMP-\${1000 + id}\`,
          name: \`\${fName} \${lName}\`,
          fathersName: \`\${firstNames[Math.floor(Math.random()*firstNames.length)]} \${lastNames[Math.floor(Math.random()*lastNames.length)]}\`,
          department: dept.name,
          age: Math.floor(Math.random() * (48 - 21 + 1)) + 21,
          qualification: quals[Math.floor(Math.random()*quals.length)],
          homeState: states[Math.floor(Math.random()*states.length)],
          experience: exps[Math.floor(Math.random()*exps.length)],
          salary: dept.salary,
          phone: \`9\${Math.floor(100000000 + Math.random() * 900000000)}\`,
          email: \`\${fName.toLowerCase()}.\${lName.toLowerCase()}\${id}@gmail.com\`,
          emergencyContact: \`8\${Math.floor(100000000 + Math.random() * 900000000)}\`,
          status: statuses[Math.floor(Math.random()*statuses.length)]
        });
        id++;
      }
    }
    return emps;
  };`;

const newGen = `const generateEmployees = () => {
    const depts = [
      { name: "Packing Department", minSalary: 22000, maxSalary: 25000 },
      { name: "Scanning / Intake", minSalary: 24000, maxSalary: 27000 },
      { name: "Material Handling", minSalary: 26000, maxSalary: 30000 },
      { name: "General Workers", minSalary: 20000, maxSalary: 23000 },
      { name: "Security Guard / Loss Prevention", minSalary: 21000, maxSalary: 24000 },
      { name: "Fleet Drivers / Logistics", minSalary: 30000, maxSalary: 38000 },
      { name: "Management Team", minSalary: 40000, maxSalary: 55000 }
    ];
    const states = ["Bihar", "UP", "Punjab", "Haryana"];
    const quals = ["10th Pass", "12th Pass", "ITI Diploma", "Graduate", "Post Graduate"];
    const exps = ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"];
    const statuses = ["Active", "On Leave", "Shift Active"];
    const firstNames = ["Amit", "Rahul", "Rajesh", "Suresh", "Ramesh", "Mukesh", "Vijay", "Ajay", "Sanjay", "Sunil", "Anil", "Manoj", "Vinod", "Pramod", "Deepak", "Vikas", "Sonu", "Monu", "Ravi", "Prakash"];
    const lastNames = ["Kumar", "Singh", "Yadav", "Sharma", "Verma", "Paswan", "Chauhan", "Gupta", "Mishra", "Pandey"];

    const emps = [];
    let id = 1;
    for (const dept of depts) {
      for(let i=1; i<=50; i++) {
        const fName = firstNames[Math.floor(Math.random()*firstNames.length)];
        const lName = lastNames[Math.floor(Math.random()*lastNames.length)];
        emps.push({
          id: id,
          empId: \`EMP-\${1000 + id}\`,
          name: \`\${fName} \${lName}\`,
          fathersName: \`\${firstNames[Math.floor(Math.random()*firstNames.length)]} \${lastNames[Math.floor(Math.random()*lastNames.length)]}\`,
          department: dept.name,
          age: Math.floor(Math.random() * (48 - 21 + 1)) + 21,
          qualification: quals[Math.floor(Math.random()*quals.length)],
          homeState: states[Math.floor(Math.random()*states.length)],
          experience: exps[Math.floor(Math.random()*exps.length)],
          salary: Math.floor(Math.random() * (dept.maxSalary - dept.minSalary + 1)) + dept.minSalary,
          phone: \`9\${Math.floor(100000000 + Math.random() * 900000000)}\`,
          email: \`\${fName.toLowerCase()}.\${lName.toLowerCase()}\${id}@gmail.com\`,
          emergencyContact: \`8\${Math.floor(100000000 + Math.random() * 900000000)}\`,
          status: statuses[Math.floor(Math.random()*statuses.length)]
        });
        id++;
      }
    }
    return emps;
  };`;

if (!code.includes(oldGen.substring(0, 50))) {
  console.log("Could not find old gen");
}

code = code.replace(oldGen, newGen);
fs.writeFileSync('server.ts', code);
console.log("Successfully patched salary bands");
