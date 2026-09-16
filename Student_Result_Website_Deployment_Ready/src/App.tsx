import { useState } from "react";
import cmPhoto from "@/imports/IMG_fb9e6a32-cdd0-45a0-8772-f93513d67f78.jpg";
import karnatakaEmblem from "@/imports/tMNFsiFAqTQIMZx-800x450-noPad.jpg";

// ── Types ──────────────────────────────────────────────────────────────────
type Subject = {
  sl: number; code: string; name: string; maxMarks: number; minMarks: number;
  seMarks: number; iaMarks: number; marksScored: number; credits: number;
  grade: string; creditPoints: number; letterGrade: string; status: string;
};

type StudentResult = {
  usn: string; name: string; college: string; examMonth: string; examType: string;
  programLevel: string; programName: string; semester: string; publishedAt: string;
  result: string; sgpa: string; cgpa: string; termGrade: string;
  promotionStatus: string; subjects: Subject[];
};

// ── API helpers ────────────────────────────────────────────────────────────
type ApiErrorResponse = { error?: string; message?: string };

async function readApiResponse<T>(res: Response): Promise<T> {
  // Do not call res.json() blindly. If the backend is stopped, the proxy can
  // return an empty/non-JSON response, which causes "Unexpected end of JSON input".
  const text = await res.text();
  let data: T | ApiErrorResponse | null = null;

  if (text.trim()) {
    try {
      data = JSON.parse(text) as T | ApiErrorResponse;
    } catch {
      throw new Error(`Server returned an invalid response (HTTP ${res.status}).`);
    }
  }

  if (!res.ok) {
    const errorData = data as ApiErrorResponse | null;
    throw new Error(
      errorData?.error || errorData?.message || `Request failed (HTTP ${res.status}).`,
    );
  }

  if (data === null) {
    throw new Error("Server returned an empty response.");
  }

  return data as T;
}

// In development, an empty base uses Vite's /api proxy.
// In production, VITE_API_URL points to the deployed backend (for example,
// https://your-backend.onrender.com).
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\\/+$/, "");

async function apiLogin(usn: string, password: string): Promise<{ token: string; usn: string; name: string }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usn, password }),
    });
  } catch {
    throw new Error("Cannot connect to the result server. Please try again.");
  }

  return readApiResponse<{ token: string; usn: string; name: string }>(res);
}

async function apiFetchResult(usn: string, token: string): Promise<StudentResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/results/${encodeURIComponent(usn)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Cannot connect to the result server. Please try again.");
  }

  return readApiResponse<StudentResult>(res);
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<"login" | "result">("login");
  const [token, setToken] = useState("");
  const [usn, setUsn] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<StudentResult | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = await apiLogin(usn.trim(), password);
      const result = await apiFetchResult(auth.usn, auth.token);
      setToken(auth.token);
      setStudent(result);
      setPage("result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setPage("login");
    setPassword("");
    setStudent(null);
    setToken("");
    setError("");
  }

  if (page === "login") {
    return (
      <LoginPage
        usn={usn} setUsn={setUsn}
        password={password} setPassword={setPassword}
        error={error} loading={loading} onLogin={handleLogin}
      />
    );
  }
  return <ResultPage student={student!} token={token} onBack={handleBack} />;
}

// ── Shared header components ───────────────────────────────────────────────
function GovHeader() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-300">
            <img src={cmPhoto} alt="Shri. D. K. Shivakumar" className="w-full h-full object-cover object-top" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-800 leading-tight">Shri. D. K. Shivakumar</div>
            <div className="text-[10px] text-gray-500">Hon'ble Chief Minister, Government of Karnataka</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <img src={karnatakaEmblem} alt="Government of Karnataka Emblem" className="h-14 w-auto object-contain" />
          <div className="text-[11px] font-semibold text-gray-700 mt-0.5">Government of Karnataka</div>
        </div>
      </div>
    </div>
  );
}

