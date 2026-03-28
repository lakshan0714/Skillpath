"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSkills, submitOnboarding } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
    BarChart,
    BookOpen,
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const LEVELS = [
  { value: "beginner", label: "Complete Beginner", desc: "Never touched this skill" },
  { value: "basics", label: "Know the Basics", desc: "I know a little bit" },
  { value: "intermediate", label: "Intermediate", desc: "I have some experience" },
];
const HOURS = [1, 2, 3, 4];
const WEEKS = [2, 4, 6, 8, 12];

const STEPS = [
  { title: "What do you want to learn?", icon: BookOpen },
  { title: "Set your timeline", icon: Calendar },
  { title: "Hours per day", icon: Clock },
  { title: "Available days", icon: Calendar },
  { title: "Your current level", icon: BarChart },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [form, setForm] = useState({
    skill_name: "",
    timeline_weeks: 4,
    hours_per_day: 1,
    available_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    level: "beginner",
  });

  useEffect(() => {
    getSkills()
      .then((res: any) => {
        setSuggestions(res.skills.map((s: any) => s.name));
      })
      .catch(() => {});
  }, []);

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter((d) => d !== day)
        : [...prev.available_days, day],
    }));
  };

  const canProceed = () => {
    if (step === 0) return form.skill_name.trim().length > 0;
    if (step === 3) return form.available_days.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res: any = await submitOnboarding(form);
      router.push(`/generating?plan_id=${res.plan_id}`);
    } catch (e: any) {
      alert(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SkillPath AI</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all duration-300",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="text-2xl font-bold mb-6">{STEPS[step].title}</h2>

          {/* Step 0 — Skill name */}
          {step === 0 && (
            <div className="space-y-4">
              <Input
                placeholder="e.g. Python, React, SQL..."
                value={form.skill_name}
                onChange={(e) => setForm({ ...form, skill_name: e.target.value })}
                className="h-12 text-base"
                autoFocus
              />
              {suggestions.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Popular skills</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, skill_name: s })}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm border transition-colors",
                          form.skill_name === s
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted hover:bg-muted/80 border-transparent"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Timeline */}
          {step === 1 && (
            <div className="grid grid-cols-3 gap-3">
              {WEEKS.map((w) => (
                <button
                  key={w}
                  onClick={() => setForm({ ...form, timeline_weeks: w })}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    form.timeline_weeks === w
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-2xl font-bold">{w}</div>
                  <div className="text-xs text-muted-foreground">weeks</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Hours */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              {HOURS.map((h) => (
                <button
                  key={h}
                  onClick={() => setForm({ ...form, hours_per_day: h })}
                  className={cn(
                    "p-6 rounded-xl border-2 text-center transition-all",
                    form.hours_per_day === h
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-3xl font-bold">{h}</div>
                  <div className="text-sm text-muted-foreground">
                    hour{h > 1 ? "s" : ""} / day
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3 — Available days */}
          {step === 3 && (
            <div className="space-y-3">
              {DAYS.map((day) => {
                const selected = form.available_days.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="capitalize font-medium">{day}</span>
                    {selected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
              <p className="text-xs text-muted-foreground text-center">
                {form.available_days.length} day{form.available_days.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          {/* Step 4 — Level */}
          {step === 4 && (
            <div className="space-y-3">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setForm({ ...form, level: l.value })}
                  className={cn(
                    "w-full flex items-start gap-4 px-4 py-4 rounded-xl border-2 text-left transition-all",
                    form.level === l.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      form.level === l.value
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {form.level === l.value && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{l.label}</p>
                    <p className="text-sm text-muted-foreground">{l.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1 h-12"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 h-12"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className="flex-1 h-12"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Generate My Roadmap 🚀
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}