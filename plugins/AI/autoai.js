import { Blackbox } from "../../lib/ai/blackbox.js";
const blackbox = new Blackbox();
const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!db.data.dbai.blackboxchat) db.data.dbai.blackboxchat = {};
  const session = db.data.dbai.blackboxchat[m.sender];
  const inputText = args.length
    ? args.join(" ")
    : m.quoted?.text || m.quoted?.caption || m.quoted?.description || null;
  if (!inputText) {
    return m.reply(
      `Masukkan teks atau reply pesan dengan teks yang ingin diolah.\nContoh penggunaan:\n*${usedPrefix}${command} Hai, apa kabar?*`,
    );
  }
  await conn.sendMessage(m.chat, { react: { text: "ðŸ”Ž", key: m.key } });
  try {
    const input = [
      {
        role: "user",
        content: inputText,
      },
    ];
    const data = await blackbox.chat(
      input,
      "Realtime",
      true,
      false,
      false,
      false,
    );
    const answer = data.slice(data.lastIndexOf("$") + 1);
    if (answer) {
      const output = answer;
      const snippets = [...output.matchAll(/```([^`]+)```/g)].map((match) =>
        match[1].trim(),
      );
      let result;
      if (snippets.length) {
        const ctaButton = conn.ctaButton.setBody(output);
        let index = 1;
        for (const snippet of snippets) {
          ctaButton.addCopy(`Snippet ${index++}`, snippet);
        }
        result = await ctaButton.run(m.chat, conn, m);
      } else {
        result = await conn.reply(m.chat, output, m);
      }
      const {
        key: { id: keyId },
      } = result;
      db.data.dbai.blackboxchat[m.sender] = {
        key: {
          id: keyId,
        },
      };
      await conn.sendMessage(m.chat, { react: { text: "ðŸ”Ž", key: m.key } });
    } else {
      console.error("Handler error:");
      await conn.sendMessage(m.chat, { react: { text: "ðŸ”Ž", key: m.key } });
    }
  } catch (error) {
    console.error("Handler error:", error);
    await conn.sendMessage(m.chat, { react: { text: "ðŸ”Ž", key: m.key } });
  }
};
handler.before = async (m, { conn }) => {
  if (
    !db.data.dbai.blackboxchat ||
    m.isBaileys ||
    !(m.sender in db.data.dbai.blackboxchat)
  )
    return;
  const {
    key: { id: keyId },
  } = db.data.dbai.blackboxchat[m.sender];
  if (m.quoted?.id === keyId && m.text.trim()) {
    m.react(wait);
    try {
      const input = [
        {
          role: "user",
          content: m.text.trim(),
        },
      ];
      const data = await blackbox.chat(
        input,
        "Realtime",
        true,
        false,
        false,
        false,
      );
      const answer = data.slice(data.lastIndexOf("$") + 1);
      if (answer) {
        const output = answer;
        const snippets = [...output.matchAll(/```([^`]+)```/g)].map((match) =>
          match[1].trim(),
        );
        let result;
        if (snippets.length) {
          const ctaButton = conn.ctaButton.setBody(output);
          let index = 1;
          for (const snippet of snippets) {
            ctaButton.addCopy(`Snippet ${index++}`, snippet);
          }
          result = await ctaButton.run(m.chat, conn, m);
        } else {
          result = await conn.reply(m.chat, output, m);
        }
        const {
          key: { id: newKeyId },
        } = result;
        db.data.dbai.blackboxchat[m.sender].key.id = newKeyId;
        await conn.sendMessage(m.chat, { react: { text: "ðŸ”Ž", key: m.key } });
      } else {
        await conn.sendMessage(m.chat, { react: { text: "ðŸ”Ž", key: m.key } });
      }
    } catch (error) {
      console.error("Handler before error:", error);
      await conn.sendMessage(m.chat, { react: { text: "ðŸ”Ž", key: m.key } });
    }
  }
};
handler.help = ["autoai"];
handler.tags = ["owner"];
handler.command = /^(autoai)$/i;
export default handler;