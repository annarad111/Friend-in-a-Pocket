import { Mic, MicOff } from "lucide-react";
import type { MicState } from "@/hooks/useMicrophoneInput";
import styles from "./MicButton.module.scss";

type Props = {
  micState: MicState;
  onToggle: () => void;
  error: string | null;
};

export const MicButton = ({ micState, onToggle, error }: Props) => (
  <div className={styles.wrap}>
    <button
      type="button"
      className={[
        styles.button,
        micState === "listening" && styles.listening,
        micState === "error" && styles.hasError,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onToggle}
      title={micState === "listening" ? "Oprește înregistrarea" : "Vorbește în loc să scrii"}
      aria-label={micState === "listening" ? "Oprește înregistrarea" : "Activează vocea"}
    >
      {micState === "listening" ? <MicOff size={15} /> : <Mic size={15} />}
    </button>
    {error && <p className={styles.errorMsg}>{error}</p>}
  </div>
);
