// Gera o site estático em dist/.
// Uso: npm run build
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import matter from 'gray-matter';
import { servicos, icones, videos } from './src/servicos.mjs';
import config from './src/config.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const H = { orange: '#F27123', tinta: '#1E2B28', verde: '#0B4D3F', noite: '#063A2F' };

fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });

const pages = []; // para o sitemap

// ---------- Blog: lê os artigos ----------
const blogDir = path.join(ROOT, 'content/blog');
const posts = fs.readdirSync(blogDir)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  .map((f) => {
    const { data, content } = matter(fs.readFileSync(path.join(blogDir, f), 'utf8'));
    const slug = data.slug || f.replace(/\.md$/, '');
    if (!data.titulo || !data.data) throw new Error(`Artigo ${f}: faltam "titulo" ou "data" no cabeçalho.`);
    const d = data.data instanceof Date ? data.data : new Date(data.data + 'T12:00:00');
    return { ...data, slug, date: d, html: marked.parse(content) };
  })
  .filter((p) => p.rascunho !== true)
  .sort((a, b) => b.date - a.date);
const fmtData = (d) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// ---------- Partes comuns ----------
const linkStyle = 'color: #0B4D3F; text-decoration: none; padding: 12px 0; border-bottom: 3px solid transparent';
const header = (ativo) => read('src/partials/header.html')
  .replace('<!--BLOGLINK-->', `<a href="/blog/" style="${linkStyle}">Blog</a>\n`)
  .replace(new RegExp(`(<a href="${ativo}" style="color: #0B4D3F; text-decoration: none; padding: 12px 0; border-bottom: 3px solid )transparent`), `$1${H.orange}`);
const footer = read('src/partials/footer.html')
  .replace('<!--BLOGLINKFOOT-->', '<a href="/blog/" style="color: #D3E4DD; text-decoration: none">Blog</a>\n');

const schemaEmpresa = {
  '@context': 'https://schema.org',
  '@type': 'HousekeepingService',
  '@id': `${config.url}/#empresa`,
  name: 'DIMA Limpeza Profissional',
  url: `${config.url}/`,
  logo: `${config.url}/img/dima-logo.png`,
  image: `${config.url}/img/og-dima.png`,
  telephone: config.telefone,
  email: config.email,
  foundingDate: '2002',
  slogan: 'Limpeza é o nosso negócio',
  sameAs: config.redes,
  ...(config.areaAtendida.length ? { areaServed: config.areaAtendida.map((c) => (typeof c === 'string' ? { '@type': 'City', name: c } : c)) } : {}),
};

