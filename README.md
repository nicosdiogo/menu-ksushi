# K-Sushi — Menu Digital

Menu digital para o restaurante **K-Sushi**, pensado para ser aberto por **QR Code nas mesas**, primeiro no telemóvel e também no computador. Consulta de pratos, bebidas e sobremesas, favoritos e uma lista de pedido para mostrar ao empregado.

**Demonstração:** https://menuk-sushi.vercel.app/

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)

> **Estado: proposta.** Este projecto é uma proposta de desenvolvimento e não um produto oficial publicado pelo restaurante.

## Funcionalidades

- **Navegação por categorias:** ecrã inicial com blocos interactivos para Sushi & Pratos Principais, Entradas & Acompanhamentos, Bebidas & Cocktails e Sobremesas, com chips de categoria sempre acessíveis.
- **Ordenação:** ordem do menu, A–Z e preço crescente ou decrescente.
- **Pesquisa** em ecrã inteiro, em tempo real, sem distinguir maiúsculas nem acentos.
- **Favoritos** guardados no dispositivo.
- **Detalhes do prato** num painel que abre de baixo (telemóvel) ou centrado (computador) e fecha ao arrastar ou com `Esc`.
- **Lista de pedido** (não é encomenda):
  - quantidades, subtotais e total;
  - **modo empregado**, um ecrã grande e legível que mantém o telemóvel ligado;
  - **recibo informativo** com pré-visualização antes de descarregar, em PDF ou imagem, gerado no próprio navegador, com partilha onde o dispositivo o permitir;
  - envio do texto da lista por **WhatsApp**.
- **Avisos não bloqueantes** (toasts, com «Desfazer» ao remover ou limpar), modais de confirmação e blocos informativos, sem `alert` nem `confirm`.
- **QR por mesa** com `?mesa=12`, que mostra «Mesa 12» no cabeçalho, no modo empregado e no recibo.
- **Acessibilidade e conforto:** HTML semântico, foco visível, navegação por teclado, atalho `/` para a pesquisa no computador e respeito por `prefers-reduced-motion`.

## Tecnologias

| Área | Escolha |
|---|---|
| Interface | React 18 (hooks) |
| Compilação | Vite 6 |
| Estilos | Tailwind CSS v4 |
| Dados | JSON estático |
| Estado | `useSyncExternalStore` (sem Redux nem Zustand) |
| Rotas | `#` na URL (sem biblioteca de rotas) |
| Recibo | Canvas 2D e PDF gerado à mão, sem bibliotecas |

Não tem backend nem base de dados: é uma aplicação estática.

## Como começar

Requisitos: **Node.js 18 ou superior**.

```bash
npm install
npm run dev        # desenvolvimento
npm run validate   # valida o catálogo (69 produtos)
npm run build      # validação + compilação para dist/
npm run preview    # testar a compilação localmente
```

## Estrutura

```text
├── index.html
├── package.json
├── vite.config.js
├── scripts/
│   └── validate.js          # valida o catálogo antes da compilação
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── store.js             # estado global: favoritos, lista, rota, painéis
    ├── style.css            # tema e animações
    ├── components/          # HomeView, CategoryView, ProductCard, ProductDetails,
    │                        # SearchOverlay, CartDrawer, WaiterView, PreviewModal,
    │                        # ConfirmModal, Toaster, ui.jsx
    ├── data/
    │   ├── menu.json        # catálogo
    │   ├── site.json        # configuração
    │   └── locations.json   # localizações e contactos
    └── utils/               # format-utils, search-utils, receipt
```

## Dados do catálogo

O catálogo está em `src/data/menu.json`, separado da interface, com 4 categorias e 69 produtos extraídos do site de referência do K-Sushi. Cada produto tem:

```json
{
  "id": "identificador-unico",
  "name": "Nome original do produto",
  "description": null,
  "quantity": "8 peças",
  "price": 9750,
  "priceText": "9.750 Kz",
  "priceStatus": "listed",
  "image": "menu-main/ficheiro.jpg"
}
```

