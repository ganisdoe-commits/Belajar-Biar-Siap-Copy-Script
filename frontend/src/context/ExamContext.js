import React, { createContext, useContext, useState, useCallback } from "react";
import { buildQuestions } from "../mock";

const ExamContext = createContext(null);

export const useExam = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be used within ExamProvider");
  return ctx;
};

const STORAGE_KEY = "uskp_candidate";

export const ExamProvider = ({ children }) => {
  // Candidate profile (disimpan di browser untuk suasana login)
  const [candidate, setCandidate] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Sesi ujian aktif
  const [session, setSession] = useState(null);
  // Riwayat hasil ujian
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("uskp_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const loginCandidate = useCallback((data) => {
    setCandidate(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const logoutCandidate = useCallback(() => {
    setCandidate(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Mulai sesi ujian untuk mata ujian tertentu
  const startSession = useCallback((subject) => {
    const questions = buildQuestions(subject.id, subject.totalQuestions);
    const newSession = {
      subject,
      questions,
      answers: {}, // { questionId: "A" }
      flags: {}, // { questionId: true }
      notes: "",
      startedAt: Date.now(),
      durationSec: subject.durationMin * 60,
      submitted: false,
    };
    setSession(newSession);
    return newSession;
  }, []);

  const setAnswer = useCallback((qid, key) => {
    setSession((s) => (s ? { ...s, answers: { ...s.answers, [qid]: key } } : s));
  }, []);

  const toggleFlag = useCallback((qid) => {
    setSession((s) => {
      if (!s) return s;
      const flags = { ...s.flags };
      if (flags[qid]) delete flags[qid];
      else flags[qid] = true;
      return { ...s, flags };
    });
  }, []);

  const setNotes = useCallback((text) => {
    setSession((s) => (s ? { ...s, notes: text } : s));
  }, []);

  const submitSession = useCallback(() => {
    let result = null;
    setSession((s) => {
      if (!s) return s;
      let correct = 0;
      s.questions.forEach((q) => {
        if (s.answers[q.id] === q.answer) correct += 1;
      });
      const score = +(correct * 2.5).toFixed(2);
      result = {
        id: Date.now(),
        subjectId: s.subject.id,
        subjectName: s.subject.name,
        total: s.questions.length,
        correct,
        wrong: Object.keys(s.answers).length - correct,
        unanswered: s.questions.length - Object.keys(s.answers).length,
        score,
        passed: score >= 60,
        date: new Date().toISOString(),
      };
      return { ...s, submitted: true, result };
    });
    // simpan riwayat
    setTimeout(() => {
      setHistory((h) => {
        if (!result) return h;
        const updated = [result, ...h].slice(0, 20);
        localStorage.setItem("uskp_history", JSON.stringify(updated));
        return updated;
      });
    }, 0);
    return result;
  }, []);

  const clearSession = useCallback(() => setSession(null), []);

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
        history,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};
