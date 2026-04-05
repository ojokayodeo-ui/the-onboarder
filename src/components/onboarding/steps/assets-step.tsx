"use client";

import { useState } from "react";
import { StepWrapper } from "../step-wrapper";
import { Textarea } from "@/components/ui/input";
import { Link2, FileText, Plus, X } from "lucide-react";

interface Props {
  initial: Record<string, unknown>;
  onNext: (data: Record<string, unknown>) => void;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
  isLast?: boolean;
}

export function AssetsStep({ initial, onNext, onSave, saving, isLast }: Props) {
  const [driveLinks, setDriveLinks] = useState((initial.driveLinks as string) ?? "");
  const [additionalNotes, setAdditionalNotes] = useState((initial.additionalNotes as string) ?? "");

  function handleNext() {
    onNext({ driveLinks, additionalNotes });
  }

  function handleSave() {
    onSave({ driveLinks, additionalNotes });
  }

  const examples = [
    "Google Drive folder with brand assets",
    "Notion workspace with company docs",
    "Previous campaign reports",
    "Pitch deck / sales materials",
    "Website analytics screenshots",
  ];

  return (
    <StepWrapper
      title="Share your resources"
      description="Almost done! Share any relevant files, links, or additional context that will help us understand your business better."
      emoji="📁"
      onNext={handleNext}
      onSave={handleSave}
      saving={saving}
      isLast={isLast}
      nextLabel="Submit Onboarding"
    >
      {/* Example assets */}
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-3">What kinds of assets are useful:</label>
        <div className="space-y-2">
          {examples.map((ex) => (
            <div key={ex} className="flex items-center gap-2 text-sm text-slate-500">
              <FileText size={13} className="text-slate-400 flex-shrink-0" />
              {ex}
            </div>
          ))}
        </div>
      </div>

      <Textarea
        label="Google Drive / Notion / Dropbox Links"
        placeholder={`Paste links here, one per line:\nhttps://drive.google.com/...\nhttps://notion.so/...\nhttps://www.dropbox.com/...`}
        value={driveLinks}
        onChange={(e) => setDriveLinks(e.target.value)}
        rows={5}
        helpText="Paste any shareable links. Make sure view access is enabled."
      />

      <Textarea
        label="Anything else we should know?"
        placeholder="Any specific constraints, context, past agency experiences, expectations, or anything that would help us serve you better..."
        value={additionalNotes}
        onChange={(e) => setAdditionalNotes(e.target.value)}
        rows={4}
      />

      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
        <p className="text-sm text-brand-700 font-medium mb-1">🎉 You&apos;re almost done!</p>
        <p className="text-sm text-brand-600">Click &quot;Submit Onboarding&quot; when you&apos;re ready. You can always share more assets via email later.</p>
      </div>
    </StepWrapper>
  );
}
