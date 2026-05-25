import type React from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FixedBottomActions, Input, Select, toast } from '@/components';
import { getUserMessage, picLogApi } from '@/apis';
import { PIC_LOG_PATH } from '@/constants/app';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { formatPicLogDate, getDateKey } from '../data';
import type { PicLogVisibility } from '@/types/domain';

const visibilityOptions = [
  { value: 'invited', label: '초대된 친구만' },
  { value: 'private', label: '나만 보기' },
  { value: 'link', label: '링크를 아는 사람' },
  { value: 'public', label: '전체 공개' },
];

const PicLogNew = () => {
  const navigate = useNavigate();
  const today = useMemo(() => getDateKey(new Date()), []);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [visibility, setVisibility] = useState<PicLogVisibility>('invited');
  const [submitting, setSubmitting] = useState(false);
  const dirty = Boolean(title.trim() || date !== today || visibility !== 'invited');
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(PIC_LOG_PATH);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const log = await picLogApi.createLog({
        title: title.trim() || `${formatPicLogDate(date)}의 picLog`,
        logDate: date,
        visibility,
      });

      toast('picLog를 만들었습니다. 첫 사진을 추가해보세요.', { tone: 'success' });
      navigate(`${PIC_LOG_PATH}/${log.id}/add`, { replace: true });
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container write-page">
      <header className="write-page__header">
        <span className="board-page__eyebrow">picLog</span>
        <h2>picLog 만들기</h2>
        <p>사진이 등록된 시간과 날짜만 친구들에게 보여집니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        <Input
          label="로그 제목"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={`${formatPicLogDate(today)}의 picLog`}
          maxLength={40}
        />
        <Input
          label="기록 날짜"
          type="date"
          value={date}
          max={today}
          onChange={(event) => setDate(event.target.value)}
          required
        />
        <Select
          label="공개 범위"
          value={visibility}
          options={visibilityOptions}
          onChange={(event) => setVisibility(event.target.value as PicLogVisibility)}
        />

        <FixedBottomActions>
          <Button type="button" variant="outline" tone="neutral" onClick={handleCancel}>
            취소
          </Button>
          <Button type="submit" loading={submitting}>
            만들기
          </Button>
        </FixedBottomActions>
      </form>
    </section>
  );
};

export default PicLogNew;
