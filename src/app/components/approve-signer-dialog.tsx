import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo } from "react";
import { useSigner } from "@/providers/SignerProvider";
import { ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import sdk from "@farcaster/frame-sdk";
import { Loader2 } from "lucide-react";
import { useFrame } from "@/providers/FrameProvider";
import { appUrl } from "@/constants";
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
  const { mobile } = useFrame();
  const { valid, signer, startPolling, stopPolling } = useSigner();

  const mobileUrl = useMemo(() => {
    if (signer && signer?.signer_approval_url) {
      return signer.signer_approval_url.replace(
        "https://client.warpcast.com/deeplinks/",
        "farcaster://"
      );
    }
    return "";
  }, [signer]);

  useEffect(() => {
    if (open) {
      if (mobile && signer && signer?.signer_approval_url) {
        sdk.actions.openUrl(mobileUrl);
      }
      startPolling();
    } else {
      stopPolling();
      setLoading(false);
    }
  }, [open, signer]);

  useEffect(() => {
    if (valid) {
      onOpenChange(false);
    }
  }, [valid]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan to connect</DialogTitle>
          <DialogDescription>
            Registering a signer key enables you to interact with videos on
            Dash.
          </DialogDescription>
          <div className="flex flex-col items-center justify-center gap-4 pt-4">
            <div className="flex p-3 bg-white rounded items-center justify-center mb-2">
              <QRCodeSVG value={signer?.signer_approval_url || ""} size={230} />
            </div>
            <Button
              variant="action"
              className="w-64"
              onClick={() => sdk.actions.openUrl(mobileUrl)}
            >
              Already on mobile?
              <ArrowRightCircleIcon
                className="w-4 h-4"
                width={50}
                height={50}
              />
            </Button>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-sm">Awaiting approval...</p>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
