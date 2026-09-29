'use client';

import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import { getUploadSignature } from './upload-actions';

const MAX_MB = 10;

export default function ImageUploader({
  urls,
  onChange,
  label = 'Upload Photos',
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList) => {
    setError(null);
    setUploading(true);
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
        if (file.size > MAX_MB * 1024 * 1024) throw new Error(`${file.name} is larger than ${MAX_MB} MB.`);

        const sig = await getUploadSignature();
        const body = new FormData();
        body.append('file', file);
        body.append('api_key', sig.apiKey);
        body.append('timestamp', String(sig.timestamp));
        body.append('folder', sig.folder);
        body.append('signature', sig.signature);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
          method: 'POST',
          body,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? 'Upload failed');
        uploaded.push(data.secure_url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      // Keep whatever finished uploading, even if a later file failed
      if (uploaded.length > 0) onChange([...urls, ...uploaded]);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}

      {urls.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          {urls.map((url) => (
            <Box key={url} sx={{ position: 'relative', width: 84, height: 84 }}>
              <Box
                component="img"
                src={url}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
              />
              <IconButton
                size="small"
                onClick={() => onChange(urls.filter((u) => u !== url))}
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
        }}
      />
            <Button
        variant="outlined"
        size="small"
        startIcon={uploading ? <CircularProgress size={16} /> : <AddPhotoAlternateIcon />}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : label}
      </Button>
    </Box>
  );
}