# Palace Lounge

Website de apresentação do Palace Lounge, no Palácio de Ferro, em Luanda. Next.js App Router, React, TypeScript e Tailwind CSS. Identidade branca e dourada, Cormorant Garamond e Manrope, fotografias e vídeo reais do restaurante.

A revisão actual segue `briefing-refinado.md`: hero dividido entre texto e vídeo, secções claras, menos ornamentos e uma abertura central inspirada no logótipo oficial. Os textos principais, o menu do dia, a galeria, os formulários e as integrações preparadas foram preservados. Os briefings anteriores mantêm-se como referência do projecto.

A abertura usa duas metades do próprio logótipo, sobre branco, que se afastam para revelar a homepage. Dura cerca de dois segundos, não bloqueia o scroll nem captura o foco e pode ser dispensada pelo botão, por um clique, pelo teclado ou pelo scroll. Não é apresentada com `prefers-reduced-motion` nem ao abrir directamente uma âncora. Não usa cookies ou armazenamento local.

## Executar

```sh
npm install
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Abra `http://127.0.0.1:3001`. O Palace Studio usa separadamente `http://127.0.0.1:3000`. Para produção:

```sh
npm run build
npm start
```

## Conteúdo e materiais

- `src/lib/content.ts`: contactos, redes sociais, textos, fotografias e pratos/preços do menu.
- `src/lib/editorial.ts`: textos da homepage.
- `src/lib/menu-source.ts`: fonte partilhada pelo menu do dia e pela página `/menu`.
- `src/lib/forms.ts`: validação e envio dos pedidos de reserva; os outros formulários mantêm a pré-visualização.
- `src/app/api/reservations/route.ts`: proxy de reservas com validação no servidor e assinatura privada da integração.
- `src/components/palace-identity.tsx`: fachada oficial e divisória inspirada no logótipo.
- `src/components/palace-opening.tsx`: abertura breve, dispensável e acessível.
- `src/components/`: secções, navegação, galeria, formulários e menu digital.
- `src/app/globals.css`: sistema visual e adaptações por tamanho de ecrã.
- `src/app/editorial.css`: apresentação refinada da homepage, abertura e adaptações mobile.
- `public/media/`: cópias WebP das fotografias e versão optimizada do vídeo. Os originais foram preservados.

Rotas: `/`, `/menu` e `/privacidade`. O menu transcreve o material fornecido, datado de **19 de Outubro de 2026**, com preços em Kwanza. A imagem original está acessível a partir da página do menu.

## Estado das integrações

O formulário de **reservas está ligado ao backend real do Palace Studio**, no projecto adjacente `../palace studio`. O pedido é validado e guardado como Pendente, associado a um cliente pelo telefone normalizado. A mensagem de recepção aparece apenas depois da gravação. A mesa continua sujeita a confirmação manual.

O navegador envia para `/api/reservations` no próprio website. Esse servidor assina uma chamada para o Studio com `PALACE_RESERVATION_SECRET`, conservando a chave de idempotência em repetições de rede. O segredo nunca é exposto ao navegador. Configurar `PALACE_STUDIO_URL` e o mesmo segredo privado nos dois servidores; os valores locais já estão nos ficheiros `.env.local`, ignorados pelo Git.

Palace Privé e Palace Beach continuam em demonstração, sem guardar inscrições nem enviar comunicações. Não há analytics ou campanhas automáticas. A informação de privacidade foi actualizada para distinguir estes formulários dos pedidos reais de reserva.

A configuração de produção, o protocolo, os limites de abuso, os testes ponta a ponta e a retenção estão documentados em `../palace studio/INTEGRACAO-CRM.md`. Os contactos oficiais que não foram fornecidos continuam `null`.

O domínio público pode ser configurado em `NEXT_PUBLIC_SITE_URL` para os metadados de partilha. Nenhuma publicação ou serviço externo é necessário para executar o projecto localmente.

## Palace Menu Studio

O Studio é uma aplicação separada, em `../palace studio`, com o endpoint público `/api/published-menu`. Sem `PALACE_MENU_FEED_URL` configurado, a homepage identifica o menu do dia como **pré-visualização demonstrativa**, com a data da carta fornecida. A página `/menu` lê a mesma edição.

Na integração local, `PALACE_MENU_FEED_URL` aponta para `http://127.0.0.1:3000/api/published-menu`. Em produção, configurar o endereço HTTPS do mesmo endpoint. O adaptador lê apenas menus publicados e permite revalidar a edição a cada 60 segundos; não envia dados pessoais. O serviço externo deverá fornecer JSON neste formato:

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

Os itens aceitam `description` e `unit` opcionais. Os valores de `price` são números em Kwanza. Se a configuração estiver ausente, o serviço falhar ou os dados não forem válidos, ambas as páginas mantêm a carta de referência identificada, sem simular uma publicação. O endpoint implementado no Studio segue este contrato e só devolve dados do menu, sem contactos ou reservas.

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

Sem variáveis de integração, os pedidos de reserva devolvem uma mensagem de indisponibilidade e não simulam sucesso. O domínio dos metadados de partilha é obtido automaticamente a partir da Vercel. Ao ligar um domínio próprio, pode definir `NEXT_PUBLIC_SITE_URL` com o endereço HTTPS definitivo. `PALACE_MENU_FEED_URL` configura a leitura do menu real; `PALACE_STUDIO_URL` e `PALACE_RESERVATION_SECRET` são necessários para guardar reservas.

A abertura do palácio funciona também em telemóveis com toque. Continua a respeitar a preferência por movimento reduzido e pode ser ignorada. O vídeo, sem áudio e com cerca de 634 KB, só é carregado quando entra no enquadramento. As fotografias usam optimização Next.js e os ficheiros de media têm cache de um dia, com revalidação posterior.

Ao publicar, configure HTTPS e as variáveis de integração com o Studio. As reservas são guardadas no backend apenas quando essa ligação estiver configurada e disponível. Privé e Beach mantêm a pré-visualização demonstrativa.
