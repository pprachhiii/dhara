'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Toaster, toast } from 'react-hot-toast';

export type CommentActionState =
  | { status: 'error'; message: string }
  | { status: 'success'; comment?: Comment };

export interface Comment {
  id: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export function CommentForm({
  reportId,
  currentUserName,
  initialComments = [],
}: {
  reportId: string;
  currentUserName: string;
  initialComments?: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [textareaValue, setTextareaValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const content = formData.get('content')?.toString()?.trim();
    if (!content) return toast.error('Comment content required');

    setLoading(true);

    try {
      const res = await fetch(`/api/reports/${reportId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to post comment');
        setLoading(false);
        return;
      }

      const data = await res.json();
      const newComment: Comment = {
        id: data.id,
        userName: data.user.name ?? currentUserName,
        content: data.content,
        createdAt: new Date(data.createdAt),
      };

      setComments([newComment, ...comments]);
      setTextareaValue('');
      toast.success('Comment added');
    } catch (err) {
      console.error('Comment post error:', err);
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster /> {/* Notifications */}
      {/* Comment Form */}
      <form
        className='flex flex-col gap-2'
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSubmit(formData);
        }}
      >
        <Textarea
          name='content'
          required
          placeholder='Add a comment...'
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.currentTarget.value)}
          className='min-h-[80px]'
          disabled={loading}
        />
        <Button type='submit' className='mt-2' size='sm' disabled={loading}>
          {loading ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
      <Separator className='my-4' />
      {/* Comments List */}
      <div className='space-y-4'>
        {comments.map((c) => (
          <div key={c.id} className='flex gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>
                {c.userName
                  .split(' ')
                  .map((s) => s[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{c.userName}</span>
                <span className='text-xs text-muted-foreground'>
                  {formatDistanceToNow(new Date(c.createdAt))} ago
                </span>
              </div>
              <p className='mt-1 text-sm text-muted-foreground'>{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
