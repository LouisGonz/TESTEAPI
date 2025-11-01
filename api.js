import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = 3000;

async function extrairBrasileirao() {
  const url = "https://www.cnnbrasil.com.br/esportes/futebol/brasileirao/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  // Banner
  const banner = $(".banner-brasileirao__logo").attr("src");

  // Notícias
  const noticias = [];
  $("a:has(figure)").each((i, el) => {
    const link = $(el).attr("href");
    const titulo = $(el).find("h2").text().trim();
    const imagem = $(el).find("img").attr("src");
    if (titulo && link) noticias.push({
      titulo,
      link: link.startsWith("http") ? link : `https://www.cnnbrasil.com.br${link}`,
      imagem
    });
  });

  // Times
  const times = [];
  $(".team-item").each((i, el) => {
    const nome = $(el).find(".team-tooltip").text().trim();
    const sigla = $(el).find(".short-name").text().trim();
    const link = $(el).find("a").attr("href");
    const logo = $(el).find("img").attr("src");
    times.push({
      nome,
      sigla,
      link,
      logo
    });
  });

  return { banner, noticias, times };
}

// Rota principal da API
app.get("/brasileirao", async (req, res) => {
  try {
    const data = await extrairBrasileirao();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para notícias de um time específico
app.get("/brasileirao/:time", async (req, res) => {
  try {
    const timeParam = req.params.time.toLowerCase();
    const { noticias } = await extrairBrasileirao();
    
    // Filtra notícias que contenham o nome do time
    const filtradas = noticias.filter(n => n.titulo.toLowerCase().includes(timeParam));

    res.json(filtradas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
