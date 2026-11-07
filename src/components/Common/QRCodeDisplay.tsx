import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, ExternalLink } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  subtitle?: string;
  size?: number;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  title = 'Scan QR Code',
  subtitle = 'Point camera or scanner',
  size = 220,
  className = ''
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value || !value.trim()) {
      setDataUrl('');
      setError(null);
      return;
    }

    let isMounted = true;
    QRCode.toDataURL(value.trim(), {
      width: size * 2, // High resolution retina rendering
      margin: 1.5,
      color: {
        dark: '#121212',
        light: '#FFFFFF'
      }
    })
      .then(url => {
        if (isMounted) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('QR code generation error:', err);
          setError('Failed to generate QR code');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `tmc-qr-code-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!value || !value.trim()) {
    return (
      <div className={`p-6 text-center rounded-2xl border-2 border-dashed border-[#E8E3D9] bg-[#FAF8F5] text-neutral-400 space-y-2 ${className}`}>
        <QrCode className="w-10 h-10 mx-auto text-neutral-300" />
        <div className="text-xs font-medium text-neutral-600">No Link Configured</div>
        <div className="text-[11px] text-neutral-400 max-w-xs mx-auto">
          Add an Instagram URL, Linktree, or website link in Admin Settings to automatically generate this QR code.
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-[#E8E3D9] p-5 shadow-xs flex flex-col items-center text-center space-y-3.5 ${className}`}>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#C58B39] font-bold">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-neutral-500 mt-0.5">
            {subtitle}
          </div>
        )}
      </div>

      <div className="p-3 bg-white rounded-2xl border-2 border-[#121212] shadow-sm relative group">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Generated QR Code"
            style={{ width: `${size}px`, height: `${size}px` }}
            className="rounded-lg object-contain block mx-auto"
          />
        ) : (
          <div
            style={{ width: `${size}px`, height: `${size}px` }}
            className="flex items-center justify-center text-neutral-400 text-xs"
          >
            {error || 'Generating QR...'}
          </div>
        )}
      </div>

      <div className="w-full space-y-2">
        <a
          href={value.startsWith('http') ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono font-medium text-[#C58B39] hover:underline flex items-center justify-center gap-1 truncate max-w-full px-2"
        >
          <span className="truncate">{value}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>

        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg border border-[#DCD6C8] bg-[#FAF8F5] hover:bg-[#F2EDE4] text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-600" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          {dataUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-[#121212] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Download QR</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
