import React from 'react';
import Icon from './Icon';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="ابحث عن كتاب (حسب العنوان, الرقم, الجهة...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 pr-12 text-lg bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
        <Icon name="search" className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  );
};

export default SearchBar;