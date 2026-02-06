
import React, { useState, useRef, useEffect } from 'react';
import { DocumentFormat, AppStatus, PlannerState, FileData } from './types';
import { generateLessonContent } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import { AceLogo, UploadIcon, FormatIcon } from './components/Icons';
import { parse } from 'marked';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showRaw, setShowRaw] = useState(false);
  const [isCustomNumPlans, setIsCustomNumPlans] = useState(false);
  const [copying, setCopying] = useState(false);
  
  const [state, setState] = useState<PlannerState>({
    format: DocumentFormat.DLP_4A,
    school: 'Araibo National High School',
    teacher: 'Jay-Art T. Sadjail',
    gradeLevel: 'Grade 8',
    subject: 'Mathematics',
    topic: '',
    subTopics: [''],
    numPlans: 1,
    referenceFiles: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const isDll = state.format.includes('Log');

  // Synchronize subTopics array with numPlans selection (only for DLP)
  useEffect(() => {
    if (isDll) return;
    setState(prev => {
      const newSubTopics = [...prev.subTopics];
      if (newSubTopics.length < prev.numPlans) {
        for (let i = newSubTopics.length; i < prev.numPlans; i++) {
          newSubTopics.push('');
        }
      } else if (newSubTopics.length > prev.numPlans) {
        newSubTopics.splice(prev.numPlans);
      }
      return { ...prev, subTopics: newSubTopics };
    });
  }, [state.numPlans, isDll]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    if (name === 'numPlans') {
      if (value === 'custom') {
        setIsCustomNumPlans(true);
      } else {
        setIsCustomNumPlans(false);
        setState(prev => ({ ...prev, numPlans: parseInt(value) || 1 }));
      }
    } else {
      setState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubTopicChange = (index: number, value: string) => {
    setState(prev => {
      const newSubTopics = [...prev.subTopics];
      newSubTopics[index] = value;
      if (index === 0) return { ...prev, subTopics: newSubTopics, topic: value };
      return { ...prev, subTopics: newSubTopics };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setState(prev => ({
          ...prev,
          referenceFiles: [...prev.referenceFiles, { name: file.name, content }]
        }));
      };
      reader.readAsText(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setState(prev => ({
      ...prev,
      referenceFiles: prev.referenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleGenerate = async (overrideFormat?: DocumentFormat) => {
    const currentFormat = overrideFormat || state.format;
    const isLog = currentFormat.includes('Log');
    const mainTopic = isLog ? state.topic : state.subTopics[0];
    
    if (!mainTopic.trim()) {
      setError("Please specify a topic to proceed.");
      return;
    }
    
    const activeState = overrideFormat ? { ...state, format: overrideFormat } : state;
    if (overrideFormat) setState(activeState);

    setStatus(AppStatus.GENERATING);
    setError('');
    
    try {
      const generatedContent = await generateLessonContent(activeState);
      setResult(generatedContent);
      setStatus(AppStatus.SUCCESS);
      setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 150);
    } catch (err: any) {
      setError(err.message);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleResetTopic = () => {
    setState(prev => ({ ...prev, topic: '', subTopics: [''], numPlans: 1 }));
    setResult('');
    setStatus(AppStatus.IDLE);
    setError('');
    setIsCustomNumPlans(false);
  };

  const handleCopyMarkdown = async () => {
    setCopying(true);
    try {
      // Create rich text blob for pasting into Word/Excel/Google Docs
      const htmlContent = parse(result) as string;
      const type = "text/html";
      const blob = new Blob([htmlContent], { type });
      const data = [new ClipboardItem({ 
        [type]: blob,
        "text/plain": new Blob([result], { type: "text/plain" })
      })];
      
      await navigator.clipboard.write(data);
      alert("Lesson content copied! You can now paste it directly into Word, Excel, or any document editor.");
    } catch (err) {
      // Fallback to simple text copy if ClipboardItem API fails
      try {
        await navigator.clipboard.writeText(result);
        alert("Markdown text copied successfully!");
      } catch (innerErr) {
        console.error("Copy failed", innerErr);
      }
    }
    setCopying(false);
  };

  const handleExportWord = async () => {
    if (!result) return;
    const isLandscape = state.format.includes('Log');
    
    const htmlBody = await parse(result);

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Lesson Plan - ACE AI Planner</title>
        <style>
          @page { 
            size: ${isLandscape ? '11in 8.5in landscape' : '8.5in 11in portrait'}; 
            margin: 0.5in; 
          }
          body { 
            font-family: 'Times New Roman', serif; 
            font-size: 11pt; 
            color: black; 
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 20px; 
            table-layout: fixed;
          }
          th, td { 
            border: 1pt solid black; 
            padding: 8px; 
            vertical-align: top; 
            word-wrap: break-word; 
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        ${htmlBody}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(state.topic || 'Lesson_Plan').replace(/\s+/g, '_')}_ACE.doc`;
    link.click();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-[9999] p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <AceLogo className="w-20 h-20 mx-auto shadow-2xl shadow-[#f4511e]/20" />
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Ace Ai <span className="text-[#f4511e]">Planner</span></h1>
            <p className="text-gray-400 font-semibold tracking-wide">DepEd Professional Instructional Design</p>
            <p className="text-[#f4511e] text-[10px] font-black uppercase tracking-[0.3em] mt-4">By: Jay-Art T. Sadjail</p>
          </div>
          <button onClick={() => setHasStarted(true)} className="w-full py-5 bg-[#f4511e] hover:bg-[#ff6a3c] text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-[#f4511e]/20 tracking-widest uppercase">Enter Workspace</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-12 px-6 scroll-smooth">
      <header className="w-full max-w-6xl flex items-center justify-between mb-12 no-print px-4">
        <div className="flex items-center gap-4">
          <AceLogo className="w-10 h-10" />
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase leading-none">Ace AI Planner</h2>
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">developed by: Jay-Art T. Sadjail</p>
          </div>
        </div>
        <button onClick={() => setHasStarted(false)} className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Exit</button>
      </header>

      <main className="w-full max-w-6xl space-y-8 no-print px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 bg-[#111] p-8 rounded-[40px] border border-white/5 shadow-2xl relative">
            <button onClick={handleResetTopic} className="absolute top-6 right-8 text-[9px] font-black text-gray-600 hover:text-gray-400 uppercase tracking-[0.2em] transition-colors">Reset Form</button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-[9px] font-black text-[#f4511e] uppercase tracking-widest">School</label><input name="school" value={state.school} onChange={handleInputChange} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-[#f4511e]/50 outline-none transition-all" /></div>
              <div className="space-y-2"><label className="text-[9px] font-black text-[#f4511e] uppercase tracking-widest">Instructor</label><input name="teacher" value={state.teacher} onChange={handleInputChange} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-[#f4511e]/50 outline-none transition-all" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-[9px] font-black text-[#f4511e] uppercase tracking-widest">Grade Level</label><input name="gradeLevel" value={state.gradeLevel} onChange={handleInputChange} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-[#f4511e]/50 outline-none transition-all" /></div>
              <div className="space-y-2"><label className="text-[9px] font-black text-[#f4511e] uppercase tracking-widest">Learning Area</label><input name="subject" value={state.subject} onChange={handleInputChange} className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-[#f4511e]/50 outline-none transition-all" /></div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <label className="flex items-center gap-3 text-[9px] font-black text-[#f4511e] uppercase tracking-widest"><FormatIcon className="w-4 h-4" /> Selected Framework</label>
                <div className="flex items-center gap-4">
                  {!isDll && (
                    <div className="flex items-center gap-3 bg-black/30 p-2 rounded-2xl border border-white/5">
                       <label className="text-[9px] font-black text-gray-500 uppercase px-2">Days:</label>
                       {isCustomNumPlans ? (
                         <input 
                           type="number" 
                           min="1" 
                           max="30" 
                           value={state.numPlans} 
                           onChange={(e) => setState(prev => ({ ...prev, numPlans: parseInt(e.target.value) || 1 }))}
                           className="w-16 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-center focus:border-[#f4511e]/50 outline-none font-black"
                         />
                       ) : (
                         <select name="numPlans" value={state.numPlans} onChange={handleInputChange} className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#f4511e]/50 font-black cursor-pointer">
                           {[1,2,3,4,5].map(n => <option key={n} value={n} className="bg-[#111]">{n}</option>)}
                           <option value="custom" className="bg-[#111]">...</option>
                         </select>
                       )}
                    </div>
                  )}
                  <select name="format" value={state.format} onChange={handleInputChange} className="bg-black/30 border border-white/5 rounded-2xl px-6 py-3 text-xs outline-none focus:border-[#f4511e]/50 font-bold min-w-[240px] cursor-pointer hover:bg-black/50 transition-all">
                    {Object.values(DocumentFormat).map(f => <option key={f} value={f} className="bg-[#111]">{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {isDll ? (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                    <label className="text-[9px] font-black text-[#f4511e] uppercase tracking-widest">Weekly Theme / Main Topic</label>
                    <input 
                      name="topic" 
                      placeholder="Enter the week's theme..."
                      value={state.topic} 
                      onChange={handleInputChange} 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 font-black text-lg focus:border-[#f4511e]/50 outline-none placeholder:text-gray-800" 
                    />
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center gap-4">
                       <div className="h-px bg-white/5 flex-grow"></div>
                       <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">Daily Lesson Plan Breakdown</p>
                       <div className="h-px bg-white/5 flex-grow"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {state.subTopics.map((topic, index) => (
                        <div key={index} className="space-y-2 group animate-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 50}ms` }}>
                          <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Plan #{index + 1} Topic</label>
                          <input 
                            placeholder={`Topic for day ${index + 1}...`}
                            value={topic} 
                            onChange={(e) => handleSubTopicChange(index, e.target.value)} 
                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold focus:border-[#f4511e]/50 outline-none transition-all group-hover:border-white/10" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#111] p-8 rounded-[40px] border border-white/5 flex flex-col h-full shadow-2xl relative">
              <div className="space-y-6 flex-grow">
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black text-[#f4511e] uppercase tracking-widest">Reference Support</label>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="ref-file" multiple />
                  <label htmlFor="ref-file" className="cursor-pointer bg-white/5 border border-dashed border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center hover:bg-white/10 hover:border-[#f4511e]/40 transition-all group active:scale-95">
                    <UploadIcon className="w-8 h-8 text-gray-500 mb-3 group-hover:text-[#f4511e] transition-colors" />
                    <span className="text-[10px] font-black text-gray-500 uppercase group-hover:text-white tracking-widest">Attach Material</span>
                  </label>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-3">
                  {state.referenceFiles.map((f, i) => (
                    <div key={i} className="bg-black/40 p-4 rounded-2xl flex items-center justify-between border border-white/5 animate-in slide-in-from-right-4 group hover:border-[#f4511e]/20 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-[#f4511e]/10 flex items-center justify-center text-[#f4511e] text-[10px] font-black">
                          {i + 1}
                        </div>
                        <span className="text-[10px] font-black text-gray-300 truncate max-w-[120px]">{f.name}</span>
                      </div>
                      <button onClick={() => handleRemoveFile(i)} className="text-gray-600 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                  ))}
                  {state.referenceFiles.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest leading-loose">No files attached.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => handleGenerate()} 
                  disabled={status === AppStatus.GENERATING} 
                  className="w-full py-6 bg-[#f4511e] hover:bg-[#ff6a3c] rounded-3xl font-black uppercase text-sm tracking-[0.2em] disabled:opacity-50 transition-all shadow-2xl shadow-[#f4511e]/20 active:scale-95 flex items-center justify-center gap-4"
                >
                  {status === AppStatus.GENERATING ? 'Generating...' : 'Generate Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {result && (status === AppStatus.SUCCESS || status === AppStatus.GENERATING) && (
        <section id="result-section" className={`w-full ${isDll ? 'max-w-[1400px]' : 'max-w-6xl'} mt-16 px-4 mb-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 print-area`}>
          <div className="bg-[#111] border border-white/5 rounded-[50px] p-10 md:p-16 shadow-2xl relative overflow-hidden print:bg-white print:border-none print:shadow-none print:p-0">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#f4511e] to-transparent no-print" />
            
            <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-4 no-print">
              <div className="flex items-center gap-4">
                <div className={`px-5 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest ${isDll ? 'border-orange-500/30 text-orange-400' : 'border-blue-500/30 text-blue-400'}`}>
                  {isDll ? 'Weekly View (Landscape)' : 'Daily View (Portrait)'}
                </div>
                <button onClick={() => setShowRaw(!showRaw)} className="text-[10px] font-black text-gray-500 uppercase hover:text-white transition-colors tracking-widest">
                  {showRaw ? 'Preview' : 'Markdown'}
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleCopyMarkdown} 
                  disabled={copying}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all tracking-widest flex items-center gap-2"
                >
                  {copying ? 'Copying...' : 'Copy Table'}
                </button>
                <button onClick={handlePrintPDF} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all tracking-widest">Print PDF</button>
                <button onClick={handleExportWord} className="px-8 py-3 bg-[#f4511e] rounded-2xl text-[10px] font-black uppercase hover:bg-[#ff6a3c] transition-all shadow-xl shadow-[#f4511e]/20 tracking-[0.2em]">Export .Docx</button>
              </div>
            </div>
            
            {showRaw ? (
              <pre className="bg-black/50 p-8 rounded-[30px] font-mono text-sm text-gray-400 overflow-x-auto whitespace-pre-wrap border border-white/5 custom-scrollbar">{result}</pre>
            ) : (
              <div ref={resultRef} className={`prose prose-invert prose-orange max-w-none text-gray-300 ${isDll ? 'overflow-x-auto custom-scrollbar pb-8' : ''} print:text-black print:prose-black`}>
                <div className={isDll ? 'min-w-[1200px] print:min-w-0' : ''}>
                  <MarkdownRenderer content={result} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {error && (
        <div className="mt-12 p-12 bg-red-900/10 border border-red-500/20 rounded-[40px] text-center max-w-4xl w-full">
          <h3 className="text-red-400 font-black uppercase text-sm mb-4 tracking-widest">System Error</h3>
          <p className="text-red-300/60 text-xs font-bold uppercase tracking-wide leading-relaxed">{error}</p>
          <button onClick={() => handleGenerate()} className="mt-8 px-12 py-5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase transition-all tracking-widest">Retry</button>
        </div>
      )}

      <footer className="mt-auto py-16 flex flex-col items-center opacity-40 hover:opacity-100 transition-all duration-500 no-print">
        <div className="w-12 h-0.5 bg-[#f4511e] mb-6 rounded-full" />
        <span className="text-[11px] text-gray-500 font-black tracking-[0.8em] uppercase mb-4">Ace Ai Planner Engine</span>
        <div className="flex items-center gap-6">
           <span className="text-[9px] text-gray-700 font-bold uppercase tracking-widest">v3.1.0 Architecture</span>
           <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
           <span className="text-[9px] text-gray-700 font-bold uppercase tracking-widest">DepEd Optimized</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
