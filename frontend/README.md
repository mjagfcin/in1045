# Frontend - Sistema de Gerenciamento de Provas

## Descrição

Interface React para o Sistema de Gerenciamento de Provas com geração de PDFs individualizados e correção automática.

## Stack

- **React 18** - UI framework
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **React Hook Form + Zod** - Formulários e validação
- **Axios** - HTTP client

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Servidor rodará em `http://localhost:5173`

## Compilação para Produção

```bash
npm run build
npm run preview
```

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
├── pages/              # Páginas
├── services/           # Serviços (API calls)
├── types/              # Tipos TypeScript
├── utils/              # Funções utilitárias
├── App.tsx
└── main.tsx
```

## Próximos Passos

1. Implementar componentes de formulário
2. Integrar com APIs do backend
3. Adicionar validação de formulários
4. Implementar upload de arquivos CSV
5. Implementar download de PDFs e CSVs

---

*Desenvolvido em Março de 2026*
