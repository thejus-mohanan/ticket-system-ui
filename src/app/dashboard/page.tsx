'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketDetailModal } from '@/components/ticket-detail-modal';
import { Ticket, TicketStatus } from '@/types/ticket';
import { mockTickets } from '@/lib/mockData';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ticket; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  const filteredTickets = tickets.filter(ticket =>
    Object.values(ticket).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortConfig.direction === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  // Remove unused variables
  // const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  // const paginatedTickets = sortedTickets.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: keyof Ticket) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId ? { ...ticket, status: newStatus, updatedAt: new Date() } : ticket
    ));
    setSelectedTicket(prev => prev?.id === ticketId ? { ...prev, status: newStatus, updatedAt: new Date() } : prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const getTicketsByStatus = (status: TicketStatus) =>
    sortedTickets.filter(ticket => ticket.status === status);

  const StatusTable = ({ status, title }: { status: TicketStatus; title: string }) => {
    const statusTickets = getTicketsByStatus(status);
    const paginatedStatusTickets = statusTickets.slice(startIndex, startIndex + itemsPerPage);
    const statusTotalPages = Math.ceil(statusTickets.length / itemsPerPage);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Badge variant="secondary">{statusTickets.length} tickets</Badge>
          </CardTitle>
          <CardDescription>
            Manage all {status.toLowerCase()} support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {[
                      { key: 'title', label: 'Title', className: 'text-left' },
                      { key: 'customer', label: 'Customer', className: 'text-left' },
                      { key: 'priority', label: 'Priority', className: 'text-center' },
                      { key: 'createdAt', label: 'Created', className: 'text-right' },
                    ].map(({ key, label, className }) => (
                      <th 
                        key={key}
                        className={`h-12 px-4 align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/80 ${className}`}
                        onClick={() => handleSort(key as keyof Ticket)}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {sortConfig?.key === key && (
                            <span className="text-xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedStatusTickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <td className="p-4 align-middle font-medium">
                        <div className="max-w-[200px] truncate" title={ticket.title}>
                          {ticket.title}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div>
                          <div className="font-medium">{ticket.customer}</div>
                          <div className="text-xs text-muted-foreground">{ticket.email}</div>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <Badge variant={
                          ticket.priority === 'high' ? 'destructive' :
                          ticket.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right text-muted-foreground">
                        {ticket.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {statusTickets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-lg font-medium">No tickets found</div>
                <div className="text-sm mt-1">No {status.toLowerCase()} tickets match your search criteria</div>
              </div>
            )}
          </div>

          {statusTickets.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(statusTickets.length, startIndex + 1)} to {Math.min(statusTickets.length, startIndex + itemsPerPage)} of {statusTickets.length} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(statusTotalPages, prev + 1))}
                  disabled={currentPage === statusTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
              <p className="text-sm text-gray-600">Manage customer support tickets efficiently</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/newticket">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  + New Ticket
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search tickets by title, customer, email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 w-full"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{getTicketsByStatus('new').length}</div>
                <div className="text-gray-600">New</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{getTicketsByStatus('ongoing').length}</div>
                <div className="text-gray-600">Ongoing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getTicketsByStatus('closed').length}</div>
                <div className="text-gray-600">Closed</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="new" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new">
              New Tickets ({getTicketsByStatus('new').length})
            </TabsTrigger>
            <TabsTrigger value="ongoing">
              Ongoing Tickets ({getTicketsByStatus('ongoing').length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed Tickets ({getTicketsByStatus('closed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <StatusTable status="new" title="New Tickets" />
          </TabsContent>

          <TabsContent value="ongoing">
            <StatusTable status="ongoing" title="Ongoing Tickets" />
          </TabsContent>

          <TabsContent value="closed">
            <StatusTable status="closed" title="Closed Tickets" />
          </TabsContent>
        </Tabs>
      </main>

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}