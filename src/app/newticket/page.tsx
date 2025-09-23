'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function NewTicketPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    priority: 'medium',
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  // categories and priorities
  const categories = [
    'Bug Report',
    'Feature Request',
    'Technical Issue',
    'Account Problem',
    'Billing Inquiry',
    'General Question',
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  // ✅ Seed mock tickets if none exist
  useEffect(() => {
    const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    if (existingTickets.length === 0) {
      const mockTickets = [
        {
          id: '1',
          title: 'Sample Bug Report',
          url: 'https://example.com/bug',
          description: 'The page crashes on submit',
          category: 'bug-report',
          priority: 'high',
          attachments: [],
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('tickets', JSON.stringify(mockTickets));
    }
  }, []);

  // input change handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachments(Array.from(files));
    }
  };

  // form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate required fields
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('❌ Missing Information. Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // fake API delay

      const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      const newTicket = {
        id: Date.now().toString(),
        ...formData,
        attachments: attachments.map((file) => file.name),
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedTickets = [...existingTickets, newTicket];
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));

      // success toast
      toast.success(`🎉 Ticket "${formData.title}" has been created and is now being processed.`);

      // Reset form
      setFormData({
        title: '',
        url: '',
        description: '',
        category: '',
        priority: 'medium',
      });
      setAttachments([]);

      // Redirect after delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch  {
      toast.error('❌ Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Ticket</h1>
            <p className="text-lg text-gray-600">
              Submit a new support request or feature suggestion
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Ticket Information</CardTitle>
              <CardDescription>
                Fill in the details below. Fields marked with * are required.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Brief summary of the issue or request"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* URL */}
                <div className="space-y-2">
                  <Label htmlFor="url">URL (Optional)</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://example.com/issue-page"
                    value={formData.url}
                    onChange={handleChange}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide details about the issue or request"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                  />
                </div>

                {/* Category + Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select onValueChange={(value) => handleSelectChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category.toLowerCase().replace(/\s+/g, '-')}
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority *</Label>
                    <Select
                      onValueChange={(value) => handleSelectChange('priority', value)}
                      defaultValue="medium"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${priority.value === 'high'
                                    ? 'bg-red-500'
                                    : priority.value === 'medium'
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                              />
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments (Optional)</Label>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-auto max-w-sm"
                  />
                  {attachments.length > 0 && (
                    <ul className="text-sm text-gray-600 space-y-1">
                      {attachments.map((file, idx) => (
                        <li key={idx}>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                  <Button type="submit" disabled={isLoading} className="flex-1 h-11 bg-blue-600">
                    {isLoading ? 'Creating Ticket...' : 'Create Ticket'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    disabled={isLoading}
                    className="flex-1 h-11"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toasts */}
      <Toaster richColors position="top-right" />
    </>
  );
}
