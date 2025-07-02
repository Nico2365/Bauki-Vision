import React, { useState } from "react";

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult("");
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(",")[1];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "system",
              content: "Du bist ein Baukontroll-KI-System. Analysiere das Bild nach DIN 18202 (Toleranzen im Hochbau) und anderen Bauvorschriften. Berichte über sichtbare Abweichungen oder Fehler."
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
                {
                  type: "text",
                  text: "Bitte überprüfe dieses Baustellenbild und liste alle erkennbaren baulichen Mängel oder Verstöße gegen Normen wie DIN 18202 auf.",
                },
              ],
            },
          ],
          max_tokens: 1000
        })
      });

     const data = await response.json();
if (!response.ok) {
  console.error("Fehler von OpenAI:", data);
  setResult("❌ Fehler: " + (data.error?.message || "Unbekannter Fehler"));
} else {
  const text = data.choices?.[0]?.message?.content || "Keine Antwort erhalten.";
  setResult(text);
}
      setLoading(false);
    };

    reader.readAsDataURL(image);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-center">Bau-KI mit Bilderkennung</h1>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {preview && <img src={preview} alt="Vorschau" className="max-w-md rounded shadow" />}
      <button
        onClick={analyzeImage}
        disabled={!image || loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Analyse läuft..." : "Bild analysieren"}
      </button>
      {result && (
        <div className="mt-6 p-4 bg-white rounded shadow max-w-2xl whitespace-pre-wrap">
          <h2 className="text-xl font-semibold mb-2">Analyseergebnis:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}