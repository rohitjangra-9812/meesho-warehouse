export interface RosterAssociate {
  empId: string;
  name: string;
  department: 'Wave Picking' | 'Packing & QC' | 'Inbound Receiving' | 'Dock Logistics' | 'Returns & RTO' | 'Security & Facility';
  shift: 'Morning A' | 'Evening B' | 'Night C';
  attendanceStatus: 'Checked In' | 'On Floor' | 'Dock Station' | 'Break';
  punchTime: string;
  turnstileGate: string;
  defaultDiet: 'Pure Veg' | 'Non-Veg' | 'Jain';
  photo: string;
  phone: string;
}

export const CANTEEN_ACTIVE_ROSTER: RosterAssociate[] = [
  // Shift A - Morning (06:00 - 14:30)
  { empId: 'MSH-EMP-001', name: 'Aarav Kumar', department: 'Inbound Receiving', shift: 'Morning A', attendanceStatus: 'Checked In', punchTime: '05:52 AM', turnstileGate: 'Gate A - Inbound Dock', defaultDiet: 'Pure Veg', photo: '👨‍💼', phone: '+91 98765 43210' },
  { empId: 'MSH-EMP-002', name: 'Vivaan Sharma', department: 'Wave Picking', shift: 'Morning A', attendanceStatus: 'On Floor', punchTime: '05:55 AM', turnstileGate: 'Gate B - Mezzanine Aisle', defaultDiet: 'Non-Veg', photo: '🧑‍🔧', phone: '+91 98765 43211' },
  { empId: 'MSH-EMP-003', name: 'Aditya Singh', department: 'Packing & QC', shift: 'Morning A', attendanceStatus: 'Checked In', punchTime: '06:01 AM', turnstileGate: 'Gate C - Packing Belt 1', defaultDiet: 'Pure Veg', photo: '👨‍🏭', phone: '+91 98765 43212' },
  { empId: 'MSH-EMP-004', name: 'Vihaan Verma', department: 'Dock Logistics', shift: 'Morning A', attendanceStatus: 'Dock Station', punchTime: '05:48 AM', turnstileGate: 'Gate D - Bay 4 Express', defaultDiet: 'Pure Veg', photo: '👨‍💻', phone: '+91 98765 43213' },
  { empId: 'MSH-EMP-005', name: 'Arjun Gupta', department: 'Packing & QC', shift: 'Morning A', attendanceStatus: 'On Floor', punchTime: '06:03 AM', turnstileGate: 'Gate C - Packing Belt 2', defaultDiet: 'Pure Veg', photo: '🧑‍💼', phone: '+91 98765 43214' },
  { empId: 'MSH-EMP-011', name: 'Sunita Patel', department: 'Wave Picking', shift: 'Morning A', attendanceStatus: 'On Floor', punchTime: '05:50 AM', turnstileGate: 'Gate B - Zone 3', defaultDiet: 'Jain', photo: '👩‍🔧', phone: '+91 98765 43220' },
  { empId: 'MSH-EMP-012', name: 'Priya Reddy', department: 'Dock Logistics', shift: 'Morning A', attendanceStatus: 'Dock Station', punchTime: '05:54 AM', turnstileGate: 'Gate D - Inbound Bay 1', defaultDiet: 'Pure Veg', photo: '👩‍💼', phone: '+91 98765 43221' },
  { empId: 'MSH-EMP-013', name: 'Ananya Joshi', department: 'Packing & QC', shift: 'Morning A', attendanceStatus: 'On Floor', punchTime: '06:02 AM', turnstileGate: 'Gate C - QC Bench', defaultDiet: 'Pure Veg', photo: '👩‍🏭', phone: '+91 98765 43222' },
  { empId: 'MSH-EMP-019', name: 'Ritu Singh', department: 'Wave Picking', shift: 'Morning A', attendanceStatus: 'On Floor', punchTime: '05:57 AM', turnstileGate: 'Gate B - Zone 1', defaultDiet: 'Pure Veg', photo: '👩‍🔧', phone: '+91 98765 43228' },
  { empId: 'MSH-EMP-020', name: 'Anita Verma', department: 'Security & Facility', shift: 'Morning A', attendanceStatus: 'Checked In', punchTime: '05:40 AM', turnstileGate: 'Main Security Booth', defaultDiet: 'Pure Veg', photo: '👮‍♀️', phone: '+91 98765 43229' },
  { empId: 'MSH-EMP-021', name: 'Kunal Deshmukh', department: 'Wave Picking', shift: 'Morning A', attendanceStatus: 'On Floor', punchTime: '05:59 AM', turnstileGate: 'Gate B - Zone 4', defaultDiet: 'Non-Veg', photo: '👨‍🔧', phone: '+91 98765 43230' },
  { empId: 'MSH-EMP-022', name: 'Harish Nair', department: 'Inbound Receiving', shift: 'Morning A', attendanceStatus: 'Checked In', punchTime: '05:49 AM', turnstileGate: 'Gate A - Unloading Bay', defaultDiet: 'Pure Veg', photo: '👨‍💼', phone: '+91 98765 43231' },
  { empId: 'MSH-EMP-023', name: 'Pooja Tiwari', department: 'Packing & QC', shift: 'Morning A', attendanceStatus: 'On Floor', punchTime: '06:05 AM', turnstileGate: 'Gate C - Auto Sealer', defaultDiet: 'Jain', photo: '👩‍🏭', phone: '+91 98765 43232' },
  { empId: 'MSH-EMP-024', name: 'Siddharth Roy', department: 'Dock Logistics', shift: 'Morning A', attendanceStatus: 'Dock Station', punchTime: '05:53 AM', turnstileGate: 'Gate D - Outbound Staging', defaultDiet: 'Non-Veg', photo: '🧑‍💻', phone: '+91 98765 43233' },
  { empId: 'MSH-EMP-025', name: 'Megha Sen', department: 'Returns & RTO', shift: 'Morning A', attendanceStatus: 'Checked In', punchTime: '06:00 AM', turnstileGate: 'Gate E - RTO Sorting', defaultDiet: 'Pure Veg', photo: '👩‍💻', phone: '+91 98765 43234' },
  { empId: 'MSH-EMP-026', name: 'Deepak Choudhary', department: 'Wave Picking', shift: 'Morning A', attendanceStatus: 'On Floor', punchTime: '05:51 AM', turnstileGate: 'Gate B - High Bay Aisle', defaultDiet: 'Pure Veg', photo: '👨‍🔧', phone: '+91 98765 43235' },
  { empId: 'MSH-EMP-027', name: 'Shweta Mishra', department: 'Packing & QC', shift: 'Morning A', attendanceStatus: 'On Floor', punchTime: '06:04 AM', turnstileGate: 'Gate C - Bubble Wrap Station', defaultDiet: 'Pure Veg', photo: '👩‍🏭', phone: '+91 98765 43236' },
  { empId: 'MSH-EMP-028', name: 'Gaurav Kulkarni', department: 'Inbound Receiving', shift: 'Morning A', attendanceStatus: 'Checked In', punchTime: '05:45 AM', turnstileGate: 'Gate A - Dock Weighbridge', defaultDiet: 'Non-Veg', photo: '👨‍💼', phone: '+91 98765 43237' },

  // Shift B - Evening / General (14:00 - 22:30)
  { empId: 'MSH-EMP-006', name: 'Sai Yadav', department: 'Wave Picking', shift: 'Evening B', attendanceStatus: 'Checked In', punchTime: '13:48 PM', turnstileGate: 'Gate B - Zone 2', defaultDiet: 'Pure Veg', photo: '👨‍🔧', phone: '+91 98765 43215' },
  { empId: 'MSH-EMP-007', name: 'Reyansh Malik', department: 'Inbound Receiving', shift: 'Evening B', attendanceStatus: 'Checked In', punchTime: '13:50 PM', turnstileGate: 'Gate A - Inbound Bay', defaultDiet: 'Non-Veg', photo: '👨‍🏭', phone: '+91 98765 43216' },
  { empId: 'MSH-EMP-008', name: 'Ayaan Chauhan', department: 'Dock Logistics', shift: 'Evening B', attendanceStatus: 'Dock Station', punchTime: '13:45 PM', turnstileGate: 'Gate D - Bay 2 Hub', defaultDiet: 'Pure Veg', photo: '👨‍💼', phone: '+91 98765 43217' },
  { empId: 'MSH-EMP-009', name: 'Krishna Saini', department: 'Returns & RTO', shift: 'Evening B', attendanceStatus: 'Checked In', punchTime: '13:55 PM', turnstileGate: 'Gate E - RTO Desk', defaultDiet: 'Pure Veg', photo: '🧑‍💻', phone: '+91 98765 43218' },
  { empId: 'MSH-EMP-014', name: 'Diya Tiwari', department: 'Inbound Receiving', shift: 'Evening B', attendanceStatus: 'Checked In', punchTime: '13:52 PM', turnstileGate: 'Gate A - Pallet Staging', defaultDiet: 'Pure Veg', photo: '👩‍💼', phone: '+91 98765 43223' },
  { empId: 'MSH-EMP-015', name: 'Kavita Desai', department: 'Wave Picking', shift: 'Evening B', attendanceStatus: 'On Floor', punchTime: '13:56 PM', turnstileGate: 'Gate B - Zone 5', defaultDiet: 'Jain', photo: '👩‍🔧', phone: '+91 98765 43224' },
  { empId: 'MSH-EMP-016', name: 'Neha Rao', department: 'Returns & RTO', shift: 'Evening B', attendanceStatus: 'Checked In', punchTime: '13:58 PM', turnstileGate: 'Gate E - RTO Sorting', defaultDiet: 'Pure Veg', photo: '👩‍💻', phone: '+91 98765 43225' },
  { empId: 'MSH-EMP-029', name: 'Abhishek Pandey', department: 'Wave Picking', shift: 'Evening B', attendanceStatus: 'On Floor', punchTime: '13:49 PM', turnstileGate: 'Gate B - Zone 1', defaultDiet: 'Non-Veg', photo: '👨‍🔧', phone: '+91 98765 43238' },
  { empId: 'MSH-EMP-030', name: 'Sneha Pillai', department: 'Packing & QC', shift: 'Evening B', attendanceStatus: 'On Floor', punchTime: '14:02 PM', turnstileGate: 'Gate C - Conveyor 3', defaultDiet: 'Pure Veg', photo: '👩‍🏭', phone: '+91 98765 43239' },
  { empId: 'MSH-EMP-031', name: 'Manish Bhat', department: 'Dock Logistics', shift: 'Evening B', attendanceStatus: 'Dock Station', punchTime: '13:44 PM', turnstileGate: 'Gate D - Bay 5', defaultDiet: 'Pure Veg', photo: '🧑‍💻', phone: '+91 98765 43240' },
  { empId: 'MSH-EMP-032', name: 'Rashmi Chauhan', department: 'Wave Picking', shift: 'Evening B', attendanceStatus: 'On Floor', punchTime: '13:53 PM', turnstileGate: 'Gate B - Zone 3', defaultDiet: 'Pure Veg', photo: '👩‍🔧', phone: '+91 98765 43241' },
  { empId: 'MSH-EMP-033', name: 'Tanmay Saxena', department: 'Security & Facility', shift: 'Evening B', attendanceStatus: 'Checked In', punchTime: '13:40 PM', turnstileGate: 'Main Gate Control', defaultDiet: 'Pure Veg', photo: '👮‍♂️', phone: '+91 98765 43242' },

  // Shift C - Night (22:00 - 06:30)
  { empId: 'MSH-EMP-010', name: 'Ishaan Reddy', department: 'Security & Facility', shift: 'Night C', attendanceStatus: 'Checked In', punchTime: '21:45 PM', turnstileGate: 'Perimeter Desk 1', defaultDiet: 'Pure Veg', photo: '👮‍♂️', phone: '+91 98765 43219' },
  { empId: 'MSH-EMP-017', name: 'Pooja Kumar', department: 'Packing & QC', shift: 'Night C', attendanceStatus: 'On Floor', punchTime: '21:52 PM', turnstileGate: 'Gate C - Night Shift Line', defaultDiet: 'Pure Veg', photo: '👩‍🏭', phone: '+91 98765 43226' },
  { empId: 'MSH-EMP-018', name: 'Sneha Sharma', department: 'Inbound Receiving', shift: 'Night C', attendanceStatus: 'Checked In', punchTime: '21:49 PM', turnstileGate: 'Gate A - Night Inflow', defaultDiet: 'Pure Veg', photo: '👩‍💼', phone: '+91 98765 43227' },
  { empId: 'MSH-EMP-034', name: 'Vikrant Thakur', department: 'Wave Picking', shift: 'Night C', attendanceStatus: 'On Floor', punchTime: '21:55 PM', turnstileGate: 'Gate B - Fast Pick Line', defaultDiet: 'Non-Veg', photo: '👨‍🔧', phone: '+91 98765 43243' },
  { empId: 'MSH-EMP-035', name: 'Nikhil Rane', department: 'Dock Logistics', shift: 'Night C', attendanceStatus: 'Dock Station', punchTime: '21:47 PM', turnstileGate: 'Gate D - Night Cross-dock', defaultDiet: 'Pure Veg', photo: '🧑‍💻', phone: '+91 98765 43244' },
  { empId: 'MSH-EMP-036', name: 'Swati Bansal', department: 'Returns & RTO', shift: 'Night C', attendanceStatus: 'Checked In', punchTime: '21:58 PM', turnstileGate: 'Gate E - Night Audit', defaultDiet: 'Jain', photo: '👩‍💻', phone: '+91 98765 43245' },
  { empId: 'MSH-EMP-037', name: 'Dinesh Joshi', department: 'Wave Picking', shift: 'Night C', attendanceStatus: 'On Floor', punchTime: '21:50 PM', turnstileGate: 'Gate B - High Rack Zone', defaultDiet: 'Pure Veg', photo: '👨‍🔧', phone: '+91 98765 43246' },
  { empId: 'MSH-EMP-038', name: 'Geeta Kashyap', department: 'Packing & QC', shift: 'Night C', attendanceStatus: 'On Floor', punchTime: '22:01 PM', turnstileGate: 'Gate C - Seal Desk', defaultDiet: 'Pure Veg', photo: '👩‍🏭', phone: '+91 98765 43247' }
];

