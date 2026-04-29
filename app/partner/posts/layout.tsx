export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-bg-lv2">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </div>
    </div>
  );
}
