import { useSigner } from "@/hooks/useSigner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import sdk from "@farcaster/frame-sdk";

interface SignerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const ApproveSignerDialog = ({
  open,
  onOpenChange,
  setLoading,
}: SignerModalProps) => {
  const { signer, startPolling, stopPolling } = useSigner();

  useEffect(() => {
    if (open) {
      startPolling();
    } else {
      stopPolling();
      setLoading(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan to connect</DialogTitle>
          <DialogDescription>
            Registering a signer key allows you to like and recast videos on
            Dash.
          </DialogDescription>
          <div className="flex items-center justify-center py-4">
            <div className="flex p-3 bg-white rounded items-center justify-center">
              <QRCodeSVG value={signer?.signer_approval_url || ""} size={200} />
            </div>
          </div>
          {/* <Button onClick={() => sdk.actions.openUrl(signer?.signer_approval_url || "")}>
            Already on mobile?
            <ArrowRightCircleIcon className="w-4 h-4" width={50} height={50} />
          </Button> */}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
