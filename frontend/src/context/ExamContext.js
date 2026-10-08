import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import * as api from "../api";

const ExamContext = createContext(null);

export const useExam = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be used within ExamProvider");
  return ctx;
};

const STORAGE_KEY = "bbp_candidate";

export const ExamProvider = ({ children }) => {
  const [candidate, setCandidate] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [session, setSessionState] = useState(null);
  const sessionRef = useRef(null);
  const setSession = useCallback((val) => {
    setSessionState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      sessionRef.current = next;
      return next;
    });
  }, []);

  const loginCandidate = useCallback((data) => {
    setCandidate(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const logoutCandidate = useCallback(() => {
    setCandidate(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const startSession = useCallback(async (subject) => {
    const data = await api.getExam(subject.id);
    const newSession = {
      subject: data.subject,
      questions: data.questions,
      answers: {},
      flags: {},
      notes: "",
      durationSec: data.duration_sec,
      submitted: false,
    };
    setSession(newSession);
    return newSession;
  }, [setSession]);

  const setAnswer = useCallback((qid, key) => {
    setSession((s) => (s ? { ...s, answers: { ...s.answers, [qid]: key } } : s));
  }, [setSession]);

  const toggleFlag = useCallback((qid) => {
    setSession((s) => {
      if (!s) return s;
      const flags = { ...s.flags };
      if (flags[qid]) delete flags[qid];
      else flags[qid] = true;
      return { ...s, flags };
    });
  }, [setSession]);

  const setNotes = useCallback((text) => {
    setSession((s) => (s ? { ...s, notes: text } : s));
  }, [setSession]);

  const submitSession = useCallback(async () => {
    const s = sessionRef.current;
    if (!s) return null;
    const data = await api.submitExam({
      subject_id: s.subject.id,
      candidate: candidate || { name: "Peserta", id: "" },
      answers: s.answers,
    });
    setSession({ ...s, submitted: true, result: data.result, review: data.review });
    return data.result;
  }, [candidate, setSession]);

  const clearSession = useCallback(() => setSession(null), [setSession]);

  return (
    <ExamContext.Provider
      value={{
        candidate,
        loginCandidate,
        logoutCandidate,
        session,
        startSession,
        setAnswer,
        toggleFlag,
        setNotes,
        submitSession,
        clearSession,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};
