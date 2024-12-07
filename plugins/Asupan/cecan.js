const gis = require("g-i-s");
let handler = async (m, { conn, setReply }) => {
  setReply(mess.wait);
  let query = [
    "cecan hd",
    "cecan indo",
    "cewe cantik",
    "cewe aesthetic",
    "cecan aesthetic",
  ];
  let data = await pinterest(query.getRandom());
  conn.sendMessage(
    m.chat,
    { caption: "Random Cewe Cantik", image: { url: data.result.getRandom() } },
    { quoted: m }
  );
};
handler.help = ["no"];
handler.tags = ["random"];
handler.command = ["cecan"];

export default handler;

async function pinterest(query) {
  return new Promise((resolve, reject) => {
    let err = { status: 404, message: "Terjadi kesalahan" };
    gis({ searchTerm: query + " site:id.pinterest.com" }, (er, res) => {
      if (er) return err;
      let hasil = {
        status: 200,
        creator: "chibot",
        result: [],
      };
      res.forEach((x) => hasil.result.push(x.url));
      resolve(hasil);
    });
  });
}
