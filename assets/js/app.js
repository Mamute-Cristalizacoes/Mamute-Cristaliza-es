// =====================================================
// MAMUTE CRISTALIZAÇÕES — SISTEMA DE GESTÃO v2.0
// Arquivo: assets/js/app.js
// Descrição: Lógica principal do sistema integrado ao Supabase
// =====================================================

'use strict';

// =====================================================
// ESTADO GLOBAL DA APLICAÇÃO
// =====================================================

/** @type {import('@supabase/supabase-js').SupabaseClient|null} */
let supabaseClient = null;

// Arrays de dados carregados do banco
let servicos              = [];
let orcamentos            = [];
let promissorias          = [];
let contas                = [];
let produtos              = [];
let notas                 = [];
let clientesFidelizados   = [];
let agendamentosFidelizados = [];

// =====================================================
// MENSAGENS PERSONALIZADAS POR TIPO DE SERVIÇO
// =====================================================

const mensagensWhatsApp = {
  'Limpeza de Vidro': `Olá, {cliente}! 👋\n\nPassando para confirmar o serviço de **Limpeza de Vidro** agendado para o dia *{data}*{hora}.\n\nNossos profissionais estarão prontos para deixar seus vidros impecáveis! ✨\n\nMamute Cristalizações 🐘`,
  'Cristalização de Piso': `Olá, {cliente}! 👋\n\nConfirmando o agendamento para **Cristalização de Piso** em *{data}*{hora}.\n\nSeu piso ficará com acabamento profissional e durável! 💎\n\nMamute Cristalizações 🐘`,
  'Polimento de Piso': `Olá, {cliente}! 👋\n\nLembrando do agendamento de **Polimento de Piso** para *{data}*{hora}.\n\nVamos deixar seu piso brilhando! ✨\n\nMamute Cristalizações 🐘`,
  'Limpeza de Fachada': `Olá, {cliente}! 👋\n\nConfirmando a **Limpeza de Fachada** agendada para *{data}*{hora}.\n\nSua fachada ficará impecável! 🏢\n\nMamute Cristalizações 🐘`,
  'ACM': `Olá, {cliente}! 👋\n\nConfirmando o serviço de **Limpeza e Manutenção de ACM** para *{data}*{hora}.\n\nSeu revestimento ficará como novo! 🔧\n\nMamute Cristalizações 🐘`,
  'Esquadrias': `Olá, {cliente}! 👋\n\nConfirmando o agendamento para **Limpeza de Esquadrias** em *{data}*{hora}.\n\nSuas esquadrias ficarão limpas e brilhantes! 🪟\n\nMamute Cristalizações 🐘`,
  'Limpeza de Placa Solar': `Olá, {cliente}! 👋\n\nConfirmando a **Limpeza de Placa Solar** agendada para *{data}*{hora}.\n\nSua eficiência energética será otimizada! ⚡\n\nMamute Cristalizações 🐘`,
  'Outros': `Olá, {cliente}! 👋\n\nPassando para confirmar seu agendamento para *{data}*{hora}.\n\nEstamos prontos para atendê-lo! 🐘\n\nMamute Cristalizações 🐘`
};

// Estado de edição
let editingIndex    = -1;
let medicoesAtuais  = [];
let clienteSelecionado = null;

// Estado do calendário
let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();

// Credenciais de acesso (hardcoded para sistema local simples)
const VALID_USER     = 'Mamute';
const VALID_PASSWORD = 'mamute2025';
const AUTH_KEY       = 'mamute_auth_v1';

// =====================================================
// INICIALIZAÇÃO DO SUPABASE
// =====================================================

/**
 * Inicializa a conexão com o Supabase usando as credenciais
 * definidas no index.html (variáveis globais SUPABASE_URL e SUPABASE_ANON_KEY).
 * @returns {Promise<boolean>} true se inicializado com sucesso
 */
async function inicializarSupabase() {
  try {
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
      console.error('❌ Chaves do Supabase não encontradas. Verifique o index.html.');
      return false;
    }

    const { createClient } = window.supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Supabase:', error);
    return false;
  }
}

// =====================================================
// REFERÊNCIAS DO DOM
// =====================================================

// Telas principais
const loginScreen  = document.getElementById('loginScreen');
const appScreen    = document.getElementById('appScreen');

// Formulário de login
const loginForm     = document.getElementById('loginForm');
const loginUser     = document.getElementById('loginUser');
const loginPassword = document.getElementById('loginPassword');
const loginError    = document.getElementById('loginError');
const togglePassword = document.getElementById('togglePassword');

// Header
const logoutBtn       = document.getElementById('logoutBtn');
const backupHeaderBtn = document.getElementById('backupHeaderBtn');
const menuToggle      = document.getElementById('menuToggle');
const headerActions   = document.querySelector('.header-actions');

// Abas
const tabBtns     = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Agendamentos
const listaEl        = document.getElementById('lista');
const novoBtn        = document.getElementById('novoBtn');
const calBtn         = document.getElementById('calBtn');
const exportBtn      = document.getElementById('exportBtn');
const filtroCategoria = document.getElementById('filtroCategoria');

// Modal de agendamento
const modal       = document.getElementById('modal');
const closeModal  = document.getElementById('closeModal');
const cancelBtn   = document.getElementById('cancelBtn');
const formServico = document.getElementById('formServico');
const modalTitle  = document.getElementById('modalTitle');

// Inputs do formulário de agendamento
const empresaInput    = document.getElementById('empresa');
const dataInput       = document.getElementById('data');
const horaInput       = document.getElementById('hora');
const telefoneInput   = document.getElementById('telefone');
const duracaoInput    = document.getElementById('duracao');
const categoriaInput  = document.getElementById('categoria');
const fidelizadoInput = document.getElementById('fidelizado');
const obsInput        = document.getElementById('obs');

// Calendário
const modalCalendario = document.getElementById('modalCalendario');
const closeCal        = document.getElementById('closeCal');
const prevMonth       = document.getElementById('prevMonth');
const nextMonth       = document.getElementById('nextMonth');
const calTitulo       = document.getElementById('calTitulo');
const calendarGrid    = document.getElementById('calendarGrid');

// Modal do dia
const modalDia    = document.getElementById('modalDia');
const closeDia    = document.getElementById('closeDia');
const listaDoDia  = document.getElementById('listaDoDia');
const diaTitulo   = document.getElementById('diaTitulo');
const printDayBtn = document.getElementById('printDayBtn');

// Orçamentos
const novoOrcBtn          = document.getElementById('novoOrcBtn');
const listaOrcamentosTab  = document.getElementById('listaOrcamentosTab');
const modalOrcamento      = document.getElementById('modalOrcamento');
const closeOrcamento      = document.getElementById('closeOrcamento');
const orcTipo             = document.getElementById('orcTipo');
const medidaDinamica      = document.getElementById('medidaDinamica');
const addMedida           = document.getElementById('addMedida');
const listaMedicoes       = document.getElementById('listaMedicoes');
const totalOrcamentoDisplay = document.getElementById('totalOrcamento');
const formOrcamento       = document.getElementById('formOrcamento');
const listaOrcamentosSalvos = document.getElementById('listaOrcamentosSalvos');

// Promissórias
const novaPromBtn      = document.getElementById('novaPromBtn');
const listaPromissorias = document.getElementById('listaPromissorias');
const modalPromissoria = document.getElementById('modalPromissoria');
const closePromissoria = document.getElementById('closePromissoria');
const formPromissoria  = document.getElementById('formPromissoria');

// Contas a pagar
const novaContaBtn = document.getElementById('novaContaBtn');
const listaContas  = document.getElementById('listaContas');
const modalConta   = document.getElementById('modalConta');
const closeConta   = document.getElementById('closeConta');
const formConta    = document.getElementById('formConta');

