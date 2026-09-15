import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function App() {
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem('shopping_lists');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'dev-Mercadona', items: [] }];
  });
  const [activeListId, setActiveListId] = useState(lists[0]?.id || '');
  const [newItemText, setNewItemText] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState('');

  useEffect(() => {
    localStorage.setItem('shopping_lists', JSON.stringify(lists));
  }, [lists]);

  const activeList = lists.find((l) => l.id === activeListId) || lists[0];

  // List Handlers
  const addList = () => {
    const name = prompt('Enter store/list name:');
    if (!name?.trim()) return;
    const newList = { id: Date.now().toString(), name: name.trim(), items: [] };
    setLists([...lists, newList]);
    setActiveListId(newList.id);
  };

  const startEditList = (list) => {
    setEditingListId(list.id);
    setEditingListName(list.name);
  };

  const saveListName = (id) => {
    setLists(lists.map((l) => (l.id === id ? { ...l, name: editingListName.trim() || l.name } : l)));
    setEditingListId(null);
  };

  const deleteList = (id) => {
    if (lists.length === 1) return alert('You must keep at least one list.');
    const filtered = lists.filter((l) => l.id !== id);
    setLists(filtered);
    if (activeListId === id) setActiveListId(filtered[0].id);
  };

  // Item Handlers
  const addItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim() || !activeList) return;
    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
      createdAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    };
    setLists(lists.map((l) => (l.id === activeList.id ? { ...l, items: [newItem, ...l.items] } : l)));
    setNewItemText('');
  };

  const toggleItem = (itemId) => {
    setLists(
      lists.map((l) => {
        if (l.id !== activeList.id) return l;
        return {
          ...l,
          items: l.items.map((i) => (i.id === itemId ? { ...i, completed: !i.completed } : i)),
        };
      })
    );
  };

  const deleteItem = (itemId) => {
    setLists(
      lists.map((l) => {
        if (l.id !== activeList.id) return l;
        return { ...l, items: l.items.filter((i) => i.id !== itemId) };
      })
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 text-slate-800 p-4 font-sans">
      {/* Store Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar border-b border-slate-200">
        {lists.map((list) => (
          <div
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${
              activeList?.id === list.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {editingListId === list.id ? (
              <input
                type="text"
                value={editingListName}
                onChange={(e) => setEditingListName(e.target.value)}
                onBlur={() => saveListName(list.id)}
                onKeyDown={(e) => e.key === 'Enter' && saveListName(list.id)}
                className="bg-transparent text-white outline-none w-20"
                autoFocus
              />
            ) : (
              <span>{list.name}</span>
            )}
            
            {activeList?.id === list.id && (
              <div className="flex items-center gap-1 ml-1 opacity-80">
                <Edit2 size={12} onClick={(e) => { e.stopPropagation(); startEditList(list); }} className="hover:text-amber-300" />
                <Trash2 size={12} onClick={(e) => { e.stopPropagation(); deleteList(list.id); }} className="hover:text-red-400" />
              </div>
            )}
          </div>
        ))}
        <button
          onClick={addList}
          className="p-1.5 rounded-full border border-dashed border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-700"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add Item Form */}
      {activeList && (
        <>
          <form onSubmit={addItem} className="mb-6">
            <input
              type="text"
              placeholder={`Add item to ${activeList.name}...`}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm"
            />
          </form>

          {/* Item List */}
          <div className="space-y-2">
            {activeList.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm transition-all ${
                  item.completed ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      item.completed ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {item.completed && <Check size={12} />}
                  </button>
                  <span className={`text-sm truncate ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {item.text}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">{item.createdAt}</span>
                  <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}

            {activeList.items.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-8">List is empty</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
