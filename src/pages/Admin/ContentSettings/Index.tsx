import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button, Checkbox, Select } from '@/components/atoms';
import { toast } from '@/components/feedback';
import { contentSettingApi, getUserMessage } from '@/apis';
import type {
  ContentDeletePermission,
  ContentEditPermission,
  ContentSettingRecord,
  ContentSettingStatus,
  ContentViewPermission,
  ContentWritePermission,
} from '@/types/domain';
import {
  contentStatusLabels,
  defaultContentSettings,
  deletePermissionLabels,
  editPermissionLabels,
  viewPermissionLabels,
  writePermissionLabels,
} from '../constants';

type EditableSetting = Pick<
  ContentSettingRecord,
  | 'writePermission'
  | 'editPermission'
  | 'deletePermission'
  | 'viewPermission'
  | 'showComments'
  | 'allowComments'
  | 'showReactions'
  | 'allowReactions'
  | 'showShare'
  | 'showReport'
  | 'showInList'
  | 'status'
>;

const writePermissionOptions = Object.entries(writePermissionLabels).map(([value, label]) => ({ value, label }));
const editPermissionOptions = Object.entries(editPermissionLabels).map(([value, label]) => ({ value, label }));
const deletePermissionOptions = Object.entries(deletePermissionLabels).map(([value, label]) => ({ value, label }));
const viewPermissionOptions = Object.entries(viewPermissionLabels).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(contentStatusLabels).map(([value, label]) => ({ value, label }));

const mergeWithDefaults = (settings: ContentSettingRecord[]) =>
  defaultContentSettings.map((defaultSetting) => {
    const savedSetting = settings.find((setting) => setting.contentKey === defaultSetting.contentKey);

    return savedSetting ?? ({ ...defaultSetting, id: `missing-${defaultSetting.contentKey}` } as ContentSettingRecord);
  });

const getEditableSetting = (setting: ContentSettingRecord): EditableSetting => ({
  writePermission: setting.writePermission,
  editPermission: setting.editPermission,
  deletePermission: setting.deletePermission,
  viewPermission: setting.viewPermission,
  showComments: setting.showComments,
  allowComments: setting.allowComments,
  showReactions: setting.showReactions,
  allowReactions: setting.allowReactions,
  showShare: setting.showShare,
  showReport: setting.showReport,
  showInList: setting.showInList,
  status: setting.status,
});

const getCreatePayload = (setting: ContentSettingRecord, draft: EditableSetting) => ({
  contentKey: setting.contentKey,
  label: setting.label,
  group: setting.group,
  contentType: setting.contentType,
  listPath: setting.listPath,
  ...draft,
});

