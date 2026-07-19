export const Views = {
  dashboard: `
    <h2 style="margin-bottom: 1.5rem;">Resumo Financeiro</h2>
    <div class="grid-dashboard">
      <div class="card"><div class="card-title">Saldo Disponível</div><div class="card-value" id="dash-saldo">R$ 0,00</div></div>
      <div class="card"><div class="card-title">Receitas Mensais</div><div class="card-value" style="color:#22C55E" id="dash-receitas">R$ 0,00</div></div>
      <div class="card"><div class="card-title">Despesas Mensais</div><div class="card-value" style="color:#EF4444" id="dash-despesas">R$ 0,00</div></div>
    </div>
    <div class="card" style="width: 100%; max-height: 400px;">
      <canvas id="chart-fluxo"></canvas>
    </div>
  `,

  receitas: `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
      <h2>Histórico de Receitas</h2>
      <button class="menu-item" id="btn-add-receita" style="background:var(--color-blue); color:white; font-weight:bold;">+ Nova Receita</button>
    </div>
    <div class="card" style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left;" id="table-receitas">
        <thead>
          <tr style="border-bottom:1px solid var(--border-color); color:var(--text-secondary);">
            <th style="padding:1rem;">Descrição</th>
            <th style="padding:1rem;">Data</th>
            <th style="padding:1rem;">Valor</th>
            <th style="padding:1rem;">Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `,

  despesas: `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
      <h2>Controle de Despesas</h2>
      <button class="menu-item" id="btn-add-despesa" style="background:var(--color-red); color:white; font-weight:bold;">+ Nova Despesa</button>
    </div>
    <div class="card" style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left;" id="table-despesas">
        <thead>
          <tr style="border-bottom:1px solid var(--border-color); color:var(--text-secondary);">
            <th style="padding:1rem;">Descrição</th>
            <th style="padding:1rem;">Data</th>
            <th style="padding:1rem;">Status</th>
            <th style="padding:1rem;">Valor</th>
            <th style="padding:1rem;">Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `,

  backup: `
    <h2>Segurança & Dados</h2>
    <p style="color:var(--text-secondary); margin: 1rem 0 2rem 0;">Seus dados são criptografados localmente. Exporte cópias de segurança regularmente.</p>
    <div class="grid-dashboard">
      <div class="card" style="text-align:center;">
        <h3>Exportar Backup</h3>
        <button id="btn-export" class="menu-item" style="background:var(--color-blue); color:white; margin:1rem auto 0 auto; width:fit-content;">Criar Arquivo .JSON</button>
      </div>
      <div class="card" style="text-align:center;">
        <h3>Exportar Excel</h3>
        <button id="btn-export-excel" class="menu-item" style="background:var(--color-green); color:white; margin:1rem auto 0 auto; width:fit-content;">Baixar Planilha .XLSX</button>
      </div>
      <div class="card" style="text-align:center;">
        <h3>Importar Backup</h3>
        <input type="file" id="file-import" style="display:none;">
        <button id="btn-import-trigger" class="menu-item" style="background:var(--border-color); color:white; margin:1rem auto 0 auto; width:fit-content;">Carregar Arquivo</button>
      </div>
    </div>
  `
};

export const Modais = {
  novaReceita: `
    <h3>Nova Receita</h3>
    <form id="form-receita" style="display:flex; flex-direction:column; gap:1rem; margin-top:1.5rem;">
      <input type="text" placeholder="Descrição" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
      <input type="number" step="0.01" placeholder="Valor (R$)" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
      <input type="date" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
      <div style="display:flex; gap:1rem; justify-content:flex-end; margin-top:1rem;">
        <button type="button" id="btn-cancel" style="padding:0.6rem 1rem; background:transparent; border:none; color:var(--text-secondary); cursor:pointer;">Cancelar</button>
        <button type="submit" style="padding:0.6rem 1rem; background:var(--color-green); border:none; color:white; font-weight:bold; border-radius:6px; cursor:pointer;">Salvar</button>
      </div>
    </form>
  `,

  novaDespesa: `
    <h3>Nova Despesa</h3>
    <form id="form-despesa" style="display:flex; flex-direction:column; gap:1rem; margin-top:1.5rem;">
      <input type="text" placeholder="Descrição" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
      <input type="number" step="0.01" placeholder="Valor (R$)" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
      <input type="date" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
      <select style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
        <option value="Pendente">Pendente</option>
        <option value="Pago">Pago</option>
      </select>
      <div style="display:flex; gap:1rem; justify-content:flex-end; margin-top:1rem;">
        <button type="button" id="btn-cancel" style="padding:0.6rem 1rem; background:transparent; border:none; color:var(--text-secondary); cursor:pointer;">Cancelar</button>
        <button type="submit" style="padding:0.6rem 1rem; background:var(--color-red); border:none; color:white; font-weight:bold; border-radius:6px; cursor:pointer;">Salvar</button>
      </div>
    </form>
  `,

  novoCartao: `
    <h3>Adicionar Cartão</h3>
    <form id="form-cartao" style="display:flex; flex-direction:column; gap:1rem; margin-top:1.5rem;">
      <input type="text" placeholder="Nome do Banco (Ex: Nubank)" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
      <input type="number" step="0.01" placeholder="Limite Total (R$)" required style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
      <input type="number" placeholder="Dia do Vencimento" required min="1" max="31" style="padding:0.75rem; background:var(--bg-main); border:1px solid var(--border-color); color:white; border-radius:6px;">
      <div style="display:flex; gap:1rem; justify-content:flex-end; margin-top:1rem;">
        <button type="button" id="btn-cancel" style="padding:0.6rem 1rem; background:transparent; border:none; color:var(--text-secondary); cursor:pointer;">Cancelar</button>
        <button type="submit" style="padding:0.6rem 1rem; background:var(--color-blue); border:none; color:white; font-weight:bold; border-radius:6px; cursor:pointer;">Adicionar</button>
      </div>
    </form>
  `
};