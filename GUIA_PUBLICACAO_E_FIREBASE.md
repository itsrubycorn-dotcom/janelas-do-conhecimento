# Tutorial — configurar acessos reais e atualizar o GitHub

O site já pode ser publicado. Para **comprovar os acessos da comunidade no painel**, primeiro configure o Firebase e depois publique os arquivos atualizados.

## PARTE 1 — Criar o banco de dados (Firebase)

1. Entre em https://console.firebase.google.com/ e clique em **Criar um projeto** (ou **Adicionar projeto**). Dê o nome `Janelas do Conhecimento`. Google Analytics é opcional; não é necessário para este site.
2. Dentro do projeto, clique no ícone **Web `</>`** em "Adicionar app". Cadastre o nome `janelas-do-conhecimento` e copie o objeto de configuração do Firebase que aparece na tela (propriedades como `apiKey`, `authDomain`, `projectId`, `appId`). **Não é preciso ativar Firebase Hosting**, pois usaremos GitHub Pages.
3. No arquivo `config.js`, substitua **somente** os valores vazios pelas informações do seu aplicativo web. Exemplo (valores fictícios):

   ```js
   window.JANELAS_CONFIG = {
     firebase: {
       apiKey: "SUA_API_KEY",
       authDomain: "SEU_PROJETO.firebaseapp.com",
       projectId: "SEU_PROJETO",
       appId: "1:12345:web:abcdef"
     },
     adminEmail: "seu-email@exemplo.com"
   };
   ```

   Não copie os valores fictícios do exemplo. `adminEmail` é o endereço da pessoa que poderá ver os registros.

4. No Firebase, vá para **Build > Authentication > Sign-in method** e ative os métodos **Anônimo** e **E-mail/senha**.
5. Em **Authentication > Users**, crie manualmente um usuário de **e-mail/senha** para a administração. Use o **mesmo e-mail** definido no `adminEmail` de `config.js`. Guarde a senha em local privado. NUNCA escreva a senha no código ou no GitHub.
6. Em **Authentication > Settings > Authorized domains**, confira se `itsrubycorn-dotcom.github.io` está autorizado. Adicione o domínio se não estiver. Durante testes locais, `localhost` também pode precisar ser autorizado.
7. Vá a **Build > Firestore Database > Create database**. Selecione o modo de produção e a região conforme sua preferência (considere privacidade e residência dos dados; a escolha da região é permanente para o banco criado). O plano gratuito do Firebase costuma ser suficiente para um projeto acadêmico de pequena escala, sujeito a limites e condições vigentes.
8. Na aba **Rules** do Firestore, abra o arquivo `firestore.rules` do ZIP. Substitua `SEU_EMAIL_ADMIN@EXEMPLO.COM` pelo **mesmo e-mail** configurado nos passos 3 e 5. Cole todo o conteúdo das regras no Firebase e clique em **Publish**.

   **ATENÇÃO:** As regras são essenciais. Não use `allow read, write: if true`, pois isso exporia dados dos participantes. Com estas regras, visitantes só podem registrar entradas e avaliações, e apenas o administrador autenticado pode consultar dados.

9. No GitHub, publique o `config.js` atualizado junto com os demais arquivos, conforme a Parte 2.

## PARTE 2 — Publicar novamente no repositório já existente

Repositório informado anteriormente:

https://github.com/itsrubycorn-dotcom/janelas-do-conhecimento

Site esperado:

https://itsrubycorn-dotcom.github.io/janelas-do-conhecimento/

### Opção A — GitHub pelo navegador (sem instalar programas)

