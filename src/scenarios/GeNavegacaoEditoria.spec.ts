import { test } from '../support/fixtures/ge';

test.describe('ge - Navegação por editoria', () => {
  const EDITORIA = 'seleção brasileira';
  const CAMINHO = '/futebol/selecao-brasileira/';

  test.beforeEach(async ({ gePage, geUrl }) => {
    await gePage.acessarHome(geUrl);
  });

  test('Navegar da home até a editoria Seleção Brasileira pelo menu e abrir uma matéria da própria editoria', async ({
    gePage
  }) => {
    await test.step('Abrir o menu principal da home', async () => {
      await gePage.abrirMenu();
    });

    await test.step('Acessar a editoria "seleção brasileira" pelo menu', async () => {
      await gePage.navegarPeloMenu(EDITORIA);
      await gePage.validarEditoria(EDITORIA, CAMINHO, /Seleção Brasileira/);
    });

    await test.step('Abrir a primeira matéria publicada pela editoria', async () => {
      await gePage.abrirPrimeiraMateriaDaEditoria(CAMINHO);
    });

    await test.step('Validar que a matéria pertence à editoria Seleção Brasileira', async () => {
      await gePage.validarMateriaDaEditoria(EDITORIA, CAMINHO);
    });
  });
});
