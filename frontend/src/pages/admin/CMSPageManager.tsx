import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit3,
  Eye,
  Trash2,
  AlertCircle,
  FileText,
  Loader2,
  Clock,
  Globe,
  Lock,
  ExternalLink,
  X
} from "lucide-react";
import client from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/useNotificationStore";

interface CMSPage {
  id: number;
  slug: string;
  title: string;
  is_published: boolean;
  is_core: boolean;
  updated_at: string;
}

export default function CMSPageManager() {
  const navigate = useNavigate();
  const token = useAuthStore((state: any) => state.token);
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPage, setNewPage] = useState({ title: "", slug: "" });
  const [creating, setCreating] = useState(false);

  const fetchPages = async () => {
    setError(null);
    try {
      const res = await client.get("/admin/pages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Fetch failure:", err);
      if (err.response?.status === 403) {
        setError("Access denied. You do not have permission to manage CMS pages.");
      } else {
        setError("Unable to load pages. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [token]);

  const { confirm, notify } = useNotificationStore();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await client.post("/admin/pages", newPage, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setNewPage({ title: "", slug: "" });
      notify("Page created successfully.", "success");
      fetchPages();
    } catch (err) {
      notify("Failed to create page.", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: "Delete Page",
      message: "Are you sure you want to permanently delete this page? This cannot be undone.",
      confirmText: "Delete Page",
      cancelText: "Cancel",
      type: "danger"
    });

    if (!confirmed) return;
    try {
      await client.delete(`/admin/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notify("Page deleted successfully.", "success");
      fetchPages();
    } catch (err) {
      notify("Failed to delete page.", "error");
    }
  };

  const handleTogglePublish = async (page: CMSPage) => {
    try {
      await client.patch(`/admin/pages/${page.id}`, {
        is_published: !page.is_published
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      notify(`Page ${!page.is_published ? "published" : "unpublished"} successfully.`, "success");
      fetchPages();
    } catch (err) {
      notify("Failed to update page status.", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-12 min-h-screen">

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-mylms-purple font-semibold text-sm">
            <FileText size={16} />
            <span>CMS & Content</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Page Manager</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all public-facing pages, content, and visibility.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-mylms-purple text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-mylms-purple/90 transition-colors"
        >
          <Plus size={16} />
          New Page
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-700 flex-1">{error}</p>
          <button
            onClick={fetchPages}
            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Page Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">URL Slug</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <Loader2 size={24} className="animate-spin text-mylms-purple mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading pages...</p>
                  </td>
                </tr>
              ) : !error && pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <FileText size={32} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-sm">No pages created yet.</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 text-mylms-purple text-sm font-semibold hover:underline"
                    >
                      Create your first page
                    </button>
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50 transition-colors group">

                    {/* Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-mylms-purple" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{page.title}</span>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2.5 py-1 rounded-md">
                        /{page.slug}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      {page.is_core ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                          <Lock size={12} /> Core Page
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          <Globe size={12} /> Custom
                        </span>
                      )}
                    </td>

                    {/* Status toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(page)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors hover:opacity-80 ${
                          page.is_published
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${page.is_published ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {page.is_published ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <Clock size={13} className="text-gray-400" />
                        {new Date(page.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit */}
                        <Link
                          to={page.is_core ? `/admin/cms/guided/${page.slug}` : `/admin/cms/edit/${page.slug}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:border-mylms-purple hover:text-mylms-purple transition-colors shadow-sm"
                        >
                          <Edit3 size={13} />
                          {page.is_core ? "Guided Editor" : "Visual Builder"}
                        </Link>

                        {/* Preview */}
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
                          title="Preview page"
                        >
                          <ExternalLink size={14} />
                        </a>

                        {/* Delete (non-core only) */}
                        {!page.is_core && (
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                            title="Delete page"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer row count */}
        {!loading && pages.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{pages.length}</span> page{pages.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create New Page</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Page Title</label>
                <input
                  required
                  type="text"
                  value={newPage.title}
                  onChange={e => setNewPage({ ...newPage, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mylms-purple/20 focus:border-mylms-purple transition-all"
                  placeholder="e.g. Undergraduate Programs"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL Slug</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-mylms-purple/20 focus-within:border-mylms-purple transition-all">
                  <span className="px-3 py-2.5 bg-gray-100 text-gray-500 text-sm border-r border-gray-200 font-mono">/</span>
                  <input
                    required
                    type="text"
                    value={newPage.slug}
                    onChange={e => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/ /g, "-") })}
                    className="flex-1 px-4 py-2.5 bg-gray-50 text-sm font-mono focus:outline-none"
                    placeholder="programs"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-mylms-purple text-white text-sm font-semibold rounded-lg hover:bg-mylms-purple/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : null}
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
