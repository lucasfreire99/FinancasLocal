import { StorageEngine } from './database/storage.js';
import { Views } from './components/views.js';
import { DashboardModule } from './modules/dashboard.js';
import { TransacoesModule } from './modules/transacoes.js';
import { BackupModule } from './modules/backup.js';
import { UI } from './components/ui-elements.js';

class FinApp {
  constructor() {
    this.storage = new StorageEngine();
    this.currentView = 'dashboard';
    
    // Instanciação dos Módulos
    this.dashboardModule = new DashboardModule(this.storage);
    this.transacoesModule = new TransacoesModule(this.storage);
    this.backupModule = new BackupModule(this.storage);
  }

  async init() {
    try {
      // Abre o banco local criptografado
      await this.storage.init();
      this.setupRouter();
      await this.navigate('dashboard');
      this.registerServiceWorker();
    } catch (error) {
      console.error("Falha de inicialização crítica:", error);
      UI.toast('Falha ao abrir banco local de segurança.', 'error');
    }
  }

  setupRouter() {
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        e.preventDefault();
        const view = e.currentTarget.getAttribute('data-view');
        if (view) {
          document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
          e.currentTarget.classList.add('active');
          await this.navigate(view);
        }
      });
    });
  }

  async navigate(viewName) {
    this.currentView = viewName;
    const container = document.getElementById('app-view');
    container.innerHTML = Views[viewName] || '<h2>Página não encontrada</h2>';

    // Ciclo de atualização de dados baseado na View selecionada
    switch (viewName) {
      case 'dashboard':
        await this.dashboardModule.render();
        break;
      case 'receitas':
        await this.transacoesModule.renderReceitas();
        break;
      case 'despesas':
        await this.transacoesModule.renderDespesas();
        break;
      case 'backup':
        await this.backupModule.init();
        break;
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(() => console.log('PWA Service Worker ativo operacional.'))
          .catch(err => console.error('Erro de registro PWA:', err));
      });
    }
  }
}

// Inicialização imediata ao carregar a janela DOM
window.addEventListener('DOMContentLoaded', () => {
  const application = new FinApp();
  application.init();
});