Regras seguidas:

- Nenhum produto, preço ou descrição foi inventado ou alterado. Campos ausentes ficam `null`.
- `priceText` mostra o preço exactamente como na fonte. `price` só é numérico quando há um único valor.
- Produtos «Consultar» têm `priceStatus: "consultar"` e `price: null`, sem preço fictício.
- `npm run validate` confirma ids únicos, contagem por categoria e que nenhum preço foi inventado. A compilação só avança se a validação passar.

## Configuração (`src/data/site.json`)

| Campo | Descrição |
|---|---|
| `logo` | URL do logótipo |
| `imageBase` | Prefixo das fotografias (por omissão, o site de referência) |
| `whatsappNumber` | Número oficial para o botão WhatsApp; `null` deixa o cliente escolher o contacto |
| `tableParam` | Nome do parâmetro de mesa na URL (`mesa`) |
| `menuUrl` | Apenas nota de referência; o código não o utiliza |

**Fotografias locais:** copie a pasta `menu-main/` para `public/` e defina `"imageBase": "./"`.

## QR Codes

A aplicação não gera QR Codes: gera-os fora dela, depois de publicar o menu.

- **Geral:** `https://o-seu-dominio/`
- **Por mesa:** `https://o-seu-dominio/?mesa=12`

O parâmetro de mesa serve apenas de identificação: não cria pedidos nem regista nada. Prefira QR **estáticos** e teste cada um antes de imprimir. Exemplo para gerar vários em Python (`pip install "qrcode[pil]"`):

```python
import qrcode
base = "https://o-seu-dominio/"
for n in range(1, 21):
    qrcode.make(f"{base}?mesa={n}").save(f"mesa-{n}.png")
```

## Publicação

É uma aplicação estática (`base: './'`), por isso funciona em qualquer alojamento. O `npm run build` gera a pasta `dist/`, que pode ser enviada tal como está.

Na **Vercel**: importar o repositório, *Framework Preset* **Vite**, *Build Command* `npm run build`, *Output Directory* `dist`.

## Privacidade

- Sem cookies, sem contas e sem analytics.
- Favoritos e lista de pedido ficam em `localStorage`, só no dispositivo do cliente (`ksushi-fav`, `ksushi-cart`, `ksushi-tip`).
- O rodapé tem o botão **«Apagar dados guardados»**.

## Limitações e notas

- A lista de pedido é **informativa**: não é encomenda, fatura nem confirmação, e nada é enviado ao restaurante.
- O total só soma produtos com preço único. «Consultar» e o **Sashimi Salmão**, que tem dois preços (`25.400 Kz / 12.500 Kz` para «15 ou 7 peças»), ficam «por confirmar», porque a correspondência preço–quantidade não é explícita na fonte.
- O PDF do recibo é a imagem do recibo numa página, e por isso o texto não é seleccionável.
- Os contactos e localizações vêm do site de referência e devem ser **confirmados** (telefone ↔ unidade) antes de publicar.
- As fotografias carregam do site de referência enquanto não forem alojadas localmente.
- Por ser uma aplicação de página única, o conteúdo é desenhado em JavaScript. Para indexação em motores de busca, seria necessário pré-renderização.

### Inconsistências do catálogo original (não corrigidas)

- «TEMPURÁ DE CAMARÃO» (título) vs «Tempura de Camarão» (texto alternativo); «COVERT DO CHEFE» (provável «couvert»); «PIÑA COLADA» vs «Pina Colada».
- A secção «Sushi & Pratos Principais» mistura sushi com pratos quentes.
- Nenhum produto tem descrição, ingredientes ou alergénios.

## Autor

Desenvolvido por **Nicola D. João**.

## Licença e direitos

Marca, logótipo, nomes e fotografias dos pratos pertencem ao **K-Sushi**. O código desta proposta tem todos os direitos reservados ao autor, salvo indicação em contrário.