// Estoque
const novoProdutoBtn = document.getElementById('novoProdutoBtn');
const listaEstoque   = document.getElementById('listaEstoque');
const modalProduto   = document.getElementById('modalProduto');
const closeProduto   = document.getElementById('closeProduto');
const formProduto    = document.getElementById('formProduto');

// Notas
const novaNotaBtn       = document.getElementById('novaNotaBtn');
const listaNotas        = document.getElementById('listaNotas');
const modalNota         = document.getElementById('modalNota');
const closeNota         = document.getElementById('closeNota');
const formNota          = document.getElementById('formNota');
const notaLembrete      = document.getElementById('notaLembrete');
const notaLembreteConfig = document.getElementById('notaLembreteConfig');

// Clientes Fidelizados
const novoClienteBtn         = document.getElementById('novoClienteBtn');
const listaClientesFidelizados = document.getElementById('listaClientesFidelizados');
const modalCliente           = document.getElementById('modalCliente');
const closeCliente           = document.getElementById('closeCliente');
const formCliente            = document.getElementById('formCliente');

// Agendamentos Fidelizados
const modalAgendFidelizado   = document.getElementById('modalAgendFidelizado');
const closeAgendFidelizado   = document.getElementById('closeAgendFidelizado');
const formAgendFidelizado    = document.getElementById('formAgendFidelizado');

// Overlay de loading e toast
const loadingOverlay = document.getElementById('loadingOverlay');
const toastContainer = document.getElementById('toastContainer');

// =====================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =====================================================

window.addEventListener('DOMContentLoaded', async () => {
  // Inicializa o Supabase
  const supabaseOk = await inicializarSupabase();

  if (!supabaseOk) {
    console.warn('⚠️ Supabase não inicializado. Verifique as credenciais.');
    // Mesmo sem Supabase, exibe a tela de login
    showLogin();
    return;
  }

  // Verifica se já existe sessão ativa
  const isAuthenticated = sessionStorage.getItem(AUTH_KEY);
  if (isAuthenticated) {
    await showApp();
  } else {
    showLogin();
  }
});

// =====================================================
// LOGIN / LOGOUT
// =====================================================

/** Exibe a tela de login e oculta a aplicação */
function showLogin() {
  if (loginScreen) loginScreen.classList.remove('hidden');
  if (appScreen)   appScreen.classList.add('hidden');
  if (loginUser)   loginUser.focus();
}

/** Exibe a aplicação principal e carrega os dados */
async function showApp() {
  if (loginScreen) loginScreen.classList.add('hidden');
  if (appScreen)   appScreen.classList.remove('hidden');

  showLoading(true);
  await carregarTodosDados();
  showLoading(false);

  renderList();
  renderCalendar();
}

// Evento de submit do formulário de login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user     = loginUser.value.trim();
    const password = loginPassword.value;

    // Limpa mensagem de erro anterior
    loginError.textContent = '';

    if (user === VALID_USER && password === VALID_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      await showApp();
    } else {
      loginError.textContent = 'Usuário ou senha incorretos. Tente novamente.';
      loginPassword.value = '';
      loginPassword.focus();
    }
  });
}

// Botão de logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      sessionStorage.removeItem(AUTH_KEY);
      if (loginUser)     loginUser.value = '';
      if (loginPassword) loginPassword.value = '';
      showLogin();
    }
  });
}

// Botão de backup no header
if (backupHeaderBtn) {
  backupHeaderBtn.addEventListener('click', (e) => {
    e.preventDefault();
    exportarDados();
  });
}

// Toggle de senha (mostrar/ocultar)
if (togglePassword) {
  togglePassword.addEventListener('click', () => {
    const isPassword = loginPassword.type === 'password';
    loginPassword.type = isPassword ? 'text' : 'password';
    togglePassword.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
  });
}

// =====================================================
// MENU MOBILE (HAMBURGUER)
// =====================================================

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
    if (headerActions) headerActions.classList.toggle('open', isOpen);
  });
}

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
  if (menuToggle && headerActions) {
    if (!menuToggle.contains(e.target) && !headerActions.contains(e.target)) {
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      headerActions.classList.remove('open');
    }
  }
});

// =====================================================
// NAVEGAÇÃO DE ABAS
// =====================================================

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');

    // Remove estado ativo de todos
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabContents.forEach(c => {
      c.classList.remove('active');
      c.classList.add('hidden');
    });

    // Ativa o selecionado
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const targetTab = document.getElementById(tabName);
    if (targetTab) {
      targetTab.classList.add('active');
      targetTab.classList.remove('hidden');
    }
  });
});

// =====================================================
// MODAIS — UTILITÁRIOS
// =====================================================

/**
 * Abre um modal pelo seu ID.
 * @param {string} modalId - ID do elemento modal
 */
function abrirModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.remove('hidden');
    // Foca no primeiro input do modal
    setTimeout(() => {
      const firstInput = m.querySelector('input:not([readonly]), textarea, select');
      if (firstInput) firstInput.focus();
    }, 100);
  }
}

/**
 * Fecha um modal pelo seu ID.
 * @param {string} modalId - ID do elemento modal
 */
function fecharModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('hidden');
}

// Fechar modais ao clicar no backdrop
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', () => {
    const modalId = backdrop.getAttribute('data-close');
    if (modalId) fecharModal(modalId);
  });
});

// Fechar modais com tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal:not(.hidden)').forEach(m => {
      m.classList.add('hidden');
    });
  }
});

// Botões de fechar individuais
if (closeModal)          closeModal.addEventListener('click', () => fecharModal('modal'));
if (cancelBtn)           cancelBtn.addEventListener('click', () => fecharModal('modal'));
if (closeCal)            closeCal.addEventListener('click', () => fecharModal('modalCalendario'));
if (closeDia)            closeDia.addEventListener('click', () => fecharModal('modalDia'));
if (closeOrcamento)      closeOrcamento.addEventListener('click', () => fecharModal('modalOrcamento'));
if (closePromissoria)    closePromissoria.addEventListener('click', () => fecharModal('modalPromissoria'));
if (closeConta)          closeConta.addEventListener('click', () => fecharModal('modalConta'));
if (closeProduto)        closeProduto.addEventListener('click', () => fecharModal('modalProduto'));
if (closeNota)           closeNota.addEventListener('click', () => fecharModal('modalNota'));
if (closeCliente)        closeCliente.addEventListener('click', () => fecharModal('modalCliente'));
if (closeAgendFidelizado) closeAgendFidelizado.addEventListener('click', () => {
  fecharModal('modalAgendFidelizado');
  clienteSelecionado = null;
});

// =====================================================
// LOADING E NOTIFICAÇÕES
// =====================================================

/**
 * Exibe ou oculta o overlay de carregamento.
 * @param {boolean} show
 */
function showLoading(show) {
  if (loadingOverlay) {
    loadingOverlay.classList.toggle('hidden', !show);
  }
}

/**
 * Exibe uma notificação toast.
 * @param {string} message - Mensagem a exibir
 * @param {'success'|'error'|'warning'|'info'} type - Tipo da notificação
 * @param {number} duration - Duração em ms (padrão: 3000)
 */
function showToast(message = '✓ Salvo com sucesso!', type = 'success', duration = 3000) {
  if (!toastContainer) return;

  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);

  // Remove automaticamente após o tempo definido
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Alias para compatibilidade com código original
function showSaveNotification(msg = '✓ Salvo com sucesso!') {
  showToast(msg, 'success');
}

// =====================================================
// CARREGAR DADOS DO SUPABASE
// =====================================================

/**
 * Carrega todos os dados do Supabase e atualiza as variáveis globais.
 * Após o carregamento, chama atualizarTodasAsAbas().
 */
