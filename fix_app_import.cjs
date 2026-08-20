const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(', Landmark, Users, BookOpen, Truck, BrainCircuit, ScanBarcode , Shield } from "lucide-react";', ', Landmark, Users, BookOpen, Truck, BrainCircuit, ScanBarcode , Shield, Video, FileBarChart } from "lucide-react";');
fs.writeFileSync('src/App.tsx', code);
