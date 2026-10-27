import { Locator, Page } from '@playwright/test';
import BaseElements from './BaseElements';

export default class GeElements extends BaseElements {
  constructor(readonly page: Page) {
    super(page);
    this.page = page;
  }

  getBotaoAceitarCookies(): Locator {
    return this.page.getByRole('button', { name: 'Prosseguir' });
  }

  // o ge renderiza dois headers (normal e fixo), cada um com seu botão de menu
  getBotaoMenu(): Locator {
    return this.page.getByRole('button', { name: 'Menu' }).first();
  }

  getMenuNavegacao(): Locator {
    return this.page.getByRole('navigation');
  }

  getLinkDoMenu(nome: string): Locator {
    return this.getMenuNavegacao().getByRole('link', {
      name: nome,
      exact: true
    });
  }

  getCampoBusca(): Locator {
    return this.page.getByRole('searchbox', { name: 'buscar' });
  }

  // nome da editoria exibido no cabeçalho de seções e matérias
  getEditoriaNoCabecalho(nome: string): Locator {
    return this.page
      .getByRole('banner')
      .getByRole('link', { name: nome, exact: true });
  }

  // o feed da editoria também lista matérias de outras seções (ex.: times),
  // então filtramos pelo endereço da própria editoria
  getMateriasDaEditoria(caminho: string): Locator {
    return this.page
      .getByRole('main')
      .locator(`a[href^="https://ge.globo.com${caminho}noticia/"]`);
  }

  getTituloMateria(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  getDataPublicacao(): Locator {
    return this.page.getByRole('main').getByRole('time').first();
  }

  getCorpoMateria(): Locator {
    return this.page.getByRole('main');
  }

  getListaResultadosBusca(termo: RegExp): Locator {
    return this.page
      .getByRole('list')
      .filter({ has: this.page.getByRole('link', { name: termo }) })
      .first();
  }

  getResultadosBusca(termo: RegExp): Locator {
    return this.getListaResultadosBusca(termo).getByRole('listitem');
  }

  // os links da busca passam pelo redirecionador measures.globo.com com o
  // destino codificado no parâmetro "u"; notícias têm "/noticia/" nesse destino
  getPrimeiraNoticiaDaBusca(termo: RegExp): Locator {
    return this.getResultadosBusca(termo)
      .filter({ has: this.page.locator('a[href*="%2Fnoticia%2F"]') })
      .first();
  }

  getTituloDoResultado(resultado: Locator): Locator {
    return resultado.getByRole('link').last();
  }

  getSecaoTabela(): Locator {
    return this.page
      .getByRole('article')
      .filter({ has: this.page.getByRole('heading', { name: 'Tabela' }) });
  }

  getLinkSimulador(): Locator {
    return this.getSecaoTabela().getByRole('link', {
      name: 'Acessar Simulador'
    });
  }

  getTabelaClassificacao(): Locator {
    return this.getSecaoTabela()
      .getByRole('table')
      .filter({
        has: this.page.getByRole('columnheader', { name: 'Classificação' })
      });
  }

  getTabelaPontuacao(): Locator {
    return this.getSecaoTabela()
      .getByRole('table')
      .filter({
        has: this.page.getByRole('columnheader', { name: 'P', exact: true })
      });
  }
}
