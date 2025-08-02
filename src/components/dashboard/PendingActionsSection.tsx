import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, Clock } from 'lucide-react';
import { DocumentApi, Document } from '@/services/documentApi';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export function PendingActionsSection() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewDoc, setReviewDoc] = useState<Document | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Get current user ID from JWT token
  function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  const currentUserId = getUserIdFromToken();

  // Helper to get current user's department IDs (mocked as [] for now)
  const userDepartments: number[] = [];

  // Helper to check if user or their department is in shared_with
  function isSharedWith(doc: Document) {
    if (!doc.shared_with) return false;
    let sharedWith = doc.shared_with;
    if (typeof sharedWith === 'string') {
      try { sharedWith = JSON.parse(sharedWith); } catch { return false; }
    }
    if (!Array.isArray(sharedWith)) return false;
    return sharedWith.some(r =>
      (r.type === 'employee' && String(r.id) === String(currentUserId)) ||
      (r.type === 'department' && userDepartments.includes(Number(r.id)))
    );
  }

  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        // Load real documents from API
        const realDocuments = await DocumentApi.getDocuments(true); // Only shared documents
        setDocuments(realDocuments);
      } catch (error) {
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDocuments();
  }, []);

  // Pending review documents for the employee (recipient)
  const pendingReviewDocs = documents.filter(doc =>
    doc.require_review && doc.status === 'pending_review' && isSharedWith(doc) && doc.uploaded_by !== currentUserId
  );

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          Pending Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading pending actions...</p>
            </div>
          ) : pendingReviewDocs.length > 0 ? (
            pendingReviewDocs.map((doc) => (
              <Dialog key={doc.id}>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <div className="text-sm text-gray-500">{doc.category}</div>
                    <div className="text-xs text-gray-400">Shared by {doc.uploaded_by_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Pending Review</Badge>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        Review Document
                      </Button>
                    </DialogTrigger>
                  </div>
                </div>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review Document</DialogTitle>
                    <DialogDescription>
                      <div className="mb-2">
                        <span className="font-medium">{doc.name}</span> ({doc.category})<br />
                        <span className="text-xs text-gray-400">Shared by {doc.uploaded_by_name}</span>
                      </div>
                      <div className="mb-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              const blob = await DocumentApi.downloadDocument(doc.id);
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = doc.name;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch (error) {
                              alert('Failed to download document');
                            }
                          }}
                        >
                          <Download className="h-4 w-4 mr-1 inline" /> Download
                        </Button>
                      </div>
                      {doc.review_message && (
                        <div className="mb-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="font-semibold">Message from sender:</span><br />
                          {doc.review_message}
                        </div>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  {showRejectReason && reviewDoc?.id === doc.id ? (
                    <div className="mb-2">
                      <Textarea
                        placeholder="Enter rejection reason..."
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        rows={3}
                        className="w-full"
                      />
                    </div>
                  ) : null}
                  {reviewError && reviewDoc?.id === doc.id && <div className="text-red-500 text-sm mb-2">{reviewError}</div>}
                  <DialogFooter>
                    {showRejectReason && reviewDoc?.id === doc.id ? (
                      <Button
                        variant="destructive"
                        disabled={reviewLoading || !rejectionReason.trim()}
                        onClick={async () => {
                          setReviewDoc(doc);
                          setReviewLoading(true);
                          setReviewError(null);
                          try {
                            await DocumentApi.reviewDocument(doc.id, 'reject', rejectionReason);
                            setDocuments(docs => docs.filter(d => d.id !== doc.id));
                            setShowRejectReason(false);
                            setRejectionReason('');
                            setReviewDoc(null);
                          } catch (err: any) {
                            setReviewError(err?.response?.data?.error || 'Failed to reject document');
                          } finally {
                            setReviewLoading(false);
                          }
                        }}
                      >
                        Submit Rejection
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          disabled={reviewLoading}
                          onClick={async () => {
                            setReviewDoc(doc);
                            setReviewLoading(true);
                            setReviewError(null);
                            try {
                              await DocumentApi.reviewDocument(doc.id, 'approve');
                              setDocuments(docs => docs.filter(d => d.id !== doc.id));
                              setShowRejectReason(false);
                              setRejectionReason('');
                              setReviewDoc(null);
                            } catch (err: any) {
                              setReviewError(err?.response?.data?.error || 'Failed to approve document');
                            } finally {
                              setReviewLoading(false);
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={reviewLoading}
                          onClick={() => {
                            setReviewDoc(doc);
                            setShowRejectReason(true);
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))
          ) : (
            <div className="text-center py-4">
              <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No pending review documents</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 