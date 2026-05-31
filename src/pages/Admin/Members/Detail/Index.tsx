import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldOff, ShieldCheck } from 'lucide-react';
import { Button, Input, Select, TextArea } from '@/components/atoms';
import { confirm, toast } from '@/components/feedback';
import { getUserMessage, userApi } from '@/apis';
import { useAuthStore } from '@/stores/authStore';
import type { UserRecord, UserStatus } from '@/types/domain';
import { formatDate, formatRelativeTime } from '@/utils/community';

const statusOptions = [
  { value: 'active', label: '활성' },
  { value: 'suspended', label: '정지' },
  { value: 'withdrawn', label: '탈퇴' },
];

const MemberDetail = () => {
  const { userId } = useParams();
  const adminUser = useAuthStore((state) => state.user);
  const [member, setMember] = useState<UserRecord | null>(null);
  const [status, setStatus] = useState<UserStatus>('active');
  const [suspendedReason, setSuspendedReason] = useState('');
  const [suspendedUntil, setSuspendedUntil] = useState('');
  const [adminMemo, setAdminMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMember = async () => {
      if (!userId) {
        setError('회원 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const record = await userApi.getMember(userId);
        setMember(record);
        setStatus(record.status);
        setSuspendedReason(record.suspendedReason ?? '');
        setSuspendedUntil(record.suspendedUntil ? record.suspendedUntil.slice(0, 16) : '');
        setAdminMemo(record.adminMemo ?? '');
      } catch (loadError) {
        setError(getUserMessage(loadError));
      } finally {
        setLoading(false);
      }
    };

    void loadMember();
  }, [userId]);

  const handleSave = async () => {
    if (!member) {
      return;
    }

    const confirmed = await confirm('회원 상태를 저장할까요?', {
      title: '회원 상태 변경',
      confirmLabel: '저장',
    });

    if (!confirmed) {
      return;
    }

    setSubmitting(true);

    try {
      const updated = await userApi.updateMemberStatus(member.id, {
        status,
        suspendedReason,
        suspendedUntil: suspendedUntil ? new Date(suspendedUntil).toISOString() : undefined,
        suspendedBy: adminUser?.id,
        adminMemo,
      });
      setMember(updated);
      toast('회원 상태를 저장했습니다.', { tone: 'success' });
    } catch (saveError) {
      toast(getUserMessage(saveError), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <section className="container admin-page">회원 정보를 불러오고 있습니다.</section>;
  }

  if (error || !member) {
    return <section className="container admin-page">{error ?? '회원 정보를 찾을 수 없습니다.'}</section>;
  }

  const memberName = member.nickname ?? member.email ?? member.id;

  return (
    <section className="container admin-page">
      <header className="admin-page__header">
        <span className="board-page__eyebrow">Admin</span>
        <h2>{memberName}</h2>
        <p>{member.email ?? '이메일 정보 없음'}</p>
      </header>

      <dl className="admin-detail-panel">
        <div>
          <dt>역할</dt>
          <dd>{member.role}</dd>
        </div>
        <div>
          <dt>현재 상태</dt>
          <dd>{member.status}</dd>
        </div>
        <div>
          <dt>가입</dt>
          <dd>{formatRelativeTime(member.created)}</dd>
        </div>
        <div>
          <dt>정지 시각</dt>
          <dd>{formatDate(member.suspendedAt)}</dd>
        </div>
      </dl>

      <div className="admin-form-card">
        <Select
          label="회원 상태"
          value={status}
          options={statusOptions}
          onChange={(event) => setStatus(event.target.value as UserStatus)}
        />
        <Input
          label="정지 만료 시각"
          type="datetime-local"
          value={suspendedUntil}
          onChange={(event) => setSuspendedUntil(event.target.value)}
          disabled={status !== 'suspended'}
        />
        <TextArea
          label="정지 사유"
          value={suspendedReason}
          onChange={(event) => setSuspendedReason(event.target.value)}
          rows={4}
          disabled={status !== 'suspended'}
        />
        <TextArea
          label="관리자 메모"
          value={adminMemo}
          onChange={(event) => setAdminMemo(event.target.value)}
          rows={4}
        />
        <Button
          type="button"
          leftIcon={status === 'suspended' ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
          loading={submitting}
          onClick={() => void handleSave()}
        >
          상태 저장
        </Button>
      </div>
    </section>
  );
};

export default MemberDetail;
