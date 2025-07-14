import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, ArrowRight, FileArchive, FilePlus, FileSearch } from 'lucide-react';
import { Badge } from '../ui/badge';
import { DocumentApi, Document } from '@/services/documentApi';

export function DocumentsWidget() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const getDocumentIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'contracts':
        return <FileText className="h-4 w-4" />;
      case 'reviews':
        return <FileSearch className="h-4 w-4" />;
      case 'benefits':
        return <FileArchive className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Pending review documents for the employee (recipient)
  const pendingReviewDocs = documents.filter(doc =>
    doc.require_review && doc.status === 'pending_review' && isSharedWith(doc) && doc.uploaded_by !== currentUserId
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Documents</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600">
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
            </div>
          ) : pendingReviewDocs.length > 0 ? (
            pendingReviewDocs.slice(0, 3).map((doc) => (
            <div 
              key={doc.id}
                className="flex items-center p-3 bg-yellow-50 rounded-lg"
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  {getDocumentIcon(doc.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{doc.name}</div>
                  <div className="text-xs text-gray-500">Added: {formatDate(doc.created_at)}</div>
              </div>
                <Badge variant="warning" className="ml-2 capitalize">
                  Pending Review
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={async () => {
                    // Download/view document
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
                  View
                </Button>
            </div>
            ))
          ) : (
            <div className="text-center py-4">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No pending review documents</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full">
          <FilePlus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </CardFooter>
    </Card>
  );
}