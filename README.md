# SIA — Sistema de Indicadores Acadêmicos

O **Sistema de Indicadores Acadêmicos (SIA)** é uma plataforma web multiuniversidade voltada à organização, análise e comparação de indicadores de desempenho acadêmico de instituições de ensino superior.

A proposta do sistema é transformar dados acadêmicos em informações úteis para apoiar gestores, coordenadores e instituições na tomada de decisões, permitindo acompanhar o desempenho da própria universidade e comparar cursos equivalentes entre diferentes instituições.

> **SIA — Dados acadêmicos transformados em indicadores para melhores decisões.**

---

## 1. Sobre o SIA

O SIA foi idealizado como uma plataforma capaz de reunir informações acadêmicas de diferentes universidades em um único ambiente.

Cada instituição possuirá sua própria estrutura de dados, permitindo o gerenciamento interno de alunos, cursos, disciplinas, usuários e resultados acadêmicos.

Ao mesmo tempo, o sistema permitirá que indicadores agregados sejam utilizados para comparação entre cursos de diferentes universidades.

O objetivo é oferecer uma ferramenta de apoio à gestão acadêmica, facilitando a identificação de problemas, tendências e oportunidades de melhoria.

---

## 2. Problema

Instituições de ensino superior produzem uma grande quantidade de dados relacionados a:

- alunos;
- cursos;
- disciplinas;
- notas;
- frequência;
- matrículas;
- aprovação;
- reprovação;
- evasão.

Entretanto, essas informações podem estar distribuídas em diferentes sistemas, planilhas ou bases de dados.

Isso pode dificultar:

- a análise do desempenho acadêmico;
- a identificação de cursos com baixo desempenho;
- o acompanhamento da evasão;
- a identificação de disciplinas com altos índices de reprovação;
- a análise da evolução acadêmica ao longo do tempo;
- a comparação entre cursos equivalentes;
- a tomada de decisões por gestores e coordenadores.

O SIA busca reduzir esse problema centralizando e organizando as informações em uma única plataforma.

---

## 3. Objetivo

O objetivo do SIA é desenvolver uma plataforma web capaz de armazenar, processar e apresentar indicadores acadêmicos de diferentes instituições de ensino superior.

A plataforma deverá permitir:

- acompanhar o desempenho acadêmico de uma universidade;
- analisar cursos e disciplinas;
- acompanhar índices de aprovação;
- acompanhar índices de reprovação;
- acompanhar índices de evasão;
- visualizar a evolução dos indicadores ao longo dos períodos;
- comparar cursos equivalentes entre universidades;
- preservar os dados individuais e administrativos de cada instituição.

---

## 4. Público-alvo

O SIA é destinado principalmente a:

- gestores acadêmicos;
- coordenadores de cursos;
- reitores e pró-reitores;
- direção de instituições de ensino superior;
- equipes de planejamento institucional;
- profissionais responsáveis por indicadores educacionais;
- administradores de sistemas acadêmicos.

Parte dos indicadores também poderá ser disponibilizada para consulta pública, especialmente na área de comparação entre instituições.

---

## 5. Modelo multiuniversidade

O SIA será utilizado por diferentes universidades através da mesma plataforma.

Cada instituição possuirá um identificador único e seus dados internos estarão vinculados exclusivamente à universidade correspondente.

Exemplo:

```text
SIA
│
├── Universidade A
│   ├── Cursos
│   ├── Alunos
│   ├── Disciplinas
│   ├── Usuários
│   └── Indicadores
│
├── Universidade B
│   ├── Cursos
│   ├── Alunos
│   ├── Disciplinas
│   ├── Usuários
│   └── Indicadores
│
└── Universidade C
    ├── Cursos
    ├── Alunos
    ├── Disciplinas
    ├── Usuários
    └── Indicadores
```

Exemplo de identificação:

```text
Universidade Federal de Tecnologia

Código: UFT-001
```

Essa estrutura permitirá separar corretamente os dados de cada instituição.

