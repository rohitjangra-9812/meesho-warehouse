const fs = require('fs');
let code = fs.readFileSync('src/components/DockManagementScreen.tsx', 'utf8');

const importsToAdd = `import { Anchor, Plus, Search, Tag, X } from 'lucide-react';`;
code = code.replace("import { Anchor, Plus } from 'lucide-react';", importsToAdd);

const statesToAdd = `
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState<Record<number, string[]>>({});
  const [newTagInput, setNewTagInput] = useState<Record<number, string>>({});
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  const addTag = (id: number, tag: string) => {
    if (!tag.trim()) return;
    setTags(prev => ({ ...prev, [id]: [...(prev[id] || []), tag.trim()] }));
    setNewTagInput(prev => ({ ...prev, [id]: '' }));
  };

  const removeTag = (id: number, tagToRemove: string) => {
    setTags(prev => ({ ...prev, [id]: prev[id].filter(t => t !== tagToRemove) }));
  };
`;

code = code.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n" + statesToAdd);

const filterLogic = `
  const filteredDocks = docks.filter(d => {
    const matchesSearch = d.doorNumber.toLowerCase().includes(searchTerm.toLowerCase()) || (d.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = activeTagFilter ? (tags[d.id] || []).includes(activeTagFilter) : true;
    return matchesSearch && matchesTag;
  });
  const allUniqueTags = Array.from(new Set(Object.values(tags).flat()));
`;

code = code.replace('return (', filterLogic + '\n  return (');

const headerAdditions = `
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
         <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter by Door Number or Notes..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
         </div>
         {allUniqueTags.length > 0 && (
           <div className="flex gap-2 items-center flex-wrap">
             <span className="text-sm text-gray-500 font-medium">Filter by tag:</span>
             <button 
               onClick={() => setActiveTagFilter(null)}
               className={\`px-3 py-1 rounded-full text-xs font-medium border \${!activeTagFilter ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}\`}
             >
               All
             </button>
             {allUniqueTags.map(tag => (
               <button 
                 key={tag}
                 onClick={() => setActiveTagFilter(tag)}
                 className={\`px-3 py-1 rounded-full text-xs font-medium border \${activeTagFilter === tag ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}\`}
               >
                 {tag}
               </button>
             ))}
           </div>
         )}
      </div>
`;

code = code.replace('{isAdding && (', headerAdditions + '\n      {isAdding && (');

// Update map from docks.map to filteredDocks.map
code = code.replace('docks.map(dock => (', 'filteredDocks.map(dock => (');

code = code.replace('<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>', '<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>\n<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Tags</th>');

const tagsCell = `
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(tags[dock.id] || []).map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          <Tag className="h-3 w-3 text-gray-500"/> {tag}
                          <button onClick={() => removeTag(dock.id, tag)} className="text-gray-400 hover:text-red-500"><X className="h-3 w-3"/></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center">
                       <input 
                         type="text" 
                         placeholder="Add tag..." 
                         value={newTagInput[dock.id] || ''}
                         onChange={e => setNewTagInput(prev => ({ ...prev, [dock.id]: e.target.value }))}
                         onKeyDown={e => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             addTag(dock.id, newTagInput[dock.id]);
                           }
                         }}
                         className="text-xs px-2 py-1 border border-gray-300 rounded-l focus:ring-0 focus:border-blue-500 w-24"
                       />
                       <button 
                         onClick={() => addTag(dock.id, newTagInput[dock.id] || '')}
                         className="bg-gray-100 border border-l-0 border-gray-300 px-2 py-1 rounded-r hover:bg-gray-200 text-gray-600"
                       >
                         <Plus className="h-3 w-3"/>
                       </button>
                    </div>
                  </td>
`;

code = code.replace('</td className="px-6 py-4 text-sm text-gray-500">', '</td className="px-6 py-4 text-sm text-gray-500">');
code = code.replace(
  '{dock.notes || "-"}\n                  </td>',
  '{dock.notes || "-"}\n                  </td>\n' + tagsCell
);

// fix colSpan
code = code.replace('colSpan={4}', 'colSpan={5}');

fs.writeFileSync('src/components/DockManagementScreen.tsx', code);