function NavBar({ college }: { college?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background: "#1a5276" }}>
        <button className="text-white p-1">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <button className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background: "#1abc9c" }}>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </button>
      </div>
      {college && (
        <div className="px-3 py-2 text-[11px] text-gray-700 bg-white border-b border-gray-200">{college}</div>
      )}
      <div className="px-3 py-1.5 text-[11px] bg-gray-50 border-b border-gray-200 flex items-center gap-1 text-gray-600">
        <span className="text-blue-600 cursor-pointer hover:underline">Home</span>
        <span>/</span>
        <span className="text-blue-600 cursor-pointer hover:underline">Exam</span>
        <span>/</span>
        <span>Exam Result</span>
      </div>
    </div>
  );
}

// ── Login page ─────────────────────────────────────────────────────────────
function LoginPage({ usn, setUsn, password, setPassword, error, loading, onLogin }: {
  usn: string; setUsn: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  error: string; loading: boolean;
  onLogin: (e: React.FormEvent) => void;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <GovHeader />
      <NavBar />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-white shadow-lg rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "Georgia, serif" }}>Karnatak University</h1>
            <p className="text-xs text-gray-500 mt-0.5">Student Examination Result Portal</p>
          </div>

          <form onSubmit={onLogin} className="px-6 py-5">
            {error && (
              <div className="mb-4 px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0 mt-0.5 fill-red-500">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Student Reg No:</label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                placeholder="e.g. U02BF25S0274"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 uppercase font-mono"
                required autoFocus disabled={loading}
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-white text-sm font-semibold rounded transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "#1abc9c" }}
            >
              {loading && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? "Verifying..." : "View Result"}
            </button>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center space-y-0.5">
              <p className="text-[11px] text-gray-400">Demo: <span className="font-mono text-gray-600">U02BF25S0274</span> / <span className="font-mono text-gray-600">Sujanpujar@123</span></p>
              <p className="text-[11px] text-gray-400">Demo: <span className="font-mono text-gray-600">4KV21CS001</span> / <span className="font-mono text-gray-600">student123</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Result page ────────────────────────────────────────────────────────────
