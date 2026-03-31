# Club CRUD Handoff - 2026-03-31

## What changed

- Added file-backed club content storage at `apps/web/src/lib/club-content-store.ts`.
- Added club server actions at `apps/web/src/actions/club-content-actions.ts`.
- Added club form fields at `apps/web/src/components/club-content-forms.tsx`.
- Added the backing JSON store at `apps/web/data/club-content-modules.json`.

## Exported APIs

- `listClubAnnouncementRecords`, `getClubAnnouncementRecord`, `createClubAnnouncementRecord`, `updateClubAnnouncementRecord`, `deleteClubAnnouncementRecord`
- `listClubEventRecords`, `getClubEventRecord`, `createClubEventRecord`, `updateClubEventRecord`, `deleteClubEventRecord`
- `listClubGalleryRecords`, `getClubGalleryRecord`, `createClubGalleryRecord`, `updateClubGalleryRecord`, `deleteClubGalleryRecord`
- `buildClubContentSummary(clubSlug)`
- `ClubAnnouncementRecordInput`, `ClubEventRecordInput`, `ClubGalleryRecordInput`
- `ClubAnnouncementFormFields`, `ClubEventFormFields`, `ClubGalleryFormFields`
- `createClubAnnouncementAction`, `updateClubAnnouncementAction`, `deleteClubAnnouncementAction`
- `createClubEventAction`, `updateClubEventAction`, `deleteClubEventAction`
- `createClubGalleryAction`, `updateClubGalleryAction`, `deleteClubGalleryAction`

## Route integration notes

- Club member routes should mirror the family content pattern under `/clubs/[clubSlug]/app/...`.
- Suggested route segments:
  - `/clubs/[clubSlug]/app/announcements`
  - `/clubs/[clubSlug]/app/announcements/new`
  - `/clubs/[clubSlug]/app/announcements/[announcementSlug]`
  - `/clubs/[clubSlug]/app/announcements/[announcementSlug]/edit`
  - same shape for `events` and `gallery`
- `revalidatePath` is already wired in the actions for:
  - club detail page
  - club app home
  - module list pages
  - module detail/edit pages
  - mobile preview page
- Forms are ready for server actions and use Korean labels only.

## Verification

- `npm run typecheck --workspace @ysplan/web`
- `npm run build`

Both passed after the club CRUD files were added.

## Next step

- Wire the club member routes to these APIs and render the actual CRUD pages.
