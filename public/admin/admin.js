/**
 * Red Wings Adventure — Módulo de Lógica Administrativa (CRUD e Uploads)
 * Gerencia a autenticação, listagem, criação, edição, exclusão e uploads do CMS.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. ESTADO GLOBAL DA APLICAÇÃO ADMIN
  // =========================================================================
  const estado = {
    sessao: null,
    artigos: [],
    artigoEmEdicaoId: null,
    carregando: false,
    termoBusca: '',
    filtroCategoria: 'todas',
  };

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

    // Métricas
    statTotal: document.getElementById('stat-total'),
    statPublicados: document.getElementById('stat-publicados'),
    statRascunhos: document.getElementById('stat-rascunhos'),

    // Ações & Visualizações
    btnNovoArtigo: document.getElementById('btn-novo-artigo'),
    btnVoltarLista: document.getElementById('btn-voltar-lista'),
    btnCancelarEdicao: document.getElementById('btn-cancelar-edicao'),
    secaoLista: document.getElementById('secao-lista'),
    secaoFormulario: document.getElementById('secao-formulario'),
    tituloFormulario: document.getElementById('titulo-formulario'),
    
    // Tabela e Busca
    inputBusca: document.getElementById('input-busca'),
    selectFiltroCategoria: document.getElementById('filtro-categoria'),
    tabelaArtigosCorpo: document.getElementById('tabela-artigos-corpo'),
    esqueletoCarregamento: document.getElementById('esqueleto-carregamento'),
    mensagemVazio: document.getElementById('mensagem-tabela-vazia'),

    // Formulário
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

    // Modal de Confirmação de Exclusão
    modalExcluir: document.getElementById('modal-excluir'),
    modalExcluirTitulo: document.getElementById('modal-excluir-titulo'),
    btnConfirmarExclusao: document.getElementById('btn-confirmar-exclusao'),
    btnCancelarExclusao: document.getElementById('btn-cancelar-exclusao'),
  };

  let idArtigoParaExcluir = null;

  // =========================================================================
  // 3. UTILITÁRIOS E TOASTS
  // =========================================================================

  /**
   * Exibe mensagens de feedback elegantes (sucesso, erro, alerta)
   */
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

    // Animação de entrada
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    // Auto-remover após 4 segundos
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Converte strings em Slugs limpos para SEO (ex: "Expedição 2026!" -> "expedicao-2026")
   */
  function gerarSlug(texto) {
    return texto
      .toString()
      .toLowerCase()
      .normalize('NFD') // Decompõe caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .trim()
      .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Espaços para hífen
      .replace(/-+/g, '-'); // Agrupa hífens repetidos
  }

  /**
   * Formata datas para o formato padrão do Brasil (PT-BR)
   */
  function formatarDataPTBR(dataIso) {
    if (!dataIso) return '-';
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // =========================================================================
  // 4. CONTROLE DE AUTENTICAÇÃO E ROTA PROTEGIDA
  // =========================================================================

  async function verificarSessaoUsuario() {
    if (!window.supabaseClient) {
      if (dom.avisoCredenciais) dom.avisoCredenciais.classList.remove('hidden');
      return null;
    }

    try {
      const { data: { session }, error } = await window.supabaseClient.auth.getSession();
      if (error || !session) {
        window.location.replace('index.html');
        return null;
      }

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
      window.location.replace('index.html');
    } catch (err) {
      console.error('[CMS] Erro ao sair:', err);
      exibirToast('Erro ao encerrar sessão. Tente novamente.', 'erro');
    }
  }

  // =========================================================================
  // 5. OPERAÇÕES DE DADOS (CRUD ARTIGOS)
  // =========================================================================

  /**
   * Busca todos os artigos no Supabase (incluindo rascunhos para usuários autenticados)
   */
  async function carregarArtigos() {
    if (!window.supabaseClient) return;

    alternarEstadoCarregamento(true);

    try {
      const { data, error } = await window.supabaseClient
        .from('artigos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      estado.artigos = data || [];
      atualizarMetricas();
      renderizarTabelaArtigos();
    } catch (erro) {
      console.error('[CMS] Erro ao carregar artigos:', erro);
      exibirToast('Falha ao carregar artigos do banco de dados.', 'erro');
    } finally {
      alternarEstadoCarregamento(false);
    }
  }

  /**
   * Atualiza os contadores no topo do painel
   */
  function atualizarMetricas() {
    const total = estado.artigos.length;
    const publicados = estado.artigos.filter((a) => a.publicado).length;
    const rascunhos = total - publicados;

    if (dom.statTotal) dom.statTotal.textContent = total;
    if (dom.statPublicados) dom.statPublicados.textContent = publicados;
    if (dom.statRascunhos) dom.statRascunhos.textContent = rascunhos;
  }

  /**
   * Alterna entre a visualização de tabela e a de formulário
   */
  function exibirFormulario(modoEdicao = false) {
    dom.secaoLista.classList.add('hidden');
    dom.secaoFormulario.classList.remove('hidden');
    dom.tituloFormulario.textContent = modoEdicao ? 'Editar Artigo' : 'Novo Artigo';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exibirLista() {
    dom.secaoFormulario.classList.add('hidden');
    dom.secaoLista.classList.remove('hidden');
    limparFormulario();
    estado.artigoEmEdicaoId = null;
  }

  function alternarEstadoCarregamento(carregando) {
    estado.carregando = carregando;
    if (carregando) {
      dom.esqueletoCarregamento.classList.remove('hidden');
      dom.tabelaArtigosCorpo.classList.add('hidden');
      dom.mensagemVazio.classList.add('hidden');
    } else {
      dom.esqueletoCarregamento.classList.add('hidden');
      dom.tabelaArtigosCorpo.classList.remove('hidden');
    }
  }

  /**
   * Renderiza a lista de artigos filtrada por texto e categoria
   */
  function renderizarTabelaArtigos() {
    const termo = estado.termoBusca.toLowerCase();
    const categoria = estado.filtroCategoria;

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

    // Adicionar eventos aos botões da tabela
    document.querySelectorAll('.btn-editar-artigo').forEach((btn) => {
      btn.addEventListener('click', () => carregarArtigoParaEdicao(btn.dataset.editarId));
    });

    document.querySelectorAll('.btn-excluir-artigo').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalExclusao(btn.dataset.excluirId, btn.dataset.titulo));
    });
  }

  // =========================================================================
  // 6. UPLOAD DE IMAGENS DIRETO PARA O SUPABASE STORAGE
  // =========================================================================

  /**
   * Realiza upload de arquivo para o bucket 'artigos-midia' e retorna a URL pública
   */
  async function fazerUploadImagem(arquivo) {
    if (!window.supabaseClient) {
      throw new Error('Supabase não conectado.');
    }

    // Validação de tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!tiposPermitidos.includes(arquivo.type)) {
      throw new Error('Formato de arquivo não suportado. Utilize JPG, PNG, WebP ou AVIF.');
    }

    // Limite de 5MB
    if (arquivo.size > 5 * 1024 * 1024) {
      throw new Error('O arquivo excede o limite máximo de 5MB.');
    }

    const extensao = arquivo.name.split('.').pop();
    const nomeLimpo = gerarSlug(arquivo.name.replace(/\.[^/.]+$/, ''));
    const caminhoArquivo = `capas/${Date.now()}-${nomeLimpo}.${extensao}`;

    // Upload via Supabase Storage SDK
    const { data, error } = await window.supabaseClient.storage
      .from('artigos-midia')
      .upload(caminhoArquivo, arquivo, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Obter URL pública gerada
    const { data: dadosPublicos } = window.supabaseClient.storage
      .from('artigos-midia')
      .getPublicUrl(caminhoArquivo);

    return dadosPublicos.publicUrl;
  }

  // =========================================================================
  // 7. PREPARAÇÃO, PREENCHIMENTO E SALVAMENTO DO FORMULÁRIO
  // =========================================================================

  function limparFormulario() {
    dom.formArtigo.reset();
    dom.artigoId.value = '';
    dom.inputImagemUrl.value = '';
    dom.previewContainer.classList.add('hidden');
    dom.previewImagem.src = '';
    dom.checkboxPublicado.checked = true;
    dom.inputAutor.value = 'Red Wings Adventure';
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

    if (artigo.imagem_capa_url) {
      dom.previewImagem.src = artigo.imagem_capa_url;
      dom.previewContainer.classList.remove('hidden');
    } else {
      dom.previewContainer.classList.add('hidden');
      dom.previewImagem.src = '';
    }

    exibirFormulario(true);
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

    if (!titulo || !conteudo) {
      exibirToast('Preencha os campos obrigatórios (Título e Conteúdo).', 'erro');
      return;
    }

    if (!slug) {
      slug = gerarSlug(titulo);
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
      // 1. Verificar se há arquivo novo pendente para upload
      const arquivoParaUpload = dom.inputUploadImagem.files[0];
      if (arquivoParaUpload) {
        exibirToast('Fazendo upload da imagem de capa para o Storage...', 'aviso');
        imagemCapaUrl = await fazerUploadImagem(arquivoParaUpload);
      }

      const payload = {
        titulo,
        slug,
        categoria,
        autor,
        resumo,
        conteudo,
        imagem_capa_url: imagemCapaUrl || null,
        publicado,
      };

      if (id) {
        // Atualização (UPDATE)
        const { error } = await window.supabaseClient
          .from('artigos')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
        exibirToast('Artigo atualizado com sucesso!', 'sucesso');
      } else {
        // Inserção (INSERT)
        const { error } = await window.supabaseClient
          .from('artigos')
          .insert([payload]);

        if (error) throw error;
        exibirToast('Artigo publicado com sucesso!', 'sucesso');
      }

      // Recarrega a listagem e retorna para a tabela
      await carregarArtigos();
      exibirLista();

    } catch (erro) {
      console.error('[CMS] Erro ao salvar artigo:', erro);
      let mensagem = 'Ocorreu um erro ao salvar o artigo.';
      if (erro.code === '23505' || (erro.message && erro.message.includes('unique constraint'))) {
        mensagem = 'Já existe um artigo com este mesmo slug de URL. Altere o slug ou o título.';
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

  // =========================================================================
  // 8. MODAL E EXCLUSÃO
  // =========================================================================

  function abrirModalExclusao(id, titulo) {
    idArtigoParaExcluir = id;
    dom.modalExcluirTitulo.textContent = `"${titulo}"`;
    dom.modalExcluir.classList.remove('hidden');
  }

  function fecharModalExclusao() {
    idArtigoParaExcluir = null;
    dom.modalExcluir.classList.add('hidden');
  }

  async function confirmarExclusao() {
    if (!idArtigoParaExcluir || !window.supabaseClient) return;

    dom.btnConfirmarExclusao.disabled = true;
    try {
      const { error } = await window.supabaseClient
        .from('artigos')
        .delete()
        .eq('id', idArtigoParaExcluir);

      if (error) throw error;

      exibirToast('Artigo excluído com sucesso.', 'sucesso');
      fecharModalExclusao();
      await carregarArtigos();
    } catch (erro) {
      console.error('[CMS] Erro ao excluir artigo:', erro);
      exibirToast('Falha ao excluir o artigo. Verifique suas permissões.', 'erro');
    } finally {
      dom.btnConfirmarExclusao.disabled = false;
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

    // Alternância de Telas
    if (dom.btnNovoArtigo) {
      dom.btnNovoArtigo.addEventListener('click', () => {
        limparFormulario();
        exibirFormulario(false);
      });
    }

    if (dom.btnVoltarLista) {
      dom.btnVoltarLista.addEventListener('click', exibirLista);
    }

    if (dom.btnCancelarEdicao) {
      dom.btnCancelarEdicao.addEventListener('click', exibirLista);
    }

    // Geração automática de Slug em tempo real ao digitar título
    if (dom.inputTitulo && dom.inputSlug) {
      dom.inputTitulo.addEventListener('input', () => {
        // Apenas auto-preenche se o usuário não tiver customizado o slug manualmente na edição
        if (!dom.artigoId.value || dom.inputSlug.value === '') {
          dom.inputSlug.value = gerarSlug(dom.inputTitulo.value);
        }
      });
    }

    // Preview do arquivo local de imagem selecionado
    if (dom.inputUploadImagem) {
      dom.inputUploadImagem.addEventListener('change', (e) => {
        const arquivo = e.target.files[0];
        if (arquivo) {
          const leitor = new FileReader();
          leitor.onload = (evento) => {
            dom.previewImagem.src = evento.target.result;
            dom.previewContainer.classList.remove('hidden');
          };
          leitor.readAsDataURL(arquivo);
        }
      });
    }

    // Remover imagem de capa
    if (dom.btnRemoverImagem) {
      dom.btnRemoverImagem.addEventListener('click', () => {
        dom.inputImagemUrl.value = '';
        dom.inputUploadImagem.value = '';
        dom.previewImagem.src = '';
        dom.previewContainer.classList.add('hidden');
      });
    }

    // Filtros e Busca
    if (dom.inputBusca) {
      dom.inputBusca.addEventListener('input', (e) => {
        estado.termoBusca = e.target.value;
        renderizarTabelaArtigos();
      });
    }

    if (dom.selectFiltroCategoria) {
      dom.selectFiltroCategoria.addEventListener('change', (e) => {
        estado.filtroCategoria = e.target.value;
        renderizarTabelaArtigos();
      });
    }

    // Submissão do Formulário
    if (dom.formArtigo) {
      dom.formArtigo.addEventListener('submit', salvarArtigo);
    }

    // Modal de Exclusão
    if (dom.btnConfirmarExclusao) {
      dom.btnConfirmarExclusao.addEventListener('click', confirmarExclusao);
    }
    if (dom.btnCancelarExclusao) {
      dom.btnCancelarExclusao.addEventListener('click', fecharModalExclusao);
    }
  }

  // Execução ao carregar a página
  document.addEventListener('DOMContentLoaded', async () => {
    registrarEventos();
    const sessaoAtiva = await verificarSessaoUsuario();
    if (sessaoAtiva) {
      await carregarArtigos();
    }
  });

})();
