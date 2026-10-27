import { expect, test } from '../support/fixtures/ge';

test.describe('ge - Tabela de classificação do Brasileirão', () => {
  const TIMES_NA_SERIE_A = 20;

  test.beforeEach(async ({ gePage, geUrl }) => {
    await gePage.acessarHome(geUrl);
  });

  test('Acessar o Brasileirão Série A pelo menu e validar a estrutura e a consistência da classificação', async ({
    gePage
  }) => {
    await test.step('Acessar "brasileirão" pelo menu principal', async () => {
      await gePage.abrirMenu();
      await gePage.navegarPeloMenu('brasileirão');
      await gePage.validarEditoria(
        'Brasileirão Série A',
        '/futebol/brasileirao-serie-a/',
        /Brasileirão Série A/
      );
    });

    await test.step('Validar a seção "Tabela" da página do campeonato', async () => {
      await gePage.validarSecaoTabela();
    });

    await test.step(`Validar as ${TIMES_NA_SERIE_A} posições da classificação em ordem`, async () => {
      await gePage.validarClassificacao(TIMES_NA_SERIE_A);
    });

    const pontuacao =
      await test.step('Ler a tabela de pontuação com as colunas oficiais', async () => {
        return gePage.lerTabelaDePontuacao(TIMES_NA_SERIE_A);
      });

    await test.step('Validar que a classificação está ordenada por pontos', async () => {
      const pontos = pontuacao.map(linha => linha.pontos);
      const ordenados = [...pontos].sort((a, b) => b - a);
      expect(pontos).toEqual(ordenados);
    });

    await test.step('Validar a consistência matemática de cada linha da tabela', async () => {
      for (const [indice, linha] of pontuacao.entries()) {
        const posicao = `${indice + 1}º colocado`;
        expect(linha.jogos, `${posicao}: J = V + E + D`).toBe(
          linha.vitorias + linha.empates + linha.derrotas
        );
        expect(linha.pontos, `${posicao}: P = 3V + E`).toBe(
          linha.vitorias * 3 + linha.empates
        );
        expect(linha.saldo, `${posicao}: SG = GP - GC`).toBe(
          linha.golsPro - linha.golsContra
        );
      }
    });
  });
});
