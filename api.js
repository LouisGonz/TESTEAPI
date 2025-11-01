import express from "express";
import Parser from "rss-parser";

const app = express();
const parser = new Parser();

// URL do RSS do Brasileirão da CNN Brasil
const RSS_URL = "https://www.cnnbrasil.com.br/esportes/futebol/brasileirao/feed/";

app.get("/", (req, res) => {
  res.send("API no ar! Use /noticia/:time para buscar notícias de times do Brasileirão.");
});

app.get("/noticia/:time", async (req, res) => {
  const time = req.params.time.toLowerCase();

  try {
    const feed = await parser.parseURL(RSS_URL);

    // Filtrar notícias que contêm o time no título
    const noticias = feed.items
      .filter(item => item.title.toLowerCase().includes(time))
      .map(item => ({
        titulo: item.title,
        link: item.link,
        pubDate: item.pubDate,
      }));

    if (noticias.length === 0) {
      return res.json({ erro: `Nenhuma notícia encontrada sobre ${req.params.time}` });
    }

    res.json(noticias.slice(0, 5)); // retorna no máximo 5 notícias
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Falha ao buscar notícias" });
  }
});

app.listen(3000, () => console.log("API rodando na porta 3000"));
