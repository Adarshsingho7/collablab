import type { CursorData } from '../../hooks/useCollaboration';

const CURSOR_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

// Simple deterministic color generator from string
const getColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
};

export default function LiveCursors({ cursors }: { cursors: Record<string, CursorData> }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {Object.values(cursors).map(data => {
        const color = getColor(data.userId);
        return (
          <div
            key={data.userId}
            className="absolute flex flex-col items-start transition-all duration-100 ease-linear pointer-events-none"
            style={{ 
              transform: `translate(${data.cursor.x}px, ${data.cursor.y}px)` 
            }}
          >
            {/* SVG Cursor Pointer */}
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}
            >
              <path 
                d="M5.65376 21.3321L3.9212 3.90561C3.78426 2.52731 5.25055 1.57967 6.4673 2.26189L20.4578 10.1065C21.6881 10.7963 21.6212 12.5936 20.3414 13.2057L14.7733 15.8687C14.4988 16.0001 14.2818 16.2238 14.1594 16.502L11.666 22.1645C11.085 23.4842 9.21557 23.5049 8.60835 22.1979L5.65376 21.3321Z" 
                fill={color} 
                stroke="white" 
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div 
              className="px-2 py-1 ml-4 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-md"
              style={{ backgroundColor: color }}
            >
              {data.cursor.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