async function carregarTodosDados() {
  if (!supabaseClient) {
    console.warn('⚠️ Supabase não inicializado. Dados não carregados.');
    return;
  }

  try {
    // Carrega todas as tabelas em paralelo para melhor performance
    const [
      agendamentosRes,
      orcamentosRes,
      promissoriasRes,
      contasRes,
      estoqueRes,
      notasRes,
      clientesRes,
      agendFidelRes
    ] = await Promise.all([
      supabaseClient.from('agendamentos').select('*').order('data', { ascending: true }),
      supabaseClient.from('orcamentos').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('promissorias').select('*').order('data_vencimento', { ascending: true }),
      supabaseClient.from('contas_pagar').select('*').order('data_vencimento', { ascending: true }),
      supabaseClient.from('estoque').select('*').order('nome', { ascending: true }),
      supabaseClient.from('notas').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('clientes_fidelizados').select('*').order('nome', { ascending: true }),
      supabaseClient.from('agendamentos_fidelizados').select('*').order('data_agendamento', { ascending: true })
    ]);

    // Atribui os dados (ignora erros individuais para não travar tudo)
    if (!agendamentosRes.error) servicos              = agendamentosRes.data || [];
    if (!orcamentosRes.error)   orcamentos            = orcamentosRes.data   || [];
    if (!promissoriasRes.error) promissorias          = promissoriasRes.data || [];
    if (!contasRes.error)       contas                = contasRes.data       || [];
    if (!estoqueRes.error)      produtos              = estoqueRes.data      || [];
    if (!notasRes.error)        notas                 = notasRes.data        || [];
    if (!clientesRes.error)     clientesFidelizados   = clientesRes.data     || [];
    if (!agendFidelRes.error)   agendamentosFidelizados = agendFidelRes.data || [];

    atualizarTodasAsAbas();

  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    showToast('Erro ao carregar dados do servidor.', 'error');
  }
}

// =====================================================
// UTILITÁRIOS DE DATA E FORMATAÇÃO
// =====================================================

/**
 * Formata uma data no formato YYYY-MM-DD para DD/MM/YYYY.
 * @param {string} dateStr
 * @returns {string}
 */
function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Formata um valor numérico como moeda brasileira.
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

/**
 * Calcula a data de fim de um serviço com base na duração.
 * @param {string} dataInicio - Data no formato YYYY-MM-DD
 * @param {number} duracao - Número de dias
 * @returns {string} Data no formato YYYY-MM-DD
 */
function calcularFimServico(dataInicio, duracao) {
  const d = new Date(dataInicio + 'T00:00:00');
  d.setDate(d.getDate() + (duracao - 1));
  return d.toISOString().split('T')[0];
}

/**
 * Envia mensagem via WhatsApp com mensagem personalizada por tipo de serviço.
 * @param {string} telefone - Número do telefone
 * @param {string} cliente - Nome do cliente
 * @param {string} data - Data formatada
 * @param {string} hora - Hora do serviço
 * @param {string} categoria - Tipo de serviço (para personalizar a mensagem)
 */
function enviarWhatsApp(telefone, cliente, data, hora, categoria = 'Outros') {
  // Remove caracteres não numéricos do telefone
  const numero = telefone.replace(/\D/g, '');
  if (!numero) {
    showToast('Telefone não informado.', 'warning');
    return;
  }

  // Obtém a mensagem personalizada para o tipo de serviço
  let mensagemTemplate = mensagensWhatsApp[categoria] || mensagensWhatsApp['Outros'];
  const horaTexto = hora ? ` às ${hora}` : '';
  
  // Substitui os placeholders na mensagem
  const mensagemFinal = mensagemTemplate
    .replace('{cliente}', cliente)
    .replace('{data}', data)
    .replace('{hora}', horaTexto);
  
  const mensagem = encodeURIComponent(mensagemFinal);

  // Adiciona código do Brasil se necessário
  const numeroFormatado = numero.startsWith('55') ? numero : `55${numero}`;
  window.open(`https://wa.me/${numeroFormatado}?text=${mensagem}`, '_blank');
}

// Expõe funções globalmente (necessário para onclick inline)
window.enviarWhatsApp = enviarWhatsApp;

// =====================================================
// AGENDAMENTOS
// =====================================================

// Abrir modal de novo agendamento
if (novoBtn) {
  novoBtn.addEventListener('click', () => {
    editingIndex = -1;
    if (modalTitle) modalTitle.textContent = 'Novo Serviço';
    if (formServico) formServico.reset();
    abrirModal('modal');
  });
}

// Filtro de categoria
if (filtroCategoria) {
  filtroCategoria.addEventListener('change', renderList);
}

// Submit do formulário de agendamento
if (formServico) {
  formServico.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novoServico = {
      empresa:   empresaInput.value.trim(),
      data:      dataInput.value,
      hora:      horaInput.value || null,
      telefone:  telefoneInput.value.trim() || null,
      duracao:   parseInt(duracaoInput.value) || 1,
      categoria: categoriaInput.value,
      fidelizado: fidelizadoInput.checked,
      obs:       obsInput.value.trim() || null
    };

    try {
      if (editingIndex === -1) {
        // Novo agendamento
        const { error } = await supabaseClient
          .from('agendamentos')
          .insert([novoServico]);
        if (error) throw error;
        showToast('Agendamento criado com sucesso!', 'success');
      } else {
        // Editar agendamento existente
        const id = servicos[editingIndex].id;
        const { error } = await supabaseClient
          .from('agendamentos')
          .update(novoServico)
          .eq('id', id);
        if (error) throw error;
        showToast('Agendamento atualizado!', 'success');
      }

      fecharModal('modal');
      await carregarTodosDados();
      renderList();
      renderCalendar();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      showToast('Erro ao salvar: ' + error.message, 'error');
    }
  });
}

/**
 * Renderiza a lista de agendamentos com base no filtro ativo, separados por mês.
 */
