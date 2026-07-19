export class DashboardModule {
  constructor(storage) {
    this.storage = storage;
    this.chart = null;
  }

  async render() {
    const receitas = await this.storage.getAll('transacoes');
    const despesas = await this.storage.getAll('despesas');

    const totalReceitas = receitas.reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalDespesas = despesas.reduce((acc, curr) => acc + Number(curr.valor), 0);
    const saldo = totalReceitas - totalDespesas;

    document.getElementById('dash-saldo').innerText = `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    document.getElementById('dash-receitas').innerText = `R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    document.getElementById('dash-despesas').innerText = `R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    this.renderChart(totalReceitas, totalDespesas);
  }

  renderChart(receitas, despesas) {
    const ctx = document.getElementById('chart-fluxo').getContext('2d');
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
          label: 'Fluxo Mensal Realizado',
          data: [receitas, despesas],
          backgroundColor: ['#22C55E', '#EF4444'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#374151' }, ticks: { color: '#9CA3AF' } },
          x: { ticks: { color: '#9CA3AF' } }
        }
      }
    });
  }
}