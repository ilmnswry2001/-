import React, { useState, useEffect } from 'react';
import { Book, BookType, BookFile } from '../types';

interface BookFormProps {
  bookToEdit?: Book | null;
  onSave: (book: Omit<Book, 'id'> | Book) => void;
  onClose: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ bookToEdit, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    type: BookType.INCOMING,
    title: '',
    number: '',
    date: new Date().toISOString().split('T')[0],
    entity: '',
    subject: '',
  });
  const [file, setFile] = useState<BookFile | undefined>(bookToEdit?.file);
  const [fileName, setFileName] = useState<string>(bookToEdit?.file?.name || '');

  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        type: bookToEdit.type,
        title: bookToEdit.title,
        number: bookToEdit.number,
        date: bookToEdit.date,
        entity: bookToEdit.entity,
        subject: bookToEdit.subject,
      });
      setFile(bookToEdit.file);
      setFileName(bookToEdit.file?.name || '');
    }
  }, [bookToEdit]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFileName(selectedFile.name);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFile({
                name: selectedFile.name,
                type: selectedFile.type,
                data: reader.result as string
            });
        };
        reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bookData = { ...formData, file };
    if (bookToEdit) {
      onSave({ ...bookToEdit, ...bookData });
    } else {
      onSave(bookData);
    }
    onClose();
  };

  const inputStyles = "w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">نوع الكتاب</label>
        <select name="type" value={formData.type} onChange={handleChange} className={inputStyles}>
          <option value={BookType.INCOMING}>وارد</option>
          <option value={BookType.OUTGOING}>صادر</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">عنوان الكتاب</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className={inputStyles} />
        </div>
        <div>
          <label htmlFor="number" className="block text-sm font-medium text-gray-300 mb-1">رقم الكتاب</label>
          <input type="text" id="number" name="number" value={formData.number} onChange={handleChange} required className={inputStyles} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">التاريخ</label>
          <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className={`${inputStyles} [color-scheme:dark]`} />
        </div>
        <div>
          <label htmlFor="entity" className="block text-sm font-medium text-gray-300 mb-1">الجهة</label>
          <input type="text" id="entity" name="entity" value={formData.entity} onChange={handleChange} required className={inputStyles} />
        </div>
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">الموضوع</label>
        <textarea id="subject" name="subject" value={formData.subject} onChange={handleChange} rows={4} required className={inputStyles}></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">إرفاق ملف (اختياري)</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500 px-1">
                        <span>اختر ملفًا</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pr-1">أو اسحبه وأفلته هنا</p>
                </div>
                {fileName && <p className="text-xs text-green-400">{fileName}</p>}
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-gray-600 text-gray-200 px-4 py-2 rounded-md ml-2 hover:bg-gray-500">إلغاء</button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          {bookToEdit ? 'تحديث الكتاب' : 'إضافة الكتاب'}
        </button>
      </div>
    </form>
  );
};

export default BookForm;