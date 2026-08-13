import { create } from "zustand"

type MonthlyBudgetState = "onTrack" | "atRisk" | "over"
type DailyRateState = "underRate" | "overRate"
type MajorScenario = "active" | "none"
type Plan = "free" | "pro"
type BudgetInjection = "with" | "without"
type AnalyticsHistoryMode = "withHistory" | "firstMonth"
type FixedBudgetOverrun = "none" | "some"
type FixedPaceState = "steady" | "one" | "faster"

interface SandboxStore {
  monthlyBudgetState: MonthlyBudgetState
  dailyRateState: DailyRateState
  majorScenario: MajorScenario
  plan: Plan
  introCardVisible: boolean
  budgetInjection: BudgetInjection
  analyticsHistoryMode: AnalyticsHistoryMode
  fixedBudgetOverrun: FixedBudgetOverrun
  fixedPaceState: FixedPaceState
  setMonthlyBudgetState: (v: MonthlyBudgetState) => void
  setDailyRateState: (v: DailyRateState) => void
  setMajorScenario: (v: MajorScenario) => void
  setPlan: (v: Plan) => void
  setIntroCardVisible: (v: boolean) => void
  setBudgetInjection: (v: BudgetInjection) => void
  setAnalyticsHistoryMode: (v: AnalyticsHistoryMode) => void
  setFixedBudgetOverrun: (v: FixedBudgetOverrun) => void
  setFixedPaceState: (v: FixedPaceState) => void
}

export const useSandboxStore = create<SandboxStore>((set) => ({
  monthlyBudgetState: "onTrack",
  dailyRateState: "underRate",
  majorScenario: "active",
  plan: "pro",
  introCardVisible: true,
  budgetInjection: "without",
  analyticsHistoryMode: "withHistory",
  fixedBudgetOverrun: "some",
  fixedPaceState: "steady",
  setMonthlyBudgetState: (v) => set({ monthlyBudgetState: v }),
  setDailyRateState: (v) => set({ dailyRateState: v }),
  setMajorScenario: (v) => set({ majorScenario: v }),
  setPlan: (v) => set({ plan: v }),
  setIntroCardVisible: (v) => set({ introCardVisible: v }),
  setBudgetInjection: (v) => set({ budgetInjection: v }),
  setAnalyticsHistoryMode: (v) => set({ analyticsHistoryMode: v }),
  setFixedBudgetOverrun: (v) => set({ fixedBudgetOverrun: v }),
  setFixedPaceState: (v) => set({ fixedPaceState: v }),
}))
