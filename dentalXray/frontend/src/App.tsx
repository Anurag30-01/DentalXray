import { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<string>("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string>("");

// Removed top-level await call; imageData will be set in analyzeFile after receiving the response.

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  const analyzeFile = async () => {
    if (!file) {
      alert("Please choose a file first");
      return;
    }

    setLogs([]);
    setReport("");
    setPredictions([]);
    setLoading(true);
    addLog("Starting analysis...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Call backend API to analyze file & get detection results
      addLog("Uploading file for Roboflow analysis...");
      const roboflowResp = await axios.post(
        "http://localhost:8000/roboflow-analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      addLog("Roboflow analysis complete.");

      const roboflowPredictions = roboflowResp.data.predictions || [];
      addLog("Roboflow analysis complete.");

      setImageData(`data:image/png;base64,${roboflowResp.data.image}`);

      setPredictions(roboflowPredictions);
      addLog(`Detected ${roboflowPredictions.length} findings.`);
      const reportResp = await axios.post(
        "http://localhost:8000/gemini-report",
        { predictions: roboflowPredictions }
      );
      setReport(reportResp.data.report);
      addLog("Report generated successfully.");
    } catch (error: any) {
      addLog(`Error: ${error.message || "Unknown error"}`);
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="fixed text-center w-full bg-gray-800 text-white p-2">
        <h1 className="text-2xl font-bold">Dental X-ray Analysis</h1>
      </div>
      <div className="min-h-screen flex p-8 gap-8 bg-gray-50">
      {/* Left panel */}
      <div className="w-1/3 bg-white p-6 rounded shadow flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Upload and Analyze</h2>

        <input
          type="file"
          accept=".dcm,image/*"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="mb-4 bg-gray-300 border border-black rounded pl-2 p-1 cursor-pointer w-[50%]"
        />

        <button
          onClick={analyzeFile}
          disabled={loading}
          className={`py-2 px-4 bg-black text-white rounded hover:bg-blue-700 disabled:bg-blue-300`}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        <div className="mt-6 flex-1 overflow-y-auto bg-gray-100 p-4 rounded border border-gray-300">
          {imageData && (
                      <img
                        src={imageData}
                        alt="DICOM PNG"
                        className="w-[300px] max-h-[300px] object-contain border border-gray-400 mb-2 rounded"
                      />
                    )}
          <h3 className="font-medium mb-2">Logs</h3>
          <div className="text-sm text-gray-700 space-y-1 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p>No logs yet.</p>
            ) : (
              logs.map((log, i) => <p key={i}>{log}</p>)
            )}
          </div>
          
        </div>
      </div>

      {/* Right panel */}
      <div className="w-2/3 bg-white p-6 rounded shadow flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Diagnostic Report</h2>

        {/* Roboflow predictions list */}
        <div className="mb-6 overflow-y-auto border border-gray-300 rounded p-4 bg-gray-50 max-h-64">
          <h3 className="font-medium mb-2">Roboflow Predictions:</h3>
          
          {predictions.length === 0 ? (
            <p>No predictions yet.</p>
          ) : (
            predictions.map((p, i) => (
              <div key={i} className="mb-2 p-2 border rounded bg-white shadow-sm">
                <p>
                  <strong>Class:</strong> {p.class}
                </p>
                <p>
                  <strong>Confidence:</strong> {(p.confidence * 100).toFixed(2)}%
                </p>
                <p>
                  <strong>Box:</strong> x={p.x}, y={p.y}, w={p.width}, h={p.height}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Gemini report */}
        <div className="flex-1 overflow-y-auto border border-gray-300 rounded p-4 bg-gray-50 whitespace-pre-wrap">
          {report ? report : <p>No report generated yet.</p>}
        </div>
      </div>
    </div>
    </div>
  );
}
