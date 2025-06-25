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
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import sdk from "@farcaster/frame-sdk";
import { Loader } from "lucide-react";
import { useFrame } from "@/providers/FrameProvider";
import { isMobile } from "@/utils/isMobile";

interface SignerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ConnectSignerDialog = ({
  open,
  onOpenChange,
}: SignerModalProps) => {
  const { loading, setLoading } = useFrame();
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
    const handleOpen = async () => {
      const mobile = await isMobile();
      if (mobile && signer && signer?.signer_approval_url) {
        sdk.actions.openUrl(mobileUrl);
      }
      startPolling();
    };

    if (open) {
      handleOpen();
    } else {
      stopPolling();
      setLoading(false);
    }
  }, [open, signer, startPolling, stopPolling, setLoading, mobileUrl]);

  useEffect(() => {
    if (valid) {
      onOpenChange(false);
    }
  }, [valid, onOpenChange]);

  return (
    <>
      <div className="z-100">
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
                  <QRCodeSVG
                    value={signer?.signer_approval_url || ""}
                    size={230}
                  />
                </div>
                <Button
                  variant="action"
                  className="w-64"
                  onClick={() => sdk.actions.openUrl(mobileUrl)}
                >
                  Already on mobile?
                  <ArrowRightIcon weight="bold" size={20} />
                </Button>
                <div className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <p className="text-sm">Awaiting approval...</p>
                </div>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-90">
          <Loader className="animate-spin" />
        </div>
      )}
    </>
  );
};
