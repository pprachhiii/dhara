'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import {
  Authority,
  ReportAuthority,
  Report,
  AuthorityCategory,
  AuthorityRole,
} from '@prisma/client';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AuthorityDetail = Authority & {
  reportAuthorities?: (ReportAuthority & { report?: Report })[];
};

export default function AuthoritiesPage() {
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<AuthorityDetail | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AuthorityCategory | 'ALL'>('ALL');
  const [role, setRole] = useState<AuthorityRole | 'ALL'>('ALL');
  const router = useRouter();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };
  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setIsDeleting(true);

      const res = await fetch(`/api/authority/${deleteTargetId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error();

      toast.success('Authority deleted successfully');
      setDeleteTargetId(null);
      fetchAuthorities();
    } catch {
      toast.error('Failed to delete authority');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatEnumLabel = (value: string) =>
    value
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const fetchAuthorities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category !== 'ALL') params.append('category', category);
    if (role !== 'ALL') params.append('role', role);

    try {
      const res = await fetch(`/api/authority?${params.toString()}`, {
        cache: 'no-store',
      });
      const data: Authority[] = await res.json();
      setAuthorities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch authorities');
    } finally {
      setLoading(false);
    }
  }, [search, category, role]);

  useEffect(() => {
    fetchAuthorities();
  }, [fetchAuthorities]);

  const openAuthority = async (id: string) => {
    try {
      const res = await fetch(`/api/authority/${id}`);
      if (!res.ok) throw new Error('Authority not found');
      const data: AuthorityDetail = await res.json();
      setSelectedAuthority(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load authority details');
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 space-y-8'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-bold text-foreground'>Manage Authorities</h1>
          <p className='text-muted-foreground'>
            Track and organize authorities by categories and roles, with quick access to details.
          </p>
        </div>
        <Button
          className='bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-md'
          asChild
        >
          <Link href='/authority/new'>
            <Plus className='h-4 w-4 mr-2' />
            Add Authority
          </Link>
        </Button>
      </div>

      {/* Filters Box */}
      <div className='flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by name, city, or region...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-10 focus:ring-yellow-400 focus:border-yellow-400'
          />
        </div>

        <Select
          value={category}
          onValueChange={(val) => setCategory(val as AuthorityCategory | 'ALL')}
        >
          <SelectTrigger className='w-full md:w-48 focus:ring-yellow-400 focus:border-yellow-400'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent className='bg-white border border-gray-200'>
            <SelectItem value='ALL' className='hover:bg-yellow-400 focus:bg-yellow-400'>
              All Categories
            </SelectItem>
            <SelectItem
              value={AuthorityCategory.GOVERNMENT}
              className='hover:bg-yellow-400 focus:bg-yellow-400'
            >
              Government
            </SelectItem>
            <SelectItem
              value={AuthorityCategory.NGO}
              className='hover:bg-yellow-400 focus:bg-yellow-400'
            >
              NGO
            </SelectItem>
            <SelectItem
              value={AuthorityCategory.COMMUNITY}
              className='hover:bg-yellow-400 focus:bg-yellow-400'
            >
              Community
            </SelectItem>
            <SelectItem
              value={AuthorityCategory.OTHER}
              className='hover:bg-yellow-400 focus:bg-yellow-400'
            >
              Other
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={role} onValueChange={(val) => setRole(val as AuthorityRole | 'ALL')}>
          <SelectTrigger className='w-full md:w-48 focus:ring-yellow-400 focus:border-yellow-400'>
            <SelectValue placeholder='Role' />
          </SelectTrigger>
          <SelectContent className='bg-white border border-gray-200'>
            <SelectItem value='ALL' className='hover:bg-yellow-400 focus:bg-yellow-400'>
              All Roles
            </SelectItem>
            <SelectItem
              value={AuthorityRole.CLEANUP}
              className='hover:bg-yellow-400 focus:bg-yellow-400'
            >
              Cleanup
            </SelectItem>
            <SelectItem
              value={AuthorityRole.WASTE_MANAGEMENT}
              className='hover:bg-yellow-400 focus:bg-yellow-400'
            >
              Waste Management
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Authority Table */}
      {authorities.length > 0 ? (
        <div className='overflow-x-auto rounded-xl border bg-white shadow-sm'>
          <table className='min-w-full'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='text-left px-4 py-2'>Name</th>
                <th className='text-left px-4 py-2'>Category</th>
                <th className='text-left px-4 py-2'>Role</th>
                <th className='text-left px-4 py-2'>City</th>
                <th className='text-left px-4 py-2'>Region</th>
                <th className='text-left px-4 py-2'>Email</th>
                <th className='text-left px-4 py-2'>Phone</th>
                <th className='text-left px-4 py-2'>Website</th>
                <th className='text-left px-4 py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {authorities.map((auth) => (
                <tr
                  key={auth.id}
                  className='cursor-pointer hover:bg-gray-50'
                  onClick={() => openAuthority(auth.id)}
                >
                  <td className='px-4 py-2 font-medium'>{auth.name}</td>
                  <td className='px-4 py-2'>{formatEnumLabel(auth.category)}</td>
                  <td className='px-4 py-2'>{formatEnumLabel(auth.role)}</td>
                  <td className='px-4 py-2'>{auth.city}</td>
                  <td className='px-4 py-2'>{auth.region ?? '-'}</td>
                  <td className='px-4 py-2'>{auth.email ?? '-'}</td>
                  <td className='px-4 py-2'>{auth.phone ?? '-'}</td>
                  <td className='px-4 py-2'>
                    {auth.website ? (
                      <a
                        href={auth.website}
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-800 underline'
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className='px-4 py-2 flex gap-2' onClick={(e) => e.stopPropagation()}>
                    {/* EDIT */}
                    <Button
                      size='sm'
                      variant='white'
                      onClick={() => router.push(`/authority/new?id=${auth.id}`)}
                    >
                      Edit
                    </Button>

                    {/* DELETE */}
                    <Button
                      size='sm'
                      className='bg-red-500 hover:bg-red-600'
                      onClick={() => handleDelete(auth.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <div className='text-center py-12'>
          <div className='max-w-md mx-auto'>
            <div className='w-16 h-16 mx-auto mb-4 bg-emerald-800 rounded-full flex items-center justify-center shadow-md'>
              <Search className='h-8 w-8 text-white' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>No authorities found</h3>
            <p className='text-muted-foreground mb-6'>
              {search || category !== 'ALL' || role !== 'ALL'
                ? 'Try adjusting your filters.'
                : 'Be the first to create an authority!'}
            </p>
            <Button
              className='bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 rounded-xl'
              asChild
            >
              <Link href='/authority/new'>
                <Plus className='h-4 w-4 mr-2' />
                Add Authority
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <p>Loading authorities...</p>
      )}

      {/* Authority Detail Modal */}
      {selectedAuthority && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl overflow-y-auto max-h-[90vh]'>
            <button
              className='absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg'
              onClick={() => setSelectedAuthority(null)}
            >
              ✕
            </button>
            <h2 className='text-2xl font-bold mb-2'>{selectedAuthority.name}</h2>
            <p className='text-sm text-gray-500 mb-4'>
              {selectedAuthority.category} - {selectedAuthority.role}
            </p>
            <p className='mb-1'>
              <strong>City:</strong> {selectedAuthority.city}
            </p>
            <p className='mb-1'>
              <strong>Region:</strong> {selectedAuthority.region ?? '-'}
            </p>
            <p className='mb-1'>
              <strong>Email:</strong> {selectedAuthority.email ?? '-'}
            </p>
            <p className='mb-1'>
              <strong>Phone:</strong> {selectedAuthority.phone ?? '-'}
            </p>
            <p className='mb-4'>
              <strong>Website:</strong>{' '}
              {selectedAuthority.website ? (
                <a
                  href={selectedAuthority.website}
                  target='_blank'
                  rel='noreferrer'
                  className='text-emerald-800 underline'
                >
                  Visit
                </a>
              ) : (
                '-'
              )}
            </p>

            {selectedAuthority.reportAuthorities?.length && (
              <div className='mt-4'>
                <h3 className='font-semibold mb-2'>Related Reports</h3>
                <ul className='list-disc list-inside text-sm'>
                  {selectedAuthority.reportAuthorities
                    .filter((ra): ra is ReportAuthority & { report: Report } => !!ra.report)
                    .map((ra) => (
                      <li key={ra.id}>
                        {ra.report.title} - Status: {ra.report.status}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteTargetId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl w-full max-w-md p-6 shadow-xl'>
            <h2 className='text-xl font-bold text-red-600 mb-2'>Delete Authority</h2>

            <p className='text-gray-600 mb-6'>
              Are you sure you want to permanently delete this authority?
              <br />
              <span className='font-semibold text-red-500'>This action cannot be undone.</span>
            </p>

            <div className='flex justify-end gap-3'>
              {/* Cancel */}
              <Button variant='white' onClick={() => setDeleteTargetId(null)} disabled={isDeleting}>
                Cancel
              </Button>

              {/* Delete Permanently */}
              <Button
                className='bg-red-600 hover:bg-red-700 text-white'
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
