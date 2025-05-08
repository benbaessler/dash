"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  animationDuration = 500,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  /** Animation duration in ms, default is 500ms */
  animationDuration?: number
}) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    // Pass animation duration to Vaul's root component
    data-animation-duration={animationDuration}
    {...props}
  />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm", className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    /** Animation duration in ms */
    animationDuration?: number
  }
>(({ className, children, animationDuration, ...props }, ref) => {
  const internalRef = React.useRef<HTMLDivElement>(null);
  
  // Apply animation duration from parent or use provided one
  React.useEffect(() => {
    if (!internalRef.current) return;
    
    const drawer = internalRef.current.closest('[data-animation-duration]');
    const duration = animationDuration || 
      (drawer && drawer.getAttribute('data-animation-duration')) || 
      500;
    
    internalRef.current.style.transitionDuration = `${duration}ms`;
  }, [animationDuration]);

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={node => {
          // Update the internal ref ourselves
          // @ts-expect-error - this is fine as we're working with DOM nodes 
          internalRef.current = node;
          
          // Handle the forwarded ref
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] bg-background",
          // Add hardware acceleration and optimize transitions
          "will-change-transform transform-gpu",
          // Use optimized animation curve from iOS for natural feeling
          "transition-transform motion-reduce:transition-none focus:outline-none focus:ring-0",
          className
        )}
        style={{
          // Set default animation curve for smoother transitions
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)"
        }}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-medium pb-4 leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
