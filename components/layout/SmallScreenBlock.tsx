"use client";

import { useEffect, useState } from "react";

export function SmallScreenBlock() {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 959px)");
    setIsSmall(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSmall(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!isSmall) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-lv1 px-8 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
        <svg
          className="h-8 w-8 text-brand-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3"
          />
        </svg>
      </div>
      <h2 className="mb-3 text-xl font-semibold text-ink-1">
        Màn hình quá nhỏ
      </h2>
      <p className="max-w-xs text-sm leading-relaxed text-ink-3">
        Trang này yêu cầu màn hình rộng tối thiểu <span className="font-medium text-ink-2">960px</span>. Vui lòng mở trên máy tính hoặc màn hình lớn hơn để tiếp tục.
      </p>
    </div>
  );
}
