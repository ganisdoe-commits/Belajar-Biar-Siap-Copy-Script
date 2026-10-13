import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import * as api from "../api";

const ExamContext = createContext(null);

export const useExam = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be used within ExamProvider");
  return ctx;
};

const STORAGE_KEY = "bbp_candidate";
const SESSION_KEY = "bbp_session";

const readJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const ExamProvider = ({ children }) => {
  const [candidate, setCandidate] = useState(() => {
    const c = readJSON(STORAGE_KEY);
    return c?.secret ? c : null;
  });
  const [session, setSessionState] = useState(() => readJSON(SESSION_KEY));
  const sessionRef = useRef(session);
  const setSession = useCallback((val) => {
    setSessionState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      sessionRef.current = next;
      return next;
    });
  }, []);

  // Simpan otomatis ke memori perangkat setiap ada perubahan (seperti CAT asli).
  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  const loginCandidate = useCallback(async (name) => {
    const data = await api.registerCandidate(name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setCandidate(data);
    return data;
  }, []);

  const logoutCandidate = useCallback(() => {
    setCandidate(null);
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, [setSession]);

  const startSession = useCallback(async (subject) => {
    const data = await api.startExam({ subject_id: subject.id });
    const offset = new Date(data.server_time).getTime() - Date.now();
    const newSession = {
      sessionId: data.session_id,
      subject: data.subject,
      questions: data.questions,
      answers: {},
      flags: {},
      notes: "",
      sheet: {},
      durationSec: data.duration_sec,
      startedAt: data.started_at,
      deadlineMs: new Date(data.deadline).getTime() - offset,
      graceSec: data.grace_sec,
      savedAt: null,
      submitted: false,
    };
    setSession(newSession);
    return newSession;
  }, [setSession]);

  const patch = useCallback((fn) => setSession((s) => (s && !s.submitted ? fn(s) : s)), [setSession]);
  const setAnswer = useCallback((qid, key) => patch((s) => ({ ...s, answers: { ...s.answers, [qid]: key } })), [patch]);
  const toggleFlag = useCallback((qid) => patch((s) => {
    const flags = { ...s.flags };
    if (flags[qid]) delete flags[qid];
    else flags[qid] = true;
    return { ...s, flags };
  }), [patch]);
  const setNotes = useCallback((text) => patch((s) => ({ ...s, notes: text })), [patch]);
  const setSheet = useCallback((sheet) => patch((s) => ({ ...s, sheet })), [patch]);

  const syncSession = useCallback(async () => {
    const s = sessionRef.current;
    if (!s || s.submitted) return null;
    const res = await api.saveExam(s.sessionId, { answers: s.answers, flags: s.flags });
    setSession((cur) => (cur && cur.sessionId === s.sessionId ? { ...cur, savedAt: res.saved_at } : cur));
    return res;
  }, [setSession]);

  const submitSession = useCallback(async () => {
    const s = sessionRef.current;
    if (!s || s.submitted) return s?.result || null;
    const data = await api.submitExam({ session_id: s.sessionId, answers: s.answers });
    setSession({ ...s, submitted: true, finishedAt: data.result.date, result: data.result, review: data.review });
    return data.result;
  }, [setSession]);

  const clearSession = useCallback(() => setSession(null), [setSession]);

  return (
    <ExamContext.Provider
      value={{
        candidate, loginCandidate, logoutCandidate, session, startSession,
        setAnswer, toggleFlag, setNotes, setSheet, syncSession, submitSession, clearSession,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};
