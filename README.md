# Site da DIMA Limpeza Profissional

Site estático de dimadistribuidora.com.br, gerado a partir deste repositório.

## Como o site é publicado

O Cloudflare Pages (ou Netlify) lê este repositório e publica o site sozinho a cada alteração:

- Comando de build: `npm run build`
- Pasta publicada: `dist`
- Versão do Node: 18 ou mais nova

## Onde fica cada coisa

| O quê | Arquivo |
| --- | --- |
| Textos da página inicial | `src/home.html` |
| Barra do topo e menu | `src/partials/header.html` |
| Rodapé | `src/partials/footer.html` |
| Páginas de serviço (textos, perguntas, vídeo) | `src/servicos.mjs` |
| Telefone, e-mail, redes e cidades atendidas | `src/config.mjs` |
| Artigos do blog | `content/blog/*.md` |
| Política de privacidade | `content/politica-de-privacidade.md` |
| Imagens | `public/img/` |
| Redirecionamentos do site antigo | `public/_redirects` |

## Publicar um artigo no blog

1. Copie `content/blog/_modelo.md` para um arquivo novo, com o endereço desejado no nome. Exemplo: `content/blog/como-remover-cimento-do-porcelanato.md`.
2. Preencha o cabeçalho (título, data, resumo e descrição) e escreva o texto abaixo dele.
3. Se houver foto, coloque-a em `public/img/blog/` e informe o caminho em `imagem`.
4. Salve e envie a alteração. O artigo aparece em `/blog/` em um ou dois minutos.

Arquivos que começam com `_` não são publicados. Para guardar um rascunho, use `rascunho: true`.

## Testar no computador

```
npm install
npm run build
npm run preview
```

As fotos dos serviços são de banco de imagens gratuito (Unsplash) e devem ser trocadas por fotos reais das obras.
