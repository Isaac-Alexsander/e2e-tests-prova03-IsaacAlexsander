import { test as base } from '@playwright/test';
import { join } from 'path';
import { TheConfig } from 'sicolo';
import GePage from '../pages/GePage';

type GeFixtures = {
  geUrl: string;
  gePage: GePage;
};

export const test = base.extend<GeFixtures>({
  geUrl: async ({}, use) => {
    const config = join(__dirname, 'config.yml');
    await use(
      TheConfig.fromFile(config).andPath('application.ge').retrieveData()
    );
  },

  gePage: async ({ page }, use) => {
    const gePage = new GePage(page);
    await gePage.registrarFechamentoDoBannerDeCookies();
    await use(gePage);
  }
});

export { expect } from '@playwright/test';
