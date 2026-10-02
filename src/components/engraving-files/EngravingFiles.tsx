"use client";
import { useEffect, useRef, useState } from "react";
import { useEngravingFiles, uploadEngravingFile, removeEngravingFile, reconcileEngravingFiles, cancelEngravingFile } from "@/lib/cart/engravingFiles";
import styles from "./EngravingFiles.module.css";

export default function EngravingFiles({ disabled = false }: { disabled?: boolean }) {
  const files = useEngravingFiles(s => s.files), note = useEngravingFiles(s => s.note);
  const hydrated = useEngravingFiles(s => s.hydrated), setNote = useEngravingFiles(s => s.setNote);
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState(""), [removing, setRemoving] = useState("");
  useEffect(() => { if (hydrated) void reconcileEngravingFiles(); }, [hydrated]);
  const busy = disabled || !hydrated || !!removing;
  return <section className={styles.block} aria-label="Макет для гравировки">
    <div className={styles.heading}><h2>Макет для гравировки</h2><span>Необязательно</span></div>
    <p className={styles.hint}>Прикрепите логотип или рисунок. Если макета пока нет, его можно передать менеджеру после заказа.</p>
    {files.length > 0 && <ul className={styles.files}>{files.map(file => <li key={file.id}>
      <div className={styles.file}><span className={styles.name}>{file.name}</span>
        <span className={file.status === "error" ? styles.error : styles.status} role="status">{file.status === "uploading" ? "Загружаем…" : file.status === "ready" ? "Загружен" : file.error}</span></div>
      <button type="button" className={styles.remove} disabled={busy} aria-label={`${file.status === "uploading" ? "Отменить загрузку" : "Удалить"} ${file.name}`}
        onClick={async () => { if (file.status === "uploading") { cancelEngravingFile(file.id); return; } setRemoving(file.id); setMessage(""); if (!await removeEngravingFile(file.id)) setMessage("Не удалось удалить файл. Попробуйте ещё раз."); setRemoving(""); }}>
        {removing === file.id ? "Удаляем…" : file.status === "uploading" ? "Отменить" : file.status === "error" ? "Продолжить без файла" : "Удалить"}</button>
    </li>)}</ul>}
    <div className={styles.actions}>
      <input ref={input} type="file" className={styles.input} accept=".jpg,.jpeg,.png,.pdf,.svg" multiple disabled={busy || files.length >= 3}
        aria-label="Прикрепить макет гравировки" onChange={event => { setMessage(""); for (const file of Array.from(event.target.files || [])) { const error = uploadEngravingFile(file); if (error) { setMessage(error); break; } } event.target.value = ""; }} />
      <button type="button" className={styles.attach} disabled={busy || files.length >= 3} onClick={() => input.current?.click()}>＋ Прикрепить файл</button>
      <span className={styles.formats}>JPG, PNG, PDF, SVG · до 3 файлов по 10 МБ</span>
    </div>
    {files.length > 0 && <details className={styles.details}><summary>Комментарий к макету</summary>
      <label htmlFor="engraving-file-note">Укажите, к каким товарам относится каждый макет, если они разные.</label>
      <textarea id="engraving-file-note" rows={2} maxLength={500} value={note} disabled={disabled} onChange={event => setNote(event.target.value)} placeholder="Например: первый логотип — на шейкеры, второй — на ложки" />
    </details>}
    {message && <p className={styles.error} role="alert">{message}</p>}
  </section>;
}
