import type React from 'react';
import { useRef } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, X } from 'lucide-react';
import { Button, FixedBottomActions, Input, RichTextEditor, toast } from '@/components';
import { communityApi, getUserMessage } from '@/apis';
import {
  BOARD_ATTACHMENT_ACCEPT,
  createFileAttachmentPreviews,
  formatFileSize,
  revokeUploadPreviews,
  type FileAttachmentPreview,
  type UploadPreview,
} from '@/utils/uploadPolicy';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { FREE_BOARD_CONFIG, type PlaygroundBoardConfig } from '../../boardConfig';

const getPlainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

interface FreeBoardWriteProps {
  config?: PlaygroundBoardConfig;
}

const FreeBoardWrite = ({ config = FREE_BOARD_CONFIG }: FreeBoardWriteProps) => {
  const navigate = useNavigate();
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const [attachments, setAttachments] = useState<FileAttachmentPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const dirty = Boolean(title.trim() || content.trim() || previews.length > 0 || attachments.length > 0);
  const { confirmLeave } = useUnsavedChanges(dirty && !submitting);

  useEffect(
    () => () => {
      revokeUploadPreviews(previews);
    },
    [previews],
  );

  const handleCancel = async () => {
    if (await confirmLeave()) {
      navigate(config.listPath);
    }
  };

  const handleAttachmentButtonClick = () => {
    attachmentInputRef.current?.click();
  };

  const handleAttachmentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const nextAttachments = createFileAttachmentPreviews(files, attachments.length);
    setAttachments((currentAttachments) => [...currentAttachments, ...nextAttachments]);
    event.target.value = '';
  };

  const handleAttachmentRemove = (attachmentId: string) => {
    setAttachments((currentAttachments) => currentAttachments.filter((attachment) => attachment.id !== attachmentId));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || (!getPlainText(content) && previews.length === 0)) {
      toast('제목과 본문을 입력해주세요.', { tone: 'warning' });
      return;
    }

    setSubmitting(true);

    try {
      const post = await communityApi.createPost({
        title: title.trim(),
        content,
        type: config.type,
        imageFiles: previews,
      });

      toast('게시글을 등록했습니다.', { tone: 'success' });
      navigate(config.getDetailPath(post.id), { replace: true });
    } catch (error) {
      toast(getUserMessage(error), { tone: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container write-page">
      <header className="write-page__header">
        <span className="board-page__eyebrow">{config.title}</span>
        <h2>글쓰기</h2>
        <p>에디터에서 본문을 작성하고 원하는 위치에 이미지를 넣을 수 있습니다.</p>
      </header>

      <form className="write-page__form" onSubmit={handleSubmit}>
        <Input label="제목" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required />
        <RichTextEditor
          label="본문"
          value={content}
          onChange={setContent}
          imageCount={previews.length}
          onImagesAdd={(nextPreviews) => setPreviews((currentPreviews) => [...currentPreviews, ...nextPreviews])}
          required
        />

        <section className="file-attachments" aria-labelledby="file-attachments-title">
          <div className="file-attachments__header">
            <div>
              <h3 id="file-attachments-title">파일 첨부</h3>
              <p>이미지는 에디터 안에 넣고, 일반 파일은 여기에 첨부합니다.</p>
            </div>
            <Button type="button" variant="outline" tone="neutral" size="sm" leftIcon={<Paperclip size={16} />} onClick={handleAttachmentButtonClick}>
              파일 선택
            </Button>
          </div>
          <input
            ref={attachmentInputRef}
            type="file"
            accept={BOARD_ATTACHMENT_ACCEPT}
            multiple
            className="file-attachments__input"
            onChange={handleAttachmentsChange}
          />
          {attachments.length > 0 ? (
            <ul className="file-attachments__list">
              {attachments.map((attachment) => (
                <li key={attachment.id} className="file-attachments__item">
                  <span className="file-attachments__icon">{attachment.extension || 'FILE'}</span>
                  <span className="file-attachments__name">{attachment.name}</span>
                  <span className="file-attachments__size">{formatFileSize(attachment.size)}</span>
                  <button type="button" aria-label={`${attachment.name} 삭제`} onClick={() => handleAttachmentRemove(attachment.id)}>
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="file-attachments__empty">첨부된 파일이 없습니다.</p>
          )}
        </section>

        <FixedBottomActions>
          <Button type="button" variant="outline" tone="neutral" onClick={handleCancel}>
            취소
          </Button>
          <Button type="submit" loading={submitting}>
            등록
          </Button>
        </FixedBottomActions>
      </form>
    </section>
  );
};

export default FreeBoardWrite;
