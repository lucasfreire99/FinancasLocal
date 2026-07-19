import { UI } from '../components/ui-elements.js';
import { Modais } from '../components/views.js';

export class TransacoesModule {
  constructor(storage) {
    this.storage = storage;
  }

  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatDateForDisplay(value) {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR');
  }

  renderReceitas() {
    return this.storage.getAll('transacoes').then((lista) => {
      const tbody = document.querySelector('#table-receitas tbody');
      if (!tbody) return;
      tbody.innerHTML = lista.map((item) => `
        <tr style="border-bottom:1px solid var(--border-color);">
          <td style="padding:1rem;">${this.escapeHtml(item.descricao)}</td>
          <td style="padding:1rem;">${this.formatDateForDisplay(item.data)}</td>
          <td style="padding:1rem; color:#22C55E; font-weight:bold;">R$ ${Number(item.valor).toFixed(2)}</td>
          <td style="padding:1rem;">
            <button type="button" data-action="edit" data-id="${item.id}" style="margin-right:0.5rem; padding:0.35rem 0.7rem; border:none; border-radius:6px; background:#1D4ED8; color:white; cursor:pointer;">Editar</button>
            <button type="button" data-action="delete" data-id="${item.id}" style="padding:0.35rem 0.7rem; border:none; border-radius:6px; background:#EF4444; color:white; cursor:pointer;">Excluir</button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('button[data-action="edit"]').forEach((button) => {
        button.onclick = async () => {
          const item = lista.find((entry) => String(entry.id) === button.getAttribute('data-id'));
          if (!item) return;
          this.openReceitaModal(item);
        };
      });

      tbody.querySelectorAll('button[data-action="delete"]').forEach((button) => {
        button.onclick = async () => {
          const item = lista.find((entry) => String(entry.id) === button.getAttribute('data-id'));
          if (!item) return;
          if (!window.confirm(`Excluir receita "${item.descricao}"?`)) return;
          await this.storage.delete('transacoes', item.id);
          UI.toast('Receita excluída.', 'success');
          await this.renderReceitas();
        };
      });

      const btn = document.getElementById('btn-add-receita');
      if (btn) {
        btn.onclick = () => this.openReceitaModal();
      }
    });
  }

  openReceitaModal(item = null) {
    const title = item ? 'Editar Receita' : 'Nova Receita';
    const descricao = this.escapeHtml(item?.descricao || '');
    const valor = this.escapeHtml(item?.valor ?? '');
    const data = this.escapeHtml(item?.data || '');
    const submitText = item ? 'Salvar' : 'Adicionar';
    const html = `
      <h3>${title}</h3>
      <form id="form-receita" style="display:flex; flex-direction:column; gap:1rem; margin-top:1.5rem;">
        <input type="text" placeholder="Descrição" value="${descricao}" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
        <input type="number" step="0.01" placeholder="Valor (R$)" value="${valor}" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
        <input type="date" value="${data}" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
        <div style="display:flex; gap:1rem; justify-content:flex-end; margin-top:1rem;">
          <button type="button" id="btn-cancel" style="padding:0.6rem 1rem; background:transparent; border:none; color:var(--text-secondary); cursor:pointer;">Cancelar</button>
          <button type="submit" style="padding:0.6rem 1rem; background:var(--color-green); border:none; color:white; font-weight:bold; border-radius:6px; cursor:pointer;">${submitText}</button>
        </div>
      </form>
    `;

    UI.openModal(html, (body) => {
      body.querySelector('#btn-cancel').onclick = UI.closeModal;
      body.querySelector('#form-receita').onsubmit = async (e) => {
        e.preventDefault();
        const inputs = e.target.querySelectorAll('input');
        const payload = {
          descricao: inputs[0].value,
          valor: parseFloat(inputs[1].value),
          data: inputs[2].value
        };
        if (item?.id !== undefined) payload.id = item.id;
        await this.storage.save('transacoes', payload);
        UI.closeModal();
        UI.toast(item ? 'Receita atualizada!' : 'Receita adicionada com sucesso!', 'success');
        await this.renderReceitas();
      };
    });
  }

  renderDespesas() {
    return this.storage.getAll('despesas').then((lista) => {
      const tbody = document.querySelector('#table-despesas tbody');
      if (!tbody) return;
      tbody.innerHTML = lista.map((item) => `
        <tr style="border-bottom:1px solid var(--border-color);">
          <td style="padding:1rem;">${this.escapeHtml(item.descricao)}</td>
          <td style="padding:1rem;">${this.formatDateForDisplay(item.data)}</td>
          <td style="padding:1rem;"><span style="padding:0.25rem 0.5rem; border-radius:4px; font-size:0.75rem; background:${item.status === 'Pago' ? '#14532D' : '#7F1D1D'}">${this.escapeHtml(item.status || 'Pendente')}</span></td>
          <td style="padding:1rem; color:#EF4444; font-weight:bold;">R$ ${Number(item.valor).toFixed(2)}</td>
          <td style="padding:1rem;">
            <button type="button" data-action="edit" data-id="${item.id}" style="margin-right:0.5rem; padding:0.35rem 0.7rem; border:none; border-radius:6px; background:#1D4ED8; color:white; cursor:pointer;">Editar</button>
            <button type="button" data-action="delete" data-id="${item.id}" style="padding:0.35rem 0.7rem; border:none; border-radius:6px; background:#EF4444; color:white; cursor:pointer;">Excluir</button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('button[data-action="edit"]').forEach((button) => {
        button.onclick = async () => {
          const item = lista.find((entry) => String(entry.id) === button.getAttribute('data-id'));
          if (!item) return;
          this.openDespesaModal(item);
        };
      });

      tbody.querySelectorAll('button[data-action="delete"]').forEach((button) => {
        button.onclick = async () => {
          const item = lista.find((entry) => String(entry.id) === button.getAttribute('data-id'));
          if (!item) return;
          if (!window.confirm(`Excluir despesa "${item.descricao}"?`)) return;
          await this.storage.delete('despesas', item.id);
          UI.toast('Despesa excluída.', 'success');
          await this.renderDespesas();
        };
      });

      const btn = document.getElementById('btn-add-despesa');
      if (btn) {
        btn.onclick = () => this.openDespesaModal();
      }
    });
  }

  openDespesaModal(item = null) {
    const title = item ? 'Editar Despesa' : 'Nova Despesa';
    const descricao = this.escapeHtml(item?.descricao || '');
    const valor = this.escapeHtml(item?.valor ?? '');
    const data = this.escapeHtml(item?.data || '');
    const status = this.escapeHtml(item?.status || 'Pendente');
    const submitText = item ? 'Salvar' : 'Adicionar';
    const html = `
      <h3>${title}</h3>
      <form id="form-despesa" style="display:flex; flex-direction:column; gap:1rem; margin-top:1.5rem;">
        <input type="text" placeholder="Descrição" value="${descricao}" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
        <input type="number" step="0.01" placeholder="Valor (R$)" value="${valor}" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
        <input type="date" value="${data}" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
        <select style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
          <option value="Pendente" ${status === 'Pendente' ? 'selected' : ''}>Pendente</option>
          <option value="Pago" ${status === 'Pago' ? 'selected' : ''}>Pago</option>
        </select>
        <div style="display:flex; gap:1rem; justify-content:flex-end; margin-top:1rem;">
          <button type="button" id="btn-cancel" style="padding:0.6rem 1rem; background:transparent; border:none; color:var(--text-secondary); cursor:pointer;">Cancelar</button>
          <button type="submit" style="padding:0.6rem 1rem; background:var(--color-red); border:none; color:white; font-weight:bold; border-radius:6px; cursor:pointer;">${submitText}</button>
        </div>
      </form>
    `;

    UI.openModal(html, (body) => {
      body.querySelector('#btn-cancel').onclick = UI.closeModal;
      body.querySelector('#form-despesa').onsubmit = async (e) => {
        e.preventDefault();
        const inputs = e.target.querySelectorAll('input');
        const status = e.target.querySelector('select').value;
        const payload = {
          descricao: inputs[0].value,
          valor: parseFloat(inputs[1].value),
          data: inputs[2].value,
          status: status
        };
        if (item?.id !== undefined) payload.id = item.id;
        await this.storage.save('despesas', payload);
        UI.closeModal();
        UI.toast(item ? 'Despesa atualizada!' : 'Despesa registrada!', 'success');
        await this.renderDespesas();
      };
    });
  }
}