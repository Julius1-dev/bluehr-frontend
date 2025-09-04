import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Megaphone, FileText, Bell, AlertCircle, Calendar } from 'lucide-react'; // Removed unused Clock and X imports
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BACKEND_URL } from '@/lib/config';

// Types
interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'policy' | 'urgent';
  date: string;
  author: string;
  isPinned: boolean;
}

interface Policy {
  id: number;
  title: string;
  content: string;
  category: string;
  version: string;
  last_updated: string;
  document_url?: string;
}

export function Announcements() {
  // State for announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New announcement form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'general' as const,
    isPinned: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch announcements from backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/company-admin/announcements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setAnnouncements(data.announcements);
        } else {
          setError(data.message || 'Failed to fetch announcements');
        }
      } catch (err: any) {
        setError('Failed to fetch announcements');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Handle adding new announcement
  const handleAddAnnouncement = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/company-admin/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAnnouncement)
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements([data.announcement, ...announcements]);
    setNewAnnouncement({ title: '', content: '', type: 'general', isPinned: false });
        setDialogOpen(false);
      } else {
        setError(data.message || 'Failed to create announcement');
      }
    } catch (err: any) {
      setError('Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  // Get badge for announcement type
  const getTypeBadge = (type: 'general' | 'policy' | 'urgent') => {
    switch (type) {
      case 'urgent':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Urgent</Badge>;
      case 'policy':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Policy Update</Badge>;
      default:
        return <Badge variant="outline">General</Badge>;
    }
  };

  // State for policies
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [policiesError, setPoliciesError] = useState<string | null>(null);
  const [isNewPolicyOpen, setIsNewPolicyOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    content: '',
    category: 'HR',
    version: '1.0',
    document: null as File | null,
  });
  const [policySubmitting, setPolicySubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewPolicy, setViewPolicy] = useState<Policy | null>(null);
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);
  const [editPolicyData, setEditPolicyData] = useState<any>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deletePolicy, setDeletePolicy] = useState<Policy | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Fetch policies from backend
  useEffect(() => {
    const fetchPolicies = async () => {
      setPoliciesLoading(true);
      setPoliciesError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/company-admin/policies`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setPolicies(data.policies);
        } else {
          setPoliciesError(data.message || 'Failed to fetch policies');
        }
      } catch (err: any) {
        setPoliciesError('Failed to fetch policies');
      } finally {
        setPoliciesLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  // Handle adding new policy
  const handleAddPolicy = async () => {
    setPolicySubmitting(true);
    setPoliciesError(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newPolicy.title);
      formData.append('content', newPolicy.content);
      formData.append('category', newPolicy.category);
      formData.append('version', newPolicy.version);
      if (newPolicy.document) {
        formData.append('document', newPolicy.document);
      }
      const res = await fetch(`${BACKEND_URL}/company-admin/policies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPolicies([data.policy, ...policies]);
        setNewPolicy({ title: '', content: '', category: 'HR', version: '1.0', document: null });
    setIsNewPolicyOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setPoliciesError(data.message || 'Failed to create policy');
      }
    } catch (err: any) {
      setPoliciesError('Failed to create policy');
    } finally {
      setPolicySubmitting(false);
    }
  };

  // Handle delete
  const handleDeletePolicy = useCallback(async () => {
    if (!deletePolicy) return;
    setDeleteSubmitting(true);
    setPoliciesError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/company-admin/policies/${deletePolicy.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPolicies(policies.filter(p => p.id !== deletePolicy.id));
        setDeletePolicy(null);
      } else {
        setPoliciesError(data.message || 'Failed to delete policy');
      }
    } catch (err: any) {
      setPoliciesError('Failed to delete policy');
    } finally {
      setDeleteSubmitting(false);
    }
  }, [deletePolicy, policies]);

  // Handle edit
  const handleEditPolicy = async () => {
    if (!editPolicy) return;
    setEditSubmitting(true);
    setPoliciesError(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editPolicyData.title);
      formData.append('content', editPolicyData.content);
      formData.append('category', editPolicyData.category);
      formData.append('version', editPolicyData.version);
      if (editPolicyData.document) {
        formData.append('document', editPolicyData.document);
      }
      const res = await fetch(`${BACKEND_URL}/company-admin/policies/${editPolicy.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPolicies(policies.map(p => p.id === editPolicy.id ? data.policy : p));
        setEditPolicy(null);
        setEditPolicyData(null);
      } else {
        setPoliciesError(data.message || 'Failed to update policy');
      }
    } catch (err: any) {
      setPoliciesError('Failed to update policy');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Announcements & Policies</h2>
          <p className="text-gray-500">Manage company-wide communications and policies</p>
        </div>
      </div>

      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" /> Announcements
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Company Policies
          </TabsTrigger>
          {/* <TabsTrigger value="templates" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Templates
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="announcements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Announcements</h3>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input 
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      placeholder="Announcement title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Content</label>
                    <Textarea 
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                      placeholder="Announcement details"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={newAnnouncement.type}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value as any})}
                      >
                        <option value="general">General</option>
                        <option value="policy">Policy Update</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2 pt-5">
                      <input 
                        type="checkbox" 
                        id="pin" 
                        checked={newAnnouncement.isPinned}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, isPinned: e.target.checked})}
                        className="h-4 w-4 rounded"
                      />
                      <label htmlFor="pin" className="text-sm font-medium">Pin to top</label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddAnnouncement} disabled={submitting}>
                      {submitting ? 'Publishing...' : 'Publish'}
                    </Button>
                  </div>
                  {error && <div className="text-red-600 text-sm pt-2">{error}</div>}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading announcements...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
          <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center text-gray-500">No announcements yet.</div>
              ) : (
                announcements
              .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
              })
              .map((announcement) => (
                <Card key={announcement.id} className={announcement.isPinned ? 'border-l-4 border-blue-500' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {announcement.title}
                          {announcement.isPinned && (
                            <Megaphone className="h-4 w-4 text-blue-500" />
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(announcement.date).toLocaleDateString()}
                          </span>
                          <span>By {announcement.author}</span>
                        </div>
                      </div>
                      {getTypeBadge(announcement.type)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{announcement.content}</p>
                  </CardContent>
                </Card>
                  ))
              )}
          </div>
          )}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Company Policies</h3>
            <Dialog open={isNewPolicyOpen} onOpenChange={setIsNewPolicyOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> New Policy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Policy</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Policy Title</label>
                    <Input 
                      value={newPolicy.title}
                      onChange={(e) => setNewPolicy({...newPolicy, title: e.target.value})}
                      placeholder="Policy title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={newPolicy.category}
                        onChange={(e) => setNewPolicy({...newPolicy, category: e.target.value})}
                      >
                        <option value="HR">HR</option>
                        <option value="IT">IT</option>
                        <option value="Workplace">Workplace</option>
                        <option value="Finance">Finance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Version</label>
                      <Input 
                        type="text"
                        value={newPolicy.version}
                        onChange={(e) => setNewPolicy({...newPolicy, version: e.target.value})}
                        placeholder="e.g., 1.0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Policy Content</label>
                    <textarea
                      className="w-full p-2 border rounded-md min-h-[120px]"
                      value={newPolicy.content}
                      onChange={(e) => setNewPolicy({...newPolicy, content: e.target.value})}
                      placeholder="Detailed policy content..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Document (PDF, DOCX, etc)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx"
                      ref={fileInputRef}
                      onChange={e => setNewPolicy({ ...newPolicy, document: e.target.files ? e.target.files[0] : null })}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setIsNewPolicyOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddPolicy} disabled={policySubmitting}>
                      {policySubmitting ? 'Saving...' : 'Save Policy'}
                    </Button>
                  </div>
                  {policiesError && <div className="text-red-600 text-sm pt-2">{policiesError}</div>}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {policiesLoading ? (
            <div className="text-center py-8 text-gray-500">Loading policies...</div>
          ) : policiesError ? (
            <div className="text-center py-8 text-red-600">{policiesError}</div>
          ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {policies.length === 0 ? (
                <div className="text-center text-gray-500 col-span-full">No policies yet.</div>
              ) : (
                policies.map((policy) => (
              <Card key={policy.id} className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{policy.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded">
                          {policy.category}
                        </span>
                        <span>v{policy.version}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                          {policy.last_updated ? new Date(policy.last_updated).toLocaleDateString() : ''}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {policy.content}
                  </p>
                </CardContent>
                    <div className="px-6 pb-4 flex flex-col gap-2">
                      {policy.document_url && (
                        <a
                          href={`${BACKEND_URL}${policy.document_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm mb-2"
                        >
                          Download Document
                        </a>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewPolicy(policy)}>
                    View Full Policy
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                          setEditPolicy(policy);
                          setEditPolicyData({ ...policy, document: null });
                        }}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1" onClick={() => setDeletePolicy(policy)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* View Full Policy Dialog */}
          <Dialog open={!!viewPolicy} onOpenChange={open => !open && setViewPolicy(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{viewPolicy?.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <div className="text-xs text-gray-500">
                  Category: {viewPolicy?.category} | Version: {viewPolicy?.version} | Last Updated: {viewPolicy?.last_updated ? new Date(viewPolicy.last_updated).toLocaleDateString() : ''}
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {viewPolicy?.content}
                </div>
                {viewPolicy?.document_url && (
                  <a
                    href={`${BACKEND_URL}${viewPolicy.document_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Download Document
                  </a>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Policy Dialog */}
          <Dialog open={!!editPolicy} onOpenChange={open => !open && setEditPolicy(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Policy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Policy Title</label>
                  <Input
                    value={editPolicyData?.title || ''}
                    onChange={e => setEditPolicyData({ ...editPolicyData, title: e.target.value })}
                    placeholder="Policy title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={editPolicyData?.category || 'HR'}
                      onChange={e => setEditPolicyData({ ...editPolicyData, category: e.target.value })}
                    >
                      <option value="HR">HR</option>
                      <option value="IT">IT</option>
                      <option value="Workplace">Workplace</option>
                      <option value="Finance">Finance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Version</label>
                    <Input
                      type="text"
                      value={editPolicyData?.version || ''}
                      onChange={e => setEditPolicyData({ ...editPolicyData, version: e.target.value })}
                      placeholder="e.g., 1.0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Policy Content</label>
                  <textarea
                    className="w-full p-2 border rounded-md min-h-[120px]"
                    value={editPolicyData?.content || ''}
                    onChange={e => setEditPolicyData({ ...editPolicyData, content: e.target.value })}
                    placeholder="Detailed policy content..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Replace Document (optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx"
                    onChange={e => setEditPolicyData({ ...editPolicyData, document: e.target.files ? e.target.files[0] : null })}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={() => setEditPolicy(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditPolicy} disabled={editSubmitting}>
                    {editSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
                {policiesError && <div className="text-red-600 text-sm pt-2">{policiesError}</div>}
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Policy Confirmation Dialog */}
          <Dialog open={!!deletePolicy} onOpenChange={open => !open && setDeletePolicy(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Policy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-red-600 font-semibold">This action is permanent. Are you sure you want to delete this policy?</div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={() => setDeletePolicy(null)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeletePolicy} disabled={deleteSubmitting}>
                    {deleteSubmitting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
                {policiesError && <div className="text-red-600 text-sm pt-2">{policiesError}</div>}
          </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Template management coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