function layout({ titulo, descricao, caminho, corpo, ativo = '', schema = [], imagem = '/img/og-dima.png', tipo = 'website' }) {
  const url = config.url + caminho;
  pages.push(caminho);
  const ld = [schemaEmpresa, ...schema].map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${tipo}">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="DIMA Limpeza Profissional">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${config.url}${imagem}">
<meta name="theme-color" content="#063A2F">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&amp;family=Open+Sans:wght@400;600;700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/site.css">
${ld}
</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<div style="font-family: 'Open Sans', system-ui, sans-serif; color: #1E2B28; background: #FFFFFF; font-size: 16px; line-height: 1.6">
${header(ativo)}
<main id="conteudo">
${corpo}
</main>
${footer}
</div>
<script src="/site.js" defer></script>
</body>
</html>
`;
}

function write(caminho, html) {
  const dir = path.join(DIST, caminho);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const h2 = (t, extra = '') => `<h2 style="margin: 0 0 12px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 34px; line-height: 1.15; text-transform: uppercase; color: #0B4D3F${extra}">${t}</h2>`;
const btnLaranja = (href, t) => `<a href="${href}" style="background: ${H.orange}; color: #0B2A22; text-decoration: none; font-weight: 700; padding: 14px 24px; border-radius: 8px; display: inline-flex; align-items: center; min-height: 48px; box-sizing: border-box">${t}</a>`;
const play = (w = 72) => `<svg aria-hidden="true" width="${w}" height="${Math.round(w * 0.72)}" viewBox="0 0 64 46"><rect width="64" height="46" rx="12" fill="#CC0000"></rect><path d="M26 14l16 9-16 9z" fill="#FFFFFF"></path></svg>`;
const wa = (msg) => `${config.whatsapp}?text=${encodeURIComponent(msg)}`;

function blocoVideo(v) {
  const info = videos[v.id];
  return `<section style="background: #FFF8F2; border-top: 1px solid #F6DCC6; border-bottom: 1px solid #F6DCC6">
<div style="max-width: 1200px; margin: 0 auto; padding: 72px 24px; display: flex; flex-wrap: wrap; gap: 32px 48px; align-items: center">
<a href="https://www.youtube.com/watch?v=${v.id}" aria-label="Assistir no YouTube: ${esc(info.titulo)}" style="flex: 1 1 520px; min-width: 0; aspect-ratio: 16 / 9; border-radius: 14px; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; text-decoration: none; background: #0B4D3F"><img src="/img/videos/${v.id}.webp" alt="" loading="lazy" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover"><span style="position: relative; display: flex; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.45))">${play()}</span><span style="position: absolute; right: 12px; bottom: 12px; background: rgba(0,0,0,0.6); color: #FFFFFF; font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 4px">${info.views} visualizações</span></a>
<div style="flex: 1 1 340px; min-width: 0">
<img src="/img/dicas-da-carol-logo.webp" alt="Dicas da Carol" width="200" height="101" loading="lazy" style="width: 200px; height: auto; mix-blend-mode: multiply; margin-bottom: 12px">
<h2 style="margin: 0 0 12px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 26px; line-height: 1.2; text-transform: uppercase; color: #0B4D3F">${esc(v.chamada)}</h2>
<p style="margin: 0 0 8px; color: #3D4C48">${esc(v.texto)}</p>
<p style="margin: 0 0 20px; color: #3D4C48; font-size: 14px">Vídeo: ${esc(info.titulo)}</p>
<a href="https://www.youtube.com/@DicasdaCarol?sub_confirmation=1" style="background: #CC0000; color: #FFFFFF; text-decoration: none; font-weight: 700; padding: 13px 22px; border-radius: 8px; min-height: 48px; box-sizing: border-box; display: inline-flex; align-items: center">Inscreva-se no canal</a>
</div>
</div>
</section>`;
}

function blocoCTA(titulo, msg) {
  return `<div style="background: #0B4D3F; color: #FFFFFF; border-radius: 16px; padding: 40px; display: flex; flex-wrap: wrap; gap: 24px; align-items: center; justify-content: space-between">
<div style="flex: 1 1 420px">
<h2 style="margin: 0 0 8px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 26px; text-transform: uppercase">${esc(titulo)}</h2>
<p style="margin: 0; color: #D3E4DD">Fale com nossa equipe e solicite uma avaliação.</p>
</div>
${btnLaranja(wa(msg), 'Falar pelo WhatsApp')}
</div>`;
}

// ---------- Home ----------
write('/', layout({
  titulo: 'Limpeza profissional pós-obra, industrial e fachadas | DIMA',
  descricao: 'Desde 2002 em limpeza pós-obra, industrial, vidros e fachadas. Equipe treinada e equipamentos adequados. Solicite uma avaliação.',
  caminho: '/',
  corpo: read('src/home.html'),
  schema: [{
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'DIMA Limpeza Profissional', url: `${config.url}/`, inLanguage: 'pt-BR',
  }],
}));

// ---------- Páginas de serviço ----------
const porSlug = Object.fromEntries(servicos.map((s) => [s.slug, s]));
const check = `<span style="width: 26px; height: 26px; border-radius: 13px; background: ${H.orange}; flex: none; display: flex; align-items: center; justify-content: center; margin-top: 1px"><svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"></path></svg></span>`;
const etapaNum = (n) => `<span style="width: 48px; height: 48px; border-radius: 24px; background: ${H.orange}; color: #0B2A22; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 20px; display: flex; align-items: center; justify-content: center">${n}</span>`;

