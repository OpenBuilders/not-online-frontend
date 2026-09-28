import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMediaKitPost,
  deleteMediaKitPhoto,
  deleteMediaKitPost,
  getMediaKit,
  setMediaKitBingo,
  updateMediaKitPost,
  uploadMediaKitPhotos,
  type MediaKitData,
} from '@/api/mediaKit';
import { useAppState } from '@/state/AppStateContext';
import type { SmmPost, SmmPostDraft } from '@/types';

const EMPTY_MEDIA_KIT: MediaKitData = { posts: [], bingoCrossed: [] };

/** Server data is canonical; React Query only holds the current response. */
export function useMediaKit() {
  const { state } = useAppState();
  const queryClient = useQueryClient();
  const queryKey = ['media-kit', state.email] as const;
  const query = useQuery({
    queryKey,
    queryFn: getMediaKit,
    enabled: state.logged,
  });
  const data = query.data ?? EMPTY_MEDIA_KIT;

  const setData = useCallback(
    (update: (current: MediaKitData) => MediaKitData) => {
      queryClient.setQueryData<MediaKitData>(queryKey, (current) => update(current ?? EMPTY_MEDIA_KIT));
    },
    [queryClient, queryKey],
  );

  const createPost = useCallback(async (draft: SmmPostDraft) => {
    const post = await createMediaKitPost(draft);
    setData((current) => ({ ...current, posts: [post, ...current.posts] }));
    return post;
  }, [setData]);

  const updatePost = useCallback(async (post: SmmPost, draft: SmmPostDraft) => {
    const updated = await updateMediaKitPost(post, draft);
    setData((current) => ({
      ...current,
      posts: current.posts.map((item) => (item.id === updated.id ? updated : item)),
    }));
    return updated;
  }, [setData]);

  const removePost = useCallback(async (postId: string) => {
    await deleteMediaKitPost(postId);
    setData((current) => ({ ...current, posts: current.posts.filter((post) => post.id !== postId) }));
  }, [setData]);

  const addPhotos = useCallback(async (postId: string, files: File[]) => {
    const updated = await uploadMediaKitPhotos(postId, files);
    setData((current) => ({
      ...current,
      posts: current.posts.map((post) => (post.id === postId ? updated : post)),
    }));
    return updated;
  }, [setData]);

  const removePhoto = useCallback(async (postId: string, photoId: string) => {
    const updated = await deleteMediaKitPhoto(postId, photoId);
    setData((current) => ({
      ...current,
      posts: current.posts.map((post) => (post.id === postId ? updated : post)),
    }));
    return updated;
  }, [setData]);

  const setBingo = useCallback(async (squareId: string, crossed: boolean) => {
    const result = await setMediaKitBingo(squareId, crossed);
    setData((current) => ({
      ...current,
      bingoCrossed: result.crossed
        ? current.bingoCrossed.includes(result.id) ? current.bingoCrossed : [...current.bingoCrossed, result.id]
        : current.bingoCrossed.filter((id) => id !== result.id),
    }));
  }, [setData]);

  return {
    ...query,
    posts: data.posts,
    bingoCrossed: data.bingoCrossed,
    createPost,
    updatePost,
    removePost,
    addPhotos,
    removePhoto,
    setBingo,
  };
}
