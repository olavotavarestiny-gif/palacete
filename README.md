# Palace Lounge

Website de apresentação do Palace Lounge, no Palácio de Ferro, em Luanda. Next.js App Router, React, TypeScript e Tailwind CSS. Identidade branca e dourada, Cormorant Garamond e Manrope, fotografias e vídeo reais do restaurante.

A revisão actual segue `briefing-refinado.md`: hero dividido entre texto e vídeo, secções claras, menos ornamentos e uma abertura central inspirada no logótipo oficial. Os textos principais, o menu do dia, a galeria, os formulários e as integrações preparadas foram preservados. Os briefings anteriores mantêm-se como referência do projecto.

A abertura usa duas metades do próprio logótipo, sobre branco, que se afastam para revelar a homepage. Dura cerca de dois segundos, não bloqueia o scroll nem captura o foco e pode ser dispensada pelo botão, por um clique, pelo teclado ou pelo scroll. Não é apresentada com `prefers-reduced-motion` nem ao abrir directamente uma âncora. Não usa cookies ou armazenamento local.

## Executar

```sh
npm install
npm run dev
```

Abra o endereço indicado no terminal (normalmente `http://localhost:3000`). Para produção:

```sh
npm run build
npm start
```

## Conteúdo e materiais

- `src/lib/content.ts`: contactos, redes sociais, textos, fotografias e pratos/preços do menu.
- `src/lib/editorial.ts`: textos da homepage.
- `src/lib/menu-source.ts`: fonte partilhada pelo menu do dia e pela página `/menu`.
- `src/lib/forms.ts`: tipos, validação e ponto de ligação ao futuro Palace Manager.
- `src/components/palace-identity.tsx`: fachada oficial e divisória inspirada no logótipo.
- `src/components/palace-opening.tsx`: abertura breve, dispensável e acessível.
- `src/components/`: secções, navegação, galeria, formulários e menu digital.
- `src/app/globals.css`: sistema visual e adaptações por tamanho de ecrã.
- `src/app/editorial.css`: apresentação refinada da homepage, abertura e adaptações mobile.
- `public/media/`: cópias WebP das fotografias e versão optimizada do vídeo. Os originais foram preservados.

Rotas: `/`, `/menu` e `/privacidade`. O menu transcreve o material fornecido, datado de **19 de Outubro de 2026**, com preços em Kwanza. A imagem original está acessível a partir da página do menu.

## Estado das integrações

Os formulários validam os dados e mostram uma pré-visualização. **Não enviam, guardam nem confirmam reservas ou inscrições.** Não há analytics, base de dados, CRM ou backend de reservas configurado. Os contactos não fornecidos permanecem `null` no ficheiro central.

Para activar os formulários, substituir `prepareSubmission` por uma integração autenticada com validação no servidor e actualizar os estados da interface e a informação de privacidade. Configurar os contactos oficiais e confirmar a oferta do menu antes do lançamento público.

O domínio público pode ser configurado em `NEXT_PUBLIC_SITE_URL` para os metadados de partilha. Nenhuma publicação ou serviço externo é necessário para executar o projecto localmente.

## Palace Menu Studio

Não existe uma aplicação Menu Studio neste repositório. Por omissão, a homepage identifica o menu do dia como **pré-visualização demonstrativa**, com a data da carta fornecida. A página `/menu` lê a mesma edição.

Quando existir um endpoint público, configurar `PALACE_MENU_FEED_URL` no servidor. O adaptador lê apenas menus publicados e permite revalidar a edição a cada 60 segundos; não envia dados pessoais. O serviço externo deverá fornecer JSON neste formato:

```json
{
  "status": "published",
  "date": "2026-10-19",
  "categories": [
    {
      "id": "entradas",
      "title": "Para começar",
      "subtitle": "Sopa e entrada do dia",
      "items": [
        { "name": "Caldo Verde", "price": 5000 }
      ]
    }
  ]
}
```

Os itens aceitam `description` e `unit` opcionais. Os valores de `price` são números em Kwanza. Se a configuração estiver ausente, o serviço falhar ou os dados não forem válidos, ambas as páginas mantêm a carta de referência identificada, sem simular uma publicação. O contrato deve ser adaptado à API real do Studio quando estiver disponível.

## Verificação

```sh
npm run typecheck
npm run build
npm run test:e2e
```

Os testes de navegador usam o Google Chrome instalado e, por omissão, iniciam uma instância de desenvolvimento na porta 3100. É possível apontar para um servidor existente com `PLAYWRIGHT_BASE_URL`.

## Publicar na Vercel

1. Importar o repositório `olavotavarestiny-gif/palacete` na Vercel e seleccionar a branch `main`.
2. Manter o framework **Next.js**, a pasta raiz `./`, a instalação `npm ci` e o build `npm run build`. Manter a pasta de saída por defeito do framework.
3. Publicar. A versão Node.js 24 está definida em `package.json` e `.nvmrc`.

Não são necessárias variáveis de ambiente para a apresentação demonstrativa. O domínio dos metadados de partilha é obtido automaticamente a partir da Vercel. Ao ligar um domínio próprio, pode definir `NEXT_PUBLIC_SITE_URL` com o endereço HTTPS definitivo. `PALACE_MENU_FEED_URL` continua opcional, até existir um endpoint real do Menu Studio.

A abertura do palácio funciona também em telemóveis com toque. Continua a respeitar a preferência por movimento reduzido e pode ser ignorada. O vídeo, sem áudio e com cerca de 634 KB, só é carregado quando entra no enquadramento. As fotografias usam optimização Next.js e os ficheiros de media têm cache de um dia, com revalidação posterior.

Os formulários continuam em demonstração: publicar o site não activa reservas, inscrições nem envio de dados pessoais.
