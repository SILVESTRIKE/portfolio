/*
Reason for existence: Odoo 18 ERP enterprise business suite sandbox providing interactive CRM pipeline, sales invoices, inventory tracker, and backend service telemetry.
System impact if absent: Users cannot test or demonstrate Odoo ERP business workflows in the WebOS portfolio.
*/

'use client';

import React, { useState } from 'react';
import { OdooLead, OdooInvoice } from '@/types';

interface OdooSandboxAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

export function OdooSandboxApp({ onNotify }: OdooSandboxAppProps) {
  const [activeTab, setActiveTab] = useState<'crm' | 'sales' | 'inventory' | 'backend'>('crm');

  const [leads, setLeads] = useState<OdooLead[]>([
    { id: 1, name: 'Cloud Migration Contract', contact: 'Acme Corp', revenue: 24500, stage: 'new' },
    { id: 2, name: 'ERP Customization Module', contact: 'VinaTech JSC', revenue: 15200, stage: 'qualified' },
    { id: 3, name: 'PostgreSQL HA Cluster Setup', contact: 'LogiGlobal', revenue: 18900, stage: 'proposition' },
    { id: 4, name: 'Doru AI Assistant Enterprise', contact: 'Binh Tan Auto', revenue: 32000, stage: 'won' }
  ]);

  const [invoices, setInvoices] = useState<OdooInvoice[]>([
    { id: 'INV/2026/0014', customer: 'Binh Tan Auto', date: '2026-09-18', amount: 32000, status: 'paid' },
    { id: 'INV/2026/0015', customer: 'VinaTech JSC', date: '2026-09-22', amount: 15200, status: 'paid' },
    { id: 'INV/2026/0016', customer: 'Acme Corp', date: '2026-09-25', amount: 24500, status: 'draft' },
    { id: 'INV/2026/0017', customer: 'OmniTrade', date: '2026-09-10', amount: 8400, status: 'overdue' }
  ]);

  const inventoryItems = [
    { sku: 'SRV-RACK-1U', name: 'Supermicro 1U Server Chassis', stock: 14, min: 5, unitPrice: '$1,200' },
    { sku: 'RAM-DDR5-32G', name: 'Samsung 32GB DDR5 ECC Reg', stock: 48, min: 20, unitPrice: '$160' },
    { sku: 'NVME-980-1TB', name: 'Samsung 980 Pro 1TB PCIe 4.0', stock: 32, min: 15, unitPrice: '$95' },
    { sku: 'ETH-10G-NIC', name: 'Intel X520 Dual 10G SFP+', stock: 8, min: 10, unitPrice: '$210' }
  ];

  const handleAdvanceStage = (id: number) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    const stages: OdooLead['stage'][] = ['new', 'qualified', 'proposition', 'won'];
    const currentIdx = stages.indexOf(lead.stage);
    const nextStage = stages[Math.min(stages.length - 1, currentIdx + 1)];

    if (nextStage !== lead.stage) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: nextStage } : l));
      if (onNotify) {
        onNotify(`Lead "${lead.name}" moved to ${nextStage.toUpperCase()}`, 'info');
      }
    }
  };

  const handleAddLead = () => {
    const name = window.prompt('Opportunity Title:');
    if (!name) return;
    const contact = window.prompt('Customer/Company Name:') || 'Prospect Client';
    const revStr = window.prompt('Estimated Revenue ($):') || '10000';
    const rev = parseFloat(revStr) || 10000;

    const newLead: OdooLead = {
      id: Date.now(),
      name,
      contact,
      revenue: rev,
      stage: 'new'
    };

    setLeads(prev => [newLead, ...prev]);
    if (onNotify) onNotify(`Created CRM Lead: ${name}`, 'info');
  };

  const totalWon = leads
    .filter(l => l.stage === 'won')
    .reduce((acc, curr) => acc + curr.revenue, 0);

  const totalPipeline = leads.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="h-full w-full flex flex-col font-sans text-xs bg-[#0b0e14] select-none">
      {/* Odoo Header Bar */}
      <div className="h-10 bg-[#714B67] text-white px-3 flex items-center justify-between border-b border-[#5a3b52]">
        <div className="flex items-center gap-3">
          <div className="font-bold text-sm tracking-wider font-mono">odoo</div>
          <div className="h-4 w-[1px] bg-white/30" />
          <nav className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('crm')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'crm' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'
              }`}
            >
              CRM Pipeline
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'sales' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'
              }`}
            >
              Invoicing & Sales
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'inventory' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('backend')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'backend' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'
              }`}
            >
              Daemon Telemetry
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="bg-[#00A09D] px-2 py-0.5 rounded font-bold">Community 18.0</span>
          <span className="text-white/80">admin@srv-doru</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-auto p-3.5">
        {/* CRM Pipeline Tab */}
        {activeTab === 'crm' && (
          <div className="h-full flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-sm text-slate-100">CRM Opportunity Pipeline</h2>
                <div className="text-slate-400 text-[11px] font-mono">
                  Pipeline Value: ${totalPipeline.toLocaleString()} | Won: ${totalWon.toLocaleString()}
                </div>
              </div>
              <button
                onClick={handleAddLead}
                className="bg-[#00A09D] hover:bg-[#008f8c] text-white px-3 py-1.5 rounded font-semibold text-xs transition-colors"
              >
                + New Opportunity
              </button>
            </div>

            {/* Kanban Columns */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 min-h-[320px]">
              {(['new', 'qualified', 'proposition', 'won'] as OdooLead['stage'][]).map((stage) => {
                const stageLeads = leads.filter(l => l.stage === stage);
                const stageTotal = stageLeads.reduce((a, b) => a + b.revenue, 0);

                return (
                  <div key={stage} className="bg-white/[0.03] border border-white/10 rounded-lg p-2.5 flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300">
                        {stage} ({stageLeads.length})
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        ${stageTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                      {stageLeads.map((l) => (
                        <div
                          key={l.id}
                          className="bg-black/50 border border-white/10 hover:border-sky-400/40 p-2.5 rounded shadow-sm flex flex-col gap-1.5 transition-all"
                        >
                          <div className="font-semibold text-slate-100">{l.name}</div>
                          <div className="text-[11px] text-slate-400">{l.contact}</div>
                          <div className="flex justify-between items-center pt-1 border-t border-white/5 font-mono">
                            <span className="text-emerald-400 font-bold">${l.revenue.toLocaleString()}</span>
                            {stage !== 'won' && (
                              <button
                                onClick={() => handleAdvanceStage(l.id)}
                                className="bg-white/10 hover:bg-white/20 text-slate-200 px-2 py-0.5 rounded text-[10px]"
                              >
                                Advance &gt;
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sales & Invoicing Tab */}
        {activeTab === 'sales' && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-sm text-slate-100">Customer Invoices & Billing</h2>
                <div className="text-slate-400 text-[11px] font-mono">
                  Total Billed: $80,100 | Unpaid: $32,900
                </div>
              </div>
              <button
                onClick={() => {
                  const cust = window.prompt('Customer Name:') || 'New Client';
                  const amt = parseFloat(window.prompt('Invoice Amount ($):') || '5000') || 5000;
                  setInvoices(prev => [
                    {
                      id: `INV/2026/00${prev.length + 18}`,
                      customer: cust,
                      date: new Date().toISOString().substring(0, 10),
                      amount: amt,
                      status: 'draft'
                    },
                    ...prev
                  ]);
                  if (onNotify) onNotify(`Drafted invoice for ${cust}`, 'info');
                }}
                className="bg-[#00A09D] hover:bg-[#008f8c] text-white px-3 py-1.5 rounded font-semibold text-xs"
              >
                + Draft Invoice
              </button>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden bg-black/30">
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead className="bg-obsidian-900 border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="py-2 px-3">Number</th>
                    <th className="py-2 px-3">Customer</th>
                    <th className="py-2 px-3">Invoice Date</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const statusBadge =
                      inv.status === 'paid'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : inv.status === 'draft'
                        ? 'text-slate-300 bg-white/10 border-white/20'
                        : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

                    return (
                      <tr key={inv.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                        <td className="py-2 px-3 text-sky-400 font-bold">{inv.id}</td>
                        <td className="py-2 px-3 text-slate-200">{inv.customer}</td>
                        <td className="py-2 px-3 text-slate-400">{inv.date}</td>
                        <td className="py-2 px-3 text-white font-bold">${inv.amount.toLocaleString()}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${statusBadge}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="flex flex-col gap-3">
            <h2 className="font-bold text-sm text-slate-100">Stock & Warehouse Valuation</h2>
            <div className="border border-white/10 rounded-lg overflow-hidden bg-black/30">
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead className="bg-obsidian-900 border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Product Name</th>
                    <th className="py-2 px-3">Location</th>
                    <th className="py-2 px-3">On Hand</th>
                    <th className="py-2 px-3">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr key={item.sku} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                      <td className="py-2 px-3 text-sky-400">{item.sku}</td>
                      <td className="py-2 px-3 text-slate-200">{item.name}</td>
                      <td className="py-2 px-3 text-slate-500">WH/Stock</td>
                      <td className="py-2 px-3 font-bold text-emerald-400">{item.stock} units</td>
                      <td className="py-2 px-3 text-slate-300">{item.unitPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Backend Daemon Telemetry Tab */}
        {activeTab === 'backend' && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <h2 className="font-bold text-sm text-slate-100 font-sans">Odoo 18 Server & PostgreSQL Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <div className="text-slate-400 text-[11px] mb-1">DAEMON STATUS</div>
                <div className="text-emerald-400 font-bold text-sm">active (running)</div>
                <div className="text-slate-500 text-[10px] mt-1">PID: 4120 | Port: 8069</div>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <div className="text-slate-400 text-[11px] mb-1">POSTGRESQL DB</div>
                <div className="text-sky-400 font-bold text-sm">odoo_prod_db</div>
                <div className="text-slate-500 text-[10px] mt-1">Connections: 8/16 pool</div>
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <div className="text-slate-400 text-[11px] mb-1">MEMORY RSS</div>
                <div className="text-amber-400 font-bold text-sm">312.0 MB</div>
                <div className="text-slate-500 text-[10px] mt-1">Uptime: 5 days 11 hours</div>
              </div>
            </div>

            <div className="bg-black/60 border border-white/10 rounded-lg p-3 flex flex-col gap-1 text-[11px] text-slate-300">
              <div className="text-slate-500"># journalctl -u odoo-erp.service -n 5</div>
              <div>[2026-09-25 16:10:02] INFO: odoo.service.server: Worker process 4122 accepted HTTP connection</div>
              <div>[2026-09-25 16:10:02] INFO: odoo.models: crm.lead model query latency: 12ms</div>
              <div>[2026-09-25 16:10:04] INFO: odoo.addons.account: invoice reconciliation check completed: 0 errors</div>
              <div className="text-emerald-400">[2026-09-25 16:10:10] SUCCESS: PostgreSQL WAL sync completed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
