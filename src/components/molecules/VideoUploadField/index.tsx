import type React from 'react';
import { FileVideo, X } from 'lucide-react';
import { Button } from '@/components/atoms';
import { VideoPlayer } from '@/components/molecules/VideoPlayer';
import {
  createVideoUploadPreview,
  formatFileSize,
  formatVideoDuration,
  getVideoUploadPolicyText,
  type VideoUploadOptions,
  type VideoUploadPreview,
} from '@/utils/uploadPolicy';

interface VideoUploadFieldProps {
  value: VideoUploadPreview | null;
  title: string;
  poster?: string;
  options: VideoUploadOptions;
  uploading?: boolean;
  onChange: (preview: VideoUploadPreview) => void;
  onRemove: () => void;
}

export const VideoUploadField = ({
  value,
  title,
  poster,
  options,
  uploading = false,
  onChange,
  onRemove,
}: VideoUploadFieldProps) => {
  const handleVideoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextPreview = await createVideoUploadPreview(file, options);

    if (nextPreview) {
      onChange(nextPreview);
    }

    event.target.value = '';
  };

  const policyText = getVideoUploadPolicyText(options);

  return (
    <section className="video-upload-field" aria-label="동영상 업로드">
      {value ? (
        <div className="video-upload-field__preview" aria-label="선택한 동영상">
          <VideoPlayer src={value.url} title={title || value.name} poster={poster} />
          <div className="video-upload-field__meta">
            <span>
              {value.name} · {formatFileSize(value.size)} · {formatVideoDuration(value.duration)} · {value.width}x{value.height}
            </span>
            <Button type="button" variant="ghost" tone="danger" size="sm" leftIcon={<X size={16} />} onClick={onRemove}>
              제거
            </Button>
          </div>
        </div>
      ) : null}

      <label className="video-upload-field__trigger">
        <input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={uploading} onChange={(event) => void handleVideoChange(event)} />
        <span>
          <FileVideo size={18} /> 동영상 선택
        </span>
      </label>

      {policyText ? <p className="video-upload-field__policy">{policyText}</p> : null}
    </section>
  );
};