const ContentSettings = () => {
  const [settings, setSettings] = useState<ContentSettingRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, EditableSetting>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const records = await contentSettingApi.list();
        const mergedSettings = mergeWithDefaults(records);
        setSettings(mergedSettings);
        setDrafts(
          Object.fromEntries(
            mergedSettings.map((setting) => [setting.contentKey, getEditableSetting(setting)]),
          ),
        );
      } catch (loadError) {
        setError(getUserMessage(loadError));
        const fallbackSettings = mergeWithDefaults([]);
        setSettings(fallbackSettings);
        setDrafts(
          Object.fromEntries(
            fallbackSettings.map((setting) => [setting.contentKey, getEditableSetting(setting)]),
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const updateDraft = <TKey extends keyof EditableSetting>(
    contentKey: string,
    field: TKey,
    value: EditableSetting[TKey],
  ) => {
    setDrafts((current) => ({
      ...current,
      [contentKey]: {
        ...current[contentKey],
        [field]: value,
      },
    }));
  };

  const handleSave = async (setting: ContentSettingRecord) => {
    const draft = drafts[setting.contentKey];

    if (!draft) {
      return;
    }

    setSavingKey(setting.contentKey);

    try {
      const updated = setting.id.startsWith('missing-')
        ? await contentSettingApi.create(getCreatePayload(setting, draft))
        : await contentSettingApi.update(setting.id, draft);

      setSettings((current) =>
        current.map((item) => (item.contentKey === updated.contentKey ? updated : item)),
      );
      setDrafts((current) => ({
        ...current,
        [updated.contentKey]: getEditableSetting(updated),
      }));
      toast('콘텐츠 운영 설정을 저장했습니다.', { tone: 'success' });
    } catch (saveError) {
      toast(getUserMessage(saveError), { tone: 'danger' });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <section className="container admin-page">
      <header className="admin-page__header">
        <span className="board-page__eyebrow">Admin</span>
        <h2>콘텐츠 운영 설정</h2>
        <p>모든 게시판과 갤러리의 권한, 댓글, 반응, 공유, 신고 노출을 관리합니다.</p>
      </header>

      {error ? <p className="admin-page__notice">{error} 기본 설계값으로 화면을 표시합니다.</p> : null}
      {loading ? <p className="admin-page__notice">운영 설정을 불러오고 있습니다.</p> : null}

      <div className="admin-setting-list">
        {settings.map((setting) => {
          const draft = drafts[setting.contentKey] ?? getEditableSetting(setting);
          const isMissing = setting.id.startsWith('missing-');

          return (
            <article className="admin-setting-card" key={setting.contentKey}>
              <header className="admin-setting-card__header">
                <span>
                  <strong>{setting.label}</strong>
                  <small>
                    {setting.group} · {setting.contentType} · {setting.listPath}
                  </small>
                </span>
                {isMissing ? <em>기본 데이터 필요</em> : null}
              </header>

              <div className="admin-setting-card__grid">
                <Select
                  label="작성 권한"
                  value={draft.writePermission}
                  options={writePermissionOptions}
                  onChange={(event) =>
                    updateDraft(setting.contentKey, 'writePermission', event.target.value as ContentWritePermission)
                  }
                />
                <Select
                  label="수정 권한"
                  value={draft.editPermission}
                  options={editPermissionOptions}
                  onChange={(event) =>
                    updateDraft(setting.contentKey, 'editPermission', event.target.value as ContentEditPermission)
                  }
                />
                <Select
                  label="삭제 권한"
                  value={draft.deletePermission}
                  options={deletePermissionOptions}
                  onChange={(event) =>
                    updateDraft(setting.contentKey, 'deletePermission', event.target.value as ContentDeletePermission)
                  }
                />
                <Select
                  label="보기 권한"
                  value={draft.viewPermission}
                  options={viewPermissionOptions}
                  onChange={(event) =>
                    updateDraft(setting.contentKey, 'viewPermission', event.target.value as ContentViewPermission)
                  }
                />
                <Select
                  label="운영 상태"
                  value={draft.status}
                  options={statusOptions}
                  onChange={(event) =>
                    updateDraft(setting.contentKey, 'status', event.target.value as ContentSettingStatus)
                  }
                />
              </div>

              <div className="admin-setting-card__checks">
                <Checkbox
                  label="댓글 영역 표시"
                  checked={draft.showComments}
                  onChange={(event) => updateDraft(setting.contentKey, 'showComments', event.target.checked)}
                />
                <Checkbox
                  label="새 댓글 작성 허용"
                  checked={draft.allowComments}
                  onChange={(event) => updateDraft(setting.contentKey, 'allowComments', event.target.checked)}
                />
                <Checkbox
                  label="반응 영역 표시"
                  checked={draft.showReactions}
                  onChange={(event) => updateDraft(setting.contentKey, 'showReactions', event.target.checked)}
                />
                <Checkbox
                  label="새 반응 허용"
                  checked={draft.allowReactions}
                  onChange={(event) => updateDraft(setting.contentKey, 'allowReactions', event.target.checked)}
                />
                <Checkbox
                  label="공유하기 노출"
                  checked={draft.showShare}
                  onChange={(event) => updateDraft(setting.contentKey, 'showShare', event.target.checked)}
                />
                <Checkbox
                  label="신고하기 노출"
                  checked={draft.showReport}
                  onChange={(event) => updateDraft(setting.contentKey, 'showReport', event.target.checked)}
                />
                <Checkbox
                  label="목록 노출"
                  checked={draft.showInList}
                  onChange={(event) => updateDraft(setting.contentKey, 'showInList', event.target.checked)}
                />
              </div>

              <Button
                type="button"
                size="sm"
                leftIcon={<Save size={16} />}
                loading={savingKey === setting.contentKey}
                onClick={() => void handleSave(setting)}
              >
                저장
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ContentSettings;
