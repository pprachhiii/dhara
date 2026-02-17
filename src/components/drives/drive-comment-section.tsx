'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';

interface Discussion {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
  } | null;
}

interface DriveCommentSectionProps {
  driveId: string;
  discussions: Discussion[];
}

export default function DriveCommentSection({ driveId, discussions }: DriveCommentSectionProps) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePostComment = async () => {
    if (!comment.trim()) return;

    try {
      setPosting(true);

      const res = await fetch(`/api/drives/${driveId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      });

      if (!res.ok) throw new Error('Failed to post comment');

      setComment('');
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className='space-y-4'>
      {/* Post Comment */}
      <Card>
        <CardContent className='pt-6'>
          <Textarea
            placeholder='Ask a question or share your thoughts...'
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className='flex justify-end mt-3'>
            <Button onClick={handlePostComment} disabled={posting || !comment.trim()}>
              <MessageSquare className='h-4 w-4 mr-2' />
              Post Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardContent className='pt-6 space-y-4'>
          {discussions.length === 0 ? (
            <p className='text-sm text-muted-foreground italic'>
              No discussions yet. Be the first to comment.
            </p>
          ) : (
            discussions.map((discussion) => (
              <div key={discussion.id} className='flex gap-3'>
                <Avatar className='h-8 w-8'>
                  <AvatarFallback>
                    {discussion.user?.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('') ?? 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='font-medium text-sm'>
                      {discussion.user?.name ?? 'Unknown'}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {new Date(discussion.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground'>{discussion.content}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
