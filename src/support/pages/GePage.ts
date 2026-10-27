import { Locator, Page, expect } from '@playwright/test';
import GeElements from '../elements/GeElements';
import BasePage from './BasePage';

export type LinhaPontuacao = {
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldo: number;
};

export default class GePage extends BasePage {
  readonly geElements: GeElements;

  constructor(readonly page: Page) {
    super(page);
    this.page = page;
    this.geElements = new GeElements(page);
  }

  // o banner LGPD pode surgir a qualquer momento (ou não surgir); o handler
  // fecha o banner sempre que ele bloquear uma ação, sem esperas fixas
  async registrarFechamentoDoBannerDeCookies(): Promise<void> {
    const botaoAceitar = this.geElements.getBotaoAceitarCookies();
    await this.page.addLocatorHandler(botaoAceitar, async () => {
      await botaoAceitar.click();
    });
  }

  async acessarHome(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveTitle(/ge\.globo/);
    await expect(this.geElements.getCampoBusca()).toBeVisible();
    await expect(this.geElements.getBotaoMenu()).toBeVisible();
  }

  async abrirMenu(): Promise<void> {
    await this.geElements.getBotaoMenu().click();
    await expect(this.geElements.getMenuNavegacao()).toBeVisible();
  }

  async navegarPeloMenu(nome: string): Promise<void> {
    const link = this.geElements.getLinkDoMenu(nome);
    await expect(link).toBeVisible();
    await link.click();
  }

  async validarEditoria(
    nome: string,
    caminho: string,
    titulo: RegExp
  ): Promise<void> {
    await expect(this.page).toHaveURL(`https://ge.globo.com${caminho}`);
    await expect(this.page).toHaveTitle(titulo);
    await expect(this.geElements.getEditoriaNoCabecalho(nome)).toBeVisible();
  }

  async abrirPrimeiraMateriaDaEditoria(caminho: string): Promise<void> {
    const materia = this.geElements.getMateriasDaEditoria(caminho).first();
    await expect(materia).toBeVisible();
    await materia.click();
  }

  async validarMateriaDaEditoria(nome: string, caminho: string): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(`ge\\.globo\\.com${caminho}noticia/\\d{4}/\\d{2}/\\d{2}/`)
    );
    await expect(this.geElements.getTituloMateria()).toBeVisible();
    await expect(this.geElements.getTituloMateria()).not.toBeEmpty();
    await expect(this.geElements.getDataPublicacao()).toBeVisible();
    await expect(this.geElements.getEditoriaNoCabecalho(nome)).toBeVisible();
  }

  async pesquisar(termo: string): Promise<void> {
    const campoBusca = this.geElements.getCampoBusca();
    await campoBusca.fill(termo);
    await expect(campoBusca).toHaveValue(termo);
    await campoBusca.press('Enter');
    await expect(this.page).toHaveURL(
      `https://ge.globo.com/busca/?q=${encodeURIComponent(termo)}`
    );
  }

  async validarRelevanciaDosResultados(
    termo: RegExp,
    quantidadeAvaliada: number
  ): Promise<void> {
    const resultados = this.geElements.getResultadosBusca(termo);
    await expect(resultados.nth(quantidadeAvaliada - 1)).toBeVisible();
    for (let i = 0; i < quantidadeAvaliada; i++) {
      await expect(resultados.nth(i)).toContainText(termo);
    }
  }

  async obterPrimeiraNoticiaDaBusca(termo: RegExp): Promise<Locator> {
    const noticia = this.geElements.getPrimeiraNoticiaDaBusca(termo);
    await expect(noticia).toBeVisible();
    await expect(noticia).toContainText(termo);
    return this.geElements.getTituloDoResultado(noticia);
  }

  async validarMateriaAberta(titulo: string, termo: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(
      /^https:\/\/ge\.globo\.com\/.*\/noticia\//
    );
    await expect(this.geElements.getTituloMateria()).toHaveText(titulo);
    await expect(this.geElements.getCorpoMateria()).toContainText(termo);
  }

  async validarSecaoTabela(): Promise<void> {
    await expect(this.geElements.getSecaoTabela()).toBeVisible();
    await expect(this.geElements.getLinkSimulador()).toBeVisible();
  }

  async validarClassificacao(quantidadeDeTimes: number): Promise<void> {
    const linhas = this.geElements
      .getTabelaClassificacao()
      .getByRole('rowgroup')
      .nth(1)
      .getByRole('row');
    await expect(linhas).toHaveCount(quantidadeDeTimes);

    // posições de 1 a N, em ordem, seguidas do nome do time
    const posicoes = Array.from(
      { length: quantidadeDeTimes },
      (_, i) => new RegExp(`^${i + 1}\\D`)
    );
    await expect(linhas).toHaveText(posicoes);

    const nomesDosTimes = this.geElements
      .getTabelaClassificacao()
      .getByRole('strong');
    await expect(nomesDosTimes).toHaveText(
      Array(quantidadeDeTimes).fill(/\p{L}{3,}/u)
    );
  }

  async lerTabelaDePontuacao(
    quantidadeDeTimes: number
  ): Promise<LinhaPontuacao[]> {
    const tabela = this.geElements.getTabelaPontuacao();
    await expect(tabela.getByRole('columnheader')).toHaveText([
      'P',
      'J',
      'V',
      'E',
      'D',
      'GP',
      'GC',
      'SG',
      '%',
      /últ\. jogos/i
    ]);

    const linhas = tabela.getByRole('rowgroup').nth(1).getByRole('row');
    await expect(linhas).toHaveCount(quantidadeDeTimes);

    const textos = await linhas.allInnerTexts();
    return textos.map(texto => {
      const [pontos, jogos, vitorias, empates, derrotas, gp, gc, saldo] = texto
        .trim()
        .split(/\s+/)
        .map(Number);
      return {
        pontos,
        jogos,
        vitorias,
        empates,
        derrotas,
        golsPro: gp,
        golsContra: gc,
        saldo
      };
    });
  }
}
