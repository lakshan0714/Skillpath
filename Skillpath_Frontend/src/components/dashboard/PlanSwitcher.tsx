"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlanContext } from "@/context/PlanContext";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function PlanSwitcher() {
  const { activePlans, planId, setPlanId } = usePlanContext();
  const router = useRouter();
  const selected = activePlans.find((p) => p.plan_id === planId);

  if (activePlans.length === 0) {
    return (
      <Link href="/onboarding">
        <Button variant="outline" size="sm" className="gap-2 w-full">
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 w-full justify-between"
        >
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate font-medium">
              {selected?.skill_name || "Select Skill"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Your Skills
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {activePlans.map((plan) => (
          <DropdownMenuItem
            key={plan.plan_id}
            onClick={() => {
              setPlanId(plan.plan_id);
              router.push(`/user_dashboard/overview?plan=${plan.plan_id}`);
            }}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              {plan.plan_id === planId ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              ) : (
                <div className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {plan.skill_name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {plan.level}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {plan.status}
            </Badge>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/onboarding"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Learn a new skill</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}