
import React, { useRef, useState } from 'react';
import { Upload, FileText, Info } from 'lucide-react';

interface Props {
  onGenerate: (dataList: any[]) => void;
  isGenerating: boolean;
}

const BulkGenerator: React.FC<Props> = ({ onGenerate, isGenerating }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const splitCSVLine = (line: string) => {
    // Split on commas that are not inside double quotes
    const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
    const parts = line.split(regex).map(p => p.trim());
    return parts.map(p => {
      if (p.startsWith('"') && p.endsWith('"')) {
        return p.slice(1, -1).replace(/""/g, '"');
      }
      return p;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      const lines = text.split(/\r\n|\n|\r/).filter(Boolean);
      setParseErrors([]);

      if (lines.length <= 1) {
        setData([]);
        setParseErrors(['CSV appears empty or only has headers.']);
        return;
      }

      const headerLine = lines[0];
      const headers = splitCSVLine(headerLine).map(h => h.trim());

      const required = ['recipientName', 'occasion', 'message', 'senderName'];
      for (const r of required) {
        if (!headers.includes(r)) {
          setData([]);
          setParseErrors([`Missing required header: ${r}. Expected headers: recipientName, occasion, message, senderName[, fontColor, fontScale]`]);
          return;
        }
      }

      const parsedData: any[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const values = splitCSVLine(line);
        const row: any = {};
        for (let c = 0; c < headers.length; c++) {
          row[headers[c]] = values[c] !== undefined ? values[c] : '';
        }

        // Validate required fields
        if (!row.recipientName || !row.occasion || !row.message || !row.senderName) {
          errors.push(`Row ${i + 1}: missing required fields`);
          continue;
        }

        // Normalize optional fields
        if (row.fontScale) {
          const n = Number(row.fontScale);
          row.fontScale = isNaN(n) ? undefined : n;
        }
        row.fontColor = row.fontColor || undefined;

        parsedData.push({
          recipientName: row.recipientName.trim(),
          occasion: row.occasion.trim(),
          message: row.message.trim(),
          senderName: row.senderName.trim(),
          fontColor: row.fontColor?.trim(),
          fontScale: row.fontScale
        });
      }

      setData(parsedData);
      setParseErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleGenerate = () => {
    if (data.length === 0) return;
    onGenerate(data);
  };

  const downloadSample = () => {
    const csvContent = "recipientName,occasion,message,senderName,fontColor,fontScale\nJohn Doe,Birthday,\"Hope your day, have a great time!\",Management,#FFFFFF,100\nJane Smith,Farewell,\"Good luck on your next adventure, we will miss you\",The Team,#FFB6C1,90";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_cards.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm flex gap-3">
        <Info className="flex-shrink-0 text-indigo-300" size={18} />
        <div>
          <p className="font-semibold mb-1">CSV Format Requirements:</p>
          <p className="text-xs opacity-80">Headers: recipientName, occasion, message, senderName, fontColor (hex), fontScale (number)</p>
          <button onClick={downloadSample} className="mt-2 text-indigo-300 underline font-bold">Download Sample Template</button>
        </div>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="group border-2 border-dashed border-slate-700 hover:border-indigo-400 hover:bg-indigo-900/40 rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center"
      >
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="w-12 h-12 bg-slate-800 group-hover:bg-indigo-800 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-300 mb-4 transition-all">
          <Upload size={24} />
        </div>
        <h3 className="font-bold text-slate-100">
          {fileName ? fileName : 'Click to Upload CSV'}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {fileName ? `${data.length} records found` : 'Bulk generation made easy'}
        </p>
        {parseErrors.length > 0 && (
          <div className="mt-2 text-xs text-amber-300">
            <ul>
              {parseErrors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>

      <button
        disabled={data.length === 0 || isGenerating}
        onClick={handleGenerate}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <FileText size={20} />
        {isGenerating ? `Processing ${data.length} Cards...` : `Generate ${data.length} Cards`}
      </button>
    </div>
  );
};

export default BulkGenerator;
