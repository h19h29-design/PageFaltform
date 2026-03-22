import type {
  AnnouncementRecordInput,
  DiaryRecordInput,
  GalleryRecordInput,
  PostRecordInput,
} from "../lib/content-store";
import { audienceOptions, visibilityScopeOptions } from "../lib/content-modules";

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

export function AnnouncementFormFields(props: {
  initial?: Partial<AnnouncementRecordInput>;
}) {
  const initial = props.initial ?? {};

  return (
    <>
      <div className="grid-two">
        <label className="form-label">
          제목
          <input
            className="text-input"
            defaultValue={toTextValue(initial.title)}
            name="title"
            required
            type="text"
          />
        </label>
        <label className="form-label">
          슬러그
          <input
            className="text-input"
            defaultValue={toTextValue(initial.slug)}
            name="slug"
            placeholder="비워 두면 제목으로 자동 생성"
            type="text"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          심각도
          <select
            className="text-input"
            defaultValue={initial.severity ?? "general"}
            name="severity"
          >
            <option value="general">일반</option>
            <option value="important">중요</option>
            <option value="urgent">긴급</option>
          </select>
        </label>
        <label className="form-label">
          노출 범위
          <select
            className="text-input"
            defaultValue={initial.visibilityScope ?? "all"}
            name="visibilityScope"
          >
            {visibilityScopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          대상
          <select
            className="text-input"
            defaultValue={initial.audience ?? "family-shared"}
            name="audience"
          >
            {audienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          읽음 확인 대상 인원
          <input
            className="text-input"
            defaultValue={toNumberValue(initial.readAckTarget)}
            min={0}
            name="readAckTarget"
            type="number"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          읽음 확인 완료 인원
          <input
            className="text-input"
            defaultValue={toNumberValue(initial.readAckConfirmed)}
            min={0}
            name="readAckConfirmed"
            type="number"
          />
        </label>
        <div className="content-checkbox-grid">
          <label className="content-checkbox">
            <input
              defaultChecked={toCheckedValue(initial.requiresReadAck)}
              name="requiresReadAck"
              type="checkbox"
            />
            <span>읽음 확인 필요</span>
          </label>
          <label className="content-checkbox">
            <input
              defaultChecked={toCheckedValue(initial.pinned)}
              name="pinned"
              type="checkbox"
            />
            <span>상단 고정</span>
          </label>
        </div>
      </div>

      <label className="form-label">
        짧은 요약
        <textarea
          className="text-input text-input--tall"
          defaultValue={toTextValue(initial.excerpt)}
          name="excerpt"
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

      <div className="grid-two">
        <label className="form-label">
          노출 시작
          <input
            className="text-input"
            defaultValue={toDateTimeLocalValue(initial.displayStartsAt)}
            name="displayStartsAt"
            type="datetime-local"
          />
        </label>
        <label className="form-label">
          노출 종료
          <input
            className="text-input"
            defaultValue={toDateTimeLocalValue(initial.displayEndsAt)}
            name="displayEndsAt"
            type="datetime-local"
          />
        </label>
      </div>
    </>
  );
}

export function PostFormFields(props: {
  initial?: Partial<PostRecordInput>;
}) {
  const initial = props.initial ?? {};

  return (
    <>
      <div className="grid-two">
        <label className="form-label">
          제목
          <input className="text-input" defaultValue={toTextValue(initial.title)} name="title" required type="text" />
        </label>
        <label className="form-label">
          슬러그
          <input
            className="text-input"
            defaultValue={toTextValue(initial.slug)}
            name="slug"
            placeholder="비워 두면 제목으로 자동 생성"
            type="text"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          글 성격
          <select className="text-input" defaultValue={initial.category ?? "update"} name="category">
            <option value="update">업데이트</option>
            <option value="guide">가이드</option>
            <option value="note">기록</option>
          </select>
        </label>
        <label className="form-label">
          노출 범위
          <select
            className="text-input"
            defaultValue={initial.visibilityScope ?? "all"}
            name="visibilityScope"
          >
            {visibilityScopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          대상
          <select className="text-input" defaultValue={initial.audience ?? "family-shared"} name="audience">
            {audienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="content-checkbox">
          <input defaultChecked={toCheckedValue(initial.featured)} name="featured" type="checkbox" />
          <span>recent 상단 강조</span>
        </label>
      </div>

      <label className="form-label">
        요약
        <textarea
          className="text-input text-input--tall"
          defaultValue={toTextValue(initial.excerpt)}
          name="excerpt"
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

      <label className="form-label">
        대표 이미지 키 또는 URL
        <input className="text-input" defaultValue={toTextValue(initial.imageUrl)} name="imageUrl" type="text" />
      </label>
    </>
  );
}

export function GalleryFormFields(props: {
  initial?: Partial<GalleryRecordInput>;
}) {
  const initial = props.initial ?? {};

  return (
    <>
      <div className="grid-two">
        <label className="form-label">
          제목
          <input className="text-input" defaultValue={toTextValue(initial.title)} name="title" required type="text" />
        </label>
        <label className="form-label">
          슬러그
          <input
            className="text-input"
            defaultValue={toTextValue(initial.slug)}
            name="slug"
            placeholder="비워 두면 제목으로 자동 생성"
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
          노출 범위
          <select
            className="text-input"
            defaultValue={initial.visibilityScope ?? "all"}
            name="visibilityScope"
          >
            {visibilityScopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          대상
          <select className="text-input" defaultValue={initial.audience ?? "family-shared"} name="audience">
            {audienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="content-checkbox">
        <input defaultChecked={toCheckedValue(initial.featured)} name="featured" type="checkbox" />
        <span>recent 상단 강조</span>
      </label>

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
        대표 이미지 키 또는 URL
        <input className="text-input" defaultValue={toTextValue(initial.imageUrl)} name="imageUrl" type="text" />
      </label>
    </>
  );
}

export function DiaryFormFields(props: {
  initial?: Partial<DiaryRecordInput>;
}) {
  const initial = props.initial ?? {};

  return (
    <>
      <div className="grid-two">
        <label className="form-label">
          제목
          <input className="text-input" defaultValue={toTextValue(initial.title)} name="title" required type="text" />
        </label>
        <label className="form-label">
          슬러그
          <input
            className="text-input"
            defaultValue={toTextValue(initial.slug)}
            name="slug"
            placeholder="비워 두면 제목으로 자동 생성"
            type="text"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          무드 배지
          <input className="text-input" defaultValue={toTextValue(initial.moodLabel)} name="moodLabel" type="text" />
        </label>
        <label className="form-label">
          노출 범위
          <select
            className="text-input"
            defaultValue={initial.visibilityScope ?? "private"}
            name="visibilityScope"
          >
            {visibilityScopeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-two">
        <label className="form-label">
          대상
          <select className="text-input" defaultValue={initial.audience ?? "personal"} name="audience">
            {audienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="content-checkbox">
          <input defaultChecked={toCheckedValue(initial.highlighted)} name="highlighted" type="checkbox" />
          <span>recent 상단 강조</span>
        </label>
      </div>

      <label className="form-label">
        한 줄 요약
        <textarea
          className="text-input text-input--tall"
          defaultValue={toTextValue(initial.excerpt)}
          name="excerpt"
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
