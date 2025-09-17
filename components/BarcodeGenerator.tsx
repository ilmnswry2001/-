import React, { useState, useMemo, useCallback } from 'react';

const motivationalPhrases = [
  "حوّل ملفاتك إلى جسور رقمية بلمسة زر.",
  "كل رمز هو بداية لقصة جديدة. ما هي قصة ملفك؟",
  "اجعل الوصول إلى معلوماتك أسرع من أي وقت مضى.",
  "بساطة، سرعة، وأناقة في رمز واحد.",
  "شارك ملفاتك بذكاء. شاركها برمز."
];

const BarcodeGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataURL, setFileDataURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const phrase = useMemo(() => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)], []);

  const qrCodeURL = useMemo(() => {
    if (!fileDataURL) return null;
    // Using an external API to generate QR code to avoid heavy client-side libraries
    // and to handle potentially very long data URLs.
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fileDataURL)}`;
  }, [fileDataURL]);

  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile) return;

    // Limit file size to 5MB to prevent extremely long data URLs
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("حجم الملف كبير جدًا. الرجاء اختيار ملف أصغر من 5 ميجابايت.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileDataURL(reader.result as string);
      setIsLoading(false);
    };
    reader.onerror = () => {
        setError("حدث خطأ أثناء قراءة الملف.");
        setIsLoading(false);
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if(selectedFile) handleFile(selectedFile);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const selectedFile = e.dataTransfer.files?.[0];
    if(selectedFile) handleFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = () => setDragOver(true);
  const handleDragLeave = () => setDragOver(false);


  const reset = () => {
    setFile(null);
    setFileDataURL(null);
    setError(null);
  };

  const downloadQRCode = () => {
    if (!qrCodeURL) return;
    const link = document.createElement('a');
    // We fetch the image and create a blob URL to bypass CORS issues with direct download.
    fetch(qrCodeURL)
        .then(response => response.blob())
        .then(blob => {
            link.href = URL.createObjectURL(blob);
            link.download = `qrcode-${file?.name || 'file'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(err => {
            console.error("Failed to download QR code:", err);
            setError("فشل في تحميل الرمز. قد تكون هناك مشكلة في الشبكة.");
        });
  };
  
  const printQRCode = () => {
    if (!qrCodeURL) return;
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
        <html>
            <head><title>طباعة الرمز</title></head>
            <body style="text-align: center; margin-top: 50px;">
                <img src="${qrCodeURL}" alt="QR Code" />
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    };
                </script>
            </body>
        </html>
    `);
    printWindow?.document.close();
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
      <h2 className="text-3xl font-bold text-white mb-2">مولّد الباركود الدائم للملفات</h2>
      <p className="text-lg text-gray-400 mb-8">{phrase}</p>
      
      {!fileDataURL ? (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`relative block w-full border-2 border-dashed rounded-lg p-12 text-center hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${dragOver ? 'border-blue-400 bg-gray-700' : 'border-gray-600'}`}
          >
            <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="mt-2 block text-lg font-semibold text-gray-300">
              اسحب وأفلت ملفك هنا
            </span>
            <span className="mt-1 block text-sm text-gray-500">أو</span>
            <label htmlFor="file-upload" className="relative cursor-pointer mt-2 inline-block bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 focus-within:outline-none">
              <span>اختر ملفًا</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
            </label>
            <p className="mt-4 text-xs text-gray-500">ملفات الصور، PDF، وغيرها (بحد أقصى 5 ميجابايت)</p>
          </div>
          {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>
      ) : (
        <div className="bg-gray-700 p-8 rounded-xl shadow-inner animate-fade-in">
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             </div>
          ) : qrCodeURL && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="flex-shrink-0 bg-white p-4 rounded-lg shadow-lg">
                    <img src={qrCodeURL} alt="Generated QR Code" width="250" height="250" />
                </div>
                <div className="text-center md:text-right">
                    <h3 className="text-2xl font-bold text-white mb-4">تم إنشاء الرمز بنجاح!</h3>
                    <div className="bg-gray-800 p-4 rounded-lg mb-6">
                        <p className="text-gray-400">اسم الملف:</p>
                        <p className="font-semibold text-gray-200 truncate">{file?.name}</p>
                        <p className="text-gray-400 mt-2">حجم الملف:</p>
                        <p className="font-semibold text-gray-200">{file ? (file.size / 1024).toFixed(2) : 0} كيلوبايت</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={downloadQRCode} className="bg-emerald-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors">تحميل الرمز</button>
                        <button onClick={printQRCode} className="bg-sky-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-sky-700 transition-colors">طباعة</button>
                        <button onClick={reset} className="bg-gray-600 text-gray-200 px-5 py-3 rounded-lg font-bold hover:bg-gray-500 transition-colors">ملف جديد</button>
                    </div>
                </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 text-xs text-gray-500 text-center">
        <p><strong>ملاحظة:</strong> هذا الرمز يحتوي على بيانات الملف مباشرة (Data URL) وهو يعمل بشكل ممتاز للعرض محليًا. لإنشاء رابط دائم وقصير يمكن مشاركته عبر الإنترنت، يتطلب الأمر رفع الملف إلى خادم وتوليد رابط خاص به.</p>
      </div>
    </div>
  );
};

export default BarcodeGenerator;