function ResultPage({ student, onBack }: { student: StudentResult; token: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <GovHeader />
      <NavBar college={student.college} />

      <div className="flex-1 px-3 py-3 max-w-5xl mx-auto w-full">
        <div className="bg-white shadow-sm">
          {/* University heading */}
          <div className="px-4 pt-4 pb-2 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Georgia, serif" }}>Karnatak University</h1>
          </div>

          {/* Student info */}
          <div className="px-4 py-3 text-xs border-b border-gray-200 space-y-1">
            <div className="text-gray-500">Exam Month:</div>
            <div className="font-bold text-gray-800">{student.examMonth}</div>
            <div className="text-gray-500">Exam Type:</div>
            <div className="font-bold text-gray-800">{student.examType}</div>
            <div className="text-gray-500">Program Level:</div>
            <div className="font-bold text-gray-800">{student.programLevel}</div>
            <div className="text-gray-500">Program Name:</div>
            <div className="font-bold text-gray-800">{student.programName}</div>
            <div className="pt-1 text-gray-500">Student Reg No:</div>
            <div className="font-bold text-gray-800 font-mono">{student.usn}</div>
            <div className="text-gray-500">Student Name:</div>
            <div className="font-bold text-gray-800">{student.name}</div>
            <div className="text-gray-500">Term/Semester:</div>
            <div className="flex items-center gap-2 mt-0.5">
              <input readOnly value={student.semester} className="border border-gray-300 rounded px-2 py-1 text-xs w-20 text-gray-700 bg-gray-50" />
              <button className="px-3 py-1 text-white text-xs rounded" style={{ background: "#1abc9c" }}>View</button>
            </div>
            <div className="pt-1 font-bold text-blue-600 text-xs">Result Published on {student.publishedAt}</div>
          </div>

          {/* Table controls */}
          <div className="px-4 py-2 flex flex-wrap items-center gap-4 text-xs border-b border-gray-200">
            <div className="flex items-center gap-1">
              <select className="border border-gray-300 rounded px-1 py-0.5 text-xs">
                <option>10</option><option>25</option><option>50</option>
              </select>
              <span className="text-gray-600">entries per page</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-gray-600">Search:</span>
              <input type="text" className="border border-gray-300 rounded px-2 py-0.5 text-xs w-32" />
            </div>
          </div>

          {/* Marks table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: "#1a3a5c", color: "white" }}>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold whitespace-nowrap">Sl.No.</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold whitespace-nowrap">Course<br />Code</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold">Course<br />Name</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold whitespace-nowrap">Maximum<br />Marks</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold whitespace-nowrap">Minimum<br />Marks</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold whitespace-nowrap">SE<br />Marks</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold whitespace-nowrap">IA<br />Marks</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold whitespace-nowrap">Marks<br />Scored</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold">Credits</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold">Grade</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold whitespace-nowrap">Credit<br />Points</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold whitespace-nowrap">Letter<br />Grade</th>
                  <th className="px-2 py-2 border border-blue-900 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.subjects.map((sub, i) => (
                  <tr key={sub.code} style={{ background: i % 2 === 0 ? "#ffffff" : "#eaf0fb" }}>
                    <td className="px-2 py-2 border border-blue-200 text-center">{sub.sl}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center font-mono text-[10px]">{sub.code}</td>
                    <td className="px-2 py-2 border border-blue-200">{sub.name}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center">{sub.maxMarks}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center">{sub.minMarks}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center">{sub.seMarks}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center">{sub.iaMarks}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center font-semibold">{sub.marksScored}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center">{sub.credits}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center font-semibold">{sub.grade}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center">{sub.creditPoints}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center font-semibold">{sub.letterGrade}</td>
                    <td className="px-2 py-2 border border-blue-200 text-center">
                      <span className={sub.status === "Pass" ? "text-green-700 font-semibold" : "text-red-600 font-semibold"}>{sub.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#1a3a5c", color: "white" }}>
                  <td colSpan={13} className="px-3 py-2 text-xs font-semibold border border-blue-900">
                    Result : <span className="text-green-300">{student.result}</span>
                    &nbsp;&nbsp; SGPA : <span className="text-yellow-200">{student.sgpa}</span>
                    &nbsp;&nbsp; CGPA : <span className="text-yellow-200">{student.cgpa}</span>
                    &nbsp;&nbsp; Term Grade : <span className="text-yellow-200">{student.termGrade}</span>
                    &nbsp;&nbsp; Promotion Status : <span className="text-green-300">{student.promotionStatus}</span>
                  </td>
                </tr>
                <tr>
                  <td colSpan={13} className="px-3 py-1 text-[10px] text-gray-500 border border-gray-200">
                    <span className="mr-4">✦ - Re-evaluation</span>
                    <span className="mr-4">* - Retotaling</span>
                    <span># - Challenge Evaluation</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
            Showing 1 to {student.subjects.length} of {student.subjects.length} entries
          </div>
          <div className="px-4 pb-1 flex items-center gap-1 text-xs">
            {["«", "‹", "1", "›", "»"].map((l) => (
              <button key={l} className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-600">{l}</button>
            ))}
          </div>

          {/* Print / Back */}
          <div className="no-print px-4 py-3 flex items-center gap-3 border-t border-gray-100">
            <button
              onClick={() => window.print()}
              className="px-5 py-1.5 text-white text-sm font-semibold rounded hover:opacity-90 transition-opacity"
              style={{ background: "#1abc9c" }}
            >
              Print
            </button>
            <button
              onClick={onBack}
              className="px-5 py-1.5 text-white text-sm font-semibold rounded hover:opacity-90 transition-opacity"
              style={{ background: "#e74c3c" }}
            >
              Back
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mx-4 mb-4 px-3 py-2 text-[11px] text-gray-600 rounded" style={{ background: "#fffde7", border: "1px solid #f9ca24" }}>
            <b>*Note:</b> This cannot be treated as original marks sheet. This result published here is for the immediate information of student. Original marks sheet will be issued by respective university.
          </div>
        </div>
      </div>
    </div>
  );
}
