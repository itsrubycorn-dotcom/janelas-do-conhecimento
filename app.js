(function () {
  'use strict';
  const db = window.JANELAS_CURRICULUM;
  const cloud = window.JANELAS_CLOUD;
  const $ = (id) => document.getElementById(id);
  const state = {
    learner:null, subject:'leitura', positions:{leitura:0,escrita:0,matematica:0},
    orders:{}, answered:false, waiting:false, nextTimer:null,
    visits:[], feedbacks:[], adminActive:false, demoView:false
  };
  const browserLogKey = 'janelas-demo-log-v1';
  const browserIdKey = 'janelas-demo-device-v1';
  const blank = (str) => String(str || '').trim();
  const safeText = (el, str) => { el.textContent = String(str); };
  const toDate = value => {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d;
  };
  function dateParts(value) {
    const date = toDate(value);
    if (!date) return {date:'Pendente',time:'Pendente'};
    const local = new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
    const obj = Object.fromEntries(local.formatToParts(date).filter(p=>p.type !== 'literal').map(p=>[p.type,p.value]));
    return {date:`${obj.day}/${obj.month}/${obj.year}`,time:`${obj.hour}:${obj.minute}:${obj.second}`};
  }
  function shuffle(level) {
    const items = [...level];
    for (let i=items.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [items[i],items[j]]=[items[j],items[i]];
    }
    return items;
  }
  function resetOrders() {
    for (const subject of Object.keys(db.subjects)) {
      state.orders[subject] = db.subjects[subject].flatMap(shuffle);
      state.positions[subject] = 0;
    }
  }
  function clearPending() { if(state.nextTimer){window.clearTimeout(state.nextTimer);state.nextTimer=null;} state.waiting=false; }
  function showModal() {
    $('login-overlay').hidden=false;
    document.body.classList.add('modal-open');
    $('entry-status').textContent='';
    window.setTimeout(()=> $('student-name').focus(),10);
  }
  function hideModal() { $('login-overlay').hidden=true;document.body.classList.remove('modal-open'); }
  function scrollToStudy(){ $('trilhas').scrollIntoView({behavior:'smooth',block:'start'}); }
  function getQuestion() { return state.orders[state.subject]?.[state.positions[state.subject]] || null; }
  function renderLearning() {
    clearPending();
    const subject = state.subject;
    const pos = state.positions[subject];
    const level = Math.min(db.levels,Math.floor(pos/5)+1);
    const label = db.labels[subject];
    safeText($('subject-label'),`Trilha de ${label.toLowerCase()}`);
    safeText($('level-pill'),`Nível ${level} de ${db.levels}`);
    safeText($('exercise-counter'), pos>=db.total?'Trilha completa':`Desafio ${pos+1} de ${db.total}`);
    safeText($('correct-counter'),`${pos} ${pos===1?'acerto':'acertos'}`);
    $('progress-bar').setAttribute('aria-valuenow',String(pos));
    $('progress-fill').style.width = `${pos/db.total*100}%`;
    for (const b of document.querySelectorAll('[data-subject]')) {
      const active=b.dataset.subject===subject;
      b.classList.toggle('selected',active);
      b.setAttribute('aria-pressed',String(active));
    }
    $('study-locked').hidden=!!state.learner;
    $('exercise-content').hidden=!state.learner || pos>=db.total;
    $('completed-content').hidden=!state.learner || pos<db.total;
    if (!state.learner){safeText($('exercise-heading'),'Pronto para aprender?');return;}
    if (pos>=db.total){safeText($('exercise-heading'),'Você chegou ao final!');return;}
    const q=getQuestion();
    safeText($('exercise-heading'),q.title);
    safeText($('explanation-title'),q.title);
    safeText($('explanation-text'),q.explanation);
    safeText($('explanation-example'),`Exemplo: ${q.example}`);
    safeText($('question-text'),q.question);
    $('question-context').hidden=!q.context;
    safeText($('question-context'),q.context);
    $('answer-options').replaceChildren();
    q.options.forEach((option,i)=>{
      const b=document.createElement('button');
      b.className='answer-option';b.type='button';b.dataset.answer=String(i);
      const letter=document.createElement('span');letter.className='option-letter';letter.textContent='ABC'[i];
      const text=document.createElement('span');text.textContent=option;
      b.append(letter,text);
      b.addEventListener('click',()=>answer(i,b));
      $('answer-options').append(b);
    });
    $('answer-feedback').className='answer-feedback';
    safeText($('answer-feedback'),'');
    $('next-question').hidden=true;
    $('retry-question').hidden=true;
    state.answered=false;
  }
  function answer(index,button) {
    if(!state.learner||state.answered||state.waiting) return;
    const q=getQuestion();if(!q)return;
    if(index===q.correct){
      state.answered=true;state.waiting=true;
      button.classList.add('correct');
      for(const b of $('answer-options').querySelectorAll('button')) b.disabled=true;
      $('answer-feedback').className='answer-feedback correct';
      safeText($('answer-feedback'),`Muito bem! ${q.rationale} Agora vamos para um novo desafio.`);
      $('next-question').hidden=false;
      state.nextTimer=window.setTimeout(advance,2300);
    } else {
      state.answered=true;
      button.classList.add('incorrect');
      for(const b of $('answer-options').querySelectorAll('button')) b.disabled=true;
      $('answer-feedback').className='answer-feedback incorrect';
      safeText($('answer-feedback'),'Quase lá! Releia a explicação acima e tente mais uma vez. Você permanece neste nível até acertar.');
      $('retry-question').hidden=false;
    }
  }
  function retry() {
    state.answered=false;
    $('retry-question').hidden=true;
    $('answer-feedback').className='answer-feedback';
    safeText($('answer-feedback'),'');
    for(const b of $('answer-options').querySelectorAll('button')) {b.disabled=false;b.classList.remove('incorrect');}
  }
  function advance() {
    if(!state.answered || !state.waiting) return;
    clearPending();
    state.positions[state.subject]++;
    renderLearning();
  }
  function selectSubject(subject){
    if(!Object.prototype.hasOwnProperty.call(db.subjects,subject)) return;
    state.subject=subject;
    renderLearning();
    $('learning-shell').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function parseAge(birth) {
    if(!/^\d{4}-\d\d-\d\d$/.test(birth))return null;
    const [year,month,day]=birth.split('-').map(Number);
    const d=new Date(year,month-1,day);
    if(d.getFullYear()!==year||d.getMonth()!==month-1||d.getDate()!==day)return null;
    const now=new Date();
    let age=now.getFullYear()-year;
    if(now.getMonth()+1<month ||(now.getMonth()+1===month && now.getDate()<day)) age--;
    return age>=0&&age<=110?age:null;
  }
  function updateConsent(){
    const age=parseAge($('student-birth').value);
    safeText($('consent-label'),age!==null&&age<18
      ? 'Confirmo que sou responsável legal ou tenho autorização do responsável para informar este nome e registrar a data/hora do acesso para avaliação acadêmica.'
      : 'Eu autorizo o registro do meu nome e da data/hora do acesso para avaliação acadêmica.');
  }
  function readLocalVisits(){
    try {const log=JSON.parse(localStorage.getItem(browserLogKey)||'[]');return Array.isArray(log)?log:[];}catch{return [];}
  }
  function recordLocalVisit(){
    let uid='';
    try{
      uid=localStorage.getItem(browserIdKey)||'';
      if(!uid){uid=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():String(Date.now());localStorage.setItem(browserIdKey,uid);}
      const visits=readLocalVisits();
      visits.unshift({name:'Não armazenado no modo local',uid,visitedAt:new Date().toISOString()});
      localStorage.setItem(browserLogKey,JSON.stringify(visits.slice(0,500)));
    }catch { /* O navegador pode bloquear armazenamento local. */ }
  }
  function clearDashboard() {
    state.adminActive=false;state.visits=[];state.feedbacks=[];
    $('admin-dashboard').hidden=true;
    $('admin-login-panel').hidden=!cloud.configured();
  }
  async function enter(e){
    e.preventDefault();
    const name=blank($('student-name').value).replace(/\s+/g,' ');
    const age=parseAge($('student-birth').value);
    if(name.length<2||name.length>60){safeText($('entry-status'),'Informe um nome de 2 a 60 caracteres.');return;}
    if(age===null){safeText($('entry-status'),'Informe uma data de nascimento válida.');return;}
    if(!$('guardian-consent').checked){safeText($('entry-status'),'A autorização de registro é necessária.');return;}
    const submit=$('entry-submit');submit.disabled=true;
    safeText($('entry-status'),'Registrando sua entrada...');
    let status='';
    if(cloud.configured()){
      try{await cloud.recordVisit(name);status='Seu acesso foi registrado no painel online.';}
      catch(e){recordLocalVisit();status='Não foi possível sincronizar o acesso. Esta entrada não está comprovada no painel online. Verifique a configuração do Firebase.';}
    }else{recordLocalVisit();status='Modo demonstração: este acesso foi contado somente neste navegador.';}
    submit.disabled=false;
    // Data de nascimento não é persistida nem incluída no registro.
    $('student-birth').value='';$('guardian-consent').checked=false;
    clearPending();clearDashboard();
    state.learner={name};resetOrders();hideModal();
    $('nav-user').hidden=false;
    safeText($('nav-user'),`${name.split(' ')[0]} · Sair`);
    renderLearning();scrollToStudy();
    const foot=document.querySelector('.study-footnote');
    safeText(foot,`${status} As explicações são educativas e não substituem o acompanhamento escolar.`);
    if(!cloud.configured())showDemoPanel();
  }
  async function leaveLearner(){
    if(!window.confirm('Deseja encerrar esta sessão de estudos?'))return;
    clearPending();state.learner=null;
    $('nav-user').hidden=true;safeText($('nav-user'),'Sair');
    resetOrders();renderLearning();
    $('student-name').value='';
    showModal();
  }
  async function submitFeedback(e) {
    e.preventDefault();
    const status=$('feedback-status');status.className='form-status';
    if(!state.learner){safeText(status,'Entre na plataforma e experimente as atividades antes de avaliar.');showModal();return;}
    const rating=Number($('rating').value),ease=$('ease').value,comment=blank($('feedback-text').value);
    if(!Number.isInteger(rating)||rating<1||rating>5||!['sim','parcialmente','nao'].includes(ease)||comment.length<2){safeText(status,'Preencha a avaliação com uma mensagem de pelo menos 2 caracteres.');return;}
    if(!cloud.configured()){safeText(status,'Esta é a versão demonstrativa. Ative o Firebase para coletar avaliações reais no painel. Nenhuma avaliação foi enviada.');return;}
    $('submit-feedback').disabled=true;safeText(status,'Enviando sua avaliação...');
    try{
      await cloud.recordFeedback(state.learner.name,rating,ease,comment);
      status.className='form-status success';safeText(status,'Obrigado! Sua avaliação foi registrada no painel do projeto.');
      $('feedback-form').reset();
    }catch(err){safeText(status,'Não foi possível salvar a avaliação. Confira a conexão e as regras do Firebase.');}
    finally{$('submit-feedback').disabled=false;}
  }
  function fillTable(tbody,values,count) {
    tbody.replaceChildren();
    if(!values.length){const row=document.createElement('tr');const cell=document.createElement('td');cell.colSpan=count;cell.textContent='Nenhum registro até o momento.';row.append(cell);tbody.append(row);return;}
    for(const valuesOfRow of values){
      const row=document.createElement('tr');
      for(const value of valuesOfRow){const cell=document.createElement('td');cell.textContent=String(value);row.append(cell);}
      tbody.append(row);
    }
  }
  function showDashboard(mode) {
    $('admin-login-panel').hidden=true;
    $('admin-dashboard').hidden=false;
    safeText($('dashboard-mode'),mode);
    $('dashboard-logout').hidden=!state.adminActive;
    safeText($('stat-visits'),state.visits.length);
    safeText($('stat-unique'),new Set(state.visits.map(r=>r.uid).filter(Boolean)).size);
    safeText($('stat-feedback'),state.feedbacks.length);
    fillTable($('visits-body'),state.visits.map(v=>{
      const d=dateParts(v.visitedAt);return [v.name,d.date,d.time];
    }),3);
    fillTable($('feedback-body'),state.feedbacks.map(f=>{
      const d=dateParts(f.submittedAt);return [f.name,f.rating,f.ease,f.comment,`${d.date} ${d.time}`];
    }),5);
    $('download-visits').disabled=!state.visits.length;
    $('download-feedback').disabled=!state.feedbacks.length;
    $('demo-switcher').hidden=cloud.configured();
    $('show-sample').setAttribute('aria-pressed',String(state.demoView));
    $('show-local').setAttribute('aria-pressed',String(!state.demoView));
  }
  function showDemoPanel(view='sample'){
    if(cloud.configured())return;
    state.demoView=view==='sample';
    state.visits=state.demoView ? (window.JANELAS_DEMO_VISITS||[]) : readLocalVisits();
    state.feedbacks=[];state.adminActive=false;
    showDashboard(state.demoView
      ? 'Dados ilustrativos'
      : 'Acessos registrados neste navegador · não sincronizados');
  }
  async function adminLogin(e){
    e.preventDefault();
    const status=$('admin-login-status');safeText(status,'Verificando as credenciais...');
    const button=$('admin-form').querySelector('button');button.disabled=true;
    try{
      await cloud.signInAdmin(blank($('admin-email').value),$('admin-password').value);
      const result=await cloud.getDashboard();
      // Não manter uma sessão de estudante e os dados da administração abertos simultaneamente.
      clearPending();state.learner=null;resetOrders();renderLearning();$('nav-user').hidden=true;
      state.visits=result.visits;state.feedbacks=result.feedbacks;state.adminActive=true;state.demoView=false;
      $('admin-password').value='';
      safeText(status,'');
      showDashboard('Acessos reais registrados no Firebase • horário de Brasília (UTC−3).');
    }catch(err){state.adminActive=false;safeText(status,'Não foi possível entrar ou consultar os registros. Confira e-mail, senha e regras do Firebase.');}
    finally{button.disabled=false;}
  }
  async function logoutAdmin(){
    try {await cloud.signOutAdmin();} catch(e){}
    clearDashboard();
    $('admin-form').reset();
  }
  function csvSafe(value){
    let s=String(value??'');
    if (/^[\s]*[=+@\-]/.test(s))s="'"+s;
    return '"'+s.replaceAll('"','""')+'"';
  }
  function downloadCSV(type){
    const rows=type==='visits'
      ? [['Tipo de dado','Nome informado','Data','Horário (Brasília)'],...state.visits.map(v=>{const d=dateParts(v.visitedAt);return[state.demoView?'DEMONSTRAÇÃO — REGISTRO SINTÉTICO':cloud.configured()?'ACESSO REGISTRADO NO SERVIDOR':'REGISTRO LOCAL NESTE NAVEGADOR',v.name,d.date,d.time];})]
      : [['Nome informado','Nota','Compreensão','Comentário','Data','Horário (Brasília)'],...state.feedbacks.map(f=>{const d=dateParts(f.submittedAt);return[f.name,f.rating,f.ease,f.comment,d.date,d.time];})];
    if(rows.length<=1)return;
    const content='\ufeff'+rows.map(row=>row.map(csvSafe).join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8;'}));
    const link=document.createElement('a');link.href=url;link.download=`${state.demoView?'AMOSTRA_DEMONSTRACAO_':'janelas_'}${type}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function init(){
    resetOrders();renderLearning();
    $('student-birth').max=new Date().toISOString().slice(0,10);
    $('student-birth').addEventListener('change',updateConsent);
    $('start-button').addEventListener('click',()=>state.learner?scrollToStudy():showModal());
    $('study-login').addEventListener('click',showModal);
    $('close-login').addEventListener('click',hideModal);
    $('login-overlay').addEventListener('click',e=>{if(e.target===$('login-overlay'))hideModal();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('login-overlay').hidden)hideModal();});
    $('entry-form').addEventListener('submit',enter);
    $('nav-user').addEventListener('click',leaveLearner);
    $('next-question').addEventListener('click',advance);
    $('retry-question').addEventListener('click',retry);
    $('restart-subject').addEventListener('click',()=>{
      state.positions[state.subject]=0;
      state.orders[state.subject]=db.subjects[state.subject].flatMap(shuffle);
      renderLearning();
    });
    for(const button of document.querySelectorAll('[data-subject]')) button.addEventListener('click',()=>selectSubject(button.dataset.subject));
    $('feedback-form').addEventListener('submit',submitFeedback);
    $('admin-form').addEventListener('submit',adminLogin);
    $('dashboard-logout').addEventListener('click',logoutAdmin);
    $('download-visits').addEventListener('click',()=>downloadCSV('visits'));
    $('download-feedback').addEventListener('click',()=>downloadCSV('feedback'));
    $('show-sample').addEventListener('click',()=>showDemoPanel('sample'));
    $('show-local').addEventListener('click',()=>showDemoPanel('local'));
    if(!cloud.configured())showDemoPanel();
  }
  document.addEventListener('DOMContentLoaded',init);
})();
