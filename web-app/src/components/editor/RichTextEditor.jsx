import { useMemo } from 'react';
import ReactQuill from 'react-quill';

/*
 * RichTextEditor — thin wrapper around react-quill (Snow theme).
 *
 * SANITIZATION NOTE:
 * Quill produces HTML. Never trust it blindly. The backend MUST sanitize the
 * submitted HTML server-side (e.g. OWASP Java HTML Sanitizer / jsoup allowlist)
 * before persisting or rendering to other users. If this HTML is ever rendered
 * client-side via dangerouslySetInnerHTML, run it through DOMPurify first.
 * The toolbar below is intentionally limited to a safe allowlist of formats.
 */

const DEFAULT_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    [{ align: [] }],
    ['clean'],
  ],
  clipboard: { matchVisual: false },
};

const DEFAULT_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'blockquote',
  'code-block',
  'link',
  'align',
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Share the details — specs, ride impressions, ownership notes…',
  readOnly = false,
}) {
  // Memoize modules/formats so Quill doesn't reinitialize on every render.
  const modules = useMemo(() => DEFAULT_MODULES, []);
  const formats = useMemo(() => DEFAULT_FORMATS, []);

  return (
    <div className="ah-editor">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      <div className="ah-muted small mt-1">
        Content is sanitized on the server before publishing.
      </div>
    </div>
  );
}