Usuários vinculados a uma universidade não poderão acessar dados privados de outras universidades.

---

## 6. Privacidade dos dados

O SIA trabalhará com diferentes níveis de acesso às informações.

### Dados públicos

Poderão ser utilizados nas áreas de pesquisa e comparação:

- nome da universidade;
- sigla;
- cidade;
- estado;
- cursos oferecidos;
- média acadêmica agregada;
- taxa de aprovação;
- taxa de reprovação;
- taxa de evasão;
- indicadores gerais dos cursos;
- evolução de desempenho acadêmico.

### Dados privados da universidade

Serão acessíveis somente por usuários autorizados da própria instituição:

- dados pessoais dos alunos;
- matrícula;
- notas individuais;
- frequência individual;
- histórico acadêmico;
- informações administrativas;
- registros internos.

### Dados privados do usuário

Também permanecerão protegidos:

- senha;
- credenciais;
- perfil;
- permissões;
- configurações da conta.

As senhas não serão armazenadas diretamente no banco de dados.

Será utilizado hash de senha através do `bcryptjs`.

---

## 7. Comparação entre universidades

Uma das principais funcionalidades do SIA será permitir a comparação entre cursos equivalentes de diferentes universidades.

Exemplo:

```text
Curso: Ciência da Computação
Período: 2026.1
```

O usuário poderá selecionar instituições para comparação.

Exemplo:

| Indicador | Universidade A | Universidade B | Universidade C |
|---|---:|---:|---:|
| Média geral | 8,1 | 7,7 | 8,0 |
| Aprovação | 87% | 82% | 85% |
| Reprovação | 8% | 11% | 9% |
| Evasão | 5% | 7% | 6% |

A comparação utilizará apenas indicadores acadêmicos agregados.

Nenhum dado individual de aluno será disponibilizado nessa área.

Também será possível utilizar filtros como:

- curso;
- universidade;
- estado;
- período acadêmico;
- modalidade de ensino.

A proposta é permitir que uma instituição identifique como seus cursos estão posicionados em relação a cursos semelhantes de outras universidades.

---

## 8. Principais funcionalidades

### Autenticação

O sistema contará com:

- cadastro de usuário;
- login;
- logout;
- sessões;
- controle de acesso por perfil.

### Universidades

Será possível:

- cadastrar;
- editar;
- consultar;
- identificar cada instituição através de código único.

### Alunos

Será possível:

- cadastrar;
- editar;
- consultar;
- pesquisar;
- filtrar;
- visualizar situação acadêmica.

### Cursos

Será possível:

- cadastrar;
- editar;
- pesquisar;
- consultar indicadores;
- comparar com cursos de outras universidades.

### Disciplinas

Será possível:

- cadastrar;
- editar;
- associar aos cursos;
- acompanhar indicadores de desempenho.

### Desempenho acadêmico

O sistema armazenará informações como:

- nota;
- frequência;
- semestre;
- ano;
- situação do aluno na disciplina.

### Indicadores

O sistema deverá calcular e apresentar:

- média acadêmica;
- taxa de aprovação;
- taxa de reprovação;
- taxa de evasão;
- desempenho por curso;
- desempenho por disciplina;
- evolução por período.

---

## 9. Dashboard

Após realizar o login, usuários autorizados terão acesso ao dashboard da própria instituição.

Exemplo:

```text
Universidade A
Período: 2026.1

2.430
Alunos

8,1
Média Geral

86%
Aprovação

9%
Reprovação

5%
Evasão
```

O dashboard também poderá apresentar gráficos com:

- evolução da média acadêmica;
- desempenho por curso;
- taxa de aprovação;
- taxa de reprovação;
- taxa de evasão;
- situação dos alunos;
- disciplinas com maior índice de reprovação;
- evolução do desempenho ao longo do tempo.

---

## 10. Perfis de acesso

Inicialmente estão previstos quatro níveis de acesso.

### Super Administrador

Responsável pela administração geral da plataforma.

