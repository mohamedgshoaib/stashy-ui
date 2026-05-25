import { setRequestLocale } from "next-intl/server";
import { Suspense, use } from "react";

import { TrackerScreen } from "@/components/tracker-screen";

export default function TrackerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <Suspense>
      <TrackerScreen />
    </Suspense>
  );
}
