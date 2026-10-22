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

})();