Poderá:

- visualizar todas as universidades;
- cadastrar instituições;
- gerenciar administradores;
- acompanhar indicadores gerais;
- administrar configurações da plataforma.

### Administrador da Universidade

Responsável pela administração da própria instituição.

Poderá:

- cadastrar e editar alunos;
- cadastrar e editar cursos;
- cadastrar e editar disciplinas;
- gerenciar usuários;
- acompanhar indicadores;
- atualizar informações acadêmicas.

Não poderá acessar dados privados de outras universidades.

### Gestor

Voltado para coordenadores e gestores acadêmicos.

Poderá:

- consultar alunos;
- consultar cursos;
- acompanhar indicadores;
- analisar desempenho acadêmico;
- realizar comparações entre cursos.

### Consulta

Perfil destinado principalmente à visualização.

Poderá:

- acessar informações autorizadas;
- visualizar indicadores;
- pesquisar universidades;
- comparar cursos.

---

## 11. Tecnologias

### Backend

- Node.js
- Express.js

### Banco de dados

- PostgreSQL

### Frontend

- HTML
- CSS
- JavaScript

### Autenticação e segurança

- bcryptjs
- express-session

### Infraestrutura

- Docker

### Versionamento

- Git
- GitHub

### Desenvolvimento

- Visual Studio Code
- GitHub Desktop

---

## 12. Arquitetura do sistema

A arquitetura inicial do SIA será:

```text
Usuário
   │
   ▼
Frontend
HTML / CSS / JavaScript
   │
   ▼
API REST
Node.js + Express
   │
   ▼
PostgreSQL
```

No ambiente de implantação, a aplicação e seus serviços serão executados utilizando Docker.

### Estrutura planejada do projeto

```text
sia/
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── universidades.routes.js
│   │   ├── alunos.routes.js
│   │   ├── cursos.routes.js
│   │   ├── disciplinas.routes.js
│   │   ├── indicadores.routes.js
│   │   └── usuarios.routes.js
│   │
│   └── server.js
│
├── public/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── alunos.js
│   │   ├── cursos.js
│   │   └── indicadores.js
│   │
│   ├── index.html
│   ├── login.html
│   └── cadastro.html
│
├── sql/
│   ├── estrutura.sql
│   ├── dados.sql
│   └── auth.sql
│
├── Dockerfile
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 13. Status e próximas etapas

🚧 **Projeto em desenvolvimento**

O SIA encontra-se atualmente em processo de reestruturação para implementação do modelo multiuniversidade e do módulo de indicadores acadêmicos.

### Próximas etapas

1. Reestruturar o banco de dados.
2. Criar o modelo multiuniversidade.
3. Implementar identificação única das universidades.
4. Vincular usuários às instituições.
5. Finalizar cadastro e login.
6. Implementar controle de acesso por perfil.
7. Desenvolver gestão de alunos.
8. Desenvolver gestão de cursos.
9. Desenvolver gestão de disciplinas.
10. Criar registros de desempenho acadêmico.
11. Implementar os cálculos dos indicadores.
12. Desenvolver o dashboard.
13. Implementar comparação entre universidades.
14. Melhorar a interface e a responsividade.
15. Realizar testes.
16. Preparar a versão de apresentação.

---

## 14. Visão futura

Em versões futuras, o SIA poderá incluir funcionalidades como:

- importação de dados através de arquivos CSV;
- integração com sistemas acadêmicos existentes;
- exportação de dados;
- geração de relatórios em PDF;
- dashboards personalizados;
- análise histórica;
- alertas acadêmicos;
- análise estatística avançada;
- integração através de API;
- autenticação institucional;
- gráficos avançados;
- identificação de alunos com risco de evasão;
- geração automática de relatórios gerenciais;
- acompanhamento de metas acadêmicas;
- comparação histórica entre períodos.

---

## SIA — Sistema de Indicadores Acadêmicos

> **Dados acadêmicos transformados em indicadores para melhores decisões.**