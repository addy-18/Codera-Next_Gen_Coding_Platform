import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Snippet } from '../types';

interface UseSnippetsReturn {
  snippets: Snippet[];
  isLoading: boolean;
  createSnippet: (data: Pick<Snippet, 'title' | 'code' | 'language' | 'tags'>) => Promise<void>;
  updateSnippet: (id: string, data: Partial<Pick<Snippet, 'title' | 'code' | 'language' | 'tags'>>) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useSnippets(): UseSnippetsReturn {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await api.get('/api/snippets');
      setSnippets(res.data);
    } catch (err) {
      console.error('[useSnippets] fetch error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createSnippet = useCallback(async (data: Pick<Snippet, 'title' | 'code' | 'language' | 'tags'>) => {
    await api.post('/api/snippets', data);
    await refetch();
  }, [refetch]);

  const updateSnippet = useCallback(async (id: string, data: Partial<Pick<Snippet, 'title' | 'code' | 'language' | 'tags'>>) => {
    await api.put(`/api/snippets/${id}`, data);
    await refetch();
  }, [refetch]);

  const deleteSnippet = useCallback(async (id: string) => {
    await api.delete(`/api/snippets/${id}`);
    await refetch();
  }, [refetch]);

  return { snippets, isLoading, createSnippet, updateSnippet, deleteSnippet, refetch };
}
