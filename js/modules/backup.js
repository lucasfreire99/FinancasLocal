import { UI } from '../components/ui-elements.js';

export class BackupModule {
  constructor(storage) {
    this.storage = storage;
  }

  async init() {
    document.getElementById('btn-export').addEventListener('click', async () => {
      const backup = {
        transacoes: await this.storage.getAll('transacoes'),
        despesas: await this.storage.getAll('despesas')
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_financeiro_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      UI.toast('Cópia exportada com sucesso!', 'success');
    });

    document.getElementById('btn-export-excel').addEventListener('click', async () => {
      const receitas = await this.storage.getAll('transacoes');
      const despesas = await this.storage.getAll('despesas');
      const totalReceitas = receitas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
      const totalDespesas = despesas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
      const saldo = totalReceitas - totalDespesas;

      const formatDate = (value) => {
        if (!value) return '';
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          const [year, month, day] = value.split('-').map(Number);
          return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        }
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
      };

      const formatMoney = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
      const removeSpecialChars = (value) => String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201c\u201d]/g, '"')
        .replace(/[^a-zA-Z0-9,.;:/()%$+\- _]/g, '')
        .trim();
      const rows = [];

      rows.push(['Resumo Financeiro']);
      rows.push(['Data da Exportacao', removeSpecialChars(new Date().toLocaleDateString('pt-BR'))]);
      rows.push([]);

      rows.push(['Receitas']);
      rows.push(['Descricao', 'Data', 'Valor']);
      receitas.forEach((item) => rows.push([removeSpecialChars(item.descricao), removeSpecialChars(formatDate(item.data)), removeSpecialChars(formatMoney(item.valor))]));
      rows.push(['', 'Total Receitas', removeSpecialChars(formatMoney(totalReceitas))]);
      rows.push([]);

      rows.push(['Despesas']);
      rows.push(['Descricao', 'Data', 'Status', 'Valor']);
      despesas.forEach((item) => rows.push([removeSpecialChars(item.descricao), removeSpecialChars(formatDate(item.data)), removeSpecialChars(item.status || 'Pendente'), removeSpecialChars(formatMoney(item.valor))]));
      rows.push(['', 'Total Despesas', '', removeSpecialChars(formatMoney(totalDespesas))]);
      rows.push([]);

      rows.push(['Resumo Final']);
      rows.push(['Saldo', removeSpecialChars(formatMoney(saldo))]);

      const csv = rows.map((row) => row.map((value) => `"${removeSpecialChars(String(value)).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financas_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      UI.toast('Planilha exportada com sucesso!', 'success');
    });

    const fileImport = document.getElementById('file-import');
    document.getElementById('btn-import-trigger').addEventListener('click', () => fileImport.click());

    fileImport.addEventListener('change', (e) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.transacoes) for (const t of data.transacoes) await this.storage.save('transacoes', t);
          if (data.despesas) for (const d of data.despesas) await this.storage.save('despesas', d);
          UI.toast('Dados restaurados com sucesso!', 'success');
        } catch (err) {
          UI.toast('Erro ao ler arquivo de backup.', 'error');
        }
      };
      reader.readAsText(e.target.files[0]);
    });
  }
}