const LLMP_API = import.meta.env.VITE_LLM_API;
const LLMP_MODEL = import.meta.env.VITE_LLM_MODEL;

self.addEventListener("message", async (e) => {
  if (!LLMP_MODEL || !LLMP_API) {
    return;
  }

  if (e.data.type === "theme-name-suggestion/request") {
    if (e.data.image instanceof Blob === false) {
      throw new Error("invalid image");
    }
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        resolve(reader.result as string);
      });
      reader.addEventListener("error", () => {
        reject("unable to convert image to base64");
      });
      reader.readAsDataURL(e.data.image);
    });

    const response = await fetch(`${LLMP_API}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: LLMP_MODEL,
        prompt:
          'This image is a grid of cards from one memory game theme. Suggest 3 theme names. Name 1: the single broadest word that fits ALL cards, preferring a franchise or brand if one is recognizable (e.g. Disney, Pokemon), otherwise a category (e.g. Animals). Names 2-3: different, slightly more specific alternatives, max 2 words, prefer 1 word. Reply as JSON: {"names": ["..."]}',
        options: { temperature: 0 },
        images: [base64.split(",")[1]],
        format: "json",
        think: false,
        stream: false,
      }),
    }).then((r) => r.json());

    if ("response" in response && typeof response.response === "string") {
      const names = JSON.parse(response.response).names;
      self.postMessage({
        type: "theme-name-suggestion/response",
        names,
      });
    }
  }
});
