import React from 'react';

interface IconProps {
  name: 'dashboard' | 'inbox' | 'outbox' | 'add' | 'edit' | 'delete' | 'close' | 'search' | 'file' | 'users' | 'logout' | 'barcode';
  className?: string;
}

const ICONS: Record<IconProps['name'], JSX.Element> = {
  dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  inbox: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />,
  outbox: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />,
  add: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
  edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
  delete: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
  search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  file: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  users: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  logout: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3l3-3m0 0l-3-3m3 3H3" />,
  barcode: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 1v1m-6-2h.01M6 8h.01M7 8v.01M8 8v.01M9 8v.01M10 8v.01M11 8v.01M12 8v.01M13 8v.01M14 8v.01M15 8v.01M16 8v.01M17 8v.01M18 8v.01M6 12h.01M7 12v.01M8 12v.01M9 12v.01M10 12v.01M11 12v.01M12 12v.01M13 12v.01M14 12v.01M15 12v.01M16 12v.01M17 12v.01M18 12v.01M6 16h.01M7 16v.01M8 16v.01M9 16v.01M10 16v.01M11 16v.01M12 16v.01M13 16v.01M14 16v.01M15 16v.01M16 16v.01M17 16v.01M18 16v.01M6 20h.01M7 20v.01M8 20v.01M9 20v.01M10 20v.01M11 20v.01M12 20v.01M13 20v.01M14 20v.01M15 20v.01M16 20v.01M17 20v.01M18 20v.01M4 4h1v1H4V4zm2 2H4v1h2V6zM4 8H3v1h1V8zm1-2h1V5H5v1zm-1 5v-1H3v1h1zm1-1H4v1h1v-1zm1 1v1H5v-1h1zm-2 2H3v1h1v-1zm1-1v1H4v-1h1zm2 1h-1v1h1v-1zm-1-1H5v1h1v-1z" />,
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {ICONS[name]}
    </svg>
  );
};

export default Icon;