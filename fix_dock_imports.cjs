const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');
code = code.replace("import { Truck, Clock, MapPin, Package, Fuel, AlertCircle, CheckCircle2, Search, Plus, X, ArrowRight, Zap, Bot, ThumbsUp, XCircle, Bell, BellRing, FileText, Printer } from 'lucide-react';", 
"import { Truck, Clock, MapPin, Package, Fuel, AlertCircle, CheckCircle2, Search, Plus, X, ArrowRight, Zap, Bot, ThumbsUp, XCircle, Bell, BellRing, FileText, Printer, ClipboardCheck, RefreshCw } from 'lucide-react';");
fs.writeFileSync('src/components/DockScreen.tsx', code);
