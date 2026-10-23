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

  carregarArtigosPublicos();

})();
