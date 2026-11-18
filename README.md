# Prévia de apresentação com 12 registros de demonstração

Esta edição traz **12 registros sintéticos para demonstração do painel**, com nomes brasileiros plausíveis e datas ilustrativas entre outubro e novembro de 2026. **Não são acessos reais e não comprovam aplicação comunitária**. Esses dados permanecem separados dos registros coletados online.

O painel apresenta uma identificação discreta “Dados ilustrativos”, sem banners de alerta. A exportação CSV mantém uma coluna que identifica a origem dos registros; a amostra nunca é enviada ao Firebase e deixa de aparecer quando a integração online está configurada.

Para comprovar participação acadêmica, publique o site e convide pessoas reais a acessá-lo, com consentimento adequado; configure o Firebase para registrar horário do servidor e feedbacks. Veja o guia.

---

# Janelas do Conhecimento — edição 2026

Projeto extensionista de inclusão digital e apoio educacional para crianças e adolescentes de Osasco (SP).

**Site refeito do zero** em HTML5, CSS3 e JavaScript sem dependências de compilação. Pode ser publicado gratuitamente no GitHub Pages.

## O que há nesta versão

- Visual renovado e adaptável a celulares, tablets e computadores.
- **75 exercícios originais**: 25 de leitura, 25 de escrita e 25 de matemática.
- **5 níveis por matéria**, com explicação contextual e exemplo antes de cada exercício.
- A cada **acerto**, a próxima questão é mostrada automaticamente e a dificuldade progride; em caso de erro, a pessoa recebe orientação e pode tentar novamente.
- Identificação de entrada **somente com nome e data de nascimento** (não é autenticação forte).
- Campo de consentimento/ciência do participante ou de seu responsável.
- Área de avaliação para registrar feedbacks verdadeiros dos participantes.
- Painel administrativo com acessos, identificadores anônimos únicos, data e horário (fuso de Brasília) e feedbacks, exportáveis em CSV.
- Dados online armazenados no Firebase (opcional, mas **necessário para comprovar acessos de vários dispositivos**).

## Executar localmente

Na pasta em que está `index.html`, rode `python -m http.server 8000` e abra `http://localhost:8000`. Na hospedagem GitHub Pages o site funciona sem servidor próprio.

**Sem configurar o Firebase:** as atividades funcionam e a contagem de acessos é **apenas deste navegador**; nomes não são salvos no modo local e os feedbacks não são enviados. Esse modo não serve como prova de acessos de outras pessoas.

## Habilitar acessos e avaliações reais

Siga `GUIA_PUBLICACAO_E_FIREBASE.md`. É necessário criar um projeto no Firebase, habilitar Authentication (anônima e email/senha), Cloud Firestore e configurar as regras de segurança. A responsável acessa o painel com email/senha distintos da identificação simples do estudante.

### Dados coletados

No modo online, apenas `name`, `uid` anônimo e `visitedAt` (data/hora do servidor) são registrados em `visits`. Em `feedbacks` ficam `name`, `uid`, avaliação, comentário e horário. **A data de nascimento não é transmitida, armazenada nem exportada.** Ela é lida na tela apenas para adaptar o texto de consentimento. Um nome declarado pelo próprio participante não comprova identidade. A contagem de dispositivos únicos também não é necessariamente a contagem exata de pessoas.

Se você realizar a atividade com menores de idade, obtenha autorização adequada dos responsáveis, não divulgue nomes ou horários publicamente e inclua somente evidências consentidas no relatório da faculdade. Armazene e elimine registros conforme a finalidade acadêmica e as orientações institucionais.

## Estrutura

- `index.html`: interface, formulários, trilhas, painel.
- `style.css`: identidade visual responsiva.
- `curriculum.js`: banco completo com 75 perguntas e explicações.
- `app.js`: lógica dos desafios progressivos, login, dashboard, exportação CSV.
- `cloud.js`: integração segura pelo SDK do Firebase.
- `config.js`: configurações públicas do aplicativo Firebase e email do administrador.
- `firestore.rules`: regras de segurança que só permitem ao administrador ler registros.
- `GUIA_PUBLICACAO_E_FIREBASE.md`: tutorial de configuração e atualização do GitHub.

## Objetivos do projeto

Relaciona-se ao ODS 4 — Educação de qualidade e ao ODS 10 — Redução das desigualdades.

**Aviso:** não envie senhas de administração ao GitHub. A configuração JavaScript web Firebase (incluindo `apiKey`) é pública por projeto; a proteção dos registros está nas regras do Firestore e no Firebase Authentication.

## Três comentários ilustrativos na página

A seção de avaliação apresenta três exemplos curtos de comentários sobre a experiência. **São textos-modelo, não feedbacks recebidos de usuários.** Eles não são gravados no Firestore, não entram na contagem de avaliações recebidas e não devem ser usados como prova de aplicação comunitária. Substitua esses exemplos por depoimentos reais apenas com autorização de quem os enviou.

### Como localizar os comentários

No menu superior, clique em **Comentários**. Os três modelos estão em uma seção própria logo após **Como você vai aprender?**, antes dos exercícios. São exemplos ilustrativos, não são registros reais e não integram o painel de avaliações recebidas.


### Avaliações ilustrativas no painel

Na visualização **Ver exemplo (12)**, o painel apresenta **dois feedbacks ilustrativos** com as notas e comentários propostos, distintos das avaliações recebidas pelo Firebase. Os exemplos usam nomes identificados como exemplos e não possuem datas de envio; o arquivo CSV também indica essa origem. Na visualização local, essas linhas não são apresentadas como avaliações reais.


### Ajuste visual da tabela de feedbacks

Os dois exemplos ilustrativos utilizam nomes idênticos aos **registros sintéticos de demonstração** da tabela de acessos (Mariana Costa Almeida e Rafael Santos Lima). Nenhuma avaliação real foi atribuída a uma pessoa: esses são registros de exemplo, sem data de envio. A origem ilustrativa permanece identificada no painel e no CSV.


## Ajustes finais da apresentação

Foram removidas três notas repetidas da interface: a explicação sob os comentários, o rótulo “Dados ilustrativos” sobre os indicadores do painel e a frase extensa sobre dois exemplos na tabela de avaliações. A identificação da natureza dos dados permanece clara nos cartões (“Exemplo de comentário”), no seletor “Ver exemplo (12)”, no título “Avaliações de exemplo”, na introdução ao painel e no arquivo CSV (com coluna de origem). Esses registros não são avaliações ou acessos reais.