export const SUPERVISOR_PROFILES = [
  { id: 'SUP-01', name: 'Rajesh Yadav', role: 'Wave Picking Supervisor', shift: 'Morning A', department: 'Wave Picking', badgeId: 'MSH-SUP-8110', avatar: '👨‍💼' },
  { id: 'SUP-02', name: 'Vikram Patel', role: 'Inbound Receiving Lead', shift: 'Evening B', department: 'Inbound Receiving', badgeId: 'MSH-SUP-8114', avatar: '🧑‍💼' },
  { id: 'SUP-03', name: 'Pooja Sharma', role: 'Packing & QC Shift Lead', shift: 'Morning A', department: 'Packing & QC', badgeId: 'MSH-SUP-8120', avatar: '👩‍💼' },
  { id: 'SUP-04', name: 'Amol Deshmukh', role: 'Dock Logistics Shift Lead', shift: 'Morning A', department: 'Dock Logistics', badgeId: 'MSH-SUP-8125', avatar: '👨‍💻' },
  { id: 'SUP-05', name: 'Sunil Rathore', role: 'Returns & RTO Supervisor', shift: 'Evening B', department: 'Returns & RTO', badgeId: 'MSH-SUP-8132', avatar: '🧑‍💻' },
  { id: 'SUP-06', name: 'Kavita Nair', role: 'Night Operations Floor Incharge', shift: 'Night C', department: 'Security & Facility', badgeId: 'MSH-SUP-8190', avatar: '👩‍✈️' }
];
