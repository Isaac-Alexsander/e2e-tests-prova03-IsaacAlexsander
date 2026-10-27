import { expect, test } from '../support/fixtures/ge';

test.describe('ge - Busca de conteúdo', () => {
  const TERMO = 'Libertadores';
  const TERMO_REGEX = new RegExp(TERMO, 'i');

  test.beforeEach(async ({ gePage, geUrl }) => {
    await gePage.acessarHome(geUrl);
  });

  test('Pesquisar "Libertadores", validar a relevância dos resultados e abrir uma notícia correspondente', async ({
    gePage
  }) => {
    await test.step(`Pesquisar "${TERMO}" pelo campo de busca do cabeçalho`, async () => {
      await gePage.pesquisar(TERMO);
    });

    await test.step('Validar que os primeiros resultados citam o termo pesquisado', async () => {
      await gePage.validarRelevanciaDosResultados(TERMO_REGEX, 3);
    });

    const titulo =
      await test.step('Selecionar a primeira notícia entre os resultados', async () => {
        const linkDaNoticia =
          await gePage.obterPrimeiraNoticiaDaBusca(TERMO_REGEX);
        const textoDoLink = await linkDaNoticia.innerText();
        const tituloDaNoticia = textoDoLink.split('\n')[0].trim();
        expect(tituloDaNoticia).not.toBe('');
        await linkDaNoticia.click();
        return tituloDaNoticia;
      });

    await test.step('Validar que a matéria aberta é a notícia escolhida e trata do termo', async () => {
      await gePage.validarMateriaAberta(titulo, TERMO_REGEX);
    });
  });
});
