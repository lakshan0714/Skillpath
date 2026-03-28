"use client";

import { getProfile } from "@/lib/api";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

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

interface PlanContextType {
  planId: number | null;
  setPlanId: (id: number) => void;
  activePlans: Plan[];
  allPlans: Plan[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const PlanContext = createContext<PlanContextType>({
  planId: null,
  setPlanId: () => {},
  activePlans: [],
  allPlans: [],
  loading: true,
  refetch: async () => {},
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const [planId, setPlanIdState] = useState<number | null>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res: any = await getProfile();
      const plans: Plan[] = res.plans || [];
      setAllPlans(plans);

      const active = plans
        .filter((p) => p.status === "active")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

      if (active.length > 0) {
        // Check if we already have a selected plan
        setPlanIdState((prev) => {
          // Keep existing selection if still valid
          const stillExists = active.find((p) => p.plan_id === prev);
          if (stillExists) return prev;
          // Otherwise default to most recent
          return active[0].plan_id;
        });
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
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const activePlans = allPlans.filter((p) => p.status === "active");

  return (
    <PlanContext.Provider
      value={{
        planId,
        setPlanId,
        activePlans,
        allPlans,
        loading,
        refetch: fetchPlans,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlanContext() {
  return useContext(PlanContext);
}