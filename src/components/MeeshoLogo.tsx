import React from 'react';

export function MeeshoLogo({ className = "w-8 h-8", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="512" height="512" rx="112" fill="#F43397" />
      <path 
        d="M136 340V188C136 172.536 148.536 160 164 160H196C211.464 160 224 172.536 224 188V300C224 305.523 228.477 310 234 310H242C247.523 310 252 305.523 252 300V188C252 172.536 264.536 160 280 160H312C327.464 160 340 172.536 340 188V340C340 355.464 327.464 368 312 368H280C264.536 368 252 355.464 252 340V338H224V340C224 355.464 211.464 368 196 368H164C148.536 368 136 355.464 136 340Z" 
        fill="white" 
      />
    </svg>
  );
}
