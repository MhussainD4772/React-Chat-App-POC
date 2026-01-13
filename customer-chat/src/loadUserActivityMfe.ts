let mfeLoaded = false;

export function loadUserActivityMfe(): Promise<void> {
  if (mfeLoaded) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "http://localhost:4173/assets/index-Ae27iuCM.js";
    script.onload = () => {
      mfeLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error("Failed to load User Activity MFE"));
    };

    document.body.appendChild(script);
  });
}