1. Faça login no GitHub e abra o repositório acima.
2. Entre em **Code** (lista de arquivos), escolha **Add file > Upload files**.
3. **Extraia o ZIP no computador antes**. Arraste os arquivos de dentro da pasta extraída (`index.html`, `app.js`, `style.css`, `curriculum.js`, `cloud.js`, `config.js`, `.nojekyll`, README, guia e regras) para a área de upload. NÃO envie apenas o ZIP. Caso queira manter arquivos ocultos, o `.nojekyll` é opcional neste projeto.
4. Se o site já tiver um `index.html` ou `README.md`, mantenha os novos com o mesmo nome no **diretório raiz**. O GitHub deve mostrar a substituição desses arquivos ao confirmar as alterações. Se a interface não permitir substituir algum arquivo, abra o arquivo no repositório e use o botão de edição (lápis) para trocar o conteúdo ou use a opção B (Git).
5. Na parte inferior, selecione **Commit changes**, descreva `Atualização do Janelas do Conhecimento: 75 atividades, login e painel` e confirme a alteração na branch principal (`main`, se for a branch atual).
6. Acesse **Settings > Pages** e confirme **Build and deployment > Deploy from a branch**, branch `main`, pasta `/(root)`. Se já estiver correto, não precisa mudar.
7. Abra o site publicado, preferencialmente em uma janela anônima, e teste a entrada, os três tipos de exercícios e o painel. Se o navegador mostrar a versão antiga, tente atualização forçada (Ctrl+F5).

### Opção B — Git no computador (mais segura para substituir muitos arquivos)

Se você tiver Git instalado, copie os novos arquivos para a pasta clonada do repositório e execute:

```bash
git add .
git commit -m "Recria o site com trilhas, login e painel"
git push origin main
```

A branch pode ter nome diferente de `main`; confirme antes de executar.

## PARTE 3 — Comprovar a aplicação real para a professora

1. Com o Firebase ativo e o site atualizado, convide pessoas reais da comunidade de Osasco a utilizarem a plataforma. Se forem menores, obtenha a autorização adequada dos responsáveis.
2. Cada pessoa deve preencher o formulário de entrada com seu nome e data de nascimento e autorizar o registro. O site registra **nome informado, identificador anônimo, data e horário do servidor** no Firestore. A data de nascimento não é salva.
3. Peça que completem algumas atividades e respondam ao formulário **Conte como foi sua experiência**. Os dados de avaliação serão salvos no Firestore.
4. Abra **Painel de acessos**, entre com o email e senha do administrador do Firebase e confirme que aparecem os registros. Tire capturas de tela das métricas, do histórico com datas/horários e dos comentários dos participantes (apenas com as permissões necessárias). Também é possível baixar CSV para Excel.
5. Inclua as capturas e uma análise breve em **Resultados Esperados/Obtidos**. A professora também pediu o **vídeo de até 5 minutos** com apresentação e demonstração das funcionalidades; grave-o e coloque um link acessível no trabalho.

## Solução de problemas

- **"Modo demonstração" no painel:** `config.js` ainda não está totalmente preenchido ou o navegador está abrindo uma versão antiga.
- **Registros não sincronizam:** verifique `apiKey`, `authDomain`, `projectId`, `appId`, internet, provedores Anônimo + E-mail/senha, `firestore.rules`, domínio autorizado e permissões do projeto Firebase.
- **Erro ao abrir o painel:** adminEmail no `config.js` precisa ser idêntico ao e-mail em `firestore.rules` e ao usuário do Authentication. Verifique a senha. Sem isso a leitura de nomes fica bloqueada por segurança.
- **Não vejo nomes no painel local:** o modo local não salva nomes e só conta acessos neste navegador, de propósito. Para coletar dados reais em diferentes dispositivos, ative o Firebase.
- **GitHub Pages mostra 404:** verifique se `index.html` está na raiz da branch publicada e se a configuração Pages aponta para a mesma branch e `/(root)`.
- **Abra o site sem internet:** HTML/CSS/exercícios podem funcionar se carregados localmente, mas a integração Firebase exige conexão e deve ser testada por `http://localhost` ou pela hospedagem HTTPS.

## Segurança e privacidade

Nome + data de nascimento identificam o estudante na interface, mas **não constituem login seguro** (alguém poderia informar os dados de outra pessoa). Por isso, o painel de nomes e horários tem uma autenticação **separada** com e-mail/senha no Firebase. Não divulgue prints com dados pessoais de crianças sem permissão. A plataforma não coleta nem persiste datas de nascimento no Firestore. O total de usuários/dispositivos únicos é aproximado, pois um mesmo participante pode trocar de navegador ou dispositivo.
