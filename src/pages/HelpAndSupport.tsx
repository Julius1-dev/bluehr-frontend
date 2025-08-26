import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Clock, Mail, Phone, Send, Paperclip, X } from 'lucide-react';
import { TicketApi, getUserFromToken } from '@/services/ticketApi';
import { connectSocket, joinTicketRoom, leaveTicketRoom } from '@/services/socket';
import { PerformanceApi } from '@/services/performanceApi';
import { BACKEND_URL } from '@/lib/config';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
  attachments?: string[];
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  messages: Message[];
}

function safeFormat(dateValue: any, fmt: string) {
  let d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (typeof dateValue === 'number') d = new Date(dateValue);
  if (!d || isNaN(d.getTime())) return '';
  return format(d, fmt);
}

// Add prop for dashboardRole
interface HelpAndSupportProps {
  dashboardRole: 'employee' | 'company-admin' | 'super-admin';
}

const HelpAndSupport = ({ dashboardRole }: HelpAndSupportProps) => {
  // State
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const user = getUserFromToken();
  const role = dashboardRole;
  const companyId = user?.company_id || null;
  const userId = user?.id || 1;
  const socketRef = useRef<any>(null);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [superAdmin, setSuperAdmin] = useState<{ id: string | number, name: string } | null>(null);

  // Ticket creation modal state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    initialMessage: '',
    assignedTo: ''
  });

  // Load tickets from API
  useEffect(() => {
    setIsLoading(true);
    if (dashboardRole === 'employee') {
      TicketApi.employeeListTickets()
        .then((data) => {
          // Deep sanitize all ticket fields
          const sanitizedTickets = data.map((ticket: any) => ({
            ...ticket,
            id: typeof ticket.id === 'string' || typeof ticket.id === 'number' ? ticket.id : '',
            subject: typeof ticket.subject === 'string' ? ticket.subject : '',
            status: typeof ticket.status === 'string' ? ticket.status : '',
            priority: typeof ticket.priority === 'string' ? ticket.priority : '',
            updatedAt: typeof ticket.updatedAt === 'string' ? ticket.updatedAt : '',
            createdAt: typeof ticket.createdAt === 'string' ? ticket.createdAt : '',
            assignedTo: ticket.assignedTo && typeof ticket.assignedTo === 'object' && ticket.assignedTo.id ? ticket.assignedTo : (typeof ticket.assignedTo === 'string' ? { id: ticket.assignedTo, name: ticket.assignedTo } : undefined),
            createdBy: ticket.createdBy && typeof ticket.createdBy === 'object' && ticket.createdBy.id ? ticket.createdBy : (typeof ticket.createdBy === 'string' ? { id: ticket.createdBy, name: ticket.createdBy } : undefined),
          }));
          setTickets(sanitizedTickets);
          if (sanitizedTickets.length > 0) setSelectedTicket(sanitizedTickets[0]);
        })
        .finally(() => setIsLoading(false));
    } else {
    TicketApi.listTickets(role as 'company-admin' | 'super-admin', companyId || undefined)
      .then((data) => {
          // Deep sanitize all ticket fields
          const sanitizedTickets = data.map((ticket: any) => ({
            ...ticket,
            id: typeof ticket.id === 'string' || typeof ticket.id === 'number' ? ticket.id : '',
            subject: typeof ticket.subject === 'string' ? ticket.subject : '',
            status: typeof ticket.status === 'string' ? ticket.status : '',
            priority: typeof ticket.priority === 'string' ? ticket.priority : '',
            updatedAt: typeof ticket.updatedAt === 'string' ? ticket.updatedAt : '',
            createdAt: typeof ticket.createdAt === 'string' ? ticket.createdAt : '',
            assignedTo: ticket.assignedTo && typeof ticket.assignedTo === 'object' && ticket.assignedTo.id ? ticket.assignedTo : (typeof ticket.assignedTo === 'string' ? { id: ticket.assignedTo, name: ticket.assignedTo } : undefined),
            createdBy: ticket.createdBy && typeof ticket.createdBy === 'object' && ticket.createdBy.id ? ticket.createdBy : (typeof ticket.createdBy === 'string' ? { id: ticket.createdBy, name: ticket.createdBy } : undefined),
          }));
          setTickets(sanitizedTickets);
          if (sanitizedTickets.length > 0) setSelectedTicket(sanitizedTickets[0]);
      })
      .finally(() => setIsLoading(false));
    }
  }, [role, companyId, dashboardRole, userId]);

  // Fetch assignees (company users) on mount
  useEffect(() => {
    if (dashboardRole === 'employee') {
      PerformanceApi.employeeGetAllEmployees().then((users: any[]) => {
        // Filter out current user
        const filtered = users.filter(u => u.id !== userId);
        setAssignees(filtered);
      });
    } else if (dashboardRole === 'company-admin') {
      PerformanceApi.getAllEmployees().then((users: any[]) => {
        // Filter out current user
        const filtered = users.filter(u => u.id !== userId);
        setAssignees(filtered);
      });
    }
  }, [dashboardRole, userId]);

  const API_BASE = BACKEND_URL;
  // Fetch super admin ID on mount
  useEffect(() => {
    fetch(`${API_BASE}/super-admin/users/public/super-admin`)
      .then(res => res.json())
      .then(data => setSuperAdmin(data))
      .catch(() => setSuperAdmin(null));
  }, []);

  // Load messages for selected ticket
  useEffect(() => {
    if (!selectedTicket) return;
        setIsLoading(true);
    if (dashboardRole === 'employee') {
      TicketApi.employeeListMessages(selectedTicket.id)
        .then(setMessages)
        .finally(() => setIsLoading(false));
    } else {
    TicketApi.listMessages(role as 'company-admin' | 'super-admin', selectedTicket.id)
      .then(setMessages)
      .finally(() => setIsLoading(false));
    }
    // Join ticket room
    if (!socketRef.current) socketRef.current = connectSocket();
    joinTicketRoom(selectedTicket.id);
    socketRef.current.on('new_message', async (msg: any) => {
      if (msg.ticket_id === selectedTicket.id) {
        // Reload messages from backend after receiving
        if (dashboardRole === 'employee') {
          const updatedMessages = await TicketApi.employeeListMessages(selectedTicket.id);
          setMessages(updatedMessages);
        } else {
        const updatedMessages = await TicketApi.listMessages(role as 'company-admin' | 'super-admin', selectedTicket.id);
        setMessages(updatedMessages);
        }
      }
    });
    socketRef.current.on('ticket_updated', (ticket: any) => {
      if (ticket.id === selectedTicket.id) setSelectedTicket(ticket);
    });
    socketRef.current.on('ticket_closed', (ticket: any) => {
      if (ticket.id === selectedTicket.id) setSelectedTicket(ticket);
    });
    return () => {
      leaveTicketRoom(selectedTicket.id);
      socketRef.current.off('new_message');
      socketRef.current.off('ticket_updated');
      socketRef.current.off('ticket_closed');
    };
  }, [selectedTicket, role, dashboardRole]);

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(ticket.id).toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'my-tickets') {
      // TODO: match current user id
      return matchesSearch && ticket.created_by === 1;
    }
    return matchesSearch && ticket.status === activeTab;
  });

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setIsSubmitting(true);
    if (dashboardRole === 'employee') {
      await TicketApi.employeeCreateMessage(selectedTicket.id, newMessage);
      // Reload messages from backend after sending
      // (You may want to add a TicketApi.employeeListMessages if needed)
    } else {
    await TicketApi.sendMessage(role as 'company-admin' | 'super-admin', {
      ticket_id: selectedTicket.id,
      sender_id: userId,
      sender_role: role,
      message: newMessage
    });
    }
      setNewMessage('');
      setIsSubmitting(false);
  };

  const getStatusBadge = (status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'pending') => {
    switch (status) {
      case 'open':
        return <Badge variant="default">Open</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'closed':
        return <Badge variant="destructive">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-500">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">High</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="border-red-500 text-red-500">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Ticket creation modal logic
  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.initialMessage || !newTicket.assignedTo) return;
    setIsSubmitting(true);
    let ticket;
    if (dashboardRole === 'employee') {
      if (superAdmin && newTicket.assignedTo == superAdmin.id) {
        // Use the new employee endpoint for tickets assigned to super admin
        ticket = await TicketApi.sendToSuperAdminAsEmployee({
          subject: newTicket.subject,
          description: newTicket.description,
          priority: newTicket.priority,
          initialMessage: newTicket.initialMessage,
          company_id: companyId,
        });
      } else {
        ticket = await TicketApi.employeeCreateTicket({
          subject: newTicket.subject,
          description: newTicket.description,
          priority: newTicket.priority,
          assigned_to: newTicket.assignedTo,
          created_by: userId,
          created_by_role: 'employee',
          status: 'open',
          category: 'General',
          created_at: new Date(),
          updated_at: new Date()
        });
        await TicketApi.employeeCreateMessage(ticket.id, newTicket.initialMessage);
      }
    } else if (superAdmin && newTicket.assignedTo == superAdmin.id) {
      // Use the new company admin endpoint for tickets assigned to super admin
      ticket = await TicketApi.sendToSuperAdminAsCompanyAdmin({
        subject: newTicket.subject,
        description: newTicket.description,
        priority: newTicket.priority,
        initialMessage: newTicket.initialMessage,
        company_id: companyId,
      });
      // No need to send initial message separately, it's handled in backend
    } else {
      ticket = await TicketApi.createTicket(role as 'company-admin' | 'super-admin', {
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority,
      category: 'General',
      company_id: companyId,
      created_by: userId,
      created_by_role: role,
        assigned_to: newTicket.assignedTo
    });
    await TicketApi.sendMessage(role as 'company-admin' | 'super-admin', {
      ticket_id: ticket.id,
      sender_id: userId,
      sender_role: role,
      message: newTicket.initialMessage
    });
    }
    setShowNewTicketModal(false);
    setNewTicket({ subject: '', description: '', priority: 'medium', initialMessage: '', assignedTo: '' });
    setTickets([ticket, ...tickets]);
    setSelectedTicket(ticket);
    setIsSubmitting(false);
  };

  // Callback request modal logic
  const handleRequestCallback = async () => {
    setIsSubmitting(true);
    try {
      if (role === 'employee') {
        await TicketApi.sendToSuperAdminAsEmployee({
          subject: 'Callback Request',
          description: 'User has requested a callback.',
          priority: 'urgent',
          company_id: companyId,
          initialMessage: 'User has requested a callback.',
        });
      } else if (role === 'company-admin') {
        await TicketApi.sendToSuperAdminAsCompanyAdmin({
          subject: 'Callback Request',
          description: 'User has requested a callback.',
          priority: 'urgent',
      company_id: companyId,
          initialMessage: 'User has requested a callback.',
    });
      }
    setShowCallbackModal(false);
    } finally {
    setIsSubmitting(false);
    }
  };

  // Export logic
  const handleExport = async () => {
    if (!selectedTicket) return;
    const msgs = await TicketApi.exportMessages(role as 'company-admin' | 'super-admin', selectedTicket.id);
    // Simple CSV export for now
    const csv = msgs.map((m: any) => `${m.sender_role},${m.message.replace(/\n/g, ' ')},${m.created_at}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${selectedTicket.id}_messages.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Close ticket logic
  const handleCloseTicket = async () => {
    setIsSubmitting(true);
    try {
      if (role === 'employee') {
        await TicketApi.employeeCloseTicket(selectedTicket.id);
      } else {
        await TicketApi.closeTicket(role as 'company-admin' | 'super-admin', selectedTicket.id);
      }
      setSelectedTicket({ ...selectedTicket, status: 'closed' });
      setTickets(tickets => tickets.map(ticket => ticket.id === selectedTicket.id ? { ...ticket, status: 'closed' } : ticket));
    } catch (err) {
      // Optionally show error
    }
    setIsSubmitting(false);
  };

  // Map backend message fields to frontend structure
  const mappedMessages = messages.map((msg: any) => ({
    id: msg.id,
    content: msg.message || msg.content,
    sender: msg.sender_role || msg.sender,
    timestamp: msg.created_at ? new Date(msg.created_at) : msg.timestamp,
    attachments: msg.attachments ? JSON.parse(msg.attachments) : undefined
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Help & Support</h2>
          <p className="text-muted-foreground">
            Get help, report issues, or contact our support team
          </p>
        </div>
        {role !== 'super-admin' && (
          <Button className="mt-4 md:mt-0" onClick={() => setShowNewTicketModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left sidebar */}
        <div className="space-y-4 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['company-admin', 'employee'].includes(role) && (
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowCallbackModal(true)}>
                <Phone className="mr-2 h-4 w-4" />
                Request Callback
              </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">support@joinbluecollar.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">0714 399 199</span>
              </div>
              <div className="pt-2 text-sm text-muted-foreground">
                <p>Monday to Saturday: 8am-4pm</p>
                <p>Sunday: closed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tickets..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 sm:mt-0">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
                    <TabsTrigger value="open">Open</TabsTrigger>
                    <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.length > 0 ? (
                      filteredTickets.map((ticket) => (
                        <TableRow 
                          key={ticket.id} 
                          className={`cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-muted/50' : ''}`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <TableCell className="font-medium">{typeof ticket.id === 'string' || typeof ticket.id === 'number' ? ticket.id : ''}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{typeof ticket.subject === 'string' ? ticket.subject : ''}</TableCell>
                          <TableCell>{typeof ticket.status === 'string' ? getStatusBadge(ticket.status) : ''}</TableCell>
                          <TableCell>{typeof ticket.priority === 'string' ? getPriorityBadge(ticket.priority) : ''}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                              {ticket.updatedAt && typeof ticket.updatedAt === 'string' ? safeFormat(ticket.updatedAt, 'MMM d, yyyy') : ''}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No tickets found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {selectedTicket && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{typeof selectedTicket.subject === 'string' ? selectedTicket.subject : ''}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <span>#{typeof selectedTicket.id === 'string' || typeof selectedTicket.id === 'number' ? selectedTicket.id : ''}</span>
                      <span>•</span>
                      <span>Created {selectedTicket.createdAt && typeof selectedTicket.createdAt === 'string' ? safeFormat(selectedTicket.createdAt, 'MMM d, yyyy') : ''}</span>
                      <span>•</span>
                      {selectedTicket.assignedTo && typeof selectedTicket.assignedTo === 'string' ? (
                        <span>Assigned to {selectedTicket.assignedTo}</span>
                      ) : selectedTicket.assignedTo && typeof selectedTicket.assignedTo === 'object' ? (
                        <span>Assigned to {superAdmin && selectedTicket.assignedTo.id == superAdmin.id ? 'Super Admin' : (selectedTicket.assignedTo.name && selectedTicket.assignedTo.name.trim() ? selectedTicket.assignedTo.name : 'Limited User')}</span>
                      ) : null}
                      <span>•</span>
                      {selectedTicket.createdBy && selectedTicket.createdBy.name ? (
                        <span>Created by {selectedTicket.createdBy.name}</span>
                      ) : (
                        <span>Created by Unknown</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {typeof selectedTicket.status === 'string' ? getStatusBadge(selectedTicket.status) : ''}
                    {typeof selectedTicket.priority === 'string' ? getPriorityBadge(selectedTicket.priority) : ''}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedTicket.createdBy && selectedTicket.createdBy.avatar ? selectedTicket.createdBy.avatar : ''} />
                      <AvatarFallback>
                        {selectedTicket.createdBy && selectedTicket.createdBy.name
                          ? selectedTicket.createdBy.name.split(' ').map((n: any) => n[0]).join('')
                          : ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {selectedTicket.createdBy && selectedTicket.createdBy.name ? selectedTicket.createdBy.name : 'Unknown'}
                          <span className="ml-2 text-sm text-muted-foreground">
                            {selectedTicket.createdBy && selectedTicket.createdBy.department ? selectedTicket.createdBy.department : ''}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {safeFormat(selectedTicket.createdAt, 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm">{selectedTicket.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Conversation</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                    {mappedMessages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === role ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.sender === role
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-muted rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {safeFormat(message.timestamp, 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="relative">
                      <Textarea
                        placeholder="Type your message..."
                        className="min-h-[100px] pr-10"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <div className="absolute right-2 bottom-2 flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Paperclip className="h-4 w-4" />
                          <span className="sr-only">Attach file</span>
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isSubmitting}
                        >
                          <Send className="mr-1 h-4 w-4" />
                          Send
                        </Button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Press Enter to send, Shift+Enter for a new line
                    </p>
                  </div>
                </div>

                {['super-admin', 'company-admin', 'employee'].includes(role) && selectedTicket && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCloseTicket}
                      disabled={selectedTicket.status === 'closed' || isSubmitting}
                    >
                      {selectedTicket.status === 'closed' ? 'Ticket Closed' : 'Close Ticket'}
                    </Button>
                    {role === 'super-admin' && (
                    <Button onClick={handleExport}>
                      Export Conversation
                    </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Create New Ticket</h2>
                <p className="text-blue-100 text-sm mt-1">Fill in the details below to create a new support ticket</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-blue-600 hover:text-white" 
                onClick={() => setShowNewTicketModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      placeholder="Enter ticket subject..."
                      value={newTicket.subject}
                      onChange={e => setNewTicket(f => ({ ...f, subject: e.target.value }))}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg resize-none"
                      placeholder="Describe your issue or request..."
                      value={newTicket.description}
                      onChange={e => setNewTicket(f => ({ ...f, description: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  {/* Initial Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Initial Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg resize-none"
                      placeholder="Add your initial message..."
                      value={newTicket.initialMessage}
                      onChange={e => setNewTicket(f => ({ ...f, initialMessage: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-3 py-2 bg-white"
                      value={newTicket.priority}
                      onChange={e => setNewTicket(f => ({ ...f, priority: e.target.value }))}
                    >
                      <option value="">Select priority level</option>
                      <option value="low" className="text-green-600">🟢 Low</option>
                      <option value="medium" className="text-yellow-600">🟡 Medium</option>
                      <option value="high" className="text-orange-600">🟠 High</option>
                      <option value="urgent" className="text-red-600">🔴 Urgent</option>
                    </select>
                  </div>

                  {/* Assign To */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assign To <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      options={assignees.map((user: any) => ({
                        id: user.id,
                        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                        email: user.email,
                        role: user.role,
                        department: user.department?.name
                      }))}
                      value={newTicket.assignedTo}
                      onChange={value => setNewTicket(f => ({ ...f, assignedTo: value.toString() }))}
                      placeholder="Select assignee"
                      className="w-full"
                    />
                  </div>

                  {/* Send to Super Admin - Available for both admin and employee */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-blue-800 mb-2">
                      🚨 Escalate to Super Admin
                    </label>
                    <SearchableSelect
                      options={superAdmin ? [{
                        id: superAdmin.id,
                        name: 'Send to Super Admin',
                        role: 'super-admin'
                      }] : []}
                      value={newTicket.assignedTo === (superAdmin?.id?.toString() || '') ? (superAdmin?.id || '') : ''}
                      onChange={value => setNewTicket(f => ({ ...f, assignedTo: value.toString() }))}
                      placeholder="Send to Super Admin"
                      className="w-full"
                    />
                    <p className="text-xs text-blue-600 mt-2">
                      Use this option for urgent issues that require immediate attention
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                All fields marked with <span className="text-red-500">*</span> are required
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewTicketModal(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  onClick={handleCreateTicket} 
                  disabled={!newTicket.subject || !newTicket.description || !newTicket.initialMessage || !newTicket.assignedTo}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCallbackModal && ['company-admin', 'employee'].includes(role) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Request a Callback</h3>
            <p className="mb-4">A support agent will call you as soon as possible about your urgent matter.</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowCallbackModal(false)}>Cancel</Button>
              <Button onClick={handleRequestCallback}>Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export wrappers for each dashboard
export const EmployeeHelpAndSupport = () => <HelpAndSupport dashboardRole="employee" />;
export const AdminHelpAndSupport = () => <HelpAndSupport dashboardRole="company-admin" />;
export const SuperAdminHelpAndSupport = () => <HelpAndSupport dashboardRole="super-admin" />;
