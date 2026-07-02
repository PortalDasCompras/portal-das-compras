# Portal das Compras — TODO

## Backend / Banco de Dados
- [x] Schema: tabela products (nome, descrição, preço, preço original, categoria, imagem, estoque, ativo)
- [x] Schema: tabela orders (dados do cliente, itens JSON, endereço, status, total)
- [x] Schema: tabela admin_sessions (token de sessão admin)
- [x] Seed: inserir os 33 produtos do site original
- [x] tRPC: procedures de produtos (list, listByCategory, getById, create, update, delete)
- [x] tRPC: procedures de pedidos (create, list, updateStatus)
- [x] tRPC: procedure de autenticação admin (login com usuário/senha fixos claysson/1508)

## Páginas Frontend
- [x] Layout global: Header com logo, nav (Início, Categorias, Admin, Carrinho com contador), Footer
- [x] Contexto de Carrinho (CartContext) com adicionar, remover, atualizar quantidade
- [x] Home: banner hero, barra de busca, filtros por categoria, grid de produtos com preços
- [x] Página de Categorias (/categorias): grid de 6 categorias com ícone/descrição
- [x] Página de Categoria (/categoria/:slug): breadcrumb + grid de produtos filtrados
- [x] Página de Produto (/produto/:id): imagem, preços, botão "Comprar agora", vídeo, FAQ accordion, avaliações
- [x] Página de Carrinho (/carrinho): lista de itens, controle de quantidade, subtotal, botão checkout
- [x] Página de Checkout (/checkout): formulário completo + validação CEP ViaCEP + auto-preenchimento
- [x] Página de Confirmação de Pedido (/pedido-confirmado): mensagem de sucesso
- [x] Página Admin Login (/admin): formulário login fixo (claysson/1508)
- [x] Painel Admin (/admin/dashboard): gerenciamento de produtos e pedidos

## Funcionalidades Específicas
- [x] Busca de produtos por nome na home
- [x] Filtro por categoria na home (tabs)
- [x] Validação de CEP via ViaCEP com auto-preenchimento
- [x] Contador de itens no carrinho no header
- [x] Controle de quantidade no carrinho
- [x] Cálculo de subtotal e total no carrinho/checkout
- [x] CRUD de produtos no admin
- [x] Visualização e atualização de status de pedidos no admin
- [x] Proteção de rotas admin (redirecionar se não logado)


## Lista de Desejos (Favoritos)
- [x] WishlistContext com estado de favoritos persistido em localStorage
- [x] Ícone de coração no ProductCard com toggle de favorito
- [x] Página /favoritos com grid de produtos salvos
- [x] Botão "Adicionar ao carrinho" na página de favoritos
- [x] Contador de favoritos no Header
- [x] Sincronização entre páginas (adicionar/remover em qualquer lugar)


## Correções e Melhorias
- [x] Adicionar cookie-parser middleware para processar cookies do admin
