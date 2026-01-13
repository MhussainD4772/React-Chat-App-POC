import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { loadUserActivityMfe } from "./loadUserActivityMfe";

type ChatData = {
  chatId: string;
  customerId: string;
};

interface UserActivityMFE extends HTMLElement {
  authContext: { userId: string; roles: string[] } | null;
  bffBaseUrl: string;
}

export default function UserActivityPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mfeRef = useRef<UserActivityMFE | null>(null);

  const chatData: ChatData | undefined = location.state?.chatData;

  // Derive authContext from host state (important concept)
  const authContext = chatData
    ? {
        userId: chatData.customerId,
        roles: ["customer"], // host decides roles
      }
    : null;

  useEffect(() => {
    if (!open || !containerRef.current) return;

    let cancelled = false;

    // Helper to wait for custom element to be defined
    const waitForCustomElement = (): Promise<void> => {
      return new Promise((resolve) => {
        if (customElements.get("user-activity-mfe")) {
          resolve();
          return;
        }
        // Wait for custom element to be defined (with timeout)
        const checkInterval = setInterval(() => {
          if (customElements.get("user-activity-mfe")) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(); // Resolve anyway to avoid hanging
        }, 5000);
      });
    };

    loadUserActivityMfe()
      .then(() => {
        console.log("MFE script loaded, waiting for custom element...");
        return waitForCustomElement();
      })
      .then(() => {
        if (cancelled || !containerRef.current) {
          console.log("Cancelled or container not available");
          return;
        }

        if (!customElements.get("user-activity-mfe")) {
          console.error("Custom element 'user-activity-mfe' is not defined");
          return;
        }

        // Clean up any existing MFE
        if (mfeRef.current) {
          mfeRef.current.remove();
          mfeRef.current = null;
        }

        console.log("Creating user-activity-mfe element...");
        const mfe = document.createElement(
          "user-activity-mfe"
        ) as UserActivityMFE;
        mfe.setAttribute("tenant-id", "chat-app");

        mfe.authContext = authContext;
        mfe.bffBaseUrl = "http://localhost:8001";

        console.log("MFE props set:", {
          authContext,
          bffBaseUrl: mfe.bffBaseUrl,
        });

        mfe.addEventListener("mfe:action", (e: any) => {
          if (e.detail.type === "apiError") {
            console.error("Host received MFE error:", e.detail.payload);
          }
        });

        containerRef.current.appendChild(mfe);
        mfeRef.current = mfe;
        console.log("MFE element mounted successfully");
      })
      .catch((err: unknown) => {
        console.error("Failed to load User Activity MFE:", err);
      });

    return () => {
      cancelled = true;
      if (mfeRef.current && containerRef.current) {
        mfeRef.current.remove();
        mfeRef.current = null;
      }
    };
  }, [open, authContext]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 60,
        right: 20,
        width: 360,
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <b>User Activity</b>
        <button onClick={onClose}>✕</button>
      </div>

      <div ref={containerRef} style={{ marginTop: 8 }} />
    </div>
  );
}
