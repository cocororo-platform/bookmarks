import { useState, useEffect, useCallback } from "react";

interface Bookmark {
  id: number;
  url: string;
  title: string;
  description: string | null;
  tags: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiLog {
  id: number;
  method: string;
  url: string;
  requestBody?: string;
  status: number;
  responseBody: string;
  ok: boolean;
  timestamp: string;
}

let logId = 0;

export default function ApiTester() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [createForm, setCreateForm] = useState({ url: "", title: "", description: "", tags: "" });
  const [editForm, setEditForm] = useState({ url: "", title: "", description: "", tags: "", favorite: false });

  const [tagFilter, setTagFilter] = useState("");

  const [customMethod, setCustomMethod] = useState("GET");
  const [customPath, setCustomPath] = useState("/api/bookmarks");
  const [customBody, setCustomBody] = useState("");

  const addLog = useCallback((log: Omit<ApiLog, "id" | "timestamp">) => {
    setLogs((prev) => [{ ...log, id: ++logId, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  }, []);

  const apiFetch = useCallback(
    async (method: string, url: string, body?: object) => {
      const options: RequestInit = { method, headers: { "Content-Type": "application/json" } };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(url, options);
      const text = await res.text();
      let parsed: unknown;
      try { parsed = JSON.parse(text); } catch { parsed = text; }

      addLog({
        method, url,
        requestBody: body ? JSON.stringify(body, null, 2) : undefined,
        status: res.status,
        responseBody: typeof parsed === "string" ? (parsed || "(empty)") : JSON.stringify(parsed, null, 2),
        ok: res.ok,
      });

      return { status: res.status, ok: res.ok, data: parsed };
    },
    [addLog],
  );

  const fetchBookmarks = useCallback(async (tags?: string) => {
    const params = tags ? `?tags=${tags}` : "";
    const { data } = await apiFetch("GET", `/api/bookmarks${params}`);
    if (Array.isArray(data)) setBookmarks(data);
  }, [apiFetch]);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, unknown> = { url: createForm.url, title: createForm.title };
    if (createForm.description) body.description = createForm.description;
    if (createForm.tags) body.tags = createForm.tags;
    const { ok } = await apiFetch("POST", "/api/bookmarks", body);
    if (ok) { setCreateForm({ url: "", title: "", description: "", tags: "" }); fetchBookmarks(); }
  };

  const startEdit = (b: Bookmark) => {
    setEditingId(b.id);
    setEditForm({ url: b.url, title: b.title, description: b.description ?? "", tags: b.tags, favorite: b.favorite });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    const body: Record<string, unknown> = { ...editForm };
    if (!body.description) body.description = null;
    const { ok } = await apiFetch("PUT", `/api/bookmarks/${editingId}`, body);
    if (ok) { setEditingId(null); fetchBookmarks(); }
  };

  const handleDelete = async (id: number) => {
    const { ok } = await apiFetch("DELETE", `/api/bookmarks/${id}`);
    if (ok) fetchBookmarks();
  };

  const toggleFavorite = async (b: Bookmark) => {
    const { ok } = await apiFetch("PATCH", `/api/bookmarks/${b.id}/favorite`);
    if (ok) fetchBookmarks();
  };

  const handleCustomRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    let body: object | undefined;
    if (customBody.trim()) {
      try { body = JSON.parse(customBody); } catch {
        addLog({ method: customMethod, url: customPath, requestBody: customBody, status: 0, responseBody: "JSON parse error", ok: false });
        return;
      }
    }
    await apiFetch(customMethod, customPath, body);
  };

  const handleSeed = async () => {
    const { ok } = await apiFetch("POST", "/api/seed");
    if (ok) fetchBookmarks();
  };

  const runErrorTests = async () => {
    await apiFetch("POST", "/api/bookmarks", { title: "url 누락" });
    await apiFetch("POST", "/api/bookmarks", { url: "https://test.com" });
    await apiFetch("PUT", "/api/bookmarks/99999", { title: "없는 ID" });
    await apiFetch("PUT", "/api/bookmarks/abc", { title: "잘못된 ID" });
    await apiFetch("DELETE", "/api/bookmarks/99999");
    await apiFetch("DELETE", "/api/bookmarks/abc");
  };

  const methodColor = (m: string) => {
    const map: Record<string, string> = { GET: "bg-blue-100 text-blue-700", POST: "bg-green-100 text-green-700", PUT: "bg-yellow-100 text-yellow-700", DELETE: "bg-red-100 text-red-700" };
    return map[m] ?? "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">API Tester</h1>
            <a href="/" className="text-sm text-blue-600 hover:underline">Back to App</a>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSeed} className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200">Seed DB</button>
            <button onClick={() => apiFetch("GET", "/api/health")} className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">Health</button>
            <button onClick={() => fetchBookmarks()} className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Reload</button>
            <button onClick={runErrorTests} className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">Error Tests</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: CRUD */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create */}
          <section className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">POST /api/bookmarks</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
              <input required placeholder="URL *" value={createForm.url} onChange={(e) => setCreateForm((f) => ({ ...f, url: e.target.value }))} className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input required placeholder="Title *" value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))} className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <div className="flex gap-2">
                <input placeholder='Tags (e.g. ["dev"])' value={createForm.tags} onChange={(e) => setCreateForm((f) => ({ ...f, tags: e.target.value }))} className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">Create</button>
              </div>
            </form>
          </section>

          {/* List */}
          <section className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b space-y-2">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                GET /api/bookmarks <span className="ml-2 text-gray-400">({bookmarks.length})</span>
              </h2>
              <div className="flex gap-2">
                <input
                  placeholder="Filter by tags (comma-separated)"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={() => fetchBookmarks(tagFilter.trim() || undefined)}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Filter
                </button>
                {tagFilter && (
                  <button
                    onClick={() => { setTagFilter(""); fetchBookmarks(); }}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {bookmarks.length === 0 ? (
              <p className="p-4 text-gray-400 text-sm text-center">No bookmarks. Try "Seed DB" or create one above.</p>
            ) : (
              <ul className="divide-y">
                {bookmarks.map((b) =>
                  editingId === b.id ? (
                    <li key={b.id} className="p-4 bg-yellow-50">
                      <form onSubmit={handleUpdate} className="space-y-2">
                        <div className="flex gap-2">
                          <input value={editForm.url} onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))} className="flex-1 border rounded px-2 py-1 text-sm" placeholder="URL" />
                          <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Title" />
                        </div>
                        <div className="flex gap-2">
                          <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Description" />
                          <input value={editForm.tags} onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))} className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Tags" />
                          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={editForm.favorite} onChange={(e) => setEditForm((f) => ({ ...f, favorite: e.target.checked }))} />Fav</label>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                          <button type="submit" className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">Save</button>
                        </div>
                      </form>
                    </li>
                  ) : (
                    <li key={b.id} className="p-4 flex items-start justify-between group hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleFavorite(b)} className="text-lg">{b.favorite ? "★" : "☆"}</button>
                          <span className="font-medium text-gray-900 truncate">{b.title}</span>
                          <span className="text-xs text-gray-400">#{b.id}</span>
                        </div>
                        <p className="text-sm text-blue-600 truncate mt-0.5">{b.url}</p>
                        {b.description && <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>}
                        <div className="flex gap-1 mt-1">
                          {JSON.parse(b.tags).map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button onClick={() => startEdit(b)} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">Edit</button>
                        <button onClick={() => handleDelete(b.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>
        </div>

        {/* Right: Custom + Log */}
        <div className="space-y-6">
          <section className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Custom Request</h2>
            <form onSubmit={handleCustomRequest} className="space-y-2">
              <div className="flex gap-2">
                <select value={customMethod} onChange={(e) => setCustomMethod(e.target.value)} className="border rounded px-2 py-1.5 text-sm font-mono bg-white">
                  <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                </select>
                <input value={customPath} onChange={(e) => setCustomPath(e.target.value)} className="flex-1 border rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <textarea value={customBody} onChange={(e) => setCustomBody(e.target.value)} placeholder='Body (JSON)' rows={3} className="w-full border rounded px-2 py-1.5 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <button type="submit" className="w-full py-1.5 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-900">Send</button>
            </form>
          </section>

          <section className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">API Log</h2>
              {logs.length > 0 && <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>}
            </div>
            <div className="max-h-[calc(100vh-380px)] overflow-y-auto divide-y">
              {logs.length === 0 ? (
                <p className="p-4 text-gray-400 text-sm text-center">Logs will appear here.</p>
              ) : logs.map((log) => (
                <details key={log.id}>
                  <summary className="px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2 text-sm">
                    <span className={`font-mono font-bold text-xs ${log.ok ? "text-green-600" : "text-red-600"}`}>{log.status}</span>
                    <span className={`font-mono text-xs px-1 rounded ${methodColor(log.method)}`}>{log.method}</span>
                    <span className="font-mono text-xs text-gray-600 truncate flex-1">{log.url}</span>
                    <span className="text-xs text-gray-400">{log.timestamp}</span>
                  </summary>
                  <div className="px-3 pb-3 space-y-1">
                    {log.requestBody && <div><p className="text-xs text-gray-400 mb-0.5">Request:</p><pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">{log.requestBody}</pre></div>}
                    <div><p className="text-xs text-gray-400 mb-0.5">Response:</p><pre className={`text-xs p-2 rounded overflow-x-auto ${log.ok ? "bg-green-50" : "bg-red-50"}`}>{log.responseBody}</pre></div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
