import React, { useState, useEffect } from 'react';
import {
  Binary,
  Layers,
  Database,
  ArrowRight,
  RefreshCw,
  GitCommit,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import {
  DsaHeapState,
  DsaHashTableState,
  DsaLinkedListState,
  DsaFifoQueueState,
} from '../types';
import { TriageBadge } from '../components/StatusBadge';

export const DsaDemonstration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'heap' | 'hash' | 'linked-list' | 'fifo' | 'sorting'>('heap');

  const [heapState, setHeapState] = useState<DsaHeapState | null>(null);
  const [hashState, setHashState] = useState<DsaHashTableState | null>(null);
  const [llState, setLlState] = useState<DsaLinkedListState | null>(null);
  const [fifoState, setFifoState] = useState<DsaFifoQueueState | null>(null);

  // Merge sort demo state
  const [sortKey, setSortKey] = useState('age');
  const [sortReverse, setSortReverse] = useState(false);
  const [sortResult, setSortResult] = useState<any | null>(null);
  const [isSorting, setIsSorting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const fetchDsaData = async () => {
    setIsLoading(true);
    try {
      const [heap, hash, ll, fifo] = await Promise.all([
        api.getDsaHeap(),
        api.getDsaHashTable(),
        api.getDsaLinkedList(),
        api.getDsaFifoQueue(),
      ]);
      setHeapState(heap);
      setHashState(hash);
      setLlState(ll);
      setFifoState(fifo);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDsaData();
  }, [activeTab]);

  const handleRunSort = async () => {
    setIsSorting(true);
    try {
      const res = await api.runMergeSort(sortKey, sortReverse);
      setSortResult(res);
    } catch (err: any) {
      alert(`Sort error: ${err.message}`);
    } finally {
      setIsSorting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-4 rounded border border-ermDivider flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <h2 className="text-sm font-semibold text-ermText">
              Data Structures & Algorithms Live Examination Lab
            </h2>
          </div>
          <p className="text-xs text-ermMuted mt-0.5">
            Inspect real in-memory data structures executing live in the Python backend: Binary Min-Heap, Hash Table, Linked List, and Merge Sort.
          </p>
        </div>

        <button
          onClick={fetchDsaData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Memory State</span>
        </button>
      </div>

      {/* DSA Sub-navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-ermDivider pb-2">
        <button
          onClick={() => setActiveTab('heap')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'heap'
              ? 'bg-ermBrand text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-ermDivider'
          }`}
        >
          1. Binary Min-Heap (Priority Queue)
        </button>

        <button
          onClick={() => setActiveTab('hash')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'hash'
              ? 'bg-ermBrand text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-ermDivider'
          }`}
        >
          2. Hash Table (Separate Chaining)
        </button>

        <button
          onClick={() => setActiveTab('linked-list')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'linked-list'
              ? 'bg-ermBrand text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-ermDivider'
          }`}
        >
          3. Singly Linked List (Event Stream)
        </button>

        <button
          onClick={() => setActiveTab('fifo')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'fifo'
              ? 'bg-ermBrand text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-ermDivider'
          }`}
        >
          4. FIFO Reception Queue
        </button>

        <button
          onClick={() => setActiveTab('sorting')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'sorting'
              ? 'bg-ermBrand text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-ermDivider'
          }`}
        >
          5. Merge Sort Step Visualizer
        </button>
      </div>

      {/* 1. BINARY MIN-HEAP TAB */}
      {activeTab === 'heap' && heapState && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Complexity & Theoretical Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Insertion (heappush)</span>
              <span className="text-xl font-bold font-mono text-ermBrand">O(log n)</span>
              <p className="text-[11px] text-gray-500 mt-1">Appends to end and bubbles up (_sift_up)</p>
            </div>
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Extract Min (heappop)</span>
              <span className="text-xl font-bold font-mono text-ermBrand">O(log n)</span>
              <p className="text-[11px] text-gray-500 mt-1">Swaps root with last element and sifts down</p>
            </div>
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Peek Root</span>
              <span className="text-xl font-bold font-mono text-ermBrand">O(1)</span>
              <p className="text-[11px] text-gray-500 mt-1">Direct index inspection `heap[0]`</p>
            </div>
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Tie-Breaking Resolution</span>
              <span className="text-sm font-bold text-gray-800">Arrival Sequence (FIFO)</span>
              <p className="text-[11px] text-gray-500 mt-1">Secondary key ensures earlier arrival is treated first</p>
            </div>
          </div>

          {/* Root Peak Card */}
          {heapState.peek_root ? (
            <div className="bg-white rounded border border-ermDivider p-4 border-l-4 border-l-ermBrand flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase">Current Root Node `heap[0]`</span>
                <div className="text-sm font-bold text-ermText mt-0.5">
                  {heapState.peek_root.patient_name} ({heapState.peek_root.patient_id})
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  Priority Key: <strong>{heapState.peek_root.priority}</strong> ({heapState.peek_root.triage_level}) · Arrival Seq: <strong>#{heapState.peek_root.arrival_seq}</strong>
                </div>
              </div>
              <TriageBadge level={heapState.peek_root.triage_level} />
            </div>
          ) : (
            <div className="bg-white p-4 rounded border border-ermDivider text-xs text-gray-400">
              Min-Heap is currently empty.
            </div>
          )}

          {/* Heap Array Physical Storage Layout */}
          <div className="bg-white rounded border border-ermDivider p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
                Internal Array Representation `heap[]` ({heapState.heap_array.length} Elements)
              </h3>
              <span className="font-mono text-[10px] text-gray-400">
                Left: 2i + 1 | Right: 2i + 2 | Parent: (i - 1) // 2
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {heapState.heap_array.map((item, index) => (
                <div
                  key={item.patient_id + index}
                  className="p-2.5 rounded border border-ermDivider bg-[#FAF9F6] text-xs space-y-1 min-w-[130px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-ermBrand">
                      Index [{index}]
                    </span>
                    <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                      P:{item.priority} S:{item.arrival_seq}
                    </span>
                  </div>
                  <div className="font-semibold text-ermText truncate">{item.patient_name}</div>
                  <div className="text-[10px] text-gray-500 font-mono truncate">{item.patient_id}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Operation History Trace */}
          <div className="bg-white rounded border border-ermDivider p-4 space-y-3">
            <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
              Recent Heap Operation Trace Log
            </h3>
            <div className="divide-y divide-gray-100 font-mono text-[11px]">
              {heapState.recent_operations.map((op, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      op.operation === 'PUSH' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {op.operation}
                    </span>
                    <span>{op.details}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Size: {op.heap_size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. HASH TABLE TAB */}
      {activeTab === 'hash' && hashState && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Buckets</span>
              <span className="text-xl font-bold font-mono text-ermBrand">{hashState.capacity}</span>
              <p className="text-[11px] text-gray-500 mt-1">Initial capacity: 32 with dynamic doubling</p>
            </div>
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Active Key Count</span>
              <span className="text-xl font-bold font-mono text-ermBrand">{hashState.size}</span>
              <p className="text-[11px] text-gray-500 mt-1">Unique Patient ID keys hashed</p>
            </div>
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Current Load Factor (α)</span>
              <span className="text-xl font-bold font-mono text-ermBrand">{hashState.load_factor}</span>
              <p className="text-[11px] text-gray-500 mt-1">Resizes if α &gt; 0.75</p>
            </div>
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Separate Chaining Collisions</span>
              <span className="text-xl font-bold font-mono text-amber-700">{hashState.collision_count}</span>
              <p className="text-[11px] text-gray-500 mt-1">Resolved via linked bucket chains</p>
            </div>
          </div>

          {/* Buckets Inspection Grid */}
          <div className="bg-white rounded border border-ermDivider p-4 space-y-3">
            <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
              Bucket Array & Chaining Inspection
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {hashState.buckets.map((b) => (
                <div
                  key={b.bucket_index}
                  className={`p-2.5 rounded border text-xs space-y-1 ${
                    b.chain_length > 1
                      ? 'bg-amber-50 border-amber-300'
                      : b.chain_length === 1
                      ? 'bg-[#FAF9F6] border-ermDivider'
                      : 'bg-white border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="font-bold">[{b.bucket_index}]</span>
                    <span>len:{b.chain_length}</span>
                  </div>
                  {b.nodes.map((node, i) => (
                    <div key={i} className="text-[10px] font-mono truncate text-gray-700" title={`${node.key}: ${node.summary}`}>
                      ↳ {node.key}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SINGLY LINKED LIST TAB */}
      {activeTab === 'linked-list' && llState && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Nodes in Memory</span>
              <span className="text-xl font-bold font-mono text-ermBrand">{llState.size}</span>
            </div>
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Head Pointer Node</span>
              <span className="text-xs font-bold font-mono text-gray-800">
                {llState.head ? `${llState.head.event_id} (${llState.head.event_type})` : 'NULL'}
              </span>
            </div>
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Tail Pointer Node</span>
              <span className="text-xs font-bold font-mono text-gray-800">
                {llState.tail ? `${llState.tail.event_id} (${llState.tail.event_type})` : 'NULL'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded border border-ermDivider p-4 space-y-3">
            <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
              Node Chain Visualization (Head → Node → Tail → NULL)
            </h3>

            <div className="space-y-2">
              {llState.nodes.map((node, index) => (
                <div key={node.event_id} className="flex items-center gap-3">
                  <div className="flex-1 bg-[#FAF9F6] border border-ermDivider rounded p-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-ermBrand">{node.event_id}</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-gray-200 text-gray-800 font-sans">
                        {node.event_type}
                      </span>
                      <p className="text-gray-600 font-sans mt-0.5 text-[11px]">{node.details}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">{node.timestamp?.split('T')[1]?.slice(0, 8)}</span>
                  </div>
                  {index < llState.nodes.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. FIFO QUEUE TAB */}
      {activeTab === 'fifo' && fifoState && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Current FIFO Size</span>
              <span className="text-xl font-bold font-mono text-ermBrand">{fifoState.size}</span>
            </div>
            <div className="bg-white p-4 rounded border border-ermDivider">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Front Element `peek()`</span>
              <span className="text-xs font-bold text-gray-800">
                {fifoState.front ? JSON.stringify(fifoState.front) : 'Queue Empty'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded border border-ermDivider p-4 space-y-3">
            <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
              Intake Ring Buffer Elements (Front to Rear)
            </h3>
            <div className="flex flex-wrap gap-2">
              {fifoState.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#FAF9F6] border border-ermDivider rounded text-xs space-y-1">
                  <span className="font-mono text-[10px] text-gray-400">Position #{idx + 1}</span>
                  <div className="font-semibold text-ermText">{item.name || item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MERGE SORT TAB */}
      {activeTab === 'sorting' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-4 rounded border border-ermDivider space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
                Divide & Conquer: Merge Sort Execution Engine
              </h3>
              <p className="text-xs text-ermMuted mt-0.5">
                Executes true O(n log n) recursive merge sort with stable tie-preservation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Sort Key:</label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-ermDivider rounded bg-white text-gray-700"
                >
                  <option value="age">Age (Numeric)</option>
                  <option value="arrival_seq">Arrival Sequence (FIFO sequence)</option>
                  <option value="triage_level">Triage Urgency</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Direction:</label>
                <select
                  value={sortReverse ? 'desc' : 'asc'}
                  onChange={(e) => setSortReverse(e.target.value === 'desc')}
                  className="px-3 py-1.5 text-xs border border-ermDivider rounded bg-white text-gray-700"
                >
                  <option value="asc">Ascending (Low to High)</option>
                  <option value="desc">Descending (High to Low)</option>
                </select>
              </div>

              <button
                onClick={handleRunSort}
                disabled={isSorting}
                className="mt-4 px-4 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isSorting ? 'Sorting...' : 'Execute Merge Sort'}</span>
              </button>
            </div>
          </div>

          {sortResult && (
            <div className="space-y-6">
              {/* Algorithm Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3.5 rounded border border-ermDivider">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Algorithm</span>
                  <span className="text-sm font-bold text-ermText block">{sortResult.algorithm}</span>
                </div>
                <div className="bg-white p-3.5 rounded border border-ermDivider">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Time Complexity</span>
                  <span className="text-sm font-bold font-mono text-ermBrand block">{sortResult.time_complexity}</span>
                </div>
                <div className="bg-white p-3.5 rounded border border-ermDivider">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Space Complexity</span>
                  <span className="text-sm font-bold font-mono text-ermBrand block">{sortResult.space_complexity}</span>
                </div>
                <div className="bg-white p-3.5 rounded border border-ermDivider">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Sorting Stability</span>
                  <span className="text-sm font-bold text-emerald-700 block">Guaranteed Stable</span>
                </div>
              </div>

              {/* Step by Step Execution Trace */}
              <div className="bg-white rounded border border-ermDivider p-4 space-y-2">
                <h4 className="text-xs font-semibold text-ermText uppercase tracking-wider">
                  Recursive Split & Merge Trace Log ({sortResult.steps.length} Steps)
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] text-gray-600 bg-[#FAF9F6] p-3 rounded border border-ermDivider">
                  {sortResult.steps.map((st: string, idx: number) => (
                    <div key={idx}>Step {idx + 1}: {st}</div>
                  ))}
                </div>
              </div>

              {/* Sorted Output Items */}
              <div className="bg-white rounded border border-ermDivider p-4 space-y-3">
                <h4 className="text-xs font-semibold text-ermText uppercase tracking-wider">
                  Sorted Patient Output ({sortResult.sorted_items.length} Records)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {sortResult.sorted_items.map((p: any) => (
                    <div key={p.patient_id} className="p-3 bg-white border border-ermDivider rounded text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="font-mono font-semibold text-ermBrand">{p.patient_id}</span>
                        <span className="font-bold text-gray-700">
                          {sortKey === 'age' ? `${p.age} yrs` : p[sortKey]}
                        </span>
                      </div>
                      <div className="font-medium text-ermText">{p.patient_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
