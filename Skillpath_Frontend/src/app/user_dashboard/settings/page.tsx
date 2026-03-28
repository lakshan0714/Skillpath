"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlanContext } from "@/context/PlanContext";
import { extendPlan, getProfile, updatePlan } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

const DAYS = [
  "monday","tuesday","wednesday",
  "thursday","friday","saturday","sunday",
];
const HOURS = [1, 2, 3, 4];
const EXTEND_OPTIONS = [1, 2, 3, 5, 7];

interface PlanDetails {
  plan_id: number;
  skill_name: string;
  level: string;
  hours_per_day: number;
  available_days: string;
  days_behind: number;
  health: string;
  original_end_date: string;
  current_end_date: string;
}

export default function SettingsPage() {
  const { planId, loading: planLoading } = usePlanContext();

  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extending, setExtending] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [extendSuccess, setExtendSuccess] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<number>(1);
  const [selectedExtend, setSelectedExtend] = useState<number>(2);

  useEffect(() => {
    if (planLoading) return;
    if (!planId) return;

    setLoading(true);
    getProfile()
      .then((res: any) => {
        const found = res.plans.find((p: any) => p.plan_id === planId);
        if (found) {
          setPlan(found);
          setSelectedDays(
            found.available_days ? found.available_days.split(",") : []
          );
          setSelectedHours(found.hours_per_day || 1);
        }
      })
      .finally(() => setLoading(false));
  }, [planId, planLoading]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!planId || selectedDays.length === 0) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updatePlan(planId, {
        available_days: selectedDays,
        hours_per_day: selectedHours,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExtend = async () => {
    if (!planId) return;
    setExtending(true);
    setExtendSuccess(false);
    try {
      await extendPlan(planId, selectedExtend);
      setExtendSuccess(true);
      getProfile().then((res: any) => {
        const found = res.plans.find((p: any) => p.plan_id === planId);
        if (found) setPlan(found);
      });
      setTimeout(() => setExtendSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setExtending(false);
    }
  };

  if (planLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>No active plan found.</p>
      </div>
    );
  }

  const hasChanges =
    selectedDays.join(",") !== plan.available_days ||
    selectedHours !== plan.hours_per_day;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust your learning schedule for{" "}
          <span className="font-medium text-foreground">{plan.skill_name}</span>
        </p>
      </div>

      {plan.days_behind > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">
              You are {plan.days_behind} day{plan.days_behind > 1 ? "s" : ""}{" "}
              behind schedule.
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Consider extending your timeline below.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Available Study Days
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Changing this will reschedule all your pending lessons.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAYS.map((day) => {
            const selected = selectedDays.includes(day);
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
                <span className="capitalize font-medium text-sm">{day}</span>
                {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
          <p className="text-xs text-muted-foreground text-center">
            {selectedDays.length} day{selectedDays.length !== 1 ? "s" : ""} selected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Hours Per Day
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Updates the estimated time for all pending lessons.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {HOURS.map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHours(h)}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  selectedHours === h
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="text-2xl font-bold">{h}</div>
                <div className="text-xs text-muted-foreground">
                  hr{h > 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving || !hasChanges || selectedDays.length === 0}
        className="w-full h-12 gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving & Rescheduling...
          </>
        ) : saveSuccess ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Saved! Lessons Rescheduled ✓
          </>
        ) : (
          "Save Changes"
        )}
      </Button>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Extend Timeline
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Move your goal date forward. Resets days behind to zero.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Original Goal</p>
              <p className="font-medium">
                {new Date(plan.original_end_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current End Date</p>
              <p className={cn(
                "font-medium",
                plan.days_behind > 0 ? "text-red-600" : "text-green-600"
              )}>
                {new Date(plan.current_end_date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Extend by:</p>
            <div className="flex gap-2 flex-wrap">
              {EXTEND_OPTIONS.map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedExtend(days)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                    selectedExtend === days
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {days} day{days > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleExtend}
            disabled={extending}
            variant="outline"
            className="w-full h-11 gap-2"
          >
            {extending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extending...
              </>
            ) : extendSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Timeline Extended ✓
              </>
            ) : (
              `Extend by ${selectedExtend} day${selectedExtend > 1 ? "s" : ""}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}