function renderList() {
  if (!listaEl) return;

  const categoriaFiltro = filtroCategoria ? filtroCategoria.value : 'Todos';
  const filtered = servicos.filter(s =>
    categoriaFiltro === 'Todos' || s.categoria === categoriaFiltro
  );

  if (filtered.length === 0) {
    listaEl.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p>Nenhum agendamento encontrado.</p>
      </div>
    `;
    return;
  }

  // Agrupa agendamentos por mês
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const agendamentosPorMes = {};

  filtered.forEach((s) => {
    const [year, month] = s.data.split('-');
    const mesKey = `${year}-${month}`;
    const mesNome = `${meses[parseInt(month) - 1]} / ${year}`;
    
    if (!agendamentosPorMes[mesKey]) {
      agendamentosPorMes[mesKey] = { nome: mesNome, agendamentos: [] };
    }
    agendamentosPorMes[mesKey].agendamentos.push(s);
  });

  listaEl.innerHTML = '';

  // Renderiza cada mês com seus agendamentos
  Object.keys(agendamentosPorMes).sort().forEach((mesKey) => {
    const mesData = agendamentosPorMes[mesKey];
    
    // Cria um header do mês
    const mesHeader = document.createElement('div');
    mesHeader.style.cssText = 'margin-top: 24px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--color-primary); font-size: 16px; font-weight: 700; color: var(--color-primary);';
    mesHeader.textContent = mesData.nome;
    listaEl.appendChild(mesHeader);

    // Renderiza os agendamentos do mês
    mesData.agendamentos.forEach((s, index) => {
    const card = document.createElement('div');
    card.className = `card${s.fidelizado ? ' fidelizado-card' : ''}`;

    const whatsappBtn = s.telefone
      ? `<button class="btn-action whatsapp" onclick="enviarWhatsApp('${s.telefone}', '${escapeHtml(s.empresa)}', '${formatDateDisplay(s.data)}', '${s.hora || ''}', '${s.categoria}')">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
           WhatsApp
         </button>`
      : '';

    card.innerHTML = `
      <div class="card-title">
        ${s.fidelizado ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' : ''}
        ${escapeHtml(s.empresa)}
      </div>
      <span class="card-badge">${escapeHtml(s.categoria)}</span>
      <div class="card-info">
        <div class="card-info-item">
          <span class="card-info-label">Data</span>
          <span class="card-info-value">${formatDateDisplay(s.data)}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Horário</span>
          <span class="card-info-value">${s.hora || 'Não informado'}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Duração</span>
          <span class="card-info-value">${s.duracao} dia(s)</span>
        </div>
        ${s.telefone ? `<div class="card-info-item">
          <span class="card-info-label">Telefone</span>
          <span class="card-info-value">${escapeHtml(s.telefone)}</span>
        </div>` : ''}
      </div>
      ${s.obs ? `<div class="card-obs">${escapeHtml(s.obs)}</div>` : ''}
      <div class="card-actions">
        <button class="btn-action edit" onclick="editServico(${index})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar
        </button>
        ${whatsappBtn}
        <button class="btn-action del" onclick="deleteServico(${index})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Excluir
        </button>
      </div>
    `;
    listaEl.appendChild(card);
    });
  });
}

/**
 * Exclui um agendamento pelo índice no array local.
 * @param {number} index
 */
async function deleteServico(index) {
  if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

  try {
    const id = servicos[index].id;
    const { error } = await supabaseClient
      .from('agendamentos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast('Agendamento excluído.', 'success');
    await carregarTodosDados();
    renderList();
    renderCalendar();
  } catch (error) {
    showToast('Erro ao excluir: ' + error.message, 'error');
  }
}

/**
 * Abre o modal de edição para um agendamento.
 * @param {number} index
 */
function editServico(index) {
  editingIndex = index;
  const s = servicos[index];

  if (modalTitle) modalTitle.textContent = 'Editar Serviço';
  empresaInput.value    = s.empresa    || '';
  dataInput.value       = s.data       || '';
  horaInput.value       = s.hora       || '';
  telefoneInput.value   = s.telefone   || '';
  duracaoInput.value    = s.duracao    || 1;
  categoriaInput.value  = s.categoria  || 'Limpeza de Vidro';
  fidelizadoInput.checked = s.fidelizado || false;
  obsInput.value        = s.obs        || '';

  abrirModal('modal');
}

// Expõe funções de agendamento globalmente
window.deleteServico = deleteServico;
window.editServico   = editServico;

// =====================================================
// CALENDÁRIO
// =====================================================

if (calBtn)    calBtn.addEventListener('click', () => abrirModal('modalCalendario'));
if (prevMonth) prevMonth.addEventListener('click', () => changeMonth(-1));
if (nextMonth) nextMonth.addEventListener('click', () => changeMonth(1));

/**
 * Navega para o mês anterior ou próximo.
 * @param {number} delta - -1 para anterior, +1 para próximo
 */
function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

/**
 * Renderiza o calendário com os agendamentos do mês atual.
 */
function renderCalendar() {
  if (!calendarGrid) return;
  calendarGrid.innerHTML = '';

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  if (calTitulo) calTitulo.textContent = `${meses[currentMonth]} ${currentYear}`;

  const hoje       = new Date();
  const firstDay   = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Células vazias no início
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    calendarGrid.appendChild(empty);
  }

  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEl   = document.createElement('div');
    dayEl.className = 'calendar-day';

    // Verifica se é hoje
    if (
      day === hoje.getDate() &&
      currentMonth === hoje.getMonth() &&
      currentYear === hoje.getFullYear()
    ) {
      dayEl.classList.add('today');
    }

    // Filtra serviços que cobrem este dia (considerando duração)
    const dayServicos = servicos.filter(s => {
      const sDate   = new Date(s.data + 'T00:00:00');
      const calDate = new Date(dateStr + 'T00:00:00');
      const endDate = new Date(sDate);
      endDate.setDate(sDate.getDate() + (s.duracao - 1));
      return calDate >= sDate && calDate <= endDate;
    });

    dayEl.innerHTML = `<span class="day-number">${day}</span>`;

    if (dayServicos.length > 0) {
      dayEl.classList.add('has-events');
      const badge = document.createElement('div');
      badge.className = 'event-badge';
      badge.textContent = `${dayServicos.length}`;
      dayEl.appendChild(badge);
      dayEl.onclick = () => showDayDetails(dateStr, dayServicos);
    }

    calendarGrid.appendChild(dayEl);
  }
}

/**
 * Exibe os detalhes dos serviços de um dia específico.
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @param {Array} dayServicos - Lista de serviços do dia
 */
function showDayDetails(dateStr, dayServicos) {
  if (diaTitulo) diaTitulo.textContent = `Serviços em ${formatDateDisplay(dateStr)}`;
  if (!listaDoDia) return;

  listaDoDia.innerHTML = '';

  dayServicos.forEach(s => {
    const item = document.createElement('div');
    item.className = 'day-service-item';
    item.innerHTML = `
      <strong>${escapeHtml(s.empresa)}</strong>
      <small>${escapeHtml(s.categoria)} — ${s.hora || 'Horário não informado'}</small>
    `;
    listaDoDia.appendChild(item);
  });

  abrirModal('modalDia');
}

// Botão de imprimir o dia
if (printDayBtn) {
  printDayBtn.addEventListener('click', () => window.print());
}

// =====================================================
// EXPORTAÇÃO / BACKUP
// =====================================================

if (exportBtn) exportBtn.addEventListener('click', exportarDados);

/**
 * Gera um arquivo HTML com todos os dados do sistema para backup.
 */
function exportarDados() {
  const agora = new Date().toLocaleDateString('pt-BR');

  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backup — Mamute Cristalizações — ${agora}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; color: #333; }
    .container { max-width: 1100px; margin: 0 auto; }
    h1 { color: #C41E3A; border-bottom: 3px solid #C41E3A; padding-bottom: 12px; margin-bottom: 24px; font-size: 24px; }
    h2 { color: #C41E3A; margin: 32px 0 12px; font-size: 18px; border-left: 4px solid #C41E3A; padding-left: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    th { background: #C41E3A; color: white; padding: 10px 14px; text-align: left; font-size: 13px; }
    td { padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fafafa; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
<div class="container">
  <h1>🐘 Mamute Cristalizações — Backup de Dados</h1>
  <p style="color:#666; margin-bottom:20px; font-size:13px;">Gerado em: ${agora}</p>`;

  // Agendamentos
  html += `<h2>Agendamentos (${servicos.length})</h2>
  <table><thead><tr><th>Cliente</th><th>Data</th><th>Hora</th><th>Categoria</th><th>Duração</th><th>Fidelizado</th></tr></thead><tbody>`;
  servicos.forEach(s => {
    html += `<tr><td>${s.empresa}</td><td>${formatDateDisplay(s.data)}</td><td>${s.hora || '—'}</td><td>${s.categoria}</td><td>${s.duracao} dia(s)</td><td>${s.fidelizado ? 'Sim' : 'Não'}</td></tr>`;
  });
  html += '</tbody></table>';

  // Orçamentos
  html += `<h2>Orçamentos (${orcamentos.length})</h2>
  <table><thead><tr><th>Cliente</th><th>Total Área</th><th>Total Placas</th><th>Data</th></tr></thead><tbody>`;
  orcamentos.forEach(o => {
    html += `<tr><td>${o.cliente}</td><td>${(o.total_area || 0).toFixed(2)} m²</td><td>${o.total_placas || 0} un</td><td>${new Date(o.created_at).toLocaleDateString('pt-BR')}</td></tr>`;
  });
  html += '</tbody></table>';

  // Promissórias
  html += `<h2>Promissórias (${promissorias.length})</h2>
  <table><thead><tr><th>Cliente</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr></thead><tbody>`;
  promissorias.forEach(p => {
    const diff = Math.ceil((new Date(p.data_vencimento + 'T00:00:00') - new Date()) / 86400000);
    const status = diff < 0 ? 'Atrasada' : diff <= p.dias_aviso ? 'Vence em breve' : 'Em dia';
    html += `<tr><td>${p.cliente}</td><td>${formatCurrency(p.valor)}</td><td>${formatDateDisplay(p.data_vencimento)}</td><td>${status}</td></tr>`;
  });
  html += '</tbody></table>';

  // Contas a Pagar
  html += `<h2>Contas a Pagar (${contas.length})</h2>
  <table><thead><tr><th>Fornecedor</th><th>Valor</th><th>Vencimento</th></tr></thead><tbody>`;
  contas.forEach(c => {
    html += `<tr><td>${c.fornecedor}</td><td>${formatCurrency(c.valor)}</td><td>${formatDateDisplay(c.data_vencimento)}</td></tr>`;
  });
  html += '</tbody></table>';

  // Estoque
  html += `<h2>Estoque (${produtos.length})</h2>
  <table><thead><tr><th>Produto</th><th>Categoria</th><th>Quantidade</th><th>Mínimo</th><th>Valor Unit.</th></tr></thead><tbody>`;
  produtos.forEach(p => {
    html += `<tr><td>${p.nome}</td><td>${p.categoria}</td><td>${p.quantidade}</td><td>${p.quantidade_minima}</td><td>${formatCurrency(p.valor_unitario)}</td></tr>`;
  });
  html += '</tbody></table>';

  html += `<div class="footer">Mamute Cristalizações — Sistema de Gestão Profissional</div>
</div></body></html>`;

  // Cria e dispara o download
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `backup-mamute-${new Date().toISOString().split('T')[0]}.html`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('Backup gerado com sucesso!', 'success');
}

// =====================================================
// ORÇAMENTOS
// =====================================================

// Abrir modal de orçamento
if (novoOrcBtn) {
  novoOrcBtn.addEventListener('click', () => {
    if (formOrcamento) formOrcamento.reset();
    medicoesAtuais = [];
    renderizarMedicoes();
    atualizarCamposMedida();
    abrirModal('modalOrcamento');
  });
}

// Mudança de tipo de item no orçamento
if (orcTipo) {
  orcTipo.addEventListener('change', atualizarCamposMedida);
}

/**
 * Atualiza os campos de medição de acordo com o tipo selecionado.
 */
function atualizarCamposMedida() {
  if (!medidaDinamica || !orcTipo) return;
  const tipo = orcTipo.value;

  if (tipo === 'Placa Solar') {
    medidaDinamica.innerHTML = `
      <div class="form-field">
        <label for="quantidade">Quantidade de Placas</label>
        <input id="quantidade" type="number" min="1" placeholder="Ex: 10" />
      </div>
    `;
  } else {
    medidaDinamica.innerHTML = `
      <div class="form-field">
        <label for="largura">Largura (m)</label>
        <input id="largura" type="number" step="0.01" min="0" placeholder="Ex: 1.20" />
      </div>
      <div class="form-field">
        <label for="altura">Altura (m)</label>
        <input id="altura" type="number" step="0.01" min="0" placeholder="Ex: 2.50" />
      </div>
    `;
  }
}

// Botão de adicionar medição
if (addMedida) {
  addMedida.addEventListener('click', () => {
    const tipo = orcTipo.value;

    if (tipo === 'Placa Solar') {
      const qtd = parseInt(document.getElementById('quantidade')?.value) || 0;
      if (qtd > 0) {
        medicoesAtuais.push({ tipo, quantidade: qtd });
        renderizarMedicoes();
        document.getElementById('quantidade').value = '';
      } else {
        showToast('Informe a quantidade de placas.', 'warning');
      }
    } else {
      const largura = parseFloat(document.getElementById('largura')?.value) || 0;
      const altura  = parseFloat(document.getElementById('altura')?.value)  || 0;
      if (largura > 0 && altura > 0) {
        const area = largura * altura;
        medicoesAtuais.push({ tipo, largura, altura, area });
        renderizarMedicoes();
        document.getElementById('largura').value = '';
        document.getElementById('altura').value  = '';
      } else {
        showToast('Preencha largura e altura corretamente.', 'warning');
      }
    }
  });
}

/**
 * Renderiza a tabela de medições adicionadas.
 */
function renderizarMedicoes() {
  if (!listaMedicoes) return;

  if (medicoesAtuais.length === 0) {
    listaMedicoes.innerHTML = '';
    atualizarTotalOrcamento();
    return;
  }

  let html = `<div class="medicoes-table-wrapper">
    <table class="medicoes-table">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Detalhes</th>
          <th style="width:60px; text-align:center;">Ação</th>
        </tr>
      </thead>
      <tbody>`;

  medicoesAtuais.forEach((m, idx) => {
    const detalhes = m.tipo === 'Placa Solar'
      ? `${m.quantidade} unidade(s)`
      : `${m.largura.toFixed(2)}m × ${m.altura.toFixed(2)}m = ${m.area.toFixed(2)}m²`;

    html += `<tr>
      <td>${m.tipo}</td>
      <td>${detalhes}</td>
      <td style="text-align:center;">
        <button type="button" class="btn-action del" onclick="removerMedicao(${idx})" title="Remover">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  listaMedicoes.innerHTML = html;
  atualizarTotalOrcamento();
}

/**
 * Remove uma medição pelo índice.
 * @param {number} idx
 */
window.removerMedicao = function(idx) {
  medicoesAtuais.splice(idx, 1);
  renderizarMedicoes();
};

/**
 * Atualiza o display do total do orçamento.
 */
function atualizarTotalOrcamento() {
  if (!totalOrcamentoDisplay) return;

  let totalArea   = 0;
  let totalPlacas = 0;

  medicoesAtuais.forEach(m => {
    if (m.tipo === 'Placa Solar') totalPlacas += m.quantidade;
    else totalArea += m.area;
  });

  totalOrcamentoDisplay.textContent = `Total: ${totalArea.toFixed(2)} m²  |  ${totalPlacas} Placas`;
}

// Submit do formulário de orçamento
if (formOrcamento) {
  formOrcamento.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (medicoesAtuais.length === 0) {
      showToast('Adicione pelo menos uma medição antes de salvar.', 'warning');
      return;
    }

    const cliente = document.getElementById('orcCliente').value.trim();
    let totalArea   = 0;
    let totalPlacas = 0;
    medicoesAtuais.forEach(m => {
      if (m.tipo === 'Placa Solar') totalPlacas += m.quantidade;
      else totalArea += m.area;
    });

    const novoOrc = {
      cliente,
      itens:        medicoesAtuais,
      total_area:   totalArea,
      total_placas: totalPlacas
    };

    try {
      const { error } = await supabaseClient.from('orcamentos').insert([novoOrc]);
      if (error) throw error;

      showToast('Orçamento salvo com sucesso!', 'success');
      document.getElementById('orcCliente').value = '';
      medicoesAtuais = [];
      renderizarMedicoes();
      await carregarTodosDados();
      renderizarOrcamentos();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    }
  });
}

/**
 * Renderiza a lista de orçamentos salvos.
 */
function renderizarOrcamentos() {
  const renderTo = (container) => {
    if (!container) return;
    container.innerHTML = '';

    if (orcamentos.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <p>Nenhum orçamento registrado.</p>
      </div>`;
      return;
    }

    orcamentos.forEach((orc, idx) => {
      const tipos = Array.isArray(orc.itens)
        ? [...new Set(orc.itens.map(i => i.tipo))].join(', ')
        : '—';

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-title">${escapeHtml(orc.cliente)}</div>
        <span class="card-badge">${tipos}</span>
        <div class="card-info">
          <div class="card-info-item">
            <span class="card-info-label">Área Total</span>
            <span class="card-info-value">${(orc.total_area || 0).toFixed(2)} m²</span>
          </div>
          <div class="card-info-item">
            <span class="card-info-label">Placas</span>
            <span class="card-info-value">${orc.total_placas || 0} un</span>
          </div>
          <div class="card-info-item">
            <span class="card-info-label">Data</span>
            <span class="card-info-value">${new Date(orc.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-action edit" onclick="imprimirOrcamento(${idx})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimir
          </button>
          <button class="btn-action del" onclick="excluirOrcamento(${idx})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Excluir
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  };

  renderTo(listaOrcamentosTab);
  renderTo(listaOrcamentosSalvos);
}

/**
 * Imprime um orçamento em nova janela.
 * @param {number} idx
 */
window.imprimirOrcamento = function(idx) {
  const orc = orcamentos[idx];
  if (!orc) return;

  let itensHtml = '';
  (orc.itens || []).forEach(m => {
    const detalhes = m.tipo === 'Placa Solar'
      ? `${m.quantidade} unidade(s)`
      : `${m.largura.toFixed(2)}m × ${m.altura.toFixed(2)}m (${m.area.toFixed(2)} m²)`;
    itensHtml += `<tr><td>${m.tipo}</td><td>${detalhes}</td></tr>`;
  });

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Orçamento — ${orc.cliente}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
    h1 { color: #C41E3A; border-bottom: 2px solid #C41E3A; padding-bottom: 10px; margin-bottom: 20px; }
    p { margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 10px 14px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    .total { margin-top: 24px; font-size: 1.1em; font-weight: 700; text-align: right; color: #C41E3A; }
    .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 16px; }
  </style>
</head>
<body>
  <h1>🐘 Mamute Cristalizações — Orçamento</h1>
  <p><strong>Cliente:</strong> ${orc.cliente}</p>
  <p><strong>Data:</strong> ${new Date(orc.created_at).toLocaleDateString('pt-BR')}</p>
  <table>
    <thead><tr><th>Tipo</th><th>Detalhes</th></tr></thead>
    <tbody>${itensHtml}</tbody>
  </table>
  <div class="total">
    Área Total: ${(orc.total_area || 0).toFixed(2)} m²<br>
    Total Placas: ${orc.total_placas || 0} unidades
  </div>
  <div class="footer">Este orçamento tem validade de 10 dias. — Mamute Cristalizações</div>
</body></html>`);
  win.document.close();
  win.print();
};

/**
 * Exclui um orçamento pelo índice.
 * @param {number} idx
 */
window.excluirOrcamento = async function(idx) {
  if (!confirm('Excluir este orçamento?')) return;
  const orc = orcamentos[idx];

  try {
    const { error } = await supabaseClient.from('orcamentos').delete().eq('id', orc.id);
    if (error) throw error;
    showToast('Orçamento excluído.', 'success');
    await carregarTodosDados();
    renderizarOrcamentos();
  } catch (error) {
    showToast('Erro: ' + error.message, 'error');
  }
};

// =====================================================
// PROMISSÓRIAS
// =====================================================

if (novaPromBtn) {
  novaPromBtn.addEventListener('click', () => {
    if (formPromissoria) formPromissoria.reset();
    abrirModal('modalPromissoria');
  });
}

if (formPromissoria) {
  formPromissoria.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novaProm = {
      cliente:         document.getElementById('promCliente').value.trim(),
      valor:           parseFloat(document.getElementById('promValor').value),
      data_vencimento: document.getElementById('promDataVencimento').value,
      descricao:       document.getElementById('promDescricao').value.trim() || null,
      lembrete_ativo:  document.getElementById('promLembrete').checked,
      dias_aviso:      parseInt(document.getElementById('promDiasAviso').value) || 3,
      paga:            false
    };

    try {
      const { error } = await supabaseClient.from('promissorias').insert([novaProm]);
      if (error) throw error;
      showToast('Promissória salva!', 'success');
      fecharModal('modalPromissoria');
      await carregarTodosDados();
      renderizarPromissorias();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    }
  });
}

/**
 * Renderiza a lista de promissórias.
 */
function renderizarPromissorias() {
  if (!listaPromissorias) return;
  listaPromissorias.innerHTML = '';

  if (promissorias.length === 0) {
    listaPromissorias.innerHTML = `<div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <p>Nenhuma promissória registrada.</p>
    </div>`;
    return;
  }

  promissorias.forEach((prom, idx) => {
    const hoje = new Date();
    const venc = new Date(prom.data_vencimento + 'T00:00:00');
    const diff = Math.ceil((venc - hoje) / 86400000);

    let statusType, statusText;
    if (diff < 0) {
      statusType = 'danger';
      statusText = `Atrasada há ${Math.abs(diff)} dia(s)`;
    } else if (diff <= prom.dias_aviso) {
      statusType = 'warning';
      statusText = `Vence em ${diff} dia(s)`;
    } else {
      statusType = 'success';
      statusText = `Vence em ${diff} dia(s)`;
    }

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">${escapeHtml(prom.cliente)}</div>
      <div class="card-info">
        <div class="card-info-item">
          <span class="card-info-label">Valor</span>
          <span class="card-info-value">${formatCurrency(prom.valor)}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Vencimento</span>
          <span class="card-info-value">${formatDateDisplay(prom.data_vencimento)}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Status</span>
          <span class="card-info-value">
            <span class="status-badge ${statusType}">${statusText}</span>
          </span>
        </div>
      </div>
      ${prom.descricao ? `<div class="card-obs">${escapeHtml(prom.descricao)}</div>` : ''}
      <div class="card-actions">
        <button class="btn-action del" onclick="excluirPromissoria(${idx})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Excluir
        </button>
      </div>
    `;
    listaPromissorias.appendChild(card);
  });
}

window.excluirPromissoria = async function(idx) {
  if (!confirm('Excluir esta promissória?')) return;
  const prom = promissorias[idx];
  try {
    const { error } = await supabaseClient.from('promissorias').delete().eq('id', prom.id);
    if (error) throw error;
    showToast('Promissória excluída.', 'success');
    await carregarTodosDados();
    renderizarPromissorias();
  } catch (error) {
    showToast('Erro: ' + error.message, 'error');
  }
};

// =====================================================
// CONTAS A PAGAR
// =====================================================

if (novaContaBtn) {
  novaContaBtn.addEventListener('click', () => {
    if (formConta) formConta.reset();
    abrirModal('modalConta');
  });
}

if (formConta) {
  formConta.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novaConta = {
      fornecedor:      document.getElementById('contaFornecedor').value.trim(),
      valor:           parseFloat(document.getElementById('contaValor').value),
      data_vencimento: document.getElementById('contaDataVencimento').value,
      descricao:       document.getElementById('contaDescricao').value.trim() || null,
      lembrete_ativo:  document.getElementById('contaLembrete').checked,
      dias_aviso:      parseInt(document.getElementById('contaDiasAviso').value) || 3,
      paga:            false
    };

    try {
      const { error } = await supabaseClient.from('contas_pagar').insert([novaConta]);
      if (error) throw error;
      showToast('Conta salva!', 'success');
      fecharModal('modalConta');
      await carregarTodosDados();
      renderizarContas();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    }
  });
}

/**
 * Renderiza a lista de contas a pagar.
 */
function renderizarContas() {
  if (!listaContas) return;
  listaContas.innerHTML = '';

  if (contas.length === 0) {
    listaContas.innerHTML = `<div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
      <p>Nenhuma conta registrada.</p>
    </div>`;
    return;
  }

  contas.forEach((conta, idx) => {
    const hoje = new Date();
    const venc = new Date(conta.data_vencimento + 'T00:00:00');
    const diff = Math.ceil((venc - hoje) / 86400000);

    let statusType, statusText;
    if (diff < 0) {
      statusType = 'danger';
      statusText = `Atrasada há ${Math.abs(diff)} dia(s)`;
    } else if (diff <= conta.dias_aviso) {
      statusType = 'warning';
      statusText = `Vence em ${diff} dia(s)`;
    } else {
      statusType = 'success';
      statusText = `Vence em ${diff} dia(s)`;
    }

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">${escapeHtml(conta.fornecedor)}</div>
      <div class="card-info">
        <div class="card-info-item">
          <span class="card-info-label">Valor</span>
          <span class="card-info-value">${formatCurrency(conta.valor)}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Vencimento</span>
          <span class="card-info-value">${formatDateDisplay(conta.data_vencimento)}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Status</span>
          <span class="card-info-value">
            <span class="status-badge ${statusType}">${statusText}</span>
          </span>
        </div>
      </div>
      ${conta.descricao ? `<div class="card-obs">${escapeHtml(conta.descricao)}</div>` : ''}
      <div class="card-actions">
        <button class="btn-action del" onclick="excluirConta(${idx})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Excluir
        </button>
      </div>
    `;
    listaContas.appendChild(card);
  });
}

window.excluirConta = async function(idx) {
  if (!confirm('Excluir esta conta?')) return;
  const conta = contas[idx];
  try {
    const { error } = await supabaseClient.from('contas_pagar').delete().eq('id', conta.id);
    if (error) throw error;
    showToast('Conta excluída.', 'success');
    await carregarTodosDados();
    renderizarContas();
  } catch (error) {
    showToast('Erro: ' + error.message, 'error');
  }
};

// =====================================================
// CLIENTES FIDELIZADOS
// =====================================================

if (novoClienteBtn) {
  novoClienteBtn.addEventListener('click', () => {
    if (formCliente) formCliente.reset();
    abrirModal('modalCliente');
  });
}

if (formCliente) {
  formCliente.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novoCliente = {
      nome:      document.getElementById('clienteNome').value.trim(),
      telefone:  document.getElementById('clienteTelefone').value.trim() || null,
      email:     document.getElementById('clienteEmail').value.trim() || null,
      categoria: document.getElementById('clienteCategoria').value,
      notas:     document.getElementById('clienteNotas').value.trim() || null,
      ativo:     true
    };

    try {
      const { error } = await supabaseClient.from('clientes_fidelizados').insert([novoCliente]);
      if (error) throw error;
      showToast('Cliente fidelizado adicionado!', 'success');
      fecharModal('modalCliente');
      await carregarTodosDados();
      renderizarClientesFidelizados();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    }
  });
}

/**
 * Renderiza a lista de clientes fidelizados.
 */
function renderizarClientesFidelizados() {
  const container = document.getElementById('listaClientesFidelizados');
  if (!container) return;
  container.innerHTML = '';

  if (clientesFidelizados.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      <p>Nenhum cliente fidelizado cadastrado.</p>
    </div>`;
    return;
  }

  clientesFidelizados.forEach((cliente, idx) => {
    const agendamentosCliente = agendamentosFidelizados.filter(
      a => a.cliente_fidelizado_id === cliente.id
    );
    const proximoAgendamento = agendamentosCliente.length > 0
      ? agendamentosCliente.sort((a, b) => new Date(a.data_agendamento) - new Date(b.data_agendamento))[0]
      : null;

    const whatsappBtn = cliente.telefone
      ? `<button class="btn-action whatsapp" onclick="enviarWhatsApp('${cliente.telefone}', '${escapeHtml(cliente.nome)}', 'hoje', '')">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
           WhatsApp
         </button>`
      : '';

    const card = document.createElement('div');
    card.className = 'card fidelizado-card';
    card.innerHTML = `
      <div class="card-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ${escapeHtml(cliente.nome)}
      </div>
      <span class="card-badge">${escapeHtml(cliente.categoria || 'Fidelizado')}</span>
      <div class="card-info">
        <div class="card-info-item">
          <span class="card-info-label">Telefone</span>
          <span class="card-info-value">${escapeHtml(cliente.telefone || 'Não informado')}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">E-mail</span>
          <span class="card-info-value">${escapeHtml(cliente.email || 'Não informado')}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Agendamentos</span>
          <span class="card-info-value">${agendamentosCliente.length}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Próximo Serviço</span>
          <span class="card-info-value">${proximoAgendamento ? formatDateDisplay(proximoAgendamento.data_agendamento) : 'Nenhum agendado'}</span>
        </div>
      </div>
      ${cliente.notas ? `<div class="card-obs">${escapeHtml(cliente.notas)}</div>` : ''}
      <div class="card-actions">
        <button class="btn-action schedule" onclick="abrirAgendamentoFidelizado(${idx})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Agendar
        </button>
        ${whatsappBtn}
        <button class="btn-action del" onclick="excluirCliente(${idx})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Excluir
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * Abre o modal de agendamento para cliente fidelizado.
 * @param {number} idx
 */
window.abrirAgendamentoFidelizado = function(idx) {
  clienteSelecionado = clientesFidelizados[idx];
  document.getElementById('agendFidelClienteNome').value = clienteSelecionado.nome;
  if (formAgendFidelizado) formAgendFidelizado.reset();
  document.getElementById('agendFidelClienteNome').value = clienteSelecionado.nome;
  abrirModal('modalAgendFidelizado');
};

// Toggle de recorrência mensal
const agendFidelRecorrente = document.getElementById('agendFidelRecorrente');
const agendFidelRecorrenteConfig = document.getElementById('agendFidelRecorrenteConfig');
if (agendFidelRecorrente) {
  agendFidelRecorrente.addEventListener('change', () => {
    if (agendFidelRecorrenteConfig) {
      agendFidelRecorrenteConfig.classList.toggle('hidden', !agendFidelRecorrente.checked);
    }
  });
}

if (formAgendFidelizado) {
  formAgendFidelizado.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!clienteSelecionado) {
      showToast('Nenhum cliente selecionado.', 'warning');
      return;
    }

    const temRecorrencia = document.getElementById('agendFidelRecorrente').checked;
    const diaDoMes = parseInt(document.getElementById('agendFidelDiaDoMes').value) || null;
    const mesesAte = parseInt(document.getElementById('agendFidelMesesAte').value) || null;

    if (temRecorrencia && !diaDoMes) {
      showToast('Informe o dia do mês para agendamentos recorrentes.', 'warning');
      return;
    }

    const novoAgendamento = {
      cliente_fidelizado_id: clienteSelecionado.id,
      data_agendamento:      document.getElementById('agendFidelData').value,
      hora_agendamento:      document.getElementById('agendFidelHora').value,
      categoria:             document.getElementById('agendFidelCategoria').value,
      descricao:             document.getElementById('agendFidelDescricao').value.trim() || null,
      status:                'agendado',
      recorrente:            temRecorrencia,
      dia_do_mes:            diaDoMes,
      meses_ate:             mesesAte
    };

    try {
      const { error } = await supabaseClient.from('agendamentos_fidelizados').insert([novoAgendamento]);
      if (error) throw error;
      showToast('Agendamento criado!', 'success');
      fecharModal('modalAgendFidelizado');
      clienteSelecionado = null;
      await carregarTodosDados();
      renderizarClientesFidelizados();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    }
  });
}

window.excluirCliente = async function(idx) {
  if (!confirm('Excluir este cliente fidelizado? Todos os agendamentos vinculados também serão removidos.')) return;
  const cliente = clientesFidelizados[idx];
  try {
    const { error } = await supabaseClient.from('clientes_fidelizados').delete().eq('id', cliente.id);
    if (error) throw error;
    showToast('Cliente excluído.', 'success');
    await carregarTodosDados();
    renderizarClientesFidelizados();
  } catch (error) {
    showToast('Erro: ' + error.message, 'error');
  }
};

// =====================================================
// CONTROLE DE ESTOQUE
// =====================================================

if (novoProdutoBtn) {
  novoProdutoBtn.addEventListener('click', () => {
    if (formProduto) formProduto.reset();
    abrirModal('modalProduto');
  });
}

if (formProduto) {
  formProduto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novoProduto = {
      nome:               document.getElementById('prodNome').value.trim(),
      categoria:          document.getElementById('prodCategoria').value.trim(),
      quantidade:         parseInt(document.getElementById('prodQuantidade').value) || 0,
      quantidade_minima:  parseInt(document.getElementById('prodQuantidadeMinima').value) || 0,
      valor_unitario:     parseFloat(document.getElementById('prodValor').value) || 0,
      alerta_ativo:       document.getElementById('prodAlerta').checked
    };

    try {
      const { error } = await supabaseClient.from('estoque').insert([novoProduto]);
      if (error) throw error;
      showToast('Produto salvo!', 'success');
      fecharModal('modalProduto');
      await carregarTodosDados();
      renderizarEstoque();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    }
  });
}

/**
 * Renderiza a lista de produtos do estoque.
 */
function renderizarEstoque() {
  if (!listaEstoque) return;
  listaEstoque.innerHTML = '';

  if (produtos.length === 0) {
    listaEstoque.innerHTML = `<div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
      <p>Nenhum produto no estoque.</p>
    </div>`;
    return;
  }

  produtos.forEach((prod, idx) => {
    const estoqueBaixo = prod.quantidade <= prod.quantidade_minima;
    const statusType   = estoqueBaixo ? 'danger' : 'success';
    const statusText   = estoqueBaixo ? 'Estoque Baixo' : 'Estoque OK';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">${escapeHtml(prod.nome)}</div>
      <span class="card-badge">${escapeHtml(prod.categoria)}</span>
      <div class="card-info">
        <div class="card-info-item">
          <span class="card-info-label">Quantidade</span>
          <span class="card-info-value">${prod.quantidade} un</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Mínimo</span>
          <span class="card-info-value">${prod.quantidade_minima} un</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Valor Unitário</span>
          <span class="card-info-value">${formatCurrency(prod.valor_unitario)}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Valor Total</span>
          <span class="card-info-value">${formatCurrency(prod.quantidade * prod.valor_unitario)}</span>
        </div>
        <div class="card-info-item">
          <span class="card-info-label">Status</span>
          <span class="card-info-value">
            <span class="status-badge ${statusType}">${statusText}</span>
          </span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-action del" onclick="excluirProduto(${idx})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Excluir
        </button>
      </div>
    `;
    listaEstoque.appendChild(card);
  });
}

window.excluirProduto = async function(idx) {
  if (!confirm('Excluir este produto?')) return;
  const prod = produtos[idx];
  try {
    const { error } = await supabaseClient.from('estoque').delete().eq('id', prod.id);
    if (error) throw error;
    showToast('Produto excluído.', 'success');
    await carregarTodosDados();
    renderizarEstoque();
  } catch (error) {
    showToast('Erro: ' + error.message, 'error');
  }
};

// =====================================================
// BLOCO DE NOTAS COM LEMBRETES
// =====================================================

if (novaNotaBtn) {
  novaNotaBtn.addEventListener('click', () => {
    if (formNota) formNota.reset();
    if (notaLembreteConfig) notaLembreteConfig.classList.add('hidden');
    abrirModal('modalNota');
  });
}

// Toggle de configuração de lembrete
if (notaLembrete) {
  notaLembrete.addEventListener('change', () => {
    if (notaLembreteConfig) {
      notaLembreteConfig.classList.toggle('hidden', !notaLembrete.checked);
    }
  });
}

if (formNota) {
  formNota.addEventListener('submit', async (e) => {
    e.preventDefault();

    const temLembrete = document.getElementById('notaLembrete').checked;

    const novaNota = {
      titulo:            document.getElementById('notaTitulo').value.trim(),
      conteudo:          document.getElementById('notaConteudo').value.trim() || null,
      tem_lembrete:      temLembrete,
      data_lembrete:     temLembrete ? document.getElementById('notaDataLembrete').value || null : null,
      hora_lembrete:     temLembrete ? document.getElementById('notaHoraLembrete').value || null : null,
      mensagem_whatsapp: document.getElementById('notaMensagemWhatsapp').value.trim() || null
    };

    try {
      const { error } = await supabaseClient.from('notas').insert([novaNota]);
      if (error) throw error;
      showToast('Nota salva!', 'success');
      fecharModal('modalNota');
      await carregarTodosDados();
      renderizarNotas();
    } catch (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
    }
  });
}

/**
 * Renderiza a lista de notas.
 */
function renderizarNotas() {
  if (!listaNotas) return;
  listaNotas.innerHTML = '';

  if (notas.length === 0) {
    listaNotas.innerHTML = `<div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      <p>Nenhuma nota registrada.</p>
    </div>`;
    return;
  }

  notas.forEach((nota, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">${escapeHtml(nota.titulo)}</div>
      ${nota.conteudo ? `<div class="card-obs" style="font-style:normal; white-space:pre-wrap;">${escapeHtml(nota.conteudo)}</div>` : ''}
      ${nota.tem_lembrete ? `
        <div style="margin-top:10px; padding:8px 12px; background:var(--color-success-bg); border-radius:var(--radius); font-size:12px; color:var(--color-success); display:flex; align-items:center; gap:6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          Lembrete: ${formatDateDisplay(nota.data_lembrete)} às ${nota.hora_lembrete || '—'}
        </div>
      ` : ''}
      ${nota.mensagem_whatsapp ? `
        <div style="margin-top:8px; padding:8px 12px; background:var(--color-whatsapp-bg); border-radius:var(--radius); font-size:12px; color:var(--color-whatsapp); display:flex; align-items:center; gap:6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Mensagem WhatsApp personalizada configurada
        </div>
      ` : ''}
      <div class="card-actions">
        <button class="btn-action del" onclick="excluirNota(${idx})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Excluir
        </button>
      </div>
    `;
    listaNotas.appendChild(card);
  });
}

window.excluirNota = async function(idx) {
  if (!confirm('Excluir esta nota?')) return;
  const nota = notas[idx];
  try {
    const { error } = await supabaseClient.from('notas').delete().eq('id', nota.id);
    if (error) throw error;
    showToast('Nota excluída.', 'success');
    await carregarTodosDados();
    renderizarNotas();
  } catch (error) {
    showToast('Erro: ' + error.message, 'error');
  }
};

// =====================================================
// ATUALIZAR TODAS AS ABAS
// =====================================================

/**
 * Atualiza a renderização de todas as seções da aplicação.
 */
function atualizarTodasAsAbas() {
  renderList();
  renderizarOrcamentos();
  renderizarPromissorias();
  renderizarContas();
  renderizarClientesFidelizados();
  renderizarEstoque();
  renderizarNotas();
}

// =====================================================
// SEGURANÇA — ESCAPE DE HTML
// =====================================================

/**
 * Escapa caracteres especiais HTML para prevenir XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =====================================================
// INICIALIZAÇÃO DO CALENDÁRIO AO CARREGAR
// =====================================================

// Inicializa os campos dinâmicos do orçamento
document.addEventListener('DOMContentLoaded', () => {
  atualizarCamposMedida();
});

console.log('✅ Mamute Cristalizações v2.0 — Sistema carregado com sucesso!');
