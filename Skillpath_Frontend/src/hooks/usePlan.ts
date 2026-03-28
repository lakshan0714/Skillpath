"use client";

import { getProfile } from "@/lib/api";
import { useEffect, useState } from "react";

export interface Plan {
  plan_id: number;
  skill_name: string;
  level: string;
  status: string;
  days_behind: number;
  created_at: string;
  original_end_date: string;
  current_end_date: string;
}

interface UsePlanReturn {
  planId: number | null;
  setPlanId: (id: number) => void;
  allPlans: Plan[];
  activePlans: Plan[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const STORAGE_KEY = "skillpath_selected_plan_id";

export function usePlan(): UsePlanReturn {
  const [planId, setPlanIdState] = useState<number | null>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res: any = await getProfile();
      const plans: Plan[] = res.plans || [];
      setAllPlans(plans);

      const activePlans = plans.filter((p) => p.status === "active");

      // Read saved plan from localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedId = saved ? parseInt(saved) : null;

      // Check if saved plan still exists and is active
      const savedExists = activePlans.find((p) => p.plan_id === savedId);

      if (savedExists) {
        setPlanIdState(savedId);
      } else if (activePlans.length > 0) {
        // Default to most recent active plan
        const latest = activePlans[0];
        setPlanIdState(latest.plan_id);
        localStorage.setItem(STORAGE_KEY, String(latest.plan_id));
      } else {
        setPlanIdState(null);
      }
    } catch {
      setPlanIdState(null);
    } finally {
      setLoading(false);
    }
  };

  const setPlanId = (id: number) => {
    setPlanIdState(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const activePlans = allPlans.filter((p) => p.status === "active");

  return {
    planId,
    setPlanId,
    allPlans,
    activePlans,
    loading,
    refetch: fetchPlans,
  };
}