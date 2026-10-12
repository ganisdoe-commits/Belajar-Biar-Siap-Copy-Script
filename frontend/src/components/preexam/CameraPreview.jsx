import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";

export default function CameraPreview() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [state, setState] = useState("idle");

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setState("on");
    } catch {
      setState("denied");
    }
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  return (
    <div data-testid="camera-preview" className="rounded-xl border border-indigo-800 bg-indigo-950/60 p-4">
      <div className="text-sm font-bold text-white">Pratinjau Kamera</div>
      <p className="mt-0.5 text-xs text-indigo-300">Hanya tampil di layar Anda — tidak direkam dan tidak dikirim ke mana pun.</p>
      <div className="mt-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-black/60">
        <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full -scale-x-100 object-cover ${state === "on" ? "" : "hidden"}`} />
        {state !== "on" && (
          <div className="flex flex-col items-center gap-2 p-4 text-center text-xs text-indigo-300">
            <CameraOff className="h-6 w-6" />
            {state === "denied" ? "Kamera tidak tersedia atau izin ditolak. Simulasi tetap dapat dilanjutkan." : "Kamera belum aktif"}
          </div>
        )}
      </div>
      {state !== "on" && (
        <button data-testid="camera-enable-button" onClick={start} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-700 py-2 text-sm font-semibold text-indigo-100 hover:bg-indigo-800">
          <Camera className="h-4 w-4" /> Aktifkan Kamera
        </button>
      )}
    </div>
  );
}
