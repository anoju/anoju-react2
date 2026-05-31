import { useCallback, useEffect, useState } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button, Input, Select } from '@/components/atoms';
import { DataList } from '@/components/molecules';
import { getUserMessage, userApi } from '@/apis';
import type { UserRecord } from '@/types/domain';
import { formatRelativeTime } from '@/utils/community';
import { ADMIN_MEMBERS_PATH } from '@/constants/app';

const statusOptions = [
  { value: '', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'suspended', label: '정지' },
  { value: 'withdrawn', label: '탈퇴' },
];

const roleLabels: Record<string, string> = {
  admin: '관리자',
  user: '회원',
};

const statusLabels: Record<string, string> = {
  active: '활성',
  suspended: '정지',
  withdrawn: '탈퇴',
};

const getMemberName = (member: UserRecord) => member.nickname ?? member.email ?? member.id;

const Members = () => {
  const [members, setMembers] = useState<UserRecord[]>([]);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(
    async (nextPage = 1) => {
      if (nextPage === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const result = await userApi.listMembers({
          page: nextPage,
          perPage: 20,
          status,
          keyword,
        });
        setMembers((current) => (nextPage === 1 ? result.items : [...current, ...result.items]));
        setPage(result.page);
        setTotalPages(result.totalPages);
      } catch (loadError) {
        setError(getUserMessage(loadError));
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [keyword, status],
  );

  useEffect(() => {
    void loadMembers(1);
  }, [loadMembers]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadMembers(1);
  };

  return (
    <section className="container admin-page">
      <header className="admin-page__header">
        <span className="board-page__eyebrow">Admin</span>
        <h2>회원 관리</h2>
        <p>회원 목록을 확인하고 정지 상태와 관리자 메모를 관리합니다.</p>
      </header>

      <form className="admin-filter" onSubmit={handleSearchSubmit}>
        <Input
          label="검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="닉네임 또는 이메일"
          leftIcon={<Search size={16} />}
        />
        <Select label="상태" value={status} options={statusOptions} onChange={(event) => setStatus(event.target.value)} />
        <Button type="submit">검색</Button>
      </form>

      <DataList
        items={members}
        getKey={(member) => member.id}
        renderItem={(member) => (
          <Link className="admin-member-item" to={`${ADMIN_MEMBERS_PATH}/${member.id}`}>
            <span>
              <strong>{getMemberName(member)}</strong>
              <small>{member.email ?? member.id}</small>
            </span>
            <span className="admin-member-item__badges">
              <em>{roleLabels[member.role] ?? member.role}</em>
              <em data-state={member.status}>{statusLabels[member.status] ?? member.status}</em>
            </span>
            <small>{formatRelativeTime(member.created)} 가입</small>
          </Link>
        )}
        loadingInitial={loadingInitial}
        loadingMore={loadingMore}
        hasMore={page < totalPages}
        error={error}
        emptyTitle="표시할 회원이 없습니다."
        onLoadMore={() => void loadMembers(page + 1)}
        onRetry={() => void loadMembers(1)}
      />
    </section>
  );
};

export default Members;
