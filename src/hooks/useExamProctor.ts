import { useEffect, useRef, useState, useCallback } from 'react';
import { CheatViolation, ViolationType } from '../types';

interface UseExamProctorOptions {
  enabled: boolean;
  maxViolations?: number;
  onViolation?: (violation: CheatViolation) => void;
  onViolationLimitReached?: () => void;
}

export function useExamProctor({
  enabled,
  maxViolations = 5,
  onViolation,
  onViolationLimitReached,
}: UseExamProctorOptions) {
  const [violations, setViolations] = useState<CheatViolation[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [latestViolationAlert, setLatestViolationAlert] = useState<CheatViolation | null>(null);

  // Debounce ref to avoid registering 5 events simultaneously when 1 tab switch fires both blur and visibilitychange
  const lastViolationTimeRef = useRef<number>(0);
  const onViolationRef = useRef(onViolation);
  const onLimitReachedRef = useRef(onViolationLimitReached);

  useEffect(() => {
    onViolationRef.current = onViolation;
    onLimitReachedRef.current = onViolationLimitReached;
  }, [onViolation, onViolationLimitReached]);

  const recordViolation = useCallback((type: ViolationType, title: string, description: string) => {
    const now = Date.now();
    // Allow at most 1 violation of same kind per 1.5 seconds to prevent blur + visibility duplicate logging
    if (now - lastViolationTimeRef.current < 1200) {
      return;
    }
    lastViolationTimeRef.current = now;

    const date = new Date(now);
    const timeFormatted = `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

    const newViolation: CheatViolation = {
      id: `viol-${now}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      title,
      description,
      timestamp: now,
      timeFormatted,
    };

    setViolations((prev) => {
      const updated = [...prev, newViolation];
      if (updated.length >= maxViolations) {
        if (onLimitReachedRef.current) {
          onLimitReachedRef.current();
        }
      }
      return updated;
    });

    setLatestViolationAlert(newViolation);

    if (onViolationRef.current) {
      onViolationRef.current(newViolation);
    }
  }, [maxViolations]);

  const dismissViolationAlert = useCallback(() => {
    setLatestViolationAlert(null);
  }, []);

  // Request Fullscreen
  const requestFullscreen = useCallback(async () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (e) {
      console.warn('Fullscreen request denied or not supported:', e);
    }
  }, []);

  // Exit Fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      const doc = document as any;
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (e) {
      // ignore
    }
  }, []);

  // Screen WakeLock for mobile phones so display stays awake
  useEffect(() => {
    if (!enabled) return;
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        // wakeLock might fail if battery saver is on
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        try {
          wakeLock.release();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [enabled]);

  // Main Anti-Cheat Event Listeners
  useEffect(() => {
    if (!enabled) return;

    // 1. Visibility Change (Tab switch, home button pressed on mobile, app switched)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation(
          'tab_switch',
          'Таб солих / Гадны програм',
          'Шалгалтын хуудсыг орхиж өөр таб эсвэл програм руу шилжсэн байна.'
        );
      }
    };

    // 2. Window Blur (User clicked outside browser window or switched apps)
    const handleBlur = () => {
      recordViolation(
        'window_blur',
        'Цонх идэвхгүй болсон',
        'Шалгалтын цонхноос өөр газар хандсан эсвэл хажуугийн цонх нээсэн байна.'
      );
    };

    // 3. Fullscreen change listener
    const handleFullscreenChange = () => {
      const isCurrentlyFs = Boolean(
        document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement
      );
      setIsFullscreen(isCurrentlyFs);
      if (!isCurrentlyFs && enabled) {
        recordViolation(
          'fullscreen_exit',
          'Дэлгэц бүтэн биш горимд шилжсэн',
          'Сурагч шалгалтын бүтэн дэлгэцийн горимоос гарсан байна.'
        );
      }
    };

    // 4. Keyboard Blocker (Ctrl+C, Ctrl+V, F12, DevTools, Ctrl+U, Print)
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        recordViolation(
          'dev_shortcut',
          'Хориглосон товчлуур (F12)',
          'Хөгжүүлэгчийн цонх (F12) нээх оролдлого бүртгэгдлээ.'
        );
        return;
      }

      // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+U, Ctrl+S, Ctrl+P
      if (isCtrlOrCmd) {
        if (key === 'c' || key === 'v' || key === 'x' || key === 'a' || key === 'u' || key === 'p' || key === 's') {
          e.preventDefault();
          e.stopPropagation();
          const actionMap: Record<string, string> = {
            c: 'Хуулах (Copy - Ctrl+C)',
            v: 'Буулгах (Paste - Ctrl+V)',
            x: 'Таслах (Cut - Ctrl+X)',
            a: 'Бүгдийг сонгох (Ctrl+A)',
            u: 'Эх код харах (Ctrl+U)',
            p: 'Хэвлэх (Ctrl+P)',
            s: 'Хуудас хадгалах (Ctrl+S)',
          };
          recordViolation(
            'forbidden_key',
            'Хориглосон товчлуурын хослол',
            `${actionMap[key] || key} үйлдэл хийхийг хориглосон бөгөөд оролдлогыг бүртгэв.`
          );
          return;
        }

        // Prevent Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
        if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
          e.preventDefault();
          e.stopPropagation();
          recordViolation(
            'dev_shortcut',
            'Хөгжүүлэгчийн хэрэгсэл (DevTools)',
            'Код шалгах DevTools нээх оролдлогыг блоклож, зөрчлийг бүртгэв.'
          );
          return;
        }
      }

      // Prevent Alt+Tab if key event captures it
      if (e.altKey && (key === 'tab' || e.key === 'Tab')) {
        e.preventDefault();
        recordViolation(
          'forbidden_key',
          'Цонх солих оролдлого (Alt+Tab)',
          'Alt+Tab товчлуурын хослолоор өөр програм руу шилжих оролдлого бүртгэгдлээ.'
        );
      }
    };

    // 5. Copy, Cut, Paste prevention
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation(
        'copy_attempt',
        'Текст хуулах (Copy) оролдлого',
        'Асуултын текст эсвэл хариултыг хуулбарлахыг хориглосон байна.'
      );
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation(
        'paste_attempt',
        'Текст буулгах (Paste) оролдлого',
        'Гадны эх үүсвэрээс текст буулгахыг хориглосон байна.'
      );
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation(
        'cut_attempt',
        'Текст таслах (Cut) оролдлого',
        'Текст таслах үйлдэл хориглогдсон байна.'
      );
    };

    // 6. Context Menu (Right Click or Long Press on mobile)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation(
        'context_menu',
        'Хулганы баруун товч / Цэс дуудах',
        'Баруун товч дарах эсвэл утасны дэлгэц дээр удаан дарах цэс хориглогдсон.'
      );
    };

    // Attach listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enabled, recordViolation]);

  return {
    violations,
    violationCount: violations.length,
    latestViolationAlert,
    dismissViolationAlert,
    isFullscreen,
    requestFullscreen,
    exitFullscreen,
    recordViolation,
    setViolations,
  };
}
