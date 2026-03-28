"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { deletePlan, getProfile } from "@/lib/api";
import {
    AlertTriangle,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Mail,
    Plus,
    Trash2,
    User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Plan {
  plan_id: number;
  skill_name: string;
  level: string;
  status: string;
  days_behind: number;
  created_at: string;
  original_end_date: string;
  current_end_date: string;
}

interface ProfileData {
  user: {
    id: number;
    username: string;
    email: string;
    joined: string;
  };
  plans: Plan[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchProfile = () => {
    setLoading(true);
    getProfile()
      .then((res: any) => setData(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleDelete = async (planId: number) => {
    setDeletingId(planId);
    try {
      await deletePlan(planId);

      // If deleted plan was selected — clear localStorage
      const saved = localStorage.getItem("skillpath_selected_plan_id");
      if (saved && parseInt(saved) === planId) {
        localStorage.removeItem("skillpath_selected_plan_id");
      }

      setConfirmDeleteId(null);
      fetchProfile();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const activePlans = data.plans.filter((p) => p.status === "active");
  const completedPlans = data.plans.filter((p) => p.status === "completed");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and learning plans
        </p>
      </div>

      {/* User info card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {data.user.username?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold">{data.user.username}</p>
              <p className="text-sm text-muted-foreground">{data.user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium truncate">{data.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="font-medium">
                  {new Date(data.user.joined).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Skills</p>
                <p className="font-medium">{data.plans.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active plans */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Active Skills ({activePlans.length})
            </CardTitle>
            <Link href="/onboarding">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Skill
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activePlans.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
              <p className="text-sm text-muted-foreground">
                No active skills. Start learning something new!
              </p>
              <Link href="/onboarding">
                <Button variant="outline" size="sm">Start Learning</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activePlans.map((plan) => (
                <div
                  key={plan.plan_id}
                  className="flex items-center gap-3 p-4 rounded-xl border bg-muted/30"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{plan.skill_name}</p>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {plan.level}
                      </Badge>
                      {plan.days_behind > 0 && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {plan.days_behind}d behind
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Goal:{" "}
                      {new Date(plan.original_end_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {confirmDeleteId === plan.plan_id ? (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-red-600 font-medium">Sure?</p>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(plan.plan_id)}
                          disabled={deletingId === plan.plan_id}
                          className="h-7 text-xs"
                        >
                          {deletingId === plan.plan_id ? "..." : "Yes"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-7 text-xs"
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDeleteId(plan.plan_id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed plans */}
      {completedPlans.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Completed Skills ({completedPlans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedPlans.map((plan) => (
                <div
                  key={plan.plan_id}
                  className="flex items-center gap-3 p-4 rounded-xl border bg-green-50/50 border-green-100"
                >
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{plan.skill_name}</p>
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600 border-green-200"
                      >
                        Completed
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {plan.level}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}