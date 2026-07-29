import { TopBar } from "../components/shared/TopBar";
import { StatsStrip } from "../components/shared/StatsStrip";
import { FilterChips } from "../components/shared/FilterChips";
import { LibraryGrid } from "../components/Library/LibraryGrid";
import { UploadDialog } from "../components/Upload/UploadDialog";

export function LibraryPage() {
  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <StatsStrip />
      <FilterChips />
      <LibraryGrid />
      <UploadDialog />
    </div>
  );
}
