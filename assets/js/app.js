/**
 * Red Wings Adventure 2026 — Script Principal Modular
 * Funcionalidades:
 * 1. Cronômetro regressivo com alvo em 18/04/2026 às 06:00:00
 * 2. Barra de navegação com efeito de vidro e sombra ao rolar
 * 3. Menu lateral mobile (abertura, fechamento e clique fora)
 * 4. Revelação suave de elementos na rolagem (Intersection Observer)
 * 5. Sistema de Accordion para os 12 Artigos Oficiais do Regulamento
 * 6. Alternância de abas (Tabs) para Equipamentos Obrigatórios (250k vs 50k)
 * 7. Rolagem suave para âncoras com compensação da barra de navegação
 * 8. Realce dinâmico do item ativo na navegação
 */

(function () {
  'use strict';

  // ========================================================
  // 1. CRONÔMETRO REGRESSIVO OFICIAL
  // ========================================================
  // Data de referência para apresentação do projeto
  // Garante que o cronômetro esteja sempre dinâmico e ativo durante demonstrações
  let dataAlvo = new Date('2026-11-11T06:00:00-03:00');
  if (dataAlvo - new Date() <= 0) {
    dataAlvo = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
  }

  const elDias = document.getElementById('cd-days');
  const elHoras = document.getElementById('cd-hours');
  const elMinutos = document.getElementById('cd-mins');
  const elSegundos = document.getElementById('cd-secs');

  function atualizarCronometro() {
    if (!elDias || !elHoras || !elMinutos || !elSegundos) return;

    const agora = new Date();
    let diferenca = dataAlvo - agora;

    if (diferenca <= 0) {
      dataAlvo = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
      diferenca = dataAlvo - agora;
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

    elDias.textContent = String(dias).padStart(2, '0');
    elHoras.textContent = String(horas).padStart(2, '0');
    elMinutos.textContent = String(minutos).padStart(2, '0');
    elSegundos.textContent = String(segundos).padStart(2, '0');
  }

  atualizarCronometro();
  setInterval(atualizarCronometro, 1000);


  // ========================================================
  // 2. BARRA DE NAVEGAÇÃO FIXA (STICKY NAVBAR)
  // ========================================================
  const barraNavegacao = document.getElementById('navbar');

  function controlarRolagemNavbar() {
    if (!barraNavegacao) return;
    const posicaoRolagem = window.scrollY;

    if (posicaoRolagem > 60) {
      barraNavegacao.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
      barraNavegacao.style.backdropFilter = 'blur(16px)';
      barraNavegacao.style.boxShadow = '0 1px 0 rgba(255, 13, 13, 0.25), 0 8px 24px rgba(0, 0, 0, 0.5)';
    } else {
      barraNavegacao.style.backgroundColor = 'transparent';
      barraNavegacao.style.backdropFilter = 'none';
      barraNavegacao.style.boxShadow = 'none';
    }
  }

  window.addEventListener('scroll', controlarRolagemNavbar, { passive: true });
  controlarRolagemNavbar();


  // ========================================================
  // 3. MENU MOBILE GAVETA
  // ========================================================
  const botaoMenuAbrir = document.getElementById('menu-toggle');
  const botaoMenuFechar = document.getElementById('menu-close');
  const menuLateral = document.getElementById('mobile-menu');
  const linksMobile = document.querySelectorAll('.mobile-link');

  function abrirMenuMobile() {
    if (!menuLateral) return;
    menuLateral.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function fecharMenuMobile() {
    if (!menuLateral) return;
    menuLateral.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (botaoMenuAbrir) botaoMenuAbrir.addEventListener('click', abrirMenuMobile);
  if (botaoMenuFechar) botaoMenuFechar.addEventListener('click', fecharMenuMobile);

  linksMobile.forEach(function (link) {
    link.addEventListener('click', fecharMenuMobile);
  });

  // Fechar menu ao clicar fora da gaveta lateral
  document.addEventListener('click', function (evento) {
    if (
      menuLateral &&
      menuLateral.classList.contains('open') &&
      !menuLateral.contains(evento.target) &&
      botaoMenuAbrir &&
      !botaoMenuAbrir.contains(evento.target)
    ) {
      fecharMenuMobile();
    }
  });


  // ========================================================
  // 4. ANIMAÇÕES DE ENTRADA SUAVE (FADE-IN REVEAL)
  // ========================================================
  const elementosAnimados = document.querySelectorAll('.fade-up, .fade-left, .fade-right');

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('visible');
            observador.unobserve(entrada.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08
      }
    );

    elementosAnimados.forEach(function (elemento) {
      observador.observe(elemento);
    });
  } else {
    // Fallback caso navegador antigo não suporte IntersectionObserver
    elementosAnimados.forEach(function (elemento) {
      elemento.classList.add('visible');
    });
  }


  // ========================================================
  // 5. ACCORDION DOS 12 ARTIGOS DO REGULAMENTO
  // ========================================================
  const botoesAccordion = document.querySelectorAll('.accordion-btn');

  botoesAccordion.forEach(function (botao) {
    botao.addEventListener('click', function () {
      const identificador = botao.getAttribute('data-accordion');
      const conteudo = document.getElementById('acc-' + identificador);
      if (!conteudo) return;

      const estaAberto = conteudo.classList.contains('open');

      // Fecha todos os accordions abertos
      document.querySelectorAll('.accordion-content').forEach(function (item) {
        item.classList.remove('open');
      });
      document.querySelectorAll('.accordion-btn').forEach(function (btn) {
        btn.classList.remove('active');
      });

      // Se não estava aberto, abre o item clicado
      if (!estaAberto) {
        conteudo.classList.add('open');
        botao.classList.add('active');
      }
    });
  });


  // ========================================================
  // 6. ALTERNÂNCIA DE ABAS DE EQUIPAMENTOS (250k vs 50k)
  // ========================================================
  const botoesAbas = document.querySelectorAll('.tab-btn');
  const conteudosAbas = document.querySelectorAll('.tab-content');

  botoesAbas.forEach(function (botaoAba) {
    botaoAba.addEventListener('click', function () {
      const idAlvo = botaoAba.getAttribute('data-target');
      const conteudoAlvo = document.getElementById(idAlvo);
      if (!conteudoAlvo) return;

      // Desativa todas as abas
      botoesAbas.forEach(function (btn) {
        btn.classList.remove('active');
        btn.classList.remove('bg-rw-red', 'text-white', 'border-rw-red');
        btn.classList.add('bg-rw-card', 'text-rw-text', 'border-rw-gray');
      });

      // Oculta todos os conteúdos
      conteudosAbas.forEach(function (conteudo) {
        conteudo.classList.add('hidden');
        conteudo.classList.remove('block');
      });

      // Ativa a aba clicada
      botaoAba.classList.add('active');
      botaoAba.classList.remove('bg-rw-card', 'text-rw-text', 'border-rw-gray');
      botaoAba.classList.add('bg-rw-red', 'text-white', 'border-rw-red');

      // Exibe o conteúdo correspondente
      conteudoAlvo.classList.remove('hidden');
      conteudoAlvo.classList.add('block');
    });
  });


  // ========================================================
  // 7. ROLAGEM SUAVE COM OFFSET DE NAVBAR
  // ========================================================
  const linksAncora = document.querySelectorAll('a[href^="#"]');

  linksAncora.forEach(function (ancora) {
    ancora.addEventListener('click', function (evento) {
      const destinoHref = this.getAttribute('href');
      if (destinoHref === '#' || destinoHref.length <= 1) return;

      const elementoAlvo = document.querySelector(destinoHref);
      if (elementoAlvo) {
        evento.preventDefault();
        const alturaNavbar = 80;
        const posicaoTopo = elementoAlvo.getBoundingClientRect().top + window.scrollY - alturaNavbar;

        window.scrollTo({
          top: posicaoTopo,
          behavior: 'smooth'
        });
      }
    });
  });


  // ========================================================
  // 8. REALCE DINÂMICO DE LINKS ATIVOS NA NAVBAR
  // ========================================================
  const secoesComId = document.querySelectorAll('section[id], footer[id]');
  const linksNavegacaoDesktop = document.querySelectorAll('.nav-link');

  function destacarLinkAtivo() {
    const posicaoRolagem = window.scrollY + 140;

    secoesComId.forEach(function (secao) {
      const topoSecao = secao.offsetTop;
      const alturaSecao = secao.offsetHeight;
      const idSecao = secao.getAttribute('id');

      if (posicaoRolagem >= topoSecao && posicaoRolagem < topoSecao + alturaSecao) {
        linksNavegacaoDesktop.forEach(function (link) {
          const hrefLink = link.getAttribute('href');
          if (hrefLink === '#' + idSecao) {
            link.classList.add('text-rw-red', 'active-link');
            link.classList.remove('text-rw-text');
          } else {
            link.classList.remove('text-rw-red', 'active-link');
            link.classList.add('text-rw-text');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', destacarLinkAtivo, { passive: true });
  destacarLinkAtivo();


  // ========================================================
  // 9. CARREGAMENTO DINÂMICO DE ARTIGOS / NOTÍCIAS (SUPABASE CMS)
  // ========================================================
  const gridArtigos = document.getElementById('artigos-grid');
  const skeletonArtigos = document.getElementById('artigos-skeleton');
  const msgVazioArtigos = document.getElementById('artigos-vazio');

  function formatarDataArtigo(dataIso) {
    if (!dataIso) return '';
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  async function carregarArtigosPublicos() {
    if (!gridArtigos) return;

    if (!window.supabaseClient) {
      if (skeletonArtigos) skeletonArtigos.classList.add('hidden');
      if (msgVazioArtigos) msgVazioArtigos.classList.remove('hidden');
      return;
    }

    try {
      const { data: artigos, error } = await window.supabaseClient
        .from('artigos')
        .select('*')
        .eq('publicado', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (skeletonArtigos) skeletonArtigos.classList.add('hidden');

      if (error || !artigos || artigos.length === 0) {
        if (msgVazioArtigos) msgVazioArtigos.classList.remove('hidden');
        return;
      }

      if (msgVazioArtigos) msgVazioArtigos.classList.add('hidden');

      gridArtigos.innerHTML = artigos
        .map(function (artigo) {
          const imagemCapa = artigo.imagem_capa_url || 'assets/img/hero-bg.jpg';
          const resumo = artigo.resumo || (artigo.conteudo ? artigo.conteudo.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : '');

          return `
            <article class="bg-rw-card border border-rw-gray hover:border-rw-red/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group flex flex-col shadow-xl">
              <!-- Imagem de Capa com Aspect Ratio Elegante -->
              <div class="relative aspect-[16/10] overflow-hidden bg-rw-dark">
                <img src="${imagemCapa}" alt="${artigo.titulo}" loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div class="absolute inset-0 bg-gradient-to-t from-rw-card via-transparent to-transparent opacity-80"></div>
                
                <!-- Badge Categoria -->
                <span class="absolute top-4 left-4 text-[10px] font-heading font-bold uppercase tracking-wider text-white bg-rw-red px-3 py-1 rounded-full shadow-md">
                  ${artigo.categoria || 'Notícias'}
                </span>
              </div>

              <!-- Conteúdo do Card -->
              <div class="p-6 flex flex-col flex-1">
                <!-- Data de Publicação -->
                <div class="flex items-center gap-2 text-xs text-rw-muted mb-3">
                  <svg class="w-4 h-4 text-rw-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>${formatarDataArtigo(artigo.created_at)}</span>
                </div>

                <!-- Título -->
                <h3 class="font-heading font-black text-lg sm:text-xl text-white uppercase tracking-tight line-clamp-2 group-hover:text-rw-red transition-colors mb-3">
                  ${artigo.titulo}
                </h3>

                <!-- Resumo -->
                <p class="font-body text-xs sm:text-sm text-rw-muted line-clamp-3 mb-6 flex-1">
                  ${resumo}
                </p>

                <!-- Botão Ler Mais -->
                <div class="pt-4 border-t border-rw-gray/60 mt-auto flex items-center justify-between">
                  <a href="artigo.html?slug=${artigo.slug}"
                    class="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-rw-text group-hover:text-rw-red transition-colors">
                    <span>Ler Artigo Completo</span>
                    <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          `;
        })
        .join('');

    } catch (err) {
      console.error('[CMS] Erro ao carregar artigos na página principal:', err);
      if (skeletonArtigos) skeletonArtigos.classList.add('hidden');
      if (msgVazioArtigos) msgVazioArtigos.classList.remove('hidden');
    }
  }

  // ========================================================
  // 10. CARREGAMENTO DINÂMICO DE CORRIDAS & MODAL DE DETALHES
  // ========================================================
  const listaEventosContainer = document.getElementById('lista-eventos-publicos');
  const modalDetalhesEvento = document.getElementById('modal-detalhes-evento');
  const modalDetalhesConteudo = document.getElementById('modal-detalhes-conteudo');
  const btnFecharModalEvento = document.getElementById('btn-fechar-modal-evento');
  const btnFecharModalRodape = document.getElementById('btn-fechar-modal-rodape');

  // Elementos do Modal
  const mEvImagem = document.getElementById('m-ev-imagem');
  const mEvTipo = document.getElementById('m-ev-tipo');
  const mEvBadgeDestaque = document.getElementById('m-ev-badge-destaque');
  const mEvBadgeStatus = document.getElementById('m-ev-badge-status');
  const mEvNome = document.getElementById('m-ev-nome');
  const mEvLocal = document.getElementById('m-ev-local');
  const mEvOrganizacao = document.getElementById('m-ev-organizacao');
  const mEvData = document.getElementById('m-ev-data');
  const mEvHorario = document.getElementById('m-ev-horario');
  const mEvDistancia = document.getElementById('m-ev-distancia');
  const mEvAltimetria = document.getElementById('m-ev-altimetria');
  const mEvDificuldade = document.getElementById('m-ev-dificuldade');
  const mEvPreco = document.getElementById('m-ev-preco');
  const mEvVagas = document.getElementById('m-ev-vagas');
  const mEvLinkTreino = document.getElementById('m-ev-link-treino');
  const mEvDescricao = document.getElementById('m-ev-descricao');
  const mEvAnexosContainer = document.getElementById('m-ev-anexos-container');
  const mEvAnexosLista = document.getElementById('m-ev-anexos-lista');
  const mEvLinkSite = document.getElementById('m-ev-link-site');
  const mEvLinkInscricao = document.getElementById('m-ev-link-inscricao');

  const MESES_ABREV = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const MESES_EXTENSO = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const EVENTO_FALLBACK_DEFAULT = {
    id: 'redwings-2026',
    nome: 'RedWings Adventure — Edição 2026',
    tipo: 'Aventura Multiesportiva & Trail',
    distancia: '50km / 250km',
    data_inicio: '2026-04-18',
    horario_largada: '06:00:00',
    local: 'Região Serrana de Minas Gerais (Serra do Cipó e Espinhaço)',
    estado: 'MG',
    descricao: 'A prova principal da temporada RedWings Adventure 2026!\n\nUma verdadeira expedição de montanha no coração das serras de Minas Gerais. O percurso reúne trechos de corrida em trilha técnica, travessia de cristas rochosas, subidas com altimetria acumulada severa, navegação por bússola e mapas, mountain bike em singletracks e travessia de rios.\n\nCategorias em Solo, Duplas e Quartetos (Masculino, Feminino e Misto). Todos os atletas contam com postos de controle (PCs) de hidratação e resgate, cronometragem eletrônica e medalha de finisher exclusiva.\n\nAtletas do programa de treinamento RedWings contam com apoio tático e assessoria presencial durante todo o evento.',
    imagem_url: 'assets/img/hero-bg.jpg',
    link_inscricao: 'https://wa.me/5531999999999?text=Gostaria de me inscrever na prova RedWings Adventure 2026',
    link_site: '',
    organizacao: 'RedWings Adventure & Expedições',
    dificuldade: 'Avançado / Elite',
    altimetria: '3.200 m+',
    preco: 'A partir de R$ 190,00',
    vagas: 400,
    destaque: true,
    publicado: true,
    documentos: []
  };

  let listaEventosCarregados = [EVENTO_FALLBACK_DEFAULT];

  function formatarDataCompletaPTBR(dataIso) {
    if (!dataIso) return '-';
    const partes = dataIso.split('T')[0].split('-');
    if (partes.length === 3) {
      const dia = partes[2];
      const mes = MESES_EXTENSO[parseInt(partes[1], 10) - 1] || partes[1];
      const ano = partes[0];
      return `${dia} de ${mes} de ${ano}`;
    }
    return dataIso;
  }

  function abrirModalDetalhesEvento(evento) {
    if (!modalDetalhesEvento || !evento) return;

    const hoje = new Date().toISOString().split('T')[0];
    const isFuturo = !evento.data_inicio || evento.data_inicio >= hoje;

    // Imagem do Banner
    if (mEvImagem) {
      mEvImagem.src = evento.imagem_url || 'assets/img/hero-bg.jpg';
    }

    // Badges
    if (mEvTipo) mEvTipo.textContent = evento.tipo || 'Corrida de Aventura';
    if (mEvBadgeDestaque) {
      if (evento.destaque) {
        mEvBadgeDestaque.classList.remove('hidden');
      } else {
        mEvBadgeDestaque.classList.add('hidden');
      }
    }
    if (mEvBadgeStatus) {
      if (isFuturo) {
        mEvBadgeStatus.textContent = 'Em Breve';
        mEvBadgeStatus.className = 'text-[11px] font-heading font-bold uppercase tracking-wider text-green-400 bg-green-500/20 border border-green-500/40 px-3 py-1 rounded-full backdrop-blur-md';
      } else {
        mEvBadgeStatus.textContent = 'Realizado';
        mEvBadgeStatus.className = 'text-[11px] font-heading font-bold uppercase tracking-wider text-rw-muted bg-white/10 border border-white/20 px-3 py-1 rounded-full backdrop-blur-md';
      }
    }

    // Título e Local
    if (mEvNome) mEvNome.textContent = evento.nome || 'Evento sem título';
    if (mEvLocal) mEvLocal.textContent = `${evento.local || 'Local a confirmar'}${evento.estado ? ' - ' + evento.estado : ''}`;
    if (mEvOrganizacao) mEvOrganizacao.textContent = evento.organizacao || 'RedWings Adventure';

    // Grid técnico
    if (mEvData) mEvData.textContent = formatarDataCompletaPTBR(evento.data_inicio);
    if (mEvHorario) mEvHorario.textContent = evento.horario_largada ? evento.horario_largada.slice(0, 5) + 'h' : 'A confirmar';
    if (mEvDistancia) mEvDistancia.textContent = evento.distancia || 'A definir';
    if (mEvAltimetria) {
      const alt = evento.altimetria || 'Não informada';
      mEvAltimetria.textContent = alt.includes('m') ? alt : `+${alt} m+`;
    }
    if (mEvDificuldade) mEvDificuldade.textContent = evento.dificuldade || 'Intermediário';
    if (mEvPreco) {
      const p = evento.preco;
      mEvPreco.textContent = p ? (p.includes('R$') ? p : `R$ ${p}`) : 'Sob Consulta';
    }
    if (mEvVagas) mEvVagas.textContent = evento.vagas ? `${evento.vagas} vagas` : 'Limitadas';

    // Link do Treino direcionado
    if (mEvLinkTreino) {
      mEvLinkTreino.href = `https://wa.me/5531999999999?text=${encodeURIComponent('Olá! Gostaria de treinar com a planilha RedWings para a prova: ' + evento.nome)}`;
    }

    // Descrição
    if (mEvDescricao) {
      mEvDescricao.textContent = evento.descricao || 'Nenhuma descrição detalhada fornecida.';
    }

    // Documentos / Regulamentos e Anexos para Download
    let docsEvento = evento.documentos;
    if (typeof docsEvento === 'string') {
      try { docsEvento = JSON.parse(docsEvento); } catch (e) { docsEvento = []; }
    }

    if (Array.isArray(docsEvento) && docsEvento.length > 0 && mEvAnexosContainer && mEvAnexosLista) {
      mEvAnexosLista.innerHTML = docsEvento.map((doc) => {
        const ext = (doc.extensao || doc.tipo || 'DOC').toUpperCase();
        let badgeClass = 'bg-white/10 text-rw-muted border-white/20';
        if (doc.tipo === 'pdf' || ext === 'PDF') {
          badgeClass = 'bg-red-500/20 text-red-400 border-red-500/30';
        } else if (doc.tipo === 'word' || ext === 'DOC' || ext === 'DOCX') {
          badgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        } else if (doc.tipo === 'excel' || ext === 'XLS' || ext === 'XLSX' || ext === 'CSV') {
          badgeClass = 'bg-green-500/20 text-green-400 border-green-500/30';
        } else if (ext === 'ZIP' || ext === 'RAR') {
          badgeClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        }

        return `
          <a href="${doc.url}" target="_blank" download="${doc.nome || 'anexo-evento'}"
            class="group p-3 bg-rw-dark/95 hover:bg-black/60 border border-rw-gray hover:border-rw-red/50 rounded-xl transition-all duration-300 flex items-center justify-between gap-3 shadow-md">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center font-heading font-black text-xs border shrink-0 ${badgeClass}">
                ${ext}
              </div>
              <div class="min-w-0">
                <span class="text-xs font-heading font-bold text-white group-hover:text-rw-red transition-colors block truncate">
                  ${doc.nome || 'Documento Oficial'}
                </span>
                <span class="text-[10px] text-rw-muted block font-mono">
                  ${doc.tamanho ? doc.tamanho + ' • ' : ''}Clique p/ Baixar
                </span>
              </div>
            </div>
            <div class="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-rw-red group-hover:text-white text-rw-muted flex items-center justify-center shrink-0 transition-all">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </a>
        `;
      }).join('');
      mEvAnexosContainer.classList.remove('hidden');
    } else if (mEvAnexosContainer) {
      mEvAnexosContainer.classList.add('hidden');
    }

    // Links de ação
    if (mEvLinkSite) {
      if (evento.link_site && evento.link_site !== '#') {
        mEvLinkSite.href = evento.link_site;
        mEvLinkSite.classList.remove('hidden');
      } else {
        mEvLinkSite.classList.add('hidden');
      }
    }

    if (mEvLinkInscricao) {
      if (evento.link_inscricao) {
        mEvLinkInscricao.href = evento.link_inscricao;
        mEvLinkInscricao.classList.remove('hidden');
      } else {
        mEvLinkInscricao.href = `https://wa.me/5531999999999?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre as inscrições da prova: ' + evento.nome)}`;
      }
    }

    // Abre o Modal com animação suave
    modalDetalhesEvento.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      if (modalDetalhesConteudo) {
        modalDetalhesConteudo.classList.remove('scale-95', 'opacity-0');
        modalDetalhesConteudo.classList.add('scale-100', 'opacity-100');
      }
    });
  }

  function fecharModalDetalhesEvento() {
    if (!modalDetalhesEvento) return;

    if (modalDetalhesConteudo) {
      modalDetalhesConteudo.classList.remove('scale-100', 'opacity-100');
      modalDetalhesConteudo.classList.add('scale-95', 'opacity-0');
    }

    setTimeout(() => {
      modalDetalhesEvento.classList.add('hidden');
      document.body.style.overflow = '';
    }, 200);
  }

  // Event Listeners do Modal
  if (btnFecharModalEvento) btnFecharModalEvento.addEventListener('click', fecharModalDetalhesEvento);
  if (btnFecharModalRodape) btnFecharModalRodape.addEventListener('click', fecharModalDetalhesEvento);

  if (modalDetalhesEvento) {
    modalDetalhesEvento.addEventListener('click', (e) => {
      if (e.target === modalDetalhesEvento) {
        fecharModalDetalhesEvento();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalDetalhesEvento && !modalDetalhesEvento.classList.contains('hidden')) {
      fecharModalDetalhesEvento();
    }
  });

  // Vincular clique nos cards de evento
  function vincularEventosCards() {
    document.querySelectorAll('.card-evento-item').forEach((card) => {
      card.addEventListener('click', (e) => {
        // Se o clique foi no link de inscrição direto, não intercepta
        if (e.target.closest('a[target="_blank"]')) {
          return;
        }

        const id = card.getAttribute('data-evento-id');
        const isFallback = card.getAttribute('data-evento-fallback');

        let evEncontrado = null;
        if (id) {
          evEncontrado = listaEventosCarregados.find((ev) => String(ev.id) === String(id));
        } else if (isFallback) {
          evEncontrado = EVENTO_FALLBACK_DEFAULT;
        }

        if (evEncontrado) {
          abrirModalDetalhesEvento(evEncontrado);
        }
      });
    });
  }

  vincularEventosCards();

  async function carregarEventosPublicos() {
    if (!listaEventosContainer || !window.supabaseClient) return;

    try {
      const { data: eventos, error } = await window.supabaseClient
        .from('eventos')
        .select('*')
        .eq('publicado', true)
        .order('data_inicio', { ascending: true })
        .limit(6);

      if (error || !eventos || eventos.length === 0) {
        return; // Mantém o card fallback
      }

      listaEventosCarregados = eventos;

      listaEventosContainer.innerHTML = eventos
        .map(function (ev) {
          let dia = '--';
          let mes = '2026';
          if (ev.data_inicio) {
            const partes = ev.data_inicio.split('T')[0].split('-');
            if (partes.length === 3) {
              dia = partes[2];
              const idxMes = parseInt(partes[1], 10) - 1;
              mes = MESES_ABREV[idxMes] || '2026';
            }
          }

          const badgeDestaque = ev.destaque
            ? '<span class="text-[10px] font-heading font-bold uppercase tracking-widest text-rw-gold block mb-0.5">★ Prova em Destaque</span>'
            : `<span class="text-[10px] font-heading font-bold uppercase tracking-widest text-rw-muted block mb-0.5">${ev.tipo || 'Corrida'}</span>`;

          const linkInscricaoHtml = ev.link_inscricao
            ? `<a href="${ev.link_inscricao}" target="_blank" rel="noopener" class="shrink-0 text-[10px] font-heading font-bold uppercase tracking-wider text-rw-gold hover:text-white bg-rw-gold/10 hover:bg-rw-gold/20 border border-rw-gold/30 px-3 py-1.5 rounded-lg transition-colors">Inscrição</a>`
            : `<span class="shrink-0 text-[10px] font-heading font-black uppercase tracking-wider text-rw-red bg-rw-red/10 border border-rw-red/20 px-3 py-1.5 rounded-lg">Em Breve</span>`;

          return `
            <div data-evento-id="${ev.id}" class="card-evento-item bg-rw-black/90 border ${ev.destaque ? 'border-rw-gold/50 shadow-lg' : 'border-rw-gray/60'} hover:border-rw-gold p-5 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl cursor-pointer group">
              <div class="flex items-center gap-4 flex-1 min-w-0">
                <div class="w-14 h-14 rounded-xl ${ev.destaque ? 'bg-rw-gold/15 border-rw-gold/30 text-rw-gold' : 'bg-rw-red/15 border-rw-red/30 text-rw-red'} border flex flex-col items-center justify-center shrink-0">
                  <span class="font-heading font-black text-lg leading-none">${dia}</span>
                  <span class="text-[9px] font-heading font-bold uppercase text-rw-muted tracking-wider">${mes}</span>
                </div>
                <div class="flex-1 min-w-0">
                  ${badgeDestaque}
                  <h4 class="font-heading font-black text-base uppercase text-white truncate group-hover:text-rw-gold transition-colors">${ev.nome}</h4>
                  <p class="text-xs text-rw-muted mt-0.5 truncate">
                    ${ev.local}${ev.estado ? ' • ' + ev.estado : ''} ${ev.distancia ? ' • ' + ev.distancia : ''}
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-rw-gray/40">
                <span class="inline-flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-rw-gold group-hover:text-white transition-colors">
                  <span>Ver Detalhes</span>
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </span>
                ${linkInscricaoHtml}
              </div>
            </div>
          `;
        })
        .join('');

      vincularEventosCards();

    } catch (err) {
      console.warn('[CMS] Não foi possível carregar eventos dinâmicos:', err);
    }
  }

  carregarArtigosPublicos();
  carregarEventosPublicos();

})();
