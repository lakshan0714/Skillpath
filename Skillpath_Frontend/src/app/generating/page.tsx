"use client";

import { getRoadmap } from "@/lib/api";
import { BookOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const STEPS = [
  "Analyzing your skill and goals...",
  "Fetching learning resources...",
  "Building your personalized roadmap...",
  "Scheduling your lessons...",
  "Almost ready...",
];

function GeneratingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan_id");
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!planId) {
      router.push("/onboarding");
      return;
    }

    const poll = setInterval(async () => {
      try {
        const res: any = await getRoadmap(Number(planId));
        if (res.weeks && res.weeks.length > 0) {
          clearInterval(poll);
          localStorage.setItem("skillpath_selected_plan_id", String(planId));
          router.push(`/user_dashboard/overview?plan=${planId}`);
        }
      } catch {
        // Still generating
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [planId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-sm w-full">

        <div className="flex items-center gap-2 justify-center">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SkillPath AI</span>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border-4 border-muted" />
          <div className="absolute h-24 w-24 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <BookOpen className="absolute h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Building your plan</h2>
          <p className="text-muted-foreground text-sm min-h-[20px] transition-all duration-500">
            {STEPS[stepIndex]}
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                i <= stepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          This usually takes 10–15 seconds
        </p>
      </div>
    </div>
  );
}

export default function GeneratingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GeneratingContent />
    </Suspense>
  );
}