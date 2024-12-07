import got from 'got';
import cheerio from 'cheerio';
import axios from 'axios';

let handler = async (m, {
    conn,
    text,
    args,
    command,
    usedPrefix
}) => {
    let input = `[!] *wrong input*
    
    Contoh: ${usedPrefix + command} https://vt.tiktok.com/ZSYgBPSLD/`;

    if (!text) return m.reply(input);
    if (!(text.includes('http://') || text.includes('https://'))) return m.reply(`url invalid, please input a valid url. Try with add http:// or https://`);
    if (!text.includes('tiktok.com')) return m.reply(`Invalid Tiktok URL.`);
    
    try {
        const {
            isSlide,
            result,
            title,
            author,
            audio
        } = await tiktok(text);
        let no = 1;
        
        if (isSlide) {
            await m.reply('Terdeteksi url tiktok slide\nFoto dikirim ke chat pribadi');
            let cap = `乂 *TIK TOK SLIDE*\n\n`;
            for (let img of result) {
                const response = await got(img, { responseType: 'buffer' });
                await conn.sendMessage(m.sender, {
                    image: response.body
                });
                await sleep(1000);
            }
        } else {
            await m.reply('Terdeteksi url tiktok video');
            let vd = `*${title}*`;
            const videoResponse = await got(result, { responseType: 'buffer' });
            const audioResponse = audio ? await got(audio, { responseType: 'buffer' }) : null;

            // Sending video
            await conn.sendMessage(m.chat, {
                video: videoResponse.body,
                caption: vd
            }, {
                quoted: m
            });

            // Sending audio if it exists
            if (audioResponse) {
                await conn.sendMessage(m.chat, {
                    audio: audioResponse.body,
                    mimetype: 'audio/mpeg',
                    title: title,
                    fileName: `${title}.mp3`
                }, {
                    quoted: m
                });
            }
        }
    } catch (e) {
        throw e;
    }
}

handler.help = ['tiktok <url>']
handler.tags = ['downloader']
handler.command = /^(t(ik)?t(ok)?|t(ik)?t(ok)?dl)$/i
handler.limit = true;

export default handler;

async function tiktok(url) {
    try {
        const data = new URLSearchParams({
            'id': url,
            'locale': 'id',
            'tt': 'RFBiZ3Bi'
        });

        const headers = {
            'HX-Request': true,
            'HX-Trigger': '_gcaptcha_pt',
            'HX-Target': 'target',
            'HX-Current-URL': 'https://ssstik.io/id',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://ssstik.io/id'
        };

        const response = await axios.post('https://ssstik.io/abc?url=dl', data, { headers });
        const html = response.data;

        const $ = cheerio.load(html);

        const author = $('#avatarAndTextUsual h2').text().trim();
        const title = $('#avatarAndTextUsual p').text().trim();
        const video = $('.result_overlay_buttons a.download_link').attr('href');
        const audio = $('.result_overlay_buttons a.download_link.music').attr('href');
        const imgLinks = [];
        
        $('img[data-splide-lazy]').each((index, element) => {
            const imgLink = $(element).attr('data-splide-lazy');
            imgLinks.push(imgLink);
        });

        const result = {
            isSlide: video ? false : true,
            author,
            title,
            result: video || imgLinks,
            audio
        };
        return result;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
		}