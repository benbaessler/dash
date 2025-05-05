import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { Heart, Loader } from "lucide-react";
import Image from "next/image";

interface CommentSectionProps {
  children: React.ReactNode;
  postId: string;
}

export const CommentSection = ({ children, postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchComments = async (cursor?: string) => {
    setLoading(true);

    try {
      const url = new URL(`/api/comments/${postId}`, window.location.origin);
      if (cursor) {
        url.searchParams.append("cursor", cursor);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      console.log("API Response:", data);

      const commentData = data.comments || [];
      console.log("Comment data:", commentData);

      if (cursor) {
        setComments((prev) => [...prev, ...commentData]);
      } else {
        setComments(commentData);
      }

      setNextCursor(data.cursor || null);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      console.log({});
    }
  }, [isOpen, postId]);

  const loadMoreComments = () => {
    if (nextCursor && !loading) {
      fetchComments(nextCursor);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-[70vh]">
        <DrawerHeader>
          <DrawerTitle>Comments</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto h-full">
          {loading && comments.length === 0 ? (
            <div className="flex justify-center py-4">
              <Loader className="size-4 animate-spin" />
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4 pb-4">
              {comments.map((comment) => (
                <div key={comment.hash} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8">
                    <Image
                      src={comment.author.pfp_url}
                      alt={comment.author.display_name}
                      className="w-full h-full rounded-full object-cover"
                      width={28}
                      height={28}
                    />
                  </div>
                  <div className="flex-grow text-xs">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      {comment.author.display_name}
                    </div>
                    <p className="mb-1 text-sm">{comment.text}</p>
                    <div className="flex items-center justify-between text-slate-500 w-full mt-1">
                      <span className="text-xs">
                        {formatTimeAgo(
                          Math.floor(
                            new Date(comment.timestamp).getTime() / 1000
                          )
                        )}
                      </span>
                      <div className="flex items-center gap-1 cursor-pointer text-slate-400 hover:text-slate-200">
                        <Heart size={14} />
                        <span className="text-xs">
                          {comment.reactions.likes_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {nextCursor && (
                <div className="py-4 text-center">
                  <button
                    onClick={loadMoreComments}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? "Loading more..." : "Load more comments"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No comments yet.</p>
            </div>
          )}

          {loading && comments.length > 0 && !nextCursor && (
            <div className="py-4 text-center">
              <p>Loading more comments...</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
