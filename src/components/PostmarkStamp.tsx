import './postmark-stamp.css';

type PostmarkStampProps = {
  label: string;
  detail: string;
  className?: string;
};

export function PostmarkStamp({ label, detail, className = '' }: PostmarkStampProps) {
  return (
    <div className={`postmark-stamp ${className}`.trim()} aria-label={`${label}, ${detail}`}>
      <b>{label}</b>
      <small>{detail}</small>
    </div>
  );
}
