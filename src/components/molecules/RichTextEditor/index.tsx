import type React from 'react';
import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import { Bold, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Quote, Redo2, Undo2, Unlink } from 'lucide-react';
import { IconButton } from '@/components/atoms';
import { createUploadPreviews, type UploadPreview } from '@/utils/uploadPolicy';
import { isSafeRichTextUrl } from '@/utils/richTextSecurity';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onImagesAdd?: (previews: UploadPreview[]) => void;
  imageCount?: number;
  required?: boolean;
}

export const RichTextEditor = ({
  label,
  value,
  onChange,
  onImagesAdd,
  imageCount = 0,
  required = false,
}: RichTextEditorProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: false,
        inline: false,
      }),
      Link.configure({
        autolink: true,
        defaultProtocol: 'https',
        openOnClick: false,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'rich-text-editor__content',
        'aria-label': label,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) {
      return;
    }

    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!editor || files.length === 0) {
      return;
    }

    const previews = createUploadPreviews(files).map((preview, index) => ({
      ...preview,
      sortOrder: imageCount + index,
      isCover: imageCount === 0 && index === 0,
    }));

    previews.forEach((preview) => {
      editor.chain().focus().setImage({ src: preview.url, alt: preview.alt }).run();
    });

    onImagesAdd?.(previews);
    event.target.value = '';
  };

  const handleLinkClick = () => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const nextUrl = window.prompt('링크 URL을 입력해주세요.', previousUrl ?? 'https://');

    if (nextUrl === null) {
      return;
    }

    if (!nextUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    if (!isSafeRichTextUrl(nextUrl)) {
      window.alert('http, https, mailto, tel 링크만 사용할 수 있습니다.');
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: nextUrl.trim() }).run();
  };

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__label">
        {label}
        {required ? <span aria-hidden="true">*</span> : null}
      </div>
      <div className="rich-text-editor__toolbar" aria-label={`${label} 도구`}>
        <IconButton
          label="굵게"
          icon={<Bold size={18} />}
          size="sm"
          variant={editor?.isActive('bold') ? 'soft' : 'ghost'}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <IconButton
          label="기울임"
          icon={<Italic size={18} />}
          size="sm"
          variant={editor?.isActive('italic') ? 'soft' : 'ghost'}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <IconButton
          label="목록"
          icon={<List size={18} />}
          size="sm"
          variant={editor?.isActive('bulletList') ? 'soft' : 'ghost'}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <IconButton
          label="번호 목록"
          icon={<ListOrdered size={18} />}
          size="sm"
          variant={editor?.isActive('orderedList') ? 'soft' : 'ghost'}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <IconButton
          label="인용"
          icon={<Quote size={18} />}
          size="sm"
          variant={editor?.isActive('blockquote') ? 'soft' : 'ghost'}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <IconButton label="링크" icon={<LinkIcon size={18} />} size="sm" onClick={handleLinkClick} />
        <IconButton
          label="링크 해제"
          icon={<Unlink size={18} />}
          size="sm"
          onClick={() => editor?.chain().focus().unsetLink().run()}
        />
        <IconButton label="이미지 첨부" icon={<ImagePlus size={18} />} size="sm" onClick={handleImageButtonClick} />
        <IconButton label="실행 취소" icon={<Undo2 size={18} />} size="sm" onClick={() => editor?.chain().focus().undo().run()} />
        <IconButton label="다시 실행" icon={<Redo2 size={18} />} size="sm" onClick={() => editor?.chain().focus().redo().run()} />
      </div>
      <EditorContent editor={editor} />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="rich-text-editor__file"
        onChange={handleImagesChange}
      />
    </div>
  );
};
