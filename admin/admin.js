/**
 * Red Wings Adventure — Módulo de Lógica Administrativa (CRUD e Uploads)
 * Gerencia autenticação, artigos/notícias e corridas/provas/maratonas no Supabase.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. ESTADO GLOBAL DA APLICAÇÃO ADMIN
  // =========================================================================
  const estado = {
    sessao: null,
    abaAtiva: 'artigos', // 'artigos' | 'eventos'
    
    // Artigos
    artigos: [],
    artigoEmEdicaoId: null,
    artigoDocumentos: [],
    carregandoArtigos: false,
    termoBuscaArtigos: '',
    filtroCategoriaArtigos: 'todas',

    // Eventos (Corridas, Provas, Maratonas)
    eventos: [],
    eventoEmEdicaoId: null,
    eventoDocumentos: [],
    carregandoEventos: false,
    termoBuscaEventos: '',
    filtroTipoEvento: 'todos',
  };

  // IDs para exclusão via modal
  let idArtigoParaExcluir = null;
  let idEventoParaExcluir = null;

  // =========================================================================
  // 2. REFERÊNCIAS DO DOM
  // =========================================================================
  const dom = {
    // Topo / Auth
    usuarioEmail: document.getElementById('usuario-email'),
    btnSair: document.getElementById('btn-sair'),
    
    // Alertas
    containerAlertas: document.getElementById('container-alertas'),
    avisoCredenciais: document.getElementById('aviso-credenciais-dashboard'),

    // Navegação por Abas Principais
    tabArtigos: document.getElementById('tab-artigos'),
    tabEventos: document.getElementById('tab-eventos'),
    moduloArtigos: document.getElementById('modulo-artigos'),
    moduloEventos: document.getElementById('modulo-eventos'),

    // --- ARTIGOS: Métricas ---
    statTotal: document.getElementById('stat-total'),
    statPublicados: document.getElementById('stat-publicados'),
    statRascunhos: document.getElementById('stat-rascunhos'),

    // --- ARTIGOS: Ações & Visualizações ---
    btnNovoArtigo: document.getElementById('btn-novo-artigo'),
    btnVoltarLista: document.getElementById('btn-voltar-lista'),
    btnCancelarEdicao: document.getElementById('btn-cancelar-edicao'),
    secaoLista: document.getElementById('secao-lista'),
    secaoFormulario: document.getElementById('secao-formulario'),
    tituloFormulario: document.getElementById('titulo-formulario'),
    
    // --- ARTIGOS: Tabela e Busca ---
    inputBusca: document.getElementById('input-busca'),
    selectFiltroCategoria: document.getElementById('filtro-categoria'),
    tabelaArtigosCorpo: document.getElementById('tabela-artigos-corpo'),
    esqueletoCarregamento: document.getElementById('esqueleto-carregamento'),
    mensagemVazio: document.getElementById('mensagem-tabela-vazia'),

    // --- ARTIGOS: Formulário ---
    formArtigo: document.getElementById('form-artigo'),
    artigoId: document.getElementById('artigo-id'),
    inputTitulo: document.getElementById('artigo-titulo'),
    inputSlug: document.getElementById('artigo-slug'),
    selectCategoria: document.getElementById('artigo-categoria'),
    inputAutor: document.getElementById('artigo-autor'),
    inputResumo: document.getElementById('artigo-resumo'),
    inputConteudo: document.getElementById('artigo-conteudo'),
    inputImagemUrl: document.getElementById('artigo-imagem-url'),
    inputUploadImagem: document.getElementById('artigo-upload-imagem'),
    previewImagem: document.getElementById('preview-imagem'),
    previewContainer: document.getElementById('preview-imagem-container'),
    btnRemoverImagem: document.getElementById('btn-remover-imagem'),
    checkboxPublicado: document.getElementById('artigo-publicado'),
    btnSalvarArtigo: document.getElementById('btn-salvar-artigo'),
    inputUploadDocArtigo: document.getElementById('artigo-upload-documento'),
    listaDocsArtigo: document.getElementById('artigo-lista-documentos'),

    // --- ARTIGOS: Modal Exclusão ---
    modalExcluir: document.getElementById('modal-excluir'),
    modalExcluirTitulo: document.getElementById('modal-excluir-titulo'),
    btnConfirmarExclusao: document.getElementById('btn-confirmar-exclusao'),
    btnCancelarExclusao: document.getElementById('btn-cancelar-exclusao'),

    // --- EVENTOS: Métricas ---
    statEvTotal: document.getElementById('stat-ev-total'),
    statEvFuturos: document.getElementById('stat-ev-futuros'),
    statEvPassados: document.getElementById('stat-ev-passados'),
    statEvDestaque: document.getElementById('stat-ev-destaque'),

    // --- EVENTOS: Ações & Visualizações ---
    btnNovoEvento: document.getElementById('btn-novo-evento'),
    btnVoltarListaEventos: document.getElementById('btn-voltar-lista-eventos'),
    btnCancelarEvento: document.getElementById('btn-cancelar-evento'),
    secaoListaEventos: document.getElementById('secao-lista-eventos'),
    secaoFormularioEvento: document.getElementById('secao-formulario-evento'),
    tituloFormEvento: document.getElementById('titulo-form-evento'),

    // --- EVENTOS: Tabela e Busca ---
    inputBuscaEventos: document.getElementById('input-busca-eventos'),
    filtroTipoEvento: document.getElementById('filtro-tipo-evento'),
    tabelaEventosCorpo: document.getElementById('tabela-eventos-corpo'),
    esqueletoEventos: document.getElementById('esqueleto-eventos'),
    eventosVazio: document.getElementById('eventos-vazio'),

    // --- EVENTOS: Formulário ---
    formEvento: document.getElementById('form-evento'),
    eventoId: document.getElementById('evento-id'),
    eventoImagemUrl: document.getElementById('evento-imagem-url'),
    eventoNome: document.getElementById('evento-nome'),
    eventoTipo: document.getElementById('evento-tipo'),
    eventoDistancia: document.getElementById('evento-distancia'),
    eventoDataInicio: document.getElementById('evento-data-inicio'),
    eventoHorario: document.getElementById('evento-horario'),
    eventoLocal: document.getElementById('evento-local'),
    eventoEstado: document.getElementById('evento-estado'),
    eventoDescricao: document.getElementById('evento-descricao'),
    eventoUploadImagem: document.getElementById('evento-upload-imagem'),
    previewEventoContainer: document.getElementById('preview-evento-container'),
    previewEventoImagem: document.getElementById('preview-evento-imagem'),
    btnRemoverImagemEvento: document.getElementById('btn-remover-imagem-evento'),
    eventoLinkInscricao: document.getElementById('evento-link-inscricao'),
    eventoLinkSite: document.getElementById('evento-link-site'),
    eventoOrganizacao: document.getElementById('evento-organizacao'),
    eventoDificuldade: document.getElementById('evento-dificuldade'),
    eventoAltimetria: document.getElementById('evento-altimetria'),
    eventoPreco: document.getElementById('evento-preco'),
    eventoVagas: document.getElementById('evento-vagas'),
    eventoDestaque: document.getElementById('evento-destaque'),
    eventoPublicado: document.getElementById('evento-publicado'),
    btnSalvarEvento: document.getElementById('btn-salvar-evento'),
    inputUploadDocEvento: document.getElementById('evento-upload-documento'),
    listaDocsEvento: document.getElementById('evento-lista-documentos'),

    // --- EVENTOS: Modal Exclusão ---
    modalExcluirEvento: document.getElementById('modal-excluir-evento'),
    modalExcluirEventoNome: document.getElementById('modal-excluir-evento-nome'),
    btnConfirmarExclEvento: document.getElementById('btn-confirmar-excl-evento'),
    btnCancelarExclEvento: document.getElementById('btn-cancelar-excl-evento'),
  };

  // =========================================================================
  // 3. UTILITÁRIOS E TOASTS
  // =========================================================================

  function exibirToast(mensagem, tipo = 'sucesso') {
    if (!dom.containerAlertas) return;

    const toast = document.createElement('div');
    const corBorda =
      tipo === 'sucesso'
        ? 'border-green-500/40 text-green-300 bg-green-950/80'
        : tipo === 'erro'
        ? 'border-red-500/40 text-red-300 bg-red-950/80'
        : 'border-yellow-500/40 text-yellow-300 bg-yellow-950/80';

    toast.className = `flex items-center gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 translate-y-2 opacity-0 text-xs sm:text-sm font-medium ${corBorda}`;
    
    let icone = `
      <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
    `;
    if (tipo === 'erro') {
      icone = `
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      `;
    }

    toast.innerHTML = `
      ${icone}
      <span class="flex-1">${mensagem}</span>
      <button class="opacity-70 hover:opacity-100 p-1">&times;</button>
    `;

    toast.querySelector('button').addEventListener('click', () => {
      toast.remove();
    });

    dom.containerAlertas.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function gerarSlug(texto) {
    return texto
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function formatarDataPTBR(dataIso) {
    if (!dataIso) return '-';
    // Se for formato apenas de data (YYYY-MM-DD), ajusta timezone local
    const partes = dataIso.split('T')[0].split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // =========================================================================
  // 4. CONTROLE DE ABAS (ARTIGOS VS EVENTOS)
  // =========================================================================

  function alternarAba(aba) {
    estado.abaAtiva = aba;

    const tabArtigos = dom.tabArtigos || document.getElementById('tab-artigos');
    const tabEventos = dom.tabEventos || document.getElementById('tab-eventos');
    const moduloArtigos = dom.moduloArtigos || document.getElementById('modulo-artigos');
    const moduloEventos = dom.moduloEventos || document.getElementById('modulo-eventos');

    if (aba === 'artigos') {
      // Estilo das abas
      if (tabArtigos) {
        tabArtigos.classList.add('active');
        tabArtigos.classList.remove('bg-rw-card', 'text-rw-muted');
      }
      if (tabEventos) {
        tabEventos.classList.remove('active');
        tabEventos.classList.add('bg-rw-card', 'text-rw-muted');
      }

      // Módulos
      if (moduloArtigos) {
        moduloArtigos.classList.remove('hidden');
        moduloArtigos.style.display = 'block';
      }
      if (moduloEventos) {
        moduloEventos.classList.add('hidden');
        moduloEventos.style.display = 'none';
      }

      const secaoLista = dom.secaoLista || document.getElementById('secao-lista');
      const secaoFormulario = dom.secaoFormulario || document.getElementById('secao-formulario');
      if (secaoLista && secaoFormulario && secaoFormulario.classList.contains('hidden') && secaoLista.classList.contains('hidden')) {
        secaoLista.classList.remove('hidden');
        secaoLista.style.display = 'block';
      }
    } else {
      // Estilo das abas
      if (tabEventos) {
        tabEventos.classList.add('active');
        tabEventos.classList.remove('bg-rw-card', 'text-rw-muted');
      }
      if (tabArtigos) {
        tabArtigos.classList.remove('active');
        tabArtigos.classList.add('bg-rw-card', 'text-rw-muted');
      }

      // Módulos
      if (moduloEventos) {
        moduloEventos.classList.remove('hidden');
        moduloEventos.style.display = 'block';
      }
      if (moduloArtigos) {
        moduloArtigos.classList.add('hidden');
        moduloArtigos.style.display = 'none';
      }

      const secaoListaEventos = dom.secaoListaEventos || document.getElementById('secao-lista-eventos');
      const secaoFormularioEvento = dom.secaoFormularioEvento || document.getElementById('secao-formulario-evento');
      if (secaoListaEventos && secaoFormularioEvento && secaoFormularioEvento.classList.contains('hidden') && secaoListaEventos.classList.contains('hidden')) {
        secaoListaEventos.classList.remove('hidden');
        secaoListaEventos.style.display = 'block';
      }
    }
  }

  // Expor globalmente para garantir acionamento por clique em qualquer circunstância
  window.redwingsAlternarAba = alternarAba;

  // =========================================================================
  // 5. CONTROLE DE AUTENTICAÇÃO E ROTA PROTEGIDA
  // =========================================================================

  async function verificarSessaoUsuario() {
    if (!window.supabaseClient) {
      // Sem Supabase configurado: exibe aviso mas libera visibilidade
      document.body.style.visibility = 'visible';
      if (dom.avisoCredenciais) dom.avisoCredenciais.classList.remove('hidden');
      return null;
    }

    try {
      const { data: { session }, error } = await window.supabaseClient.auth.getSession();
      if (error || !session) {
        // Sem sessão válida: redireciona antes de tornar qualquer conteúdo visível
        window.location.replace('index.html');
        return null;
      }

      // Sessão confirmada: revela o body do painel
      document.body.style.visibility = 'visible';

      estado.sessao = session;
      if (dom.usuarioEmail) {
        dom.usuarioEmail.textContent = session.user.email || 'Administrador';
      }
      return session;
    } catch (err) {
      console.error('[CMS] Erro ao validar sessão:', err);
      window.location.replace('index.html');
      return null;
    }
  }

  async function encerrarSessao() {
    if (!window.supabaseClient) return;
    try {
      await window.supabaseClient.auth.signOut();
      // Oculta o painel imediatamente antes do redirecionamento
      document.body.style.visibility = 'hidden';
      // Limpa estado local da sessão
      estado.sessao = null;
      window.location.replace('index.html');
    } catch (err) {
      console.error('[CMS] Erro ao sair:', err);
      exibirToast('Erro ao encerrar sessão. Tente novamente.', 'erro');
    }
  }

  // =========================================================================
  // 6. UPLOAD DE IMAGENS DIRETO PARA O SUPABASE STORAGE
  // =========================================================================

  async function fazerUploadImagem(arquivo, subpasta = 'capas') {
    if (!window.supabaseClient) {
      throw new Error('Supabase não conectado.');
    }

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!tiposPermitidos.includes(arquivo.type)) {
      throw new Error('Formato não suportado. Utilize JPG, PNG, WebP ou AVIF.');
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      throw new Error('O arquivo excede o limite máximo de 5MB.');
    }

    const extensao = arquivo.name.split('.').pop();
    const nomeLimpo = gerarSlug(arquivo.name.replace(/\.[^/.]+$/, ''));
    const caminhoArquivo = `${subpasta}/${Date.now()}-${nomeLimpo}.${extensao}`;

    const { data, error } = await window.supabaseClient.storage
      .from('artigos-midia')
      .upload(caminhoArquivo, arquivo, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: dadosPublicos } = window.supabaseClient.storage
      .from('artigos-midia')
      .getPublicUrl(caminhoArquivo);

    return dadosPublicos.publicUrl;
  }

  function formatarTamanhoArquivo(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function obterTipoDocumento(nomeOuExt) {
    const ext = (nomeOuExt || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
    if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
    return 'arquivo';
  }

  async function fazerUploadDocumento(arquivo, subpasta = 'documentos') {
    if (!window.supabaseClient) {
      throw new Error('Supabase não conectado.');
    }

    // ── Lista de tipos MIME permitidos para documentos ─────────────────────
    // Bloqueia qualquer tipo executável, HTML, script ou imagem não desejada.
    const tiposMimePermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // .xlsx
      'text/csv',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar',
      'application/octet-stream', // Fallback para alguns ZIPs/RARs mal detectados pelo navegador
    ];

    // Extensões permitidas (validação dupla: MIME + extensão do nome)
    const extensoesPermitidas = ['pdf','doc','docx','xls','xlsx','csv','txt','zip','rar','7z'];
    const extensaoArquivo = arquivo.name.split('.').pop().toLowerCase();

    if (!tiposMimePermitidos.includes(arquivo.type) && arquivo.type !== '') {
      throw new Error(`Tipo de arquivo não permitido (${arquivo.type}). Use PDF, Word, Excel, CSV, TXT ou ZIP.`);
    }
    if (!extensoesPermitidas.includes(extensaoArquivo)) {
      throw new Error(`Extensão ".${extensaoArquivo}" não permitida. Use: PDF, DOCX, XLSX, CSV, TXT, ZIP ou RAR.`);
    }
    // ───────────────────────────────────────────────────────────────────────

    if (arquivo.size > 25 * 1024 * 1024) {
      throw new Error('O arquivo excede o limite máximo de 25MB.');
    }

    const extensao = arquivo.name.split('.').pop().toLowerCase();
    const nomeSemExt = arquivo.name.replace(/\.[^/.]+$/, '');
    const nomeLimpo = gerarSlug(nomeSemExt);
    const caminhoArquivo = `${subpasta}/${Date.now()}-${nomeLimpo}.${extensao}`;

    const { error } = await window.supabaseClient.storage
      .from('artigos-midia')
      .upload(caminhoArquivo, arquivo, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: dadosPublicos } = window.supabaseClient.storage
      .from('artigos-midia')
      .getPublicUrl(caminhoArquivo);

    return {
      nome: arquivo.name,
      url: dadosPublicos.publicUrl,
      tipo: obterTipoDocumento(extensao),
      extensao: extensao.toUpperCase(),
      tamanho: formatarTamanhoArquivo(arquivo.size),
    };
  }

  function renderizarListaDocumentosArtigo() {
    if (!dom.listaDocsArtigo) return;
    if (!estado.artigoDocumentos || estado.artigoDocumentos.length === 0) {
      dom.listaDocsArtigo.innerHTML = '';
      return;
    }

    dom.listaDocsArtigo.innerHTML = estado.artigoDocumentos
      .map((doc, idx) => {
        const corBadge = doc.tipo === 'pdf' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                         doc.tipo === 'word' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                         doc.tipo === 'excel' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                         'bg-white/10 text-rw-muted border-white/20';

        return `
          <div class="flex items-center justify-between p-3 bg-rw-dark/90 border border-rw-gray rounded-xl">
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-[10px] font-heading font-black uppercase tracking-wider px-2 py-0.5 rounded border ${corBadge}">
                ${doc.extensao || (doc.tipo || 'DOC').toUpperCase()}
              </span>
              <div class="min-w-0">
                <span class="text-xs font-semibold text-white block truncate max-w-xs sm:max-w-md">${doc.nome}</span>
                <span class="text-[10px] text-rw-muted font-mono">${doc.tamanho || ''}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <a href="${doc.url}" target="_blank" class="p-1.5 text-rw-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Visualizar / Baixar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </a>
              <button type="button" data-remover-doc-artigo="${idx}" class="p-1.5 text-rw-muted hover:text-rw-red hover:bg-rw-red/10 rounded-lg transition-colors" title="Remover Documento">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    dom.listaDocsArtigo.querySelectorAll('[data-remover-doc-artigo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.removerDocArtigo, 10);
        estado.artigoDocumentos.splice(index, 1);
        renderizarListaDocumentosArtigo();
      });
    });
  }

  function renderizarListaDocumentosEvento() {
    if (!dom.listaDocsEvento) return;
    if (!estado.eventoDocumentos || estado.eventoDocumentos.length === 0) {
      dom.listaDocsEvento.innerHTML = '';
      return;
    }

    dom.listaDocsEvento.innerHTML = estado.eventoDocumentos
      .map((doc, idx) => {
        const corBadge = doc.tipo === 'pdf' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                         doc.tipo === 'word' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                         doc.tipo === 'excel' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                         'bg-white/10 text-rw-muted border-white/20';

        return `
          <div class="flex items-center justify-between p-3 bg-rw-dark/90 border border-rw-gray rounded-xl">
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-[10px] font-heading font-black uppercase tracking-wider px-2 py-0.5 rounded border ${corBadge}">
                ${doc.extensao || (doc.tipo || 'DOC').toUpperCase()}
              </span>
              <div class="min-w-0">
                <span class="text-xs font-semibold text-white block truncate max-w-xs sm:max-w-md">${doc.nome}</span>
                <span class="text-[10px] text-rw-muted font-mono">${doc.tamanho || ''}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <a href="${doc.url}" target="_blank" class="p-1.5 text-rw-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Visualizar / Baixar">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </a>
              <button type="button" data-remover-doc-evento="${idx}" class="p-1.5 text-rw-muted hover:text-rw-red hover:bg-rw-red/10 rounded-lg transition-colors" title="Remover Documento">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    dom.listaDocsEvento.querySelectorAll('[data-remover-doc-evento]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.removerDocEvento, 10);
        estado.eventoDocumentos.splice(index, 1);
        renderizarListaDocumentosEvento();
      });
    });
  }

  // =========================================================================
  // 7. OPERAÇÕES DE DADOS — ARTIGOS (CRUD)
  // =========================================================================

  async function carregarArtigos() {
    if (!window.supabaseClient) return;

    alternarEstadoCarregamentoArtigos(true);

    try {
      const { data, error } = await window.supabaseClient
        .from('artigos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      estado.artigos = data || [];
      atualizarMetricasArtigos();
      renderizarTabelaArtigos();
    } catch (erro) {
      console.error('[CMS] Erro ao carregar artigos:', erro);
      exibirToast('Falha ao carregar artigos do banco de dados.', 'erro');
    } finally {
      alternarEstadoCarregamentoArtigos(false);
    }
  }

  function atualizarMetricasArtigos() {
    const total = estado.artigos.length;
    const publicados = estado.artigos.filter((a) => a.publicado).length;
    const rascunhos = total - publicados;

    if (dom.statTotal) dom.statTotal.textContent = total;
    if (dom.statPublicados) dom.statPublicados.textContent = publicados;
    if (dom.statRascunhos) dom.statRascunhos.textContent = rascunhos;
  }

  function exibirFormularioArtigo(modoEdicao = false) {
    dom.secaoLista.classList.add('hidden');
    dom.secaoFormulario.classList.remove('hidden');
    dom.tituloFormulario.textContent = modoEdicao ? 'Editar Artigo' : 'Novo Artigo';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exibirListaArtigos() {
    dom.secaoFormulario.classList.add('hidden');
    dom.secaoLista.classList.remove('hidden');
    limparFormularioArtigo();
    estado.artigoEmEdicaoId = null;
  }

  function alternarEstadoCarregamentoArtigos(carregando) {
    estado.carregandoArtigos = carregando;
    if (carregando) {
      dom.esqueletoCarregamento.classList.remove('hidden');
      dom.tabelaArtigosCorpo.classList.add('hidden');
      dom.mensagemVazio.classList.add('hidden');
    } else {
      dom.esqueletoCarregamento.classList.add('hidden');
      dom.tabelaArtigosCorpo.classList.remove('hidden');
    }
  }

  function renderizarTabelaArtigos() {
    const termo = estado.termoBuscaArtigos.toLowerCase();
    const categoria = estado.filtroCategoriaArtigos;

    const filtrados = estado.artigos.filter((artigo) => {
      const correspondeTexto =
        artigo.titulo?.toLowerCase().includes(termo) ||
        artigo.slug?.toLowerCase().includes(termo) ||
        artigo.categoria?.toLowerCase().includes(termo);

      const correspondeCategoria =
        categoria === 'todas' || artigo.categoria === categoria;

      return correspondeTexto && correspondeCategoria;
    });

    if (filtrados.length === 0) {
      dom.tabelaArtigosCorpo.innerHTML = '';
      dom.mensagemVazio.classList.remove('hidden');
      return;
    }

    dom.mensagemVazio.classList.add('hidden');

    dom.tabelaArtigosCorpo.innerHTML = filtrados
      .map((artigo) => {
        const badgeStatus = artigo.publicado
          ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-heading font-semibold bg-green-500/10 text-green-400 border border-green-500/20"><span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>Publicado</span>'
          : '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-heading font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>Rascunho</span>';

        const imagemHtml = artigo.imagem_capa_url
          ? `<img src="${artigo.imagem_capa_url}" alt="Capa" class="w-12 h-12 rounded-lg object-cover border border-rw-gray" />`
          : `<div class="w-12 h-12 rounded-lg bg-rw-dark border border-rw-gray flex items-center justify-center text-rw-muted">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
             </div>`;

        return `
          <tr class="border-b border-rw-gray/60 hover:bg-white/[0.02] transition-colors">
            <td class="py-4 px-4 sm:px-6">
              <div class="flex items-center gap-3.5">
                ${imagemHtml}
                <div class="min-w-0">
                  <h4 class="font-heading font-bold text-sm text-white truncate max-w-xs sm:max-w-md">${artigo.titulo}</h4>
                  <span class="text-xs text-rw-muted font-mono block mt-0.5 truncate max-w-xs sm:max-w-md">/${artigo.slug}</span>
                </div>
              </div>
            </td>
            <td class="py-4 px-4 hidden md:table-cell">
              <span class="text-xs font-heading uppercase tracking-wider text-rw-gold font-semibold bg-rw-gold/10 px-2.5 py-1 rounded-md border border-rw-gold/20">
                ${artigo.categoria || 'Geral'}
              </span>
            </td>
            <td class="py-4 px-4 hidden sm:table-cell">
              <span class="text-xs text-rw-muted">${formatarDataPTBR(artigo.created_at)}</span>
            </td>
            <td class="py-4 px-4">
              ${badgeStatus}
            </td>
            <td class="py-4 px-4 sm:px-6 text-right">
              <div class="flex items-center justify-end gap-2">
                <a href="../artigo.html?slug=${artigo.slug}" target="_blank" title="Visualizar Artigo"
                  class="p-2 text-rw-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </a>
                <button type="button" data-editar-id="${artigo.id}" title="Editar"
                  class="btn-editar-artigo p-2 text-rw-text hover:text-rw-gold hover:bg-rw-gold/10 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button type="button" data-excluir-id="${artigo.id}" data-titulo="${artigo.titulo.replace(/"/g, '&quot;')}" title="Excluir"
                  class="btn-excluir-artigo p-2 text-rw-muted hover:text-rw-red hover:bg-rw-red/10 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    // Event listeners
    document.querySelectorAll('.btn-editar-artigo').forEach((btn) => {
      btn.addEventListener('click', () => carregarArtigoParaEdicao(btn.dataset.editarId));
    });

    document.querySelectorAll('.btn-excluir-artigo').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalExclusaoArtigo(btn.dataset.excluirId, btn.dataset.titulo));
    });
  }

  function limparFormularioArtigo() {
    dom.formArtigo.reset();
    dom.artigoId.value = '';
    dom.inputImagemUrl.value = '';
    dom.previewContainer.classList.add('hidden');
    dom.previewImagem.src = '';
    dom.checkboxPublicado.checked = true;
    dom.inputAutor.value = 'Red Wings Adventure';
    estado.artigoDocumentos = [];
    renderizarListaDocumentosArtigo();
  }

  function carregarArtigoParaEdicao(id) {
    const artigo = estado.artigos.find((a) => a.id === id);
    if (!artigo) {
      exibirToast('Artigo não encontrado.', 'erro');
      return;
    }

    estado.artigoEmEdicaoId = artigo.id;
    dom.artigoId.value = artigo.id;
    dom.inputTitulo.value = artigo.titulo || '';
    dom.inputSlug.value = artigo.slug || '';
    dom.selectCategoria.value = artigo.categoria || 'Notícias';
    dom.inputAutor.value = artigo.autor || 'Red Wings Adventure';
    dom.inputResumo.value = artigo.resumo || '';
    dom.inputConteudo.value = artigo.conteudo || '';
    dom.inputImagemUrl.value = artigo.imagem_capa_url || '';
    dom.checkboxPublicado.checked = !!artigo.publicado;

    // Documentos anexos
    estado.artigoDocumentos = Array.isArray(artigo.documentos) ? [...artigo.documentos] : [];
    renderizarListaDocumentosArtigo();

    if (artigo.imagem_capa_url) {
      dom.previewImagem.src = artigo.imagem_capa_url;
      dom.previewContainer.classList.remove('hidden');
    } else {
      dom.previewContainer.classList.add('hidden');
      dom.previewImagem.src = '';
    }

    exibirFormularioArtigo(true);
  }

  async function salvarArtigo(evento) {
    evento.preventDefault();

    if (!window.supabaseClient) {
      exibirToast('Supabase não configurado.', 'erro');
      return;
    }

    const id = dom.artigoId.value;
    const titulo = dom.inputTitulo.value.trim();
    let slug = dom.inputSlug.value.trim();
    const categoria = dom.selectCategoria.value;
    const autor = dom.inputAutor.value.trim() || 'Red Wings Adventure';
    const resumo = dom.inputResumo.value.trim();
    const conteudo = dom.inputConteudo.value.trim();
    let imagemCapaUrl = dom.inputImagemUrl.value.trim();
    const publicado = dom.checkboxPublicado.checked;

    // ── Validação de entradas ──────────────────────────────────────────────
    if (!titulo) {
      exibirToast('O título é obrigatório.', 'erro');
      return;
    }
    if (titulo.length > 250) {
      exibirToast('Título muito longo (máx. 250 caracteres).', 'erro');
      return;
    }
    if (!conteudo) {
      exibirToast('O conteúdo do artigo é obrigatório.', 'erro');
      return;
    }
    if (resumo.length > 500) {
      exibirToast('Resumo muito longo (máx. 500 caracteres).', 'erro');
      return;
    }
    if (autor.length > 100) {
      exibirToast('Nome do autor muito longo (máx. 100 caracteres).', 'erro');
      return;
    }

    // Gera slug seguro: apenas letras minúsculas, números e hífens
    if (!slug) {
      slug = gerarSlug(titulo);
    } else {
      // Sanitiza slug inserido manualmente (remove caracteres perigosos)
      slug = gerarSlug(slug);
    }
    if (!slug || slug.length > 200) {
      exibirToast('Slug inválido ou muito longo. Será gerado automaticamente.', 'aviso');
      slug = gerarSlug(titulo);
    }
    // ───────────────────────────────────────────────────────────────────────

    // Verifica sessão ativa antes de persistir (dupla checagem)
    if (window.supabaseClient) {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (!session) {
        exibirToast('Sessão expirada. Faça login novamente.', 'erro');
        setTimeout(() => window.location.replace('index.html'), 1500);
        return;
      }
    }

    dom.btnSalvarArtigo.disabled = true;
    dom.btnSalvarArtigo.classList.add('opacity-60', 'cursor-not-allowed');
    const textoOriginalBotao = dom.btnSalvarArtigo.innerHTML;
    dom.btnSalvarArtigo.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Salvando artigo...
    `;

    try {
      const arquivoParaUpload = dom.inputUploadImagem.files[0];
      if (arquivoParaUpload) {
        exibirToast('Fazendo upload da imagem de capa para o Storage...', 'aviso');
        imagemCapaUrl = await fazerUploadImagem(arquivoParaUpload, 'capas');
      }

      const payload = {
        titulo,
        slug,
        categoria,
        autor,
        resumo,
        conteudo,
        imagem_capa_url: imagemCapaUrl || null,
        documentos: estado.artigoDocumentos,
        publicado,
      };

      if (id) {
        const { error } = await window.supabaseClient
          .from('artigos')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
        exibirToast('Artigo atualizado com sucesso!', 'sucesso');
      } else {
        const { error } = await window.supabaseClient
          .from('artigos')
          .insert([payload]);

        if (error) throw error;
        exibirToast('Artigo publicado com sucesso!', 'sucesso');
      }

      await carregarArtigos();
      exibirListaArtigos();

    } catch (erro) {
      console.error('[CMS] Erro ao salvar artigo:', erro);
      let mensagem = 'Ocorreu um erro ao salvar o artigo.';
      if (erro.code === '23505' || (erro.message && erro.message.includes('unique constraint'))) {
        mensagem = 'Já existe um artigo com este mesmo slug. Altere o slug ou o título.';
      } else if (erro.message) {
        mensagem = erro.message;
      }
      exibirToast(mensagem, 'erro');
    } finally {
      dom.btnSalvarArtigo.disabled = false;
      dom.btnSalvarArtigo.classList.remove('opacity-60', 'cursor-not-allowed');
      dom.btnSalvarArtigo.innerHTML = textoOriginalBotao;
    }
  }

  function abrirModalExclusaoArtigo(id, titulo) {
    idArtigoParaExcluir = id;
    dom.modalExcluirTitulo.textContent = `"${titulo}"`;
    dom.modalExcluir.classList.remove('hidden');
  }

  function fecharModalExclusaoArtigo() {
    idArtigoParaExcluir = null;
    dom.modalExcluir.classList.add('hidden');
  }

  async function confirmarExclusaoArtigo() {
    if (!idArtigoParaExcluir || !window.supabaseClient) return;

    dom.btnConfirmarExclusao.disabled = true;
    try {
      const { error } = await window.supabaseClient
        .from('artigos')
        .delete()
        .eq('id', idArtigoParaExcluir);

      if (error) throw error;

      exibirToast('Artigo excluído com sucesso.', 'sucesso');
      fecharModalExclusaoArtigo();
      await carregarArtigos();
    } catch (erro) {
      console.error('[CMS] Erro ao excluir artigo:', erro);
      exibirToast('Falha ao excluir o artigo. Verifique suas permissões.', 'erro');
    } finally {
      dom.btnConfirmarExclusao.disabled = false;
    }
  }

  // =========================================================================
  // 8. OPERAÇÕES DE DADOS — EVENTOS / CORRIDAS / PROVAS (CRUD)
  // =========================================================================

  async function carregarEventos() {
    if (!window.supabaseClient) return;

    alternarEstadoCarregamentoEventos(true);

    try {
      const { data, error } = await window.supabaseClient
        .from('eventos')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (error) throw error;

      estado.eventos = data || [];
      atualizarMetricasEventos();
      renderizarTabelaEventos();
    } catch (erro) {
      console.error('[CMS] Erro ao carregar eventos:', erro);
      // Se a tabela ainda não existir no Supabase, avisa de forma amigável
      if (erro.code === '42P01' || (erro.message && erro.message.includes('relation "public.eventos" does not exist'))) {
        exibirToast('A tabela "eventos" precisa ser criada no Supabase (ver supabase-schema.sql).', 'aviso');
      } else {
        exibirToast('Falha ao carregar eventos do banco de dados.', 'erro');
      }
    } finally {
      alternarEstadoCarregamentoEventos(false);
    }
  }

  function atualizarMetricasEventos() {
    const hoje = new Date().toISOString().split('T')[0];
    const total = estado.eventos.length;
    const futuros = estado.eventos.filter((e) => e.data_inicio >= hoje).length;
    const passados = total - futuros;
    const destaques = estado.eventos.filter((e) => e.destaque).length;

    if (dom.statEvTotal) dom.statEvTotal.textContent = total;
    if (dom.statEvFuturos) dom.statEvFuturos.textContent = futuros;
    if (dom.statEvPassados) dom.statEvPassados.textContent = passados;
    if (dom.statEvDestaque) dom.statEvDestaque.textContent = destaques;
  }

  function exibirFormularioEvento(modoEdicao = false) {
    dom.secaoListaEventos.classList.add('hidden');
    dom.secaoFormularioEvento.classList.remove('hidden');
    dom.tituloFormEvento.textContent = modoEdicao ? 'Editar Evento' : 'Novo Evento';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exibirListaEventos() {
    dom.secaoFormularioEvento.classList.add('hidden');
    dom.secaoListaEventos.classList.remove('hidden');
    limparFormularioEvento();
    estado.eventoEmEdicaoId = null;
  }

  function alternarEstadoCarregamentoEventos(carregando) {
    estado.carregandoEventos = carregando;
    if (carregando) {
      if (dom.esqueletoEventos) dom.esqueletoEventos.classList.remove('hidden');
      if (dom.tabelaEventosCorpo) dom.tabelaEventosCorpo.classList.add('hidden');
      if (dom.eventosVazio) dom.eventosVazio.classList.add('hidden');
    } else {
      if (dom.esqueletoEventos) dom.esqueletoEventos.classList.add('hidden');
      if (dom.tabelaEventosCorpo) dom.tabelaEventosCorpo.classList.remove('hidden');
    }
  }

  function renderizarTabelaEventos() {
    const termo = estado.termoBuscaEventos.toLowerCase();
    const tipo = estado.filtroTipoEvento;

    const filtrados = estado.eventos.filter((ev) => {
      const correspondeTexto =
        ev.nome?.toLowerCase().includes(termo) ||
        ev.local?.toLowerCase().includes(termo) ||
        ev.tipo?.toLowerCase().includes(termo) ||
        ev.distancia?.toLowerCase().includes(termo);

      const correspondeTipo =
        tipo === 'todos' || ev.tipo === tipo;

      return correspondeTexto && correspondeTipo;
    });

    if (filtrados.length === 0) {
      dom.tabelaEventosCorpo.innerHTML = '';
      dom.eventosVazio.classList.remove('hidden');
      return;
    }

    dom.eventosVazio.classList.add('hidden');

    const hoje = new Date().toISOString().split('T')[0];

    dom.tabelaEventosCorpo.innerHTML = filtrados
      .map((ev) => {
        const isFuturo = ev.data_inicio >= hoje;
        const badgeData = isFuturo
          ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-heading font-semibold bg-green-500/10 text-green-400 border border-green-500/20"><span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>Em Breve</span>'
          : '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-heading font-semibold bg-white/5 text-rw-muted border border-white/10">Realizado</span>';

        const badgeDestaque = ev.destaque
          ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase bg-rw-gold/20 text-rw-gold border border-rw-gold/30">★ Destaque</span>'
          : '';

        const badgePublicado = ev.publicado
          ? '<span class="text-green-400 text-xs" title="Visível no site">● Ativo</span>'
          : '<span class="text-yellow-400 text-xs" title="Oculto">○ Oculto</span>';

        const imagemHtml = ev.imagem_url
          ? `<img src="${ev.imagem_url}" alt="Capa" class="w-12 h-12 rounded-lg object-cover border border-rw-gray" />`
          : `<div class="w-12 h-12 rounded-lg bg-rw-dark border border-rw-gray flex items-center justify-center text-rw-gold">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
             </div>`;

        return `
          <tr class="border-b border-rw-gray/60 hover:bg-white/[0.02] transition-colors">
            <td class="py-4 px-4 sm:px-6">
              <div class="flex items-center gap-3.5">
                ${imagemHtml}
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h4 class="font-heading font-bold text-sm text-white truncate max-w-xs sm:max-w-md">${ev.nome}</h4>
                    ${badgeDestaque}
                  </div>
                  <div class="flex items-center gap-2 mt-0.5 text-xs text-rw-muted">
                    <span class="font-mono text-rw-gold">${ev.distancia || 'Livre'}</span>
                    <span>•</span>
                    <span class="truncate max-w-[200px]">${ev.local || '-'}</span>
                  </div>
                </div>
              </div>
            </td>
            <td class="py-4 px-4 hidden md:table-cell">
              <span class="text-xs font-heading uppercase tracking-wider text-rw-gold font-semibold bg-rw-gold/10 px-2.5 py-1 rounded-md border border-rw-gold/20">
                ${ev.tipo || 'Geral'}
              </span>
            </td>
            <td class="py-4 px-4 hidden lg:table-cell">
              <span class="text-xs text-rw-text">${ev.local}${ev.estado ? ` - ${ev.estado}` : ''}</span>
            </td>
            <td class="py-4 px-4 hidden sm:table-cell">
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-white">${formatarDataPTBR(ev.data_inicio)}</span>
                <span class="text-[10px] text-rw-muted">${ev.horario_largada ? ev.horario_largada.slice(0, 5) + 'h' : ''}</span>
              </div>
            </td>
            <td class="py-4 px-4">
              <div class="flex flex-col gap-1 items-start">
                ${badgeData}
                ${badgePublicado}
              </div>
            </td>
            <td class="py-4 px-4 sm:px-6 text-right">
              <div class="flex items-center justify-end gap-2">
                ${ev.link_inscricao ? `
                  <a href="${ev.link_inscricao}" target="_blank" title="Link de Inscrição"
                    class="p-2 text-rw-muted hover:text-rw-gold hover:bg-white/5 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  </a>
                ` : ''}
                <button type="button" data-editar-evento-id="${ev.id}" title="Editar"
                  class="btn-editar-evento p-2 text-rw-text hover:text-rw-gold hover:bg-rw-gold/10 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button type="button" data-excluir-evento-id="${ev.id}" data-nome="${ev.nome.replace(/"/g, '&quot;')}" title="Excluir"
                  class="btn-excluir-evento p-2 text-rw-muted hover:text-rw-red hover:bg-rw-red/10 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    // Event listeners dos botões da tabela
    document.querySelectorAll('.btn-editar-evento').forEach((btn) => {
      btn.addEventListener('click', () => carregarEventoParaEdicao(btn.dataset.editarEventoId));
    });

    document.querySelectorAll('.btn-excluir-evento').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalExclusaoEvento(btn.dataset.excluirEventoId, btn.dataset.nome));
    });
  }

  function limparFormularioEvento() {
    dom.formEvento.reset();
    dom.eventoId.value = '';
    dom.eventoImagemUrl.value = '';
    dom.previewEventoContainer.classList.add('hidden');
    dom.previewEventoImagem.src = '';
    dom.eventoPublicado.checked = true;
    dom.eventoDestaque.checked = false;
    dom.eventoEstado.value = 'MG';
    estado.eventoDocumentos = [];
    renderizarListaDocumentosEvento();
  }

  function carregarEventoParaEdicao(id) {
    const ev = estado.eventos.find((e) => e.id === id);
    if (!ev) {
      exibirToast('Evento não encontrado.', 'erro');
      return;
    }

    estado.eventoEmEdicaoId = ev.id;
    dom.eventoId.value = ev.id;
    dom.eventoNome.value = ev.nome || '';
    dom.eventoTipo.value = ev.tipo || '';
    dom.eventoDistancia.value = ev.distancia || '';
    dom.eventoDataInicio.value = ev.data_inicio || '';
    dom.eventoHorario.value = ev.horario_largada ? ev.horario_largada.slice(0, 5) : '';
    dom.eventoLocal.value = ev.local || '';
    dom.eventoEstado.value = ev.estado || 'MG';
    dom.eventoDescricao.value = ev.descricao || '';
    dom.eventoImagemUrl.value = ev.imagem_url || '';
    dom.eventoLinkInscricao.value = ev.link_inscricao || '';
    dom.eventoLinkSite.value = ev.link_site || '';
    dom.eventoOrganizacao.value = ev.organizacao || '';
    dom.eventoDificuldade.value = ev.dificuldade || '';
    dom.eventoAltimetria.value = ev.altimetria || '';
    dom.eventoPreco.value = ev.preco || '';
    dom.eventoVagas.value = ev.vagas !== null && ev.vagas !== undefined ? ev.vagas : '';
    dom.eventoDestaque.checked = !!ev.destaque;
    dom.eventoPublicado.checked = !!ev.publicado;

    // Documentos anexos do evento
    estado.eventoDocumentos = Array.isArray(ev.documentos) ? [...ev.documentos] : [];
    renderizarListaDocumentosEvento();

    if (ev.imagem_url) {
      dom.previewEventoImagem.src = ev.imagem_url;
      dom.previewEventoContainer.classList.remove('hidden');
    } else {
      dom.previewEventoContainer.classList.add('hidden');
      dom.previewEventoImagem.src = '';
    }

    exibirFormularioEvento(true);
  }

  async function salvarEvento(e) {
    e.preventDefault();

    if (!window.supabaseClient) {
      exibirToast('Supabase não configurado.', 'erro');
      return;
    }

    const id = dom.eventoId.value;
    const nome = dom.eventoNome.value.trim();
    const tipo = dom.eventoTipo.value;
    const distancia = dom.eventoDistancia.value.trim();
    const dataInicio = dom.eventoDataInicio.value;
    const horarioLargada = dom.eventoHorario.value || null;
    const local = dom.eventoLocal.value.trim();
    const estadoUf = dom.eventoEstado.value;
    const descricao = dom.eventoDescricao.value.trim();
    let imagemUrl = dom.eventoImagemUrl.value.trim();
    const linkInscricao = dom.eventoLinkInscricao.value.trim() || null;
    const linkSite = dom.eventoLinkSite.value.trim() || null;
    const organizacao = dom.eventoOrganizacao.value.trim() || null;
    const dificuldade = dom.eventoDificuldade.value || null;
    const altimetria = dom.eventoAltimetria.value.trim() || null;
    const preco = dom.eventoPreco.value.trim() || null;
    const vagas = dom.eventoVagas.value ? parseInt(dom.eventoVagas.value, 10) : null;
    const destaque = dom.eventoDestaque.checked;
    const publicado = dom.eventoPublicado.checked;

    if (!nome || !tipo || !dataInicio || !local || !descricao) {
      exibirToast('Preencha os campos obrigatórios (*).', 'erro');
      return;
    }

    dom.btnSalvarEvento.disabled = true;
    dom.btnSalvarEvento.classList.add('opacity-60', 'cursor-not-allowed');
    const textoOriginalBotao = dom.btnSalvarEvento.innerHTML;
    dom.btnSalvarEvento.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-rw-black inline-block" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Salvando evento...
    `;

    try {
      const arquivoParaUpload = dom.eventoUploadImagem.files[0];
      if (arquivoParaUpload) {
        exibirToast('Fazendo upload do banner do evento...', 'aviso');
        imagemUrl = await fazerUploadImagem(arquivoParaUpload, 'eventos');
      }

      const payload = {
        nome,
        tipo,
        distancia,
        data_inicio: dataInicio,
        horario_largada: horarioLargada,
        local,
        estado: estadoUf,
        descricao,
        imagem_url: imagemUrl || null,
        link_inscricao: linkInscricao,
        link_site: linkSite,
        organizacao,
        dificuldade,
        altimetria,
        preco,
        vagas,
        destaque,
        documentos: estado.eventoDocumentos,
        publicado,
      };

      if (id) {
        const { error } = await window.supabaseClient
          .from('eventos')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
        exibirToast('Evento atualizado com sucesso!', 'sucesso');
      } else {
        const { error } = await window.supabaseClient
          .from('eventos')
          .insert([payload]);

        if (error) throw error;
        exibirToast('Evento cadastrado e agendado com sucesso!', 'sucesso');
      }

      await carregarEventos();
      exibirListaEventos();

    } catch (erro) {
      console.error('[CMS] Erro ao salvar evento:', erro);
      let mensagem = 'Ocorreu um erro ao salvar o evento.';
      if (erro.code === '42P01') {
        mensagem = 'Tabela "eventos" não encontrada no Supabase. Crie-a no SQL Editor.';
      } else if (erro.message) {
        mensagem = erro.message;
      }
      exibirToast(mensagem, 'erro');
    } finally {
      dom.btnSalvarEvento.disabled = false;
      dom.btnSalvarEvento.classList.remove('opacity-60', 'cursor-not-allowed');
      dom.btnSalvarEvento.innerHTML = textoOriginalBotao;
    }
  }

  function abrirModalExclusaoEvento(id, nome) {
    idEventoParaExcluir = id;
    dom.modalExcluirEventoNome.textContent = `"${nome}"`;
    dom.modalExcluirEvento.classList.remove('hidden');
  }

  function fecharModalExclusaoEvento() {
    idEventoParaExcluir = null;
    dom.modalExcluirEvento.classList.add('hidden');
  }

  async function confirmarExclusaoEvento() {
    if (!idEventoParaExcluir || !window.supabaseClient) return;

    dom.btnConfirmarExclEvento.disabled = true;
    try {
      const { error } = await window.supabaseClient
        .from('eventos')
        .delete()
        .eq('id', idEventoParaExcluir);

      if (error) throw error;

      exibirToast('Evento excluído com sucesso.', 'sucesso');
      fecharModalExclusaoEvento();
      await carregarEventos();
    } catch (erro) {
      console.error('[CMS] Erro ao excluir evento:', erro);
      exibirToast('Falha ao excluir o evento.', 'erro');
    } finally {
      dom.btnConfirmarExclEvento.disabled = false;
    }
  }

  // =========================================================================
  // 9. EVENT LISTENERS E INICIALIZAÇÃO
  // =========================================================================

  function registrarEventos() {
    // Sair (Logout)
    if (dom.btnSair) {
      dom.btnSair.addEventListener('click', encerrarSessao);
    }

    // Alternância de Abas Principais (Artigos vs Eventos)
    if (dom.tabArtigos) {
      dom.tabArtigos.addEventListener('click', () => alternarAba('artigos'));
    }
    if (dom.tabEventos) {
      dom.tabEventos.addEventListener('click', () => alternarAba('eventos'));
    }

    // --- ARTIGOS ---
    if (dom.btnNovoArtigo) {
      dom.btnNovoArtigo.addEventListener('click', () => {
        limparFormularioArtigo();
        exibirFormularioArtigo(false);
      });
    }
    if (dom.btnVoltarLista) {
      dom.btnVoltarLista.addEventListener('click', exibirListaArtigos);
    }
    if (dom.btnCancelarEdicao) {
      dom.btnCancelarEdicao.addEventListener('click', exibirListaArtigos);
    }

    if (dom.inputTitulo && dom.inputSlug) {
      dom.inputTitulo.addEventListener('input', () => {
        if (!dom.artigoId.value || dom.inputSlug.value === '') {
          dom.inputSlug.value = gerarSlug(dom.inputTitulo.value);
        }
      });
    }

    if (dom.inputUploadImagem) {
      dom.inputUploadImagem.addEventListener('change', (e) => {
        const arquivo = e.target.files[0];
        if (arquivo) {
          const leitor = new FileReader();
          leitor.onload = (ev) => {
            dom.previewImagem.src = ev.target.result;
            dom.previewContainer.classList.remove('hidden');
          };
          leitor.readAsDataURL(arquivo);
        }
      });
    }

    if (dom.btnRemoverImagem) {
      dom.btnRemoverImagem.addEventListener('click', () => {
        dom.inputImagemUrl.value = '';
        dom.inputUploadImagem.value = '';
        dom.previewImagem.src = '';
        dom.previewContainer.classList.add('hidden');
      });
    }

    // Upload de Documentos para Artigo
    if (dom.inputUploadDocArtigo) {
      dom.inputUploadDocArtigo.addEventListener('change', async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        exibirToast(`Enviando "${arquivo.name}" para o Storage...`, 'aviso');
        try {
          const docAnexado = await fazerUploadDocumento(arquivo, 'documentos');
          estado.artigoDocumentos.push(docAnexado);
          renderizarListaDocumentosArtigo();
          exibirToast(`Documento "${arquivo.name}" anexado com sucesso!`, 'sucesso');
        } catch (erro) {
          console.error('[CMS] Erro ao anexar documento ao artigo:', erro);
          exibirToast(erro.message || 'Falha ao anexar documento.', 'erro');
        } finally {
          e.target.value = '';
        }
      });
    }

    if (dom.inputBusca) {
      dom.inputBusca.addEventListener('input', (e) => {
        estado.termoBuscaArtigos = e.target.value;
        renderizarTabelaArtigos();
      });
    }

    if (dom.selectFiltroCategoria) {
      dom.selectFiltroCategoria.addEventListener('change', (e) => {
        estado.filtroCategoriaArtigos = e.target.value;
        renderizarTabelaArtigos();
      });
    }

    if (dom.formArtigo) {
      dom.formArtigo.addEventListener('submit', salvarArtigo);
    }

    if (dom.btnConfirmarExclusao) {
      dom.btnConfirmarExclusao.addEventListener('click', confirmarExclusaoArtigo);
    }
    if (dom.btnCancelarExclusao) {
      dom.btnCancelarExclusao.addEventListener('click', fecharModalExclusaoArtigo);
    }

    // --- EVENTOS ---
    if (dom.btnNovoEvento) {
      dom.btnNovoEvento.addEventListener('click', () => {
        limparFormularioEvento();
        exibirFormularioEvento(false);
      });
    }
    if (dom.btnVoltarListaEventos) {
      dom.btnVoltarListaEventos.addEventListener('click', exibirListaEventos);
    }
    if (dom.btnCancelarEvento) {
      dom.btnCancelarEvento.addEventListener('click', exibirListaEventos);
    }

    if (dom.eventoUploadImagem) {
      dom.eventoUploadImagem.addEventListener('change', (e) => {
        const arquivo = e.target.files[0];
        if (arquivo) {
          const leitor = new FileReader();
          leitor.onload = (ev) => {
            dom.previewEventoImagem.src = ev.target.result;
            dom.previewEventoContainer.classList.remove('hidden');
          };
          leitor.readAsDataURL(arquivo);
        }
      });
    }

    if (dom.btnRemoverImagemEvento) {
      dom.btnRemoverImagemEvento.addEventListener('click', () => {
        dom.eventoImagemUrl.value = '';
        dom.eventoUploadImagem.value = '';
        dom.previewEventoImagem.src = '';
        dom.previewEventoContainer.classList.add('hidden');
      });
    }

    // Upload de Documentos para Evento
    if (dom.inputUploadDocEvento) {
      dom.inputUploadDocEvento.addEventListener('change', async (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        exibirToast(`Enviando "${arquivo.name}" para o Storage...`, 'aviso');
        try {
          const docAnexado = await fazerUploadDocumento(arquivo, 'documentos');
          estado.eventoDocumentos.push(docAnexado);
          renderizarListaDocumentosEvento();
          exibirToast(`Documento "${arquivo.name}" anexado ao evento!`, 'sucesso');
        } catch (erro) {
          console.error('[CMS] Erro ao anexar documento ao evento:', erro);
          exibirToast(erro.message || 'Falha ao anexar documento.', 'erro');
        } finally {
          e.target.value = '';
        }
      });
    }

    if (dom.inputBuscaEventos) {
      dom.inputBuscaEventos.addEventListener('input', (e) => {
        estado.termoBuscaEventos = e.target.value;
        renderizarTabelaEventos();
      });
    }

    if (dom.filtroTipoEvento) {
      dom.filtroTipoEvento.addEventListener('change', (e) => {
        estado.filtroTipoEvento = e.target.value;
        renderizarTabelaEventos();
      });
    }

    if (dom.formEvento) {
      dom.formEvento.addEventListener('submit', salvarEvento);
    }

    if (dom.btnConfirmarExclEvento) {
      dom.btnConfirmarExclEvento.addEventListener('click', confirmarExclusaoEvento);
    }
    if (dom.btnCancelarExclEvento) {
      dom.btnCancelarExclEvento.addEventListener('click', fecharModalExclusaoEvento);
    }
  }

  // Inicialização ao carregar a página
  async function iniciarDashboard() {
    registrarEventos();
    const sessaoAtiva = await verificarSessaoUsuario();
    if (sessaoAtiva) {
      await Promise.allSettled([
        carregarArtigos(),
        carregarEventos(),
      ]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarDashboard);
  } else {
    iniciarDashboard();
  }

})();
