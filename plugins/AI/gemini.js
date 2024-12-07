import fetch from "node-fetch";

let handler = async (m, { q, conn, args, usedPrefix, command }) => {
  if (!q) return m.reply("Mau ngomong apa?");
  try {
    const apikey = "AIzaSyCqGgjrwRyoSnVHMRuysD16TwfmYJC2VTs";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apikey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: q
        }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    await conn.sendMessage(m.chat, { text: generatedText }, { quoted: m });
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    m.reply("Maaf, terjadi kesalahan saat memproses permintaan.");
  }
};

handler.help = ["gemini"];
handler.tags = ["internet", "ai", "gemini"];
handler.command = ["gemini"];

export default handler;