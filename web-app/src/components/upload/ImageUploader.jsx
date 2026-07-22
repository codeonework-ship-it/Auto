import { useCallback, useRef, useState, useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

/*
 * ImageUploader — drag & drop image uploader for car/bike posts.
 *
 * Enforces the canonical image rules:
 *   - Max 20 images per post.
 *   - Allowed types: JPEG, PNG, WEBP.
 *   - Max size 5 MB each.
 *   - Min resolution 640x480 (recommended 1280x720+).
 * Shows previews and per-file validation errors. Calls onChange(validFiles[]).
 */

const MAX_FILES = 20;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MIN_WIDTH = 640;
const MIN_HEIGHT = 480;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Read image natural dimensions from a File via object URL.
function readDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight, url });
    };
    img.onerror = () => resolve({ width: 0, height: 0, url });
    img.src = url;
  });
}

async function validateFile(file, existingCount) {
  const errors = [];
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push('Unsupported type — use JPEG, PNG, or WEBP.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    errors.push(`Too large (${(file.size / 1024 / 1024).toFixed(1)} MB) — max 5 MB.`);
  }
  const { width, height, url } = await readDimensions(file);
  if (width && height && (width < MIN_WIDTH || height < MIN_HEIGHT)) {
    errors.push(`Resolution too low (${width}x${height}) — min ${MIN_WIDTH}x${MIN_HEIGHT}.`);
  }
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${existingCount}`,
    file,
    previewUrl: url,
    width,
    height,
    errors,
    valid: errors.length === 0,
  };
}

export default function ImageUploader({ onChange, maxFiles = MAX_FILES }) {
  const [items, setItems] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const inputRef = useRef(null);

  // Notify parent whenever the valid file set changes.
  useEffect(() => {
    if (onChange) onChange(items.filter((i) => i.valid).map((i) => i.file));
  }, [items, onChange]);

  // Revoke object URLs on unmount to avoid memory leaks.
  useEffect(() => {
    return () => items.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback(
    async (fileList) => {
      setGlobalError('');
      const incoming = Array.from(fileList || []);
      if (incoming.length === 0) return;

      setItems((prev) => {
        const remaining = maxFiles - prev.length;
        if (remaining <= 0) {
          setGlobalError(`You can upload at most ${maxFiles} images.`);
          return prev;
        }
        if (incoming.length > remaining) {
          setGlobalError(
            `Only ${remaining} more image(s) allowed — extra files were ignored (max ${maxFiles}).`,
          );
        }
        return prev; // actual insert happens below after async validation
      });

      // Validate (async because we read dimensions) then merge, respecting the cap.
      const validated = [];
      for (let idx = 0; idx < incoming.length; idx += 1) {
        // eslint-disable-next-line no-await-in-loop
        validated.push(await validateFile(incoming[idx], idx));
      }

      setItems((prev) => {
        const remaining = maxFiles - prev.length;
        const toAdd = validated.slice(0, Math.max(0, remaining));
        return [...prev, ...toAdd];
      });
    },
    [maxFiles],
  );

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function handleSelect(e) {
    addFiles(e.target.files);
    e.target.value = ''; // allow re-selecting the same file
  }

  function removeItem(id) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    setGlobalError('');
  }

  const validCount = items.filter((i) => i.valid).length;

  return (
    <div>
      <div
        className={`ah-dropzone ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        <FaCloudUploadAlt size={40} className="text-warning mb-2" />
        <div className="fw-semibold">Drag &amp; drop images here, or click to browse</div>
        <div className="ah-muted small mt-1">
          JPEG / PNG / WEBP · max 5 MB each · min {MIN_WIDTH}x{MIN_HEIGHT} · up to {maxFiles} images
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={handleSelect}
        />
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2 small ah-muted">
        <span>
          {validCount} valid / {items.length} selected — {maxFiles - items.length} slot(s) left
        </span>
        {items.length > 0 && (
          <Button
            variant="link"
            size="sm"
            className="p-0 text-decoration-none"
            onClick={() => {
              items.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
              setItems([]);
              setGlobalError('');
            }}
          >
            Clear all
          </Button>
        )}
      </div>

      {globalError && (
        <Alert variant="warning" className="mt-2 py-2 small">
          {globalError}
        </Alert>
      )}

      {items.length > 0 && (
        <div
          className="mt-3"
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          }}
        >
          {items.map((item) => (
            <div key={item.id}>
              <div className={`ah-thumb ${item.valid ? '' : 'is-invalid'}`}>
                <img src={item.previewUrl} alt={item.file.name} />
                <Button
                  variant={item.valid ? 'dark' : 'danger'}
                  size="sm"
                  className="ah-thumb-remove rounded-circle p-1 lh-1"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <FaTimes />
                </Button>
              </div>
              <div className="small text-truncate mt-1" title={item.file.name}>
                {item.file.name}
              </div>
              {item.errors.length > 0 && (
                <ul className="text-danger small ps-3 mb-0">
                  {item.errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
