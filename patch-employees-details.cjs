const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldGen = `const generateEmployees = () => {
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
  };`;

const newGen = `const generateEmployees = () => {
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

// Using regex or replace
code = code.replace(oldGen, newGen);
fs.writeFileSync('server.ts', code);

let empCode = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// replace form data initialization
const oldFormData = `const [formData, setFormData] = useState({
    name: '', fathersName: '', department: 'Packing Department', age: 21,
    qualification: '10th Pass', homeState: 'Bihar', experience: 'Fresher',
    salary: 20000, phone: '', emergencyContact: '', status: 'Active'
  });`;

const newFormData = `const [formData, setFormData] = useState({
    name: '', fathersName: '', department: 'Packing Department', age: 21,
    qualification: '10th Pass', homeState: 'Bihar', experience: 'Fresher',
    salary: 20000, phone: '', email: '', emergencyContact: '', status: 'Active'
  });`;
empCode = empCode.replace(oldFormData, newFormData);

const oldOpenNew = `const openNew = () => {
    setEditingId(null);
    setFormData({
      name: '', fathersName: '', department: 'Packing Department', age: 21,
      qualification: '10th Pass', homeState: 'Bihar', experience: 'Fresher',
      salary: 20000, phone: '', emergencyContact: '', status: 'Active'
    });
    setIsModalOpen(true);
  };`;
const newOpenNew = `const openNew = () => {
    setEditingId(null);
    setFormData({
      name: '', fathersName: '', department: 'Packing Department', age: 21,
      qualification: '10th Pass', homeState: 'Bihar', experience: 'Fresher',
      salary: 20000, phone: '', email: '', emergencyContact: '', status: 'Active'
    });
    setIsModalOpen(true);
  };`;
empCode = empCode.replace(oldOpenNew, newOpenNew);

// update contact cell
const oldContactCell = `<td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">+91 {emp.phone}</div>
                    <div className="text-xs text-gray-500 mt-1">{emp.homeState}</div>
                  </td>`;
const newContactCell = `<td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">+91 {emp.phone}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono break-all max-w-[180px]">{emp.email}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{emp.homeState}</div>
                  </td>`;
empCode = empCode.replace(oldContactCell, newContactCell);

// update form inputs to add Email
const oldPhoneInput = `<div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Contact Number</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>`;
const newPhoneEmailInput = `<div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Contact Number</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>`;
empCode = empCode.replace(oldPhoneInput, newPhoneEmailInput);

fs.writeFileSync('src/components/EmployeeScreen.tsx', empCode);
