import { igdl } from 'ruhend-scraper';

async function handler(m, { command, usedPrefix, conn, text, q }) {
  if (!q) {
    return conn.reply(m.chat, 'Harap berikan URL Instagram untuk diunduh!', m);
  }

  try {
    const result = await igdl(q);

    if (!result || !result.status) {
      return conn.reply(m.chat, 'Gagal mendapatkan data dari URL Instagram. Coba URL lain!', m);
    }

    if (result.data && result.data.length > 0) {
      const mediaCount = result.data.length;
      if (mediaCount > 3) {
        const mediaUrls = result.data.map(item => item.url);
        for (const url of mediaUrls) {
          await conn.sendMessage(m.sender, { image: { url }, caption: 'Foto dari Instagram' }, { quoted: m });
        }
        return conn.reply(m.chat, `Terdapat ${mediaCount} foto. Semua foto telah dikirim ke chat pribadi Anda.`, m);
      } else {
        for (const media of result.data) {
          if (media.url) {
            await conn.sendMessage(m.chat, { video: { url: media.url }, caption: 'Video dari Instagram' }, { quoted: m });
          }
        }
        return conn.reply(m.chat, 'Unduhan selesai!', m);
      }
    } else {
      return conn.reply(m.chat, 'Data tidak ditemukan untuk URL ini.', m);
    }
  } catch (error) {
    console.error(error);
    return conn.reply(m.chat, 'Terjadi kesalahan saat memproses permintaan Anda.', m);
  }
}

handler.command = /^(ig|instagram)$/i;
handler.help = ['instagram'];
handler.tags = ['downloader'];

export default handler;