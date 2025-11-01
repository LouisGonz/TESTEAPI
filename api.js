import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();

app.get("/noticia/:time", async (req, res) => {
  const time = req.params.time.toLowerCase();
  const url = "https://www.cnnbrasil.com.br/esportes/futebol/brasileirao/";
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const noticias = [];
    $("article").each((_, el) => {
      const titulo = $(el).find("h2, h3").text().trim();
      const link = $(el).find("a").attr("href");
      if (titulo.toLowerCase().includes(time)) {
        noticias.push({
          titulo,
          link: link?.startsWith("http")
            ? link
            : `https://www.cnnbrasil.com.br${link}`,
        });
      }
    });

    if (noticias.length === 0)
      return res.json({ erro: "Nenhuma notícia encontrada sobre " + time });

    res.json(noticias.slice(0, 5));
  } catch (err) {
    res.status(500).json({ erro: "Falha ao buscar notícias" });
  }
});

app.listen(3000, () => console.log("API rodando na porta 3000"));
