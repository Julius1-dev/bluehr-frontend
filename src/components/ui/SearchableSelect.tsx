import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  id: string | number;
  name: string;
  email?: string;
  role?: string;
  department?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className,
  disabled = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  useEffect(() => {
    const filtered = options.filter(option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.id.toString() === value.toString());

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white",
          disabled && "bg-gray-100 cursor-not-allowed",
          isOpen && "ring-2 ring-blue-500 border-blue-500"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0">
          {selectedOption ? (
            <div className="truncate">
              <div className="font-medium">{selectedOption.name}</div>
              {selectedOption.role && (
                <div className="text-xs text-gray-500 capitalize">{selectedOption.role}</div>
              )}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {value && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
          <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors",
                    value === option.id && "bg-blue-50 text-blue-700"
                  )}
                  onClick={() => handleSelect(option)}
                >
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-gray-500">
                    {option.role && <span className="capitalize">{option.role}</span>}
                    {option.role && option.department && <span> • </span>}
                    {option.department && <span>{option.department}</span>}
                    {option.email && <span> • {option.email}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-center">
                No users found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
