"use client";

import { usePlanContext } from "@/context/PlanContext";

export function usePlanId() {
  const { planId, loading } = usePlanContext();
  return { planId, loaded: !loading };
}