import { Loader2 } from "lucide-react";

import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";

export const ApproveSignerButton = () => {
  const { farcasterUser, handleSignIn, loading } = useUser();

  if (farcasterUser?.status === "approved") return;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <Button onClick={handleSignIn} disabled={loading} className="relative">
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            Enable interactions
            <ExclamationCircleIcon
              color="orange"
              className="absolute -top-1 -right-1 h-6 w-6"
            />
          </>
        )}
      </Button>
    </div>
  );
};
