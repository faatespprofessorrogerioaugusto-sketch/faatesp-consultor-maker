import React, { useState } from 'react';
import { useConsulting } from '../../context/ConsultingContext';
import { ConsultingContract } from '../../types';
import {
  FileSignature,
  Printer,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Clock,
  DollarSign,
  ShieldCheck,
  Building,
  UserCheck,
  Eye,
  FileText,
  Download,
} from 'lucide-react';

// Format date to Brazilian standard (dd/mm/aaaa)
const formatDateBR = (dateStr?: string): string => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return dateStr;
};

export const ContractView: React.FC = () => {
  const { currentProjectId, contracts = [], addContract, updateContract, deleteContract, currentProject, clients, settings } = useConsulting();

  const projectContracts = contracts.filter((c) => !c.projectId || c.projectId === currentProjectId);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    projectContracts[0]?.id || null
  );

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

  const selectedContract = projectContracts.find((c) => c.id === selectedContractId) || projectContracts[0];

  const [formData, setFormData] = useState<Omit<ConsultingContract, 'id' | 'projectId'>>({
    title: 'Contrato de Prestação de Serviços de Consultoria Empresarial',
    contractNumber: `CP-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
    contractorFirm: settings.consultingFirmName || 'Consultor Prime Assessoria Empresarial Ltda.',
    contractorCnpj: '48.912.430/0001-92',
    contractorAddress: 'Av. Paulista, 1842 - 14º Andar, São Paulo - SP',
    contractorRep: settings.consultantDefaultName || 'Roberto Andrade',
    contractorRepRole: 'Sócio-Diretor & Consultor Líder',
    clientCompany: currentProject?.clientName || 'Empresa Cliente',
    clientCnpj: '12.345.678/0001-90',
    clientAddress: 'Rua Empresarial, 500 - Centro',
    clientRep: 'Representante Legal',
    clientRepCpf: '000.000.000-00',
    clientRepRole: 'Diretor / Sócio Administrador',
    scope: currentProject?.description || 'Diagnóstico empresarial aprofundado, mapeamento de processos, planejamento estratégico e implantação de melhorias operacionais.',
    methodology: 'Metodologias consagradas de consultoria estratégica, matriz SWOT, Balanced Scorecard (BSC), 5W2H e rituais periódicos de governança.',
    startDate: currentProject?.startDate || new Date().toISOString().split('T')[0],
    durationMonths: 6,
    totalValue: currentProject?.budget || 60000,
    paymentTerms: 'Parcelado em parcelas mensais e sucessivas com vencimento a cada 30 dias após início dos trabalhos.',
    deliverables: [
      'Relatório de Diagnóstico e Matriz de Riscos Operacionais',
      'Plano Estratégico com Metas de Balanced Scorecard (BSC)',
      'Planos de Ação 5W2H detalhados com cronograma',
      'Apresentação executiva final de resultados e apuração de ROI',
    ],
    forumCity: 'São Paulo - SP',
    status: 'active',
    customClauses: 'Cláusula de Confidencialidade e Sigilo (NDA): As partes comprometem-se a manter total sigilo sobre dados financeiros, métricas e estratégias compartilhadas.',
  });

  const handleCreateNewContract = () => {
    const client = clients.find((c) => c.name === currentProject?.clientName);
    const newContractData: Omit<ConsultingContract, 'id' | 'projectId'> = {
      title: `Contrato de Prestação de Serviço - ${currentProject?.name || 'Projeto'}`,
      contractNumber: `CP-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
      contractorFirm: settings.consultingFirmName || 'Consultor Prime Assessoria Empresarial',
      contractorCnpj: '48.912.430/0001-92',
      contractorAddress: 'Av. Paulista, 1842 - 14º Andar, São Paulo - SP',
      contractorRep: settings.consultantDefaultName || 'Consultor Líder',
      contractorRepRole: 'Sócio-Diretor',
      clientCompany: currentProject?.clientName || 'Cliente',
      clientCnpj: '00.000.000/0001-00',
      clientAddress: client?.city ? `${client.city} - Brasil` : 'Endereço da sede',
      clientRep: client?.contactPerson || 'Representante Legal',
      clientRepCpf: '000.000.000-00',
      clientRepRole: client?.role || 'Diretor',
      scope: currentProject?.description || currentProject?.mainObjective || 'Prestação de serviços de consultoria estratégica.',
      methodology: 'Aplicação de diagnósticos, matrizes de riscos, Balanced Scorecard (BSC) e planos de ação 5W2H.',
      startDate: currentProject?.startDate || new Date().toISOString().split('T')[0],
      durationMonths: 6,
      totalValue: currentProject?.budget || 50000,
      paymentTerms: 'Parcelado em parcelas mensais iguais mediante entrega dos relatórios de progresso.',
      deliverables: [
        'Diagnóstico e Mapeamento de Oportunidades',
        'Matriz de Riscos e Balanced Scorecard (BSC)',
        'Planos de Ação 5W2H e Acompanhamento',
        'Relatório Final Executivo',
      ],
      forumCity: client?.city ? `${client.city} - SP` : 'São Paulo - SP',
      status: 'draft',
      customClauses: 'As partes estabelecem estrita confidencialidade sobre todas as informações operacionais.',
    };

    addContract(newContractData);
  };

  const handleEditClick = (c: ConsultingContract) => {
    setFormData({
      title: c.title,
      contractNumber: c.contractNumber,
      contractorFirm: c.contractorFirm,
      contractorCnpj: c.contractorCnpj,
      contractorAddress: c.contractorAddress,
      contractorRep: c.contractorRep,
      contractorRepRole: c.contractorRepRole,
      clientCompany: c.clientCompany,
      clientCnpj: c.clientCnpj,
      clientAddress: c.clientAddress,
      clientRep: c.clientRep,
      clientRepCpf: c.clientRepCpf,
      clientRepRole: c.clientRepRole,
      scope: c.scope,
      methodology: c.methodology,
      startDate: c.startDate,
      durationMonths: c.durationMonths,
      totalValue: c.totalValue,
      paymentTerms: c.paymentTerms,
      deliverables: c.deliverables,
      forumCity: c.forumCity,
      status: c.status,
      customClauses: c.customClauses,
    });
    setSelectedContractId(c.id);
    setActiveTab('edit');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContractId) {
      updateContract(selectedContractId, formData);
      setActiveTab('preview');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Contratos de Consultoria Automáticos
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Gere minutas formais preenchidas com os dados do cliente, escopo, honorários e pré-visualização para impressão/PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold border border-slate-700 transition-all cursor-pointer shadow-sm"
            title="Imprimir contrato ou salvar em PDF"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Imprimir / Salvar PDF</span>
          </button>

          <button
            onClick={handleCreateNewContract}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Contrato</span>
          </button>
        </div>
      </div>

      {/* Contract Selector & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 px-2">
            Contratos:
          </span>
          {projectContracts.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedContractId(c.id);
                setFormData(c);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                (selectedContract?.id === c.id)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{c.contractNumber}</span>
              <span className="opacity-70 text-[10px]">({c.clientCompany})</span>
            </button>
          ))}
        </div>

        {selectedContract && (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pré-visualização (A4)</span>
            </button>
            <button
              onClick={() => handleEditClick(selectedContract)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Cláusulas</span>
            </button>
            <button
              onClick={() => deleteContract(selectedContract.id)}
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Excluir este contrato"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!selectedContract ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <FileSignature className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Nenhum contrato cadastrado para este projeto</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Clique no botão acima para gerar uma minuta de contrato preenchida automaticamente com os dados do cliente e honorários.
          </p>
          <button
            onClick={handleCreateNewContract}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Gerar Contrato Automático
          </button>
        </div>
      ) : activeTab === 'edit' ? (
        /* Edit Form */
        <form onSubmit={handleSaveEdit} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-400" />
              Editar Dados e Cláusulas do Contrato
            </h2>
            <span className="text-xs font-mono text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-800/50">
              {formData.contractNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contratada */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4" /> 1. Dados da Contratada (Sua Consultoria)
              </h3>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Razão Social / Nome Fantasia</label>
                <input
                  type="text"
                  value={formData.contractorFirm}
                  onChange={(e) => setFormData({ ...formData, contractorFirm: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={formData.contractorCnpj}
                    onChange={(e) => setFormData({ ...formData, contractorCnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Representante Legal</label>
                  <input
                    type="text"
                    value={formData.contractorRep}
                    onChange={(e) => setFormData({ ...formData, contractorRep: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Endereço Sede</label>
                <input
                  type="text"
                  value={formData.contractorAddress}
                  onChange={(e) => setFormData({ ...formData, contractorAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            {/* Contratante */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> 2. Dados da Contratante (Cliente)
              </h3>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Empresa / Razão Social</label>
                <input
                  type="text"
                  value={formData.clientCompany}
                  onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">CNPJ / CPF</label>
                  <input
                    type="text"
                    value={formData.clientCnpj}
                    onChange={(e) => setFormData({ ...formData, clientCnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Representante Legal</label>
                  <input
                    type="text"
                    value={formData.clientRep}
                    onChange={(e) => setFormData({ ...formData, clientRep: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Endereço do Cliente</label>
                <input
                  type="text"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Objeto e Escopo */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Objeto e Escopo da Consultoria
              </label>
              <textarea
                rows={3}
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Metodologia Aplicada
              </label>
              <textarea
                rows={2}
                value={formData.methodology}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Valor Total dos Honorários (R$)
                </label>
                <input
                  type="number"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Duração Estimada (Meses)
                </label>
                <input
                  type="number"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Foro da Comarca
                </label>
                <input
                  type="text"
                  value={formData.forumCity}
                  onChange={(e) => setFormData({ ...formData, forumCity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Condições de Pagamento
              </label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Cláusulas Adicionais / Confidencialidade (NDA)
              </label>
              <textarea
                rows={2}
                value={formData.customClauses}
                onChange={(e) => setFormData({ ...formData, customClauses: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md"
            >
              Salvar e Pré-visualizar Contrato
            </button>
          </div>
        </form>
      ) : (
        /* Printable A4 Preview */
        <div
          id="printable-contract-document"
          className="p-8 sm:p-12 bg-white text-slate-900 rounded-2xl shadow-2xl max-w-4xl mx-auto space-y-6 border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {/* Header of Contract */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">
              {selectedContract.contractorFirm}
            </h2>
            <p className="text-xs text-slate-600 mt-1 italic">
              Instrumento Particular de Prestação de Serviços de Consultoria Estratégica & Gestão
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-800 border border-slate-300">
              CONTRATO Nº: {selectedContract.contractNumber}
            </div>
          </div>

          {/* Qualificação das Partes */}
          <div className="text-justify text-sm leading-relaxed space-y-4">
            <p>
              Pelo presente instrumento particular, de um lado:
            </p>
            <p className="pl-4 border-l-2 border-slate-400 bg-slate-50 p-2.5 rounded text-xs">
              <strong>CONTRATADA:</strong> <strong>{selectedContract.contractorFirm}</strong>, inscrita no CNPJ sob o nº <strong>{selectedContract.contractorCnpj}</strong>, com sede em {selectedContract.contractorAddress}, neste ato representada por seu consultor e diretor, <strong>{selectedContract.contractorRep}</strong> ({selectedContract.contractorRepRole});
            </p>
            <p>
              E, de outro lado:
            </p>
            <p className="pl-4 border-l-2 border-slate-400 bg-slate-50 p-2.5 rounded text-xs">
              <strong>CONTRATANTE:</strong> <strong>{selectedContract.clientCompany}</strong>, inscrita no CNPJ sob o nº <strong>{selectedContract.clientCnpj}</strong>, com sede em {selectedContract.clientAddress}, neste ato representada por <strong>{selectedContract.clientRep}</strong>, portador(a) do CPF nº {selectedContract.clientRepCpf}, no cargo de {selectedContract.clientRepRole};
            </p>
            <p>
              Têm, entre si, justo e acordado o presente contrato mediante as seguintes cláusulas:
            </p>

            {/* Cláusulas */}
            <div className="space-y-4 pt-2">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  CLÁUSULA PRIMEIRA – DO OBJETO E ESCOPO
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  1.1. O presente contrato tem por objeto a prestação de serviços técnicos de consultoria empresarial especializada, compreendendo: {selectedContract.scope}
                </p>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  1.2. Metodologia: Os trabalhos serão conduzidos através de: {selectedContract.methodology}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  CLÁUSULA SEGUNDA – DOS ENTREGÁVEIS PRINCIPAIS
                </h4>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1 mt-1">
                  {selectedContract.deliverables.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  CLÁUSULA TERCEIRA – DO PRAZO E VIGÊNCIA
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  3.1. O prazo estimado para a execução dos trabalhos é de <strong>{selectedContract.durationMonths} (meses)</strong>, com início em <strong>{formatDateBR(selectedContract.startDate)}</strong>, podendo ser prorrogado mediante termo aditivo acordado entre as partes.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  CLÁUSULA QUARTA – DOS HONORÁRIOS E CONDIÇÕES DE PAGAMENTO
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  4.1. Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor global de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedContract.totalValue)}</strong>.
                </p>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  4.2. Condições: {selectedContract.paymentTerms}
                </p>
              </div>

              {selectedContract.customClauses && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    CLÁUSULA QUINTA – DO SIGILO E CONFIDENCIALIDADE (NDA)
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    5.1. {selectedContract.customClauses}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  CLÁUSULA SEXTA – DO FORO
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  6.1. Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o Foro da Comarca de <strong>{selectedContract.forumCity}</strong>, com renúncia expressa a qualquer outro.
                </p>
              </div>
            </div>

            <p className="pt-4 text-xs text-slate-600 text-center">
              E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma.
            </p>

            {/* Local e Data */}
            <div className="text-center text-xs text-slate-700 font-semibold pt-4">
              {selectedContract.forumCity}, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
            </div>

            {/* Assinaturas */}
            <div className="grid grid-cols-2 gap-8 pt-10 pb-4">
              <div className="text-center">
                <div className="border-t border-slate-900 pt-2 text-xs">
                  <p className="font-bold text-slate-900">{selectedContract.contractorRep}</p>
                  <p className="text-slate-600">{selectedContract.contractorFirm}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">CONTRATADA</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-900 pt-2 text-xs">
                  <p className="font-bold text-slate-900">{selectedContract.clientRep}</p>
                  <p className="text-slate-600">{selectedContract.clientCompany}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">CONTRATANTE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
