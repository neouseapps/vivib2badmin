"use client";
import { use } from "react";
import { notFound } from "next/navigation";
import { useScoring } from "@/lib/store/scoring-store";
import { CallGuideEditor } from "@/components/survey/CallGuideEditor";

export default function EditCallGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sets = useScoring((s) => s.callGuideSets);
  const set = sets.find((s) => s.id === id);
  if (!set) return notFound();
  return <CallGuideEditor mode="edit" initial={set} />;
}