for (const s of servicos) {
  const caminho = `/servicos/${s.slug}/`;
  const msg = `Olá! Vim pelo site e quero solicitar uma avaliação de ${s.nome.toLowerCase()}.`;
  const etapas = [
    ['Avaliação', s.avaliacao],
    ['Planejamento', 'Definimos técnica, produtos e equipamentos para cada superfície.'],
    ['Execução', 'Equipe especializada, com segurança e qualidade.'],
    ['Supervisão', 'Acompanhamento em todas as etapas.'],
    ['Entrega', 'Ambiente limpo, preservado e pronto para uso.'],
  ];
  const corpo = `
<section style="background: #F4F6F5; position: relative; overflow: hidden">
<div class="faixa-deco" style="position: absolute; top: -120px; left: -160px; width: 420px; height: 260px; background: ${H.orange}; transform: rotate(-28deg); border-radius: 0 0 200px 0" aria-hidden="true"></div>
<div style="max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px; position: relative">
<nav class="migalhas" aria-label="Você está em" style="font-size: 14px; color: #3D4C48; margin-bottom: 32px; padding-left: 180px">
<a href="/" style="text-decoration: none">Início</a> › <a href="/#servicos" style="text-decoration: none">Serviços</a> › <span aria-current="page">${esc(s.nome)}</span>
</nav>
<div style="display: flex; flex-wrap: wrap; gap: 48px; align-items: center">
<div style="flex: 1 1 480px; min-width: 0">
<h1 style="margin: 0 0 20px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 46px; line-height: 1.1; text-transform: uppercase; color: #0B4D3F">${esc(s.nome)}</h1>
<p style="margin: 0 0 28px; font-size: 19px; color: #3D4C48; max-width: 560px">${esc(s.lead)}</p>
<div style="display: flex; flex-wrap: wrap; gap: 12px">
${btnLaranja(wa(msg), 'Solicitar avaliação pelo WhatsApp')}
<a href="#etapas" style="border: 2px solid #0B4D3F; color: #0B4D3F; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 8px; display: inline-flex; align-items: center; min-height: 48px; box-sizing: border-box">Ver as etapas</a>
</div>
</div>
<div class="painel-heroi" aria-hidden="true" style="flex: 1 1 420px; min-width: 0; height: 420px; border-radius: 16px; background: #0B4D3F; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px"><span style="position: absolute; left: -80px; top: -80px; width: 230px; height: 230px; border-radius: 50%; background: #157E48"></span><span style="position: absolute; right: -120px; bottom: -120px; width: 360px; height: 360px; border-radius: 50%; border: 44px solid ${H.orange}; box-sizing: border-box"></span><span style="position: relative; width: 140px; height: 140px; border-radius: 50%; background: ${H.orange}; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 28px rgba(0,0,0,0.22)"><svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icones[s.icone]}</svg></span><span style="position: relative; color: #FFFFFF; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 16px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; padding: 0 24px">${esc(s.nome)}</span></div>
</div>
</div>
</section>

<section style="max-width: 1200px; margin: 0 auto; padding: 88px 24px">
${h2(esc(s.incluiTitulo))}
<p style="margin: 0 0 36px; color: #3D4C48; max-width: 680px">A proposta descreve exatamente as áreas e superfícies incluídas. Em geral, o serviço cobre:</p>
<ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 16px">
${s.inclui.map((i) => `<li style="flex: 1 1 340px; display: flex; gap: 12px; align-items: flex-start">${check}<span>${esc(i)}</span></li>`).join('\n')}
</ul>
</section>

<section id="etapas" style="background: #0B4D3F; color: #FFFFFF">
<div style="max-width: 1200px; margin: 0 auto; padding: 88px 24px">
<h2 style="margin: 0 0 40px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 34px; line-height: 1.15; text-transform: uppercase">Como a DIMA trabalha</h2>
<ol style="margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 24px">
${etapas.map(([t, d], i) => `<li style="flex: 1 1 190px; display: flex; flex-direction: column; gap: 10px">${etapaNum(i + 1)}<h3 style="margin: 0; font-size: 18px">${t}</h3><p style="margin: 0; color: #D3E4DD">${esc(d)}</p></li>`).join('\n')}
</ol>
</div>
</section>

${blocoVideo(s.video)}

<section style="max-width: 880px; margin: 0 auto; padding: 88px 24px">
<h2 style="margin: 0 0 32px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 30px; line-height: 1.2; text-transform: uppercase; color: #0B4D3F">Dúvidas sobre ${esc(s.nome.toLowerCase())}</h2>
<div style="display: flex; flex-direction: column; gap: 12px">
${s.faq.map(([q, a]) => `<details style="background: #F4F6F5; border-radius: 10px; padding: 18px 22px"><summary style="font-weight: 700">${esc(q)}</summary><p style="margin: 12px 0 0; color: #3D4C48">${esc(a)}</p></details>`).join('\n')}
</div>
</section>

<section style="max-width: 1200px; margin: 0 auto; padding: 0 24px 72px">
${blocoCTA(s.ctaTitulo, msg)}
<h2 style="margin: 56px 0 20px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 20px; text-transform: uppercase; color: #0B4D3F">Serviços relacionados</h2>
<div style="display: flex; flex-wrap: wrap; gap: 12px">
${s.relacionados.map((r) => `<a href="/servicos/${r}/" style="flex: 1 1 260px; border: 1px solid #DDE5E2; border-radius: 10px; padding: 16px 20px; text-decoration: none; color: #1E2B28; font-weight: 700">${esc(porSlug[r].nome)} →</a>`).join('\n')}
</div>
</section>`;
  write(caminho, layout({
    titulo: s.seoTitulo, descricao: s.seoDescricao, caminho, corpo, ativo: '/#servicos',
    schema: [
      { '@context': 'https://schema.org', '@type': 'Service', name: s.nome, description: s.lead, serviceType: s.nome, provider: { '@id': `${config.url}/#empresa` }, url: config.url + caminho },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: s.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${config.url}/` },
        { '@type': 'ListItem', position: 2, name: s.nome, item: config.url + caminho },
      ] },
    ],
  }));
}

// ---------- Blog ----------
const cabecalhoSecao = (titulo, sub) => `<section style="background: #F4F6F5; position: relative; overflow: hidden">
<div style="max-width: 1200px; margin: 0 auto; padding: 64px 24px 56px; position: relative">
<p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #B4500B">Blog DIMA</p>
<h1 style="margin: 0 0 12px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 42px; line-height: 1.1; text-transform: uppercase; color: #0B4D3F">${titulo}</h1>
<p style="margin: 0; font-size: 18px; color: #3D4C48; max-width: 640px">${sub}</p>
</div>
</section>`;

const cardPost = (p) => `<a href="/blog/${p.slug}/" style="flex: 1 1 320px; min-width: 0; max-width: 560px; text-decoration: none; color: #1E2B28; border: 1px solid #DDE5E2; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; background: #FFFFFF">
${p.imagem ? `<img src="${esc(p.imagem)}" alt="" loading="lazy" style="display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover">` : (p.video ? `<img src="https://i.ytimg.com/vi/${esc(p.video)}/hqdefault.jpg" alt="" loading="lazy" style="display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover">` : `<span aria-hidden="true" style="display: block; aspect-ratio: 16 / 9; background: #0B4D3F; position: relative; overflow: hidden"><span style="position: absolute; right: -50px; bottom: -50px; width: 160px; height: 160px; border-radius: 50%; border: 20px solid ${H.orange}"></span><span style="position: absolute; left: -30px; top: -30px; width: 100px; height: 100px; border-radius: 50%; background: #157E48"></span></span>`)}
<span style="padding: 18px 20px; display: flex; flex-direction: column; gap: 8px">
<span style="font-size: 13px; color: #3D4C48">${fmtData(p.date)}</span>
<span style="font-family: Montserrat, sans-serif; font-weight: 800; font-size: 18px; line-height: 1.3; color: #0B4D3F">${esc(p.titulo)}</span>
${p.resumo ? `<span style="color: #3D4C48">${esc(p.resumo)}</span>` : ''}
</span></a>`;

const vazio = `<div style="border: 1px dashed #A9BAB4; border-radius: 14px; padding: 40px; text-align: center; max-width: 720px; margin: 0 auto">
<p style="margin: 0 0 8px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 20px; text-transform: uppercase; color: #0B4D3F">Os primeiros artigos chegam em breve</p>
<p style="margin: 0 0 24px; color: #3D4C48">Enquanto isso, veja as dicas da Carol no YouTube.</p>
<a href="https://www.youtube.com/@DicasdaCarol?sub_confirmation=1" style="background: #CC0000; color: #FFFFFF; text-decoration: none; font-weight: 700; padding: 13px 22px; border-radius: 8px; min-height: 48px; box-sizing: border-box; display: inline-flex; align-items: center">Ver o canal Dicas da Carol</a>
</div>`;

write('/blog/', layout({
  titulo: 'Blog DIMA: dicas de limpeza profissional',
  descricao: 'Dicas de limpeza profissional, conservação de pisos, vidros e fachadas, e o que a DIMA aprendeu em mais de 20 anos de obras.',
  caminho: '/blog/', ativo: '/blog/',
  corpo: `${cabecalhoSecao('Dicas de limpeza profissional', 'Técnicas, produtos e cuidados para limpar e conservar cada tipo de ambiente, com a experiência da DIMA e da Carol.')}
<section style="max-width: 1200px; margin: 0 auto; padding: 64px 24px 96px">
${posts.length ? `<div style="display: flex; flex-wrap: wrap; gap: 24px">${posts.map(cardPost).join('\n')}</div>` : vazio}
</section>`,
}));

for (const p of posts) {
  const caminho = `/blog/${p.slug}/`;
  const serv = p.servico && porSlug[p.servico];
  const video = p.video ? `<a href="https://www.youtube.com/watch?v=${esc(p.video)}" aria-label="Assistir o vídeo no YouTube" style="display: flex; aspect-ratio: 16 / 9; border-radius: 14px; overflow: hidden; position: relative; align-items: center; justify-content: center; margin: 32px 0; background: #0B4D3F"><img src="https://i.ytimg.com/vi/${esc(p.video)}/hqdefault.jpg" alt="" loading="lazy" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover"><span style="position: relative; display: flex">${play()}</span></a>` : '';
  const corpo = `<article>
<header style="background: #F4F6F5">
<div style="max-width: 760px; margin: 0 auto; padding: 48px 24px 40px">
<nav aria-label="Você está em" style="font-size: 14px; color: #3D4C48; margin-bottom: 20px"><a href="/" style="text-decoration: none">Início</a> › <a href="/blog/" style="text-decoration: none">Blog</a></nav>
<h1 style="margin: 0 0 16px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 38px; line-height: 1.15; color: #0B4D3F">${esc(p.titulo)}</h1>
<p style="margin: 0; color: #3D4C48; font-size: 14px">${fmtData(p.date)} · ${esc(p.autor || 'Carolina Leão')}</p>
</div>
</header>
<div class="artigo" style="max-width: 760px; margin: 0 auto; padding: 40px 24px 24px">
${p.imagem ? `<img src="${esc(p.imagem)}" alt="${esc(p.imagemAlt || '')}" style="width: 100%; height: auto; border-radius: 14px; margin-bottom: 32px">` : ''}
${p.html}
${video}
</div>
<div style="max-width: 760px; margin: 0 auto; padding: 24px 24px 88px">
${blocoCTA(serv ? `Precisa de ${serv.nome.toLowerCase()}?` : 'Precisa de uma limpeza profissional?', `Olá! Li o artigo "${p.titulo}" no site e quero solicitar uma avaliação.`)}
${serv ? `<p style="margin: 24px 0 0"><a href="/servicos/${serv.slug}/" style="font-weight: 700">Conheça o serviço de ${esc(serv.nome.toLowerCase())} →</a></p>` : ''}
<p style="margin: 16px 0 0"><a href="/blog/" style="font-weight: 700">← Voltar para o blog</a></p>
</div>
</article>`;
  write(caminho, layout({
    titulo: `${p.seoTitulo || p.titulo} | DIMA`,
    descricao: p.descricao || p.resumo || '',
    caminho, corpo, ativo: '/blog/', tipo: 'article', imagem: p.imagem || '/img/og-dima.png',
    schema: [{
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.titulo, datePublished: p.date.toISOString().slice(0, 10),
      author: { '@type': 'Person', name: p.autor || 'Carolina Leão' }, publisher: { '@id': `${config.url}/#empresa` },
      mainEntityOfPage: config.url + caminho, ...(p.imagem ? { image: config.url + p.imagem } : {}),
    }],
  }));
}

// ---------- Política de privacidade ----------
write('/politica-de-privacidade/', layout({
  titulo: 'Política de privacidade | DIMA',
  descricao: 'Como a DIMA Limpeza Profissional trata os dados enviados pelo site.',
  caminho: '/politica-de-privacidade/',
  corpo: `<div class="artigo" style="max-width: 760px; margin: 0 auto; padding: 64px 24px 96px">
<h1 style="margin: 0 0 24px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 36px; line-height: 1.15; text-transform: uppercase; color: #0B4D3F">Política de privacidade</h1>
${marked.parse(read('content/politica-de-privacidade.md'))}
</div>`,
}));

// ---------- 404 ----------
fs.writeFileSync(path.join(DIST, '404.html'), layout({
  titulo: 'Página não encontrada | DIMA', descricao: 'A página que você procurou não existe.', caminho: '/404',
  corpo: `<div style="max-width: 760px; margin: 0 auto; padding: 96px 24px; text-align: center">
<h1 style="margin: 0 0 16px; font-family: Montserrat, sans-serif; font-weight: 800; font-size: 36px; text-transform: uppercase; color: #0B4D3F">Página não encontrada</h1>
<p style="margin: 0 0 28px; color: #3D4C48">O endereço pode ter mudado. Veja nossos serviços na página inicial.</p>
${btnLaranja('/', 'Ir para a página inicial')}
</div>`,
}));
pages.pop();

// ---------- Sitemap e robots ----------
const hoje = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `<url><loc>${config.url}${p}</loc><lastmod>${hoje}</lastmod></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${config.url}/sitemap.xml\n`);

console.log(`Site gerado em dist/: ${pages.length} páginas, ${posts.length} artigo(s) no blog.`);
