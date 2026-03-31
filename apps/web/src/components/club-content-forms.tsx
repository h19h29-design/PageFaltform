import type {
  ClubAnnouncementRecordInput,
  ClubEventRecordInput,
  ClubGalleryRecordInput,
} from "../lib/club-content-store";

const visibilityOptions: Array<{ value: "member" | "public"; label: string }> = [
  { value: "member", label: "멤버 전용" },
  { value: "public", label: "공개" },
];

const severityOptions: Array<{ value: "normal" | "important" | "urgent"; label: string }> = [
  { value: "normal", label: "일반" },
  { value: "important", label: "중요" },
  { value: "urgent", label: "긴급" },
];

function toCheckedValue(value: boolean | undefined): boolean {
  return Boolean(value);
}

function toTextValue(value: string | null | undefined): string {
  return value ?? "";
}

function toNumberValue(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function toDateTimeLocalValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function ClubAnnouncementFormFields(props: { initial?: Partial<ClubAnnouncementRecordInput> }) {
  const initial = props.initial ?? {};

  return (
    <>
      <div className="grid-two">
        <label className="form-label">
          제목
          <input className="text-input" defaultValue={toTextValue(initial.title)} name="title" required type="text" />
        </label>
        <label className="form-label">
          주소
          <input
            className="text-input"
            defaultValue={toTextValue(initial.slug)}
            name="slug"
            placeholder="비워 두면 제목 기준으로 만듭니다"
            type="text"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          중요도
          <select className="text-input" defaultValue={initial.severity ?? "normal"} name="severity">
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          공개 범위
          <select className="text-input" defaultValue={initial.visibility ?? "member"} name="visibility">
            {visibilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="content-checkbox-grid">
        <label className="content-checkbox">
          <input defaultChecked={toCheckedValue(initial.pinned)} name="pinned" type="checkbox" />
          <span>상단 고정</span>
        </label>
        <label className="content-checkbox">
          <input defaultChecked={toCheckedValue(initial.featured)} name="featured" type="checkbox" />
          <span>홈에 노출</span>
        </label>
      </div>

      <label className="form-label">
        요약
        <textarea
          className="text-input text-input--tall"
          defaultValue={toTextValue(initial.summary)}
          name="summary"
          required
        />
      </label>

      <label className="form-label">
        본문
        <textarea
          className="text-input text-input--tall"
          defaultValue={toTextValue(initial.body)}
          name="body"
          required
        />
      </label>
    </>
  );
}

export function ClubEventFormFields(props: { initial?: Partial<ClubEventRecordInput> }) {
  const initial = props.initial ?? {};

  return (
    <>
      <div className="grid-two">
        <label className="form-label">
          제목
          <input className="text-input" defaultValue={toTextValue(initial.title)} name="title" required type="text" />
        </label>
        <label className="form-label">
          주소
          <input
            className="text-input"
            defaultValue={toTextValue(initial.slug)}
            name="slug"
            placeholder="비워 두면 제목 기준으로 만듭니다"
            type="text"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          시작
          <input
            className="text-input"
            defaultValue={toDateTimeLocalValue(initial.startsAt)}
            name="startsAt"
            required
            type="datetime-local"
          />
        </label>
        <label className="form-label">
          종료
          <input
            className="text-input"
            defaultValue={toDateTimeLocalValue(initial.endsAt)}
            name="endsAt"
            required
            type="datetime-local"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          장소
          <input className="text-input" defaultValue={toTextValue(initial.location)} name="location" required type="text" />
        </label>
        <label className="form-label">
          예상 인원
          <input
            className="text-input"
            defaultValue={toNumberValue(initial.attendanceTarget)}
            min={0}
            name="attendanceTarget"
            type="number"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          공개 범위
          <select className="text-input" defaultValue={initial.visibility ?? "member"} name="visibility">
            {visibilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="content-checkbox">
          <input defaultChecked={toCheckedValue(initial.featured)} name="featured" type="checkbox" />
          <span>홈에 노출</span>
        </label>
      </div>

      <label className="form-label">
        요약
        <textarea
          className="text-input text-input--tall"
          defaultValue={toTextValue(initial.summary)}
          name="summary"
          required
        />
      </label>
    </>
  );
}

export function ClubGalleryFormFields(props: { initial?: Partial<ClubGalleryRecordInput> }) {
  const initial = props.initial ?? {};

  return (
    <>
      <div className="grid-two">
        <label className="form-label">
          제목
          <input className="text-input" defaultValue={toTextValue(initial.title)} name="title" required type="text" />
        </label>
        <label className="form-label">
          주소
          <input
            className="text-input"
            defaultValue={toTextValue(initial.slug)}
            name="slug"
            placeholder="비워 두면 제목 기준으로 만듭니다"
            type="text"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          사진 수
          <input
            className="text-input"
            defaultValue={toNumberValue(initial.photoCount)}
            min={1}
            name="photoCount"
            required
            type="number"
          />
        </label>
        <label className="form-label">
          메모 수
          <input
            className="text-input"
            defaultValue={toNumberValue(initial.noteCount)}
            min={0}
            name="noteCount"
            type="number"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          공개 범위
          <select className="text-input" defaultValue={initial.visibility ?? "member"} name="visibility">
            {visibilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="content-checkbox">
          <input defaultChecked={toCheckedValue(initial.featured)} name="featured" type="checkbox" />
          <span>홈에 노출</span>
        </label>
      </div>

      <label className="form-label">
        캡션
        <textarea
          className="text-input text-input--tall"
          defaultValue={toTextValue(initial.caption)}
          name="caption"
          required
        />
      </label>

      <label className="form-label">
        이미지 주소
        <input className="text-input" defaultValue={toTextValue(initial.imageUrl)} name="imageUrl" type="text" />
      </label>
    </>
  );
}
