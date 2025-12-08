"use client";

/**
 * Phase 9.2: Onboarding Wizard Component
 * Guides new users through the app's main features
 */

import React from "react";
import { X, ChevronRight, ChevronLeft, PartyPopper, Calendar, Users, Mail, LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Celebration Time!",
    description:
      "Your all-in-one platform for planning memorable events. Let's take a quick tour of the features that will make your event planning effortless.",
    icon: <PartyPopper className="h-12 w-12 text-primary" />,
  },
  {
    id: "create-event",
    title: "Create Your First Event",
    description:
      "Start by creating an event. Choose from weddings, birthdays, corporate events, and more. Set the date, location, and customize every detail.",
    icon: <Calendar className="h-12 w-12 text-primary" />,
    action: {
      label: "Create Event",
      href: "/events/new",
    },
  },
  {
    id: "manage-guests",
    title: "Manage Your Guest List",
    description:
      "Add guests one by one or import from a CSV file. Track RSVPs, dietary restrictions, and plus-ones all in one place.",
    icon: <Users className="h-12 w-12 text-primary" />,
  },
  {
    id: "send-invitations",
    title: "Send Beautiful Invitations",
    description:
      "Create and send email invitations with custom templates. Track opens, clicks, and RSVP responses in real-time.",
    icon: <Mail className="h-12 w-12 text-primary" />,
  },
  {
    id: "seating-charts",
    title: "Design Seating Charts",
    description:
      "Create interactive seating arrangements with drag-and-drop. Use smart seating to automatically place guests based on preferences.",
    icon: <LayoutGrid className="h-12 w-12 text-primary" />,
  },
  {
    id: "ready",
    title: "You're All Set!",
    description:
      "You now know the essentials. Explore venues, track your budget, and make your event unforgettable. Let's get started!",
    icon: <Sparkles className="h-12 w-12 text-primary" />,
    action: {
      label: "Go to Dashboard",
      href: "/dashboard",
    },
  },
];

interface OnboardingWizardProps {
  onComplete?: () => void;
  className?: string;
}

export function OnboardingWizard({ onComplete, className }: OnboardingWizardProps) {
  const {
    currentStep,
    setCurrentStep,
    completeStep,
    completeOnboarding,
    skipOnboarding,
  } = useOnboarding();

  const { analytics } = useAnalytics();

  const totalSteps = onboardingSteps.length;
  const step = onboardingSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    completeStep(step.id);

    if (isLastStep) {
      completeOnboarding();
      analytics.onboardingCompleted();
      onComplete?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    skipOnboarding();
    analytics.onboardingSkipped();
    onComplete?.();
  };

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", className)}>
      <Card className="w-full max-w-lg mx-4 shadow-xl animate-fade-in">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentStep
                      ? "w-6 bg-primary"
                      : index < currentStep
                        ? "w-2 bg-primary/60"
                        : "w-2 bg-muted-foreground/30"
                  )}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Skip onboarding"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                {step.icon}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3">
              {step.title}
            </h2>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              {step.description}
            </p>

            {/* Action Button (optional) */}
            {step.action && (
              <Link href={step.action.href}>
                <Button
                  variant="outline"
                  className="mb-6"
                  onClick={() => {
                    completeStep(step.id);
                    if (isLastStep) {
                      completeOnboarding();
                      analytics.onboardingCompleted();
                    }
                  }}
                >
                  {step.action.label}
                </Button>
              </Link>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {totalSteps}
            </span>

            <Button onClick={handleNext} className="gap-1">
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Simple onboarding modal wrapper for dashboard
 */
interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  if (!isOpen) return null;

  return <OnboardingWizard onComplete={onClose} />;
}
