import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Card } from '../types';
import { X, Copy, Check, Download, ShieldCheck, Smartphone, ExternalLink } from 'lucide-react';

interface QrCodeModalProps {
  card: Card | null;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ card, onClose }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cardUrl = card?.url || (card ? `https://everzio.in/c/${card.card_code}` : '');

  useEffect(() => {
    if (!card) return;

    // Generate high-resolution, high error-correction QR Code with standard quiet zone
    QRCode.toDataURL(cardUrl, {
      errorCorrectionLevel: 'H', // 30% error recovery
      margin: 4, // standard 4-module white quiet zone
      width: 600, // high res for print
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then(url => setDataUrl(url))
      .catch(err => console.error('Failed to generate QR code', err));
  }, [card, cardUrl]);

  if (!card) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `EVERZIO_${card.card_code}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              EVZ
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">Card QR & NFC Payload</h3>
              <p className="text-xs text-slate-400 font-mono">{card.card_code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Business association banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-sm">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-medium">Assigned Business</span>
              <span className="font-semibold text-slate-800 text-sm">
                {card.customer_name || 'Unassigned (Available)'}
              </span>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                card.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : card.status === 'AVAILABLE'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {card.status}
            </span>
          </div>

          {/* QR Code Canvas Frame */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-100/70 rounded-2xl border border-slate-200">
            <div className="p-4 bg-white rounded-xl shadow-md border border-slate-200/70">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt={`QR code for ${card.card_code}`}
                  className="w-48 h-48 object-contain select-none"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Level H Error Correction (30% recovery) • Quiet Zone 4</span>
            </div>
          </div>

          {/* Stable URL bar */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              Stable Everzio URL (Permanent)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={cardUrl}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 shrink-0 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* NFC Writing Instructions */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-950">
              <Smartphone className="w-3.5 h-3.5 text-amber-700" />
              <span>NFC Chip Programmer Info</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Write this exact URL into the physical NFC chip using any standard NFC app (e.g. NFC Tools). When tapped, phones instantly open this card.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 active:scale-[0.99] transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Print QR
            </button>
            <a
              href={`/c/${card.card_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Test URL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
