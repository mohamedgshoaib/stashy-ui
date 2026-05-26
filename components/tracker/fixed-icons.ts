import {
  AdobePhotoshopIcon,
  Building01Icon,
  CafeIcon,
  Car01Icon,
  DiscAlbumIcon,
  ShoppingBag01Icon,
  SmartPhone01Icon,
  SpoonAndForkIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import type { FixedExpenseIconKey, FixedExpenseType } from "@/components/tracker/types"

export type TrackerFixedIconOption = {
  key: FixedExpenseIconKey
  icon: IconSvgElement
  labelKey: string
  keywords: string[]
  recommendedFor: FixedExpenseType[]
}

export const TRACKER_FIXED_ICON_OPTIONS: TrackerFixedIconOption[] = [
  {
    key: "building",
    icon: Building01Icon,
    labelKey: "building",
    keywords: ["home", "rent", "house", "bill", "property"],
    recommendedFor: ["recurring", "installment"],
  },
  {
    key: "media",
    icon: DiscAlbumIcon,
    labelKey: "media",
    keywords: ["spotify", "netflix", "music", "media", "subscription"],
    recommendedFor: ["recurring"],
  },
  {
    key: "design",
    icon: AdobePhotoshopIcon,
    labelKey: "design",
    keywords: ["design", "creative", "adobe", "work", "software"],
    recommendedFor: ["recurring", "installment"],
  },
  {
    key: "phone",
    icon: SmartPhone01Icon,
    labelKey: "phone",
    keywords: ["phone", "mobile", "device", "installment", "electronics"],
    recommendedFor: ["recurring", "installment"],
  },
  {
    key: "car",
    icon: Car01Icon,
    labelKey: "car",
    keywords: ["car", "gas", "transport", "vehicle", "ride"],
    recommendedFor: ["manual", "installment"],
  },
  {
    key: "shopping",
    icon: ShoppingBag01Icon,
    labelKey: "shopping",
    keywords: ["shopping", "groceries", "market", "bag", "store"],
    recommendedFor: ["manual"],
  },
  {
    key: "cafe",
    icon: CafeIcon,
    labelKey: "cafe",
    keywords: ["cafe", "coffee", "drink", "beans", "snack"],
    recommendedFor: ["manual"],
  },
  {
    key: "dining",
    icon: SpoonAndForkIcon,
    labelKey: "dining",
    keywords: ["food", "dining", "restaurant", "meals", "eating"],
    recommendedFor: ["manual"],
  },
]

export function getTrackerFixedIcon(key: FixedExpenseIconKey): IconSvgElement {
  return TRACKER_FIXED_ICON_OPTIONS.find((option) => option.key === key)?.icon ?? Building01Icon
}

export function getTrackerFixedIconOption(key: FixedExpenseIconKey): TrackerFixedIconOption {
  return TRACKER_FIXED_ICON_OPTIONS.find((option) => option.key === key) ?? TRACKER_FIXED_ICON_OPTIONS[0]
}

export function getDefaultTrackerFixedIconKey(type: FixedExpenseType): FixedExpenseIconKey {
  switch (type) {
    case "manual":
      return "shopping"
    case "recurring":
      return "building"
    case "installment":
      return "phone"
  }
}
