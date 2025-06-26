import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FarcasterIcon } from "@/assets/icons";
import { appUrl } from "@/constants";
import sdk from "@farcaster/frame-sdk";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useFrame } from "@/providers/FrameProvider";
import { useAnalytics } from "@/hooks/useAnalytics";

type PromotionType = "add-frame" | "share-app" | "join-channel";

type PromotionProps = {
  type: PromotionType;
};

type PromotionConfig = {
  title: string;
  description: string[];
  buttonText: string;
  buttonAction: () => Promise<void>;
  shouldAutoTrigger?: boolean;
};

/**
 * Common layout component for all promotion types
 */
function PromotionLayout({
  title,
  description,
  buttonText,
  buttonAction,
  shouldAutoTrigger = false,
}: PromotionConfig) {
  const [ref, inView] = useInView({
    threshold: 1,
  });

  useEffect(() => {
    if (inView && shouldAutoTrigger) {
      sdk.actions.addFrame();
    }
  }, [inView, shouldAutoTrigger]);

  return (
    <div
      ref={ref}
      className="h-screen w-screen snap-start snap-always bg-black text-white flex flex-col items-center justify-center px-12 text-center gap-12"
    >
      <PromotionHeader title={title} />
      <PromotionContent description={description} />
      <PromotionButton text={buttonText} onClick={buttonAction} />
    </div>
  );
}

/**
 * Header component with logo and title
 */
function PromotionHeader({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Image src="/icon.png" alt="Dash Logo" width={90} height={90} />
      <h1 className="text-3xl font-semibold">{title}</h1>
    </div>
  );
}

/**
 * Content component for description text
 */
function PromotionContent({ description }: { description: string[] }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 font-regular">
      {description.map((text, index) => (
        <p
          key={index}
          className={index === 0 ? "text-lg" : "text-gray-400 text-md"}
        >
          {text}
        </p>
      ))}
    </div>
  );
}

/**
 * Reusable button component for promotions
 */
function PromotionButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => Promise<void>;
}) {
  return (
    <Button
      variant="action"
      className="w-full text-md [&_svg]:!size-5 gap-2"
      onClick={onClick}
    >
      <FarcasterIcon />
      {text}
    </Button>
  );
}

/**
 * Hook to get promotion configuration based on type
 */
function usePromotionConfig(type: PromotionType): PromotionConfig {
  const { context } = useFrame();
  const { trackEvent } = useAnalytics();
  const added = useMemo(() => context?.client.added, [context]);

  return useMemo(() => {
    const configs: Record<PromotionType, PromotionConfig> = {
      "add-frame": {
        title: "Enjoying Dash?",
        description: added
          ? ["Consider sharing the mini app with your friends!"]
          : [
              "Add the mini app to Farcaster so you don't miss out on updates! 👀",
              "Don't worry, notifications will be kept to a minimum.",
            ],
        buttonText: added ? "Share to support" : "Share to support",
        shouldAutoTrigger: !added,
        buttonAction: async () => {
          const result = await sdk.actions.composeCast({
            text: "Scroll your feed TikTok-style on /dash! ⚡️",
            embeds: [`${appUrl}?utm_source=share_app`],
          });

          if (result?.cast) {
            trackEvent("shared_app", {
              user: context?.user.username,
              castHash: result.cast.hash,
            });
          }
        },
      },

      "share-app": {
        title: "Enjoying Dash?",
        description: ["Consider sharing the mini app with your friends!"],
        buttonText: "Share to support",
        buttonAction: async () => {
          const result = await sdk.actions.composeCast({
            text: "Scroll your feed TikTok-style on /dash! ⚡️",
            embeds: [`${appUrl}?utm_source=share_app`],
          });

          if (result?.cast) {
            trackEvent("shared_app", {
              user: context?.user.username,
              castHash: result.cast.hash,
            });
          }
        },
      },

      "join-channel": {
        title: "What's missing on Dash?",
        description: [
          "Join the /dash channel, share your ideas, and shape what comes next.",
        ],
        buttonText: "Join channel",
        buttonAction: async () => {
          await sdk.actions.openUrl("https://farcaster.xyz/~/channel/dash");
          trackEvent("opened_channel", {
            user: context?.user.username,
          });
        },
      },
    };

    return configs[type];
  }, [type, added, context, trackEvent]);
}

/**
 * Main promotion component that renders the appropriate promotion based on type
 */
export function Promotion({ type }: PromotionProps) {
  const config = usePromotionConfig(type);
  return <PromotionLayout {...config} />;
}
