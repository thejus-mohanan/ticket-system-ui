'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, TicketStatus } from '@/types/ticket';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (ticketId: string, newStatus: TicketStatus) => void;
}

export function TicketDetailModal({ ticket, isOpen, onClose, onStatusChange }: TicketDetailModalProps) {
  if (!ticket) return null;

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xl">{ticket.title}</span>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status.toUpperCase()}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-sm text-gray-500 mb-1">Customer</h4>
              <p className="font-medium">{ticket.customer}</p>
              <p className="text-sm text-gray-600">{ticket.email}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-gray-500 mb-1">Dates</h4>
              <p className="text-sm">
                <span className="font-medium">Created:</span> {ticket.createdAt.toLocaleDateString()}
              </p>
              <p className="text-sm">
                <span className="font-medium">Updated:</span> {ticket.updatedAt.toLocaleDateString()}
              </p>
            </div>
            
            {ticket.assignedTo && (
              <div>
                <h4 className="font-semibold text-sm text-gray-500 mb-1">Assigned To</h4>
                <p className="font-medium">{ticket.assignedTo}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-sm text-gray-500 mb-1">Ticket ID</h4>
              <p className="font-mono text-sm">#{ticket.id}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm text-gray-500 mb-2">Description</h4>
            <p className="text-gray-700 bg-white p-4 rounded-lg border">{ticket.description}</p>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm text-gray-500 mb-3">Change Status</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={ticket.status === 'new' ? 'default' : 'outline'}
                onClick={() => onStatusChange(ticket.id, 'new')}
              >
                Mark as New
              </Button>
              <Button
                size="sm"
                variant={ticket.status === 'ongoing' ? 'default' : 'outline'}
                onClick={() => onStatusChange(ticket.id, 'ongoing')}
              >
                Mark as Ongoing
              </Button>
              <Button
                size="sm"
                variant={ticket.status === 'closed' ? 'default' : 'outline'}
                onClick={() => onStatusChange(ticket.id, 'closed')}
              >
                Mark as Closed
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}