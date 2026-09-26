const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} = require('docx');
const PDFDocument = require('pdfkit');

const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// ----------------------------------------------------
// 1. GENERATE DOCX
// ----------------------------------------------------
async function generateDocx() {
  const PRIMARY_COLOR = '1E3A8A'; // Deep Navy
  const SECONDARY_COLOR = '2563EB'; // Blue
  const TEXT_MUTED = '64748B'; // Slate 500
  const HEADER_BG = 'F1F5F9'; // Slate 100
  const BORDER_COLOR = 'CBD5E1'; // Slate 300

  function createCell(text, bold = false, fill = undefined, widthPercent = undefined) {
    return new TableCell({
      width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
      shading: fill ? { fill } : undefined,
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
        left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
        right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold,
              size: 20,
              font: 'Calibri',
            }),
          ],
        }),
      ],
    });
  }

  function sectionHeading(title) {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 120 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 10, color: PRIMARY_COLOR },
        },
        children: [
          new TextRun({
            text: title,
            bold: true,
            color: PRIMARY_COLOR,
            size: 26,
            font: 'Calibri',
          }),
        ],
      }),
    ];
  }

  function subHeading(title) {
    return [
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            color: SECONDARY_COLOR,
            size: 22,
            font: 'Calibri',
          }),
        ],
      }),
    ];
  }

  function stepParagraph(stepNum, title, desc) {
    return new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [
        new TextRun({ text: `${stepNum}. ${title}: `, bold: true, size: 21, font: 'Calibri' }),
        new TextRun({ text: desc, size: 21, font: 'Calibri' }),
      ],
    });
  }

  function bodyParagraph(text) {
    return new Paragraph({
      spacing: { before: 60, after: 80 },
      children: [new TextRun({ text, size: 21, font: 'Calibri' })],
    });
  }

  const docChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 80 },
      children: [
        new TextRun({
          text: 'CONSULTHUB ASSESSORIA & GESTÃO EMPRESARIAL',
          bold: true,
          color: SECONDARY_COLOR,
          size: 20,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 120 },
      children: [
        new TextRun({
          text: 'MANUAL DE UTILIZAÇÃO PASSO A PASSO',
          bold: true,
          color: PRIMARY_COLOR,
          size: 34,
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 300 },
      children: [
        new TextRun({
          text: 'Instruções Práticas e Sequenciais de Operação de Todos os Módulos do Sistema',
          italics: true,
          color: TEXT_MUTED,
          size: 22,
          font: 'Calibri',
        }),
      ],
    }),

    ...sectionHeading('PRÉ-REQUISITO FUNDAMENTAL: SELEÇÃO DO PROJETO ATIVO'),
    bodyParagraph(
      'Todas as ferramentas da plataforma (SWOT, 5W2H, Riscos, Gantt, BSC, etc.) são vinculadas a um projeto específico. Antes de qualquer lançamento, certifique-se de que o projeto correto está ativo.'
    ),
    stepParagraph('Passo 1', 'Localizar o seletor', 'No topo superior direito ou no cabeçalho dos módulos, localize o campo "Projeto Ativo".'),
    stepParagraph('Passo 2', 'Selecionar o projeto', 'Clique no menu suspenso e escolha o projeto no qual deseja trabalhar. A tela atualizará instantaneamente com os dados salvos para aquele cliente.'),

    ...sectionHeading('MÓDULO 1: CADASTRO DE CLIENTES'),
    bodyParagraph('Finalidade: Registrar as empresas atendidas pela consultoria e seus contatos principais.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Cadastro de Clientes" (seção CLIENTES).'),
    stepParagraph('Passo 2', 'Iniciar cadastro', 'Clique no botão azul "Novo Cliente" localizado no canto superior direito.'),
    stepParagraph('Passo 3', 'Preencher o formulário', 'Insira os campos obrigatórios: Nome da Empresa (Razão Social ou Fantasia), Pessoa de Contato, Cargo, E-mail, Telefone, Cidade/Estado, Segmento de Atuação e Origem do Relacionamento (ex: Indicação, Prospecção Ativa).'),
    stepParagraph('Passo 4', 'Salvar', 'Clique em "Salvar Cliente". O cliente aparecerá na listagem e estará disponível para associação com novos projetos.'),

    ...sectionHeading('MÓDULO 2: PROJETOS DE CONSULTORIA'),
    bodyParagraph('Finalidade: Criar e gerenciar os projetos contratados, vinculando cliente, consultor e prazos.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Projetos de consultoria".'),
    stepParagraph('Passo 2', 'Iniciar projeto', 'Clique no botão azul "Novo Projeto".'),
    stepParagraph('Passo 3', 'Preencher parâmetros', 'Selecione o Cliente cadastrado no menu suspenso, defina o Nome do Projeto, o Objetivo Principal, o Consultor Líder responsável, Data de Início, Previsão de Conclusão e o Orçamento Total (R$).'),
    stepParagraph('Passo 4', 'Confirmar criação', 'Clique em "Salvar Projeto". O projeto agora pode ser selecionado como o projeto ativo no topo da tela.'),

    ...sectionHeading('MÓDULO 3: PLANO DE CONSULTORIA'),
    bodyParagraph('Finalidade: Estruturar o plano diretor da consultoria com objetivos, metodologia e fases.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Plano de Consultoria".'),
    stepParagraph('Passo 2', 'Definir escopo e metodologia', 'Preencha o diagnóstico preliminar, a justificativa da intervenção e a metodologia aplicada.'),
    stepParagraph('Passo 3', 'Mapear as fases', 'Defina as etapas de execução (Diagnóstico, Planejamento, Execução e Encerramento) com os respectivos prazos.'),
    stepParagraph('Passo 4', 'Salvar diretrizes', 'Clique no botão de salvar para homologar o plano de trabalho.'),

    ...sectionHeading('MÓDULO 4: CONTRATO DE PRESTAÇÃO DE SERVIÇOS'),
    bodyParagraph('Finalidade: Gerar e administrar o contrato comercial formal e a lista de entregáveis acordados.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Contrato de Prestação de Serviços".'),
    stepParagraph('Passo 2', 'Cadastrar ou editar contrato', 'Clique em "Criar Contrato" ou selecione o contrato existente do projeto ativo.'),
    stepParagraph('Passo 3', 'Inserir dados formais', 'Preencha Número do Contrato, Razão Social da Contratada e Contratante, CNPJ, Duração em Meses e Valor Total.'),
    stepParagraph('Passo 4', 'Cadastrar entregáveis', 'No campo "Entregáveis Contratuais", adicione cada produto formal esperado (ex: Relatório de Diagnóstico, Mapeamento de Processos, Plano 5W2H).'),
    stepParagraph('Passo 5', 'Definir status', 'Atualize o status conforme a fase atual: Rascunho, Em Revisão, Assinado ou Ativo, e clique em "Salvar".'),

    ...sectionHeading('MÓDULO 5: SIMULADOR DE REUNIÃO'),
    bodyParagraph('Finalidade: Planejar reuniões com o cliente, antecipar objeções e registrar atas formais.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Simulador de Reunião".'),
    stepParagraph('Passo 2', 'Criar simulação de reunião', 'Clique em "Nova Reunião". Defina o Título da Reunião, Data, Duração em Minutos e Participantes presentes.'),
    stepParagraph('Passo 3', 'Definir perfil do cliente', 'Selecione a postura esperada do cliente: Receptivo, Cético, Exigente ou Colaborativo.'),
    stepParagraph('Passo 4', 'Montar a pauta e preparar respostas', 'Adicione os tópicos da pauta com tempo alocado e cadastre as possíveis objeções do cliente acompanhadas das respostas recomendadas.'),
    stepParagraph('Passo 5', 'Registrar deliberações', 'Ao término da reunião, preencha as notas e decisões acordadas e clique em "Salvar Reunião".'),

    ...sectionHeading('MÓDULO 6: COMO CRIAR E GERENCIAR A MATRIZ SWOT (PASSO A PASSO)'),
    bodyParagraph('Finalidade: Mapear Forças, Fraquezas, Oportunidades e Ameaças da organização.'),
    stepParagraph('Passo 1', 'Entrar na tela SWOT', 'No menu lateral, clique em "Análise SWOT" (na seção FERRAMENTAS DE DIAGNÓSTICOS).'),
    stepParagraph('Passo 2', 'Iniciar novo item', 'Clique no botão azul "+ Adicionar Fator" no topo ou clique no ícone "+" dentro do quadrante desejado (Forças, Fraquezas, Oportunidades ou Ameaças).'),
    stepParagraph('Passo 3', 'Selecionar o quadrante', 'Escolha a Categoria: Forças (Fatores internos positivos), Fraquezas (Fatores internos a melhorar), Oportunidades (Cenários externos favoráveis) ou Ameaças (Riscos externos).'),
    stepParagraph('Passo 4', 'Descrever o fator', 'No campo "Fator Estratégico", insira um título objetivo (ex: "Marca consolidada no mercado regional"). No campo "Descrição", detalhe o contexto e evidências.'),
    stepParagraph('Passo 5', 'Definir impacto e prioridade', 'Ajuste a régua de Impacto de 1 a 5 (onde 5 é o maior impacto nos resultados) e determine a Prioridade (Alta, Média ou Baixa).'),
    stepParagraph('Passo 6', 'Atribuir responsável', 'Indique o consultor ou líder encarregado de acompanhar aquele ponto.'),
    stepParagraph('Passo 7', 'Salvar', 'Clique em "Salvar Item". O card será posicionado no quadrante respectivo.'),
    stepParagraph('Passo 8', 'Editar ou Excluir', 'Para editar um item cadastrado, passe o mouse sobre o card e clique no ícone de Lápis. Para remover, clique no ícone de Lixeira e confirme.'),

    ...sectionHeading('MÓDULO 7: DIAGRAMA DE PARETO (REGRA 80/20)'),
    bodyParagraph('Finalidade: Identificar e priorizar as poucas causas vitais que respondem pela maior parte dos custos e perdas.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Diagrama de Pareto".'),
    stepParagraph('Passo 2', 'Adicionar ocorrência', 'Clique no botão "Adicionar Causa / Ocorrência".'),
    stepParagraph('Passo 3', 'Preencher dados', 'Insira o Nome da Categoria (ex: "Atraso no faturamento"), o Número de Ocorrências (quantidade) e o Custo Estimado (R$) associado.'),
    stepParagraph('Passo 4', 'Salvar', 'Clique em "Salvar". O sistema recalcula automaticamente a curva ABC acumulada e plota o gráfico de barras com a linha percentual de 80/20.'),

    ...sectionHeading('MÓDULO 8: MATRIZ DE RISCOS'),
    bodyParagraph('Finalidade: Identificar vulnerabilidades do projeto e planejar ações preventivas e contingenciais.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Matriz de Riscos".'),
    stepParagraph('Passo 2', 'Criar novo risco', 'Clique no botão azul "Novo Risco".'),
    stepParagraph('Passo 3', 'Identificar o risco', 'Preencha a descrição do Risco, Categoria (Operacional, Financeiro, Tecnológico, Legal, Estratégico) e Causa Provável.'),
    stepParagraph('Passo 4', 'Graduar severidade', 'Selecione a Probabilidade (de 1 - Muito Baixa a 5 - Quase Certa) e o Impacto (de 1 - Insignificante a 5 - Catastrófico). O sistema calculará o Risk Score (Probabilidade x Impacto) e classificará como Baixo, Moderado, Alto ou Crítico.'),
    stepParagraph('Passo 5', 'Elaborar planos', 'Preencha o campo "Ação Preventiva" (o que fazer para o risco não ocorrer) e o "Plano de Contingência" (o que fazer caso ocorra).'),
    stepParagraph('Passo 6', 'Salvar', 'Clique em "Salvar Risco". O risco será inserido na tabela e posicionado na matriz de calor visual.'),

    ...sectionHeading('MÓDULO 9: DIAGRAMA DE GANTT (CRONOGRAMA DE ENTREGAS)'),
    bodyParagraph('Finalidade: Controlar o cronograma de atividades e marcos contratuais da consultoria.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Diagrama de Gantt" (seção FERRAMENTAS DE PLANEJAMENTO).'),
    stepParagraph('Passo 2', 'Criar nova tarefa', 'Clique no botão "Nova Tarefa".'),
    stepParagraph('Passo 3', 'Configurar prazos e responsáveis', 'Insira o Nome da Tarefa, a Fase/Etapa, a Data de Início e a Data de Término.'),
    stepParagraph('Passo 4', 'Definir responsável e progresso', 'Selecione o Responsável nominal e preencha o percentual inicial de conclusão (0 a 100%). Marque se a tarefa é um Marco Contratual (Milestone).'),
    stepParagraph('Passo 5', 'Salvar', 'Clique em "Salvar Tarefa". A barra visual correspondente será gerada na linha do tempo.'),

    ...sectionHeading('MÓDULO 10: BALANCED SCORECARD (BSC)'),
    bodyParagraph('Finalidade: Desdobrar a estratégia em objetivos concretos distribuídos em 4 perspectivas.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Balanced Scorecard (BSC)".'),
    stepParagraph('Passo 2', 'Criar novo objetivo', 'Clique em "+ Novo Objetivo BSC".'),
    stepParagraph('Passo 3', 'Escolher a perspectiva', 'Selecione: 1. Financeira, 2. Clientes & Mercado, 3. Processos Internos ou 4. Aprendizado & Crescimento.'),
    stepParagraph('Passo 4', 'Inserir dados estratégicos', 'Preencha o Nome do Objetivo, o Indicador (KPI), o Valor Realizado Atual, a Meta Numérica e a Unidade de Medida (ex: %, R$, Dias).'),
    stepParagraph('Passo 5', 'Vincular iniciativa', 'No campo "Iniciativas", descreva a ação prática necessária para atingir a meta.'),
    stepParagraph('Passo 6', 'Salvar', 'Clique em "Salvar Objetivo". O indicador atualizará o painel de acompanhamento com as faixas de status (No Prazo, Atenção, Crítico ou Alcançado).'),

    ...sectionHeading('MÓDULO 11: COMO CRIAR E GERENCIAR O PLANO DE AÇÃO (5W2H) PASSO A PASSO'),
    bodyParagraph('Finalidade: Estabelecer o plano de ação operacional detalhado com todas as 7 perguntas fundamentais.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, vá na seção CULTURA ORGANIZACIONAL e clique em "Plano de Ação (5W2H)".'),
    stepParagraph('Passo 2', 'Abrir modal de criação', 'Clique no botão azul "Nova Ação 5W2H" no canto superior direito.'),
    stepParagraph('Passo 3', 'Preencher o What (O que)', 'No campo "O que será feito?", escreva a ação com verbo no infinitivo (ex: "Implantar conferência por código de barras no estoque").'),
    stepParagraph('Passo 4', 'Preencher o Why (Por que)', 'No campo "Por que será feito?", descreva a justificativa (ex: "Eliminar divergências de inventário e erros de expedição").'),
    stepParagraph('Passo 5', 'Preencher o Where (Onde)', 'No campo "Onde será feito?", defina a localização ou setor (ex: "Galpão Logístico - Centro de Distribuição").'),
    stepParagraph('Passo 6', 'Preencher o When (Quando)', 'Selecione a Data Limite de conclusão da ação no calendário.'),
    stepParagraph('Passo 7', 'Preencher o Who (Quem)', 'Indique o nome do líder responsável direto pela execução e prestação de contas.'),
    stepParagraph('Passo 8', 'Preencher o How (Como)', 'Detalhe o método prático ou procedimento técnico (ex: "Configurar coletores RF e treinar operadores").'),
    stepParagraph('Passo 9', 'Preencher o How Much (Quanto)', 'Informe o custo financeiro total estimado em reais (R$) para realizar a ação.'),
    stepParagraph('Passo 10', 'Prioridade e Status', 'Defina a Prioridade (Baixa, Média, Alta, Crítica) e o Status inicial (Não iniciada ou Em andamento).'),
    stepParagraph('Passo 11', 'Salvar', 'Clique no botão "Salvar Ação". A nova linha será adicionada à tabela de ações com formatação automática.'),
    stepParagraph('Passo 12', 'Como Duplicar uma Ação', 'Na tabela de ações, localize a ação e clique no ícone de Folhas Sobrepostas (Duplicar). Uma cópia idêntica com identificação "(Cópia)" será criada para facilitar o desdobramento de ações parecidas.'),
    stepParagraph('Passo 13', 'Como Editar ou Concluir', 'Para alterar prazo, responsável ou progresso, clique no ícone de Lápis (Editar). Você também pode alterar o status diretamente pelo menu de status da tabela.'),
    stepParagraph('Passo 14', 'Como Excluir uma Ação', 'Clique no ícone de Lixeira na linha da ação. Uma janela de confirmação de segurança será exibida solicitando confirmação antes da exclusão definitiva.'),

    ...sectionHeading('MÓDULO 12: PESQUISA DE CLIMA ORGANIZACIONAL'),
    bodyParagraph('Finalidade: Apurar o índice de satisfação interna dos colaboradores e calcular o eNPS.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Pesquisa de Clima Organizacional".'),
    stepParagraph('Passo 2', 'Criar novo ciclo', 'Clique em "Novo Ciclo de Pesquisa". Defina o Título e o Período.'),
    stepParagraph('Passo 3', 'Informar respondentes', 'Preencha o Total de Colaboradores Elegíveis e o Número de Respondentes Efetivos.'),
    stepParagraph('Passo 4', 'Apurar notas e eNPS', 'Insira as notas nas 7 dimensões (Liderança, Comunicação, Ambiente, Reconhecimento, Autonomia, Alinhamento e Bem-estar) e registre a quantidade de Promotores (9-10) e Detratores (0-6). O sistema calcula automaticamente o percentual e o eNPS score.'),
    stepParagraph('Passo 5', 'Salvar', 'Clique em "Salvar Pesquisa" para consolidar o diagnóstico de clima.'),

    ...sectionHeading('MÓDULO 13: RELATÓRIOS EXECUTIVOS & EXPORTAÇÃO'),
    bodyParagraph('Finalidade: Gerar o dossiê formal do projeto para entrega ao cliente nos formatos PDF e DOCX.'),
    stepParagraph('Passo 1', 'Acessar o módulo', 'No menu lateral, clique em "Relatórios Executivos" (na seção Consolidação & Ajustes).'),
    stepParagraph('Passo 2', 'Selecionar módulos incluídos', 'Nas caixas de seleção, marque quais seções você deseja que apareçam no documento final (Sumário, Contrato, Reuniões, BSC, SWOT, 5W2H, Gantt, Riscos, Pareto, Pesquisa de Clima).'),
    stepParagraph('Passo 3', 'Redigir o parecer', 'Edite o campo "Parecer Geral do Consultor" e as "Recomendações Estratégicas Prioritárias".'),
    stepParagraph('Passo 4', 'Exportar em Word (DOCX)', 'Clique no botão azul "Exportar DOCX (Word)". O arquivo nativo .docx será gerado e baixado automaticamente no seu computador.'),
    stepParagraph('Passo 5', 'Exportar em PDF', 'Clique no botão "Exportar PDF / Imprimir". Na janela de impressão do navegador, selecione "Salvar como PDF" no campo Destino para gerar o PDF em folha A4 com cabeçalhos e folha de assinaturas.'),
    stepParagraph('Passo 6', 'Exportar em Planilha (CSV)', 'Clique em "Exportar Planilha (CSV)" para baixar os dados tabulados em formato compatível com Excel.'),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'ConsultHub • Manual Passo a Passo de Utilização',
                    size: 16,
                    color: TEXT_MUTED,
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Página ', size: 16, color: TEXT_MUTED, font: 'Calibri' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: TEXT_MUTED, font: 'Calibri' }),
                  new TextRun({ text: ' de ', size: 16, color: TEXT_MUTED, font: 'Calibri' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: TEXT_MUTED, font: 'Calibri' }),
                ],
              }),
            ],
          }),
        },
        children: docChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const docxPath = path.join(publicDir, 'Manual_de_Utilizacao_ConsultHub.docx');
  fs.writeFileSync(docxPath, buffer);
  console.log('DOCX manual updated at:', docxPath);
}

// ----------------------------------------------------
// 2. GENERATE PDF
// ----------------------------------------------------
function generatePdf() {
  return new Promise((resolve, reject) => {
    const pdfPath = path.join(publicDir, 'Manual_de_Utilizacao_ConsultHub.pdf');
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      info: {
        Title: 'Manual de Utilização Passo a Passo - ConsultHub',
        Author: 'ConsultHub Assessoria Empresarial',
      },
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    const primaryColor = '#1E3A8A';
    const secondaryColor = '#2563EB';
    const textColor = '#1E293B';
    const mutedColor = '#64748B';

    doc.fontSize(10).fillColor(secondaryColor).font('Helvetica-Bold').text('CONSULTHUB ASSESSORIA & GESTÃO EMPRESARIAL', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(16).fillColor(primaryColor).font('Helvetica-Bold').text('MANUAL DE UTILIZAÇÃO PASSO A PASSO', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(9.5).fillColor(mutedColor).font('Helvetica-Oblique').text('Instruções Práticas e Sequenciais de Operação de Todos os Módulos', { align: 'center' });
    doc.moveDown(1.2);

    function addSection(title) {
      doc.moveDown(0.6);
      doc.fontSize(11).fillColor(primaryColor).font('Helvetica-Bold').text(title);
      doc.strokeColor(primaryColor).lineWidth(0.8).moveTo(doc.x, doc.y + 2).lineTo(doc.page.width - 40, doc.y + 2).stroke();
      doc.moveDown(0.4);
    }

    function addStep(stepNum, stepTitle, stepDesc) {
      doc.fontSize(8.8).fillColor(textColor).font('Helvetica-Bold').text(`${stepNum}. ${stepTitle}: `, { continued: true });
      doc.font('Helvetica').text(stepDesc);
      doc.moveDown(0.25);
    }

    function addIntro(text) {
      doc.fontSize(8.8).fillColor(mutedColor).font('Helvetica-Oblique').text(text);
      doc.moveDown(0.3);
    }

    addSection('PRÉ-REQUISITO FUNDAMENTAL: SELEÇÃO DO PROJETO ATIVO');
    addStep('Passo 1', 'Localizar seletor', 'No canto superior direito ou no cabeçalho dos módulos, localize o campo "Projeto Ativo".');
    addStep('Passo 2', 'Selecionar projeto', 'Selecione o projeto no menu suspenso. Todas as ferramentas passarão a exibir e salvar dados vinculados a este cliente.');

    addSection('MÓDULO 1: CADASTRO DE CLIENTES');
    addIntro('Finalidade: Registrar as empresas atendidas pela consultoria e seus contatos.');
    addStep('Passo 1', 'Acessar menu', 'No menu lateral esquerdo, clique em "Cadastro de Clientes" (seção CLIENTES).');
    addStep('Passo 2', 'Novo cadastro', 'Clique no botão azul "Novo Cliente" no canto superior direito.');
    addStep('Passo 3', 'Preencher campos', 'Insira Nome da Empresa, Contato, Cargo, E-mail, Telefone, Cidade e Segmento de Atuação.');
    addStep('Passo 4', 'Salvar', 'Clique em "Salvar Cliente" para gravar o registro.');

    addSection('MÓDULO 2: PROJETOS DE CONSULTORIA');
    addIntro('Finalidade: Criar os projetos contratados, vinculando cliente, consultor e orçamento.');
    addStep('Passo 1', 'Acessar menu', 'No menu lateral, clique em "Projetos de consultoria".');
    addStep('Passo 2', 'Novo projeto', 'Clique no botão azul "Novo Projeto".');
    addStep('Passo 3', 'Preencher dados', 'Selecione o Cliente, informe Nome do Projeto, Objetivo Principal, Consultor Líder, Prazos e Orçamento (R$).');
    addStep('Passo 4', 'Salvar', 'Clique em "Salvar Projeto". O projeto agora pode ser ativado na barra superior.');

    addSection('MÓDULO 3: PLANO DE CONSULTORIA');
    addIntro('Finalidade: Formalizar a metodologia, fases e diagnóstico preliminar do projeto.');
    addStep('Passo 1', 'Acessar menu', 'Clique em "Plano de Consultoria" no menu lateral.');
    addStep('Passo 2', 'Estruturar etapas', 'Preencha o escopo das fases (Diagnóstico, Planejamento, Execução, Encerramento) e salve.');

    addSection('MÓDULO 4: CONTRATO DE PRESTAÇÃO DE SERVIÇOS');
    addIntro('Finalidade: Administrar os termos comerciais, valor global e entregáveis contratuais.');
    addStep('Passo 1', 'Acessar menu', 'Clique em "Contrato de Prestação de Serviços".');
    addStep('Passo 2', 'Novo contrato', 'Clique em "Criar Contrato", preencha Razão Social, CNPJ, Duração em meses e Valor Total.');
    addStep('Passo 3', 'Cadastrar entregáveis', 'Adicione cada entrega formal esperada (ex: Relatório de Diagnóstico, Mapeamento).');
    addStep('Passo 4', 'Definir status e salvar', 'Alterne o status (Rascunho, Assinado, Ativo) e clique em "Salvar".');

    addSection('MÓDULO 5: SIMULADOR DE REUNIÃO');
    addIntro('Finalidade: Planejar encontros com clientes, prever posturas e registrar atas formais.');
    addStep('Passo 1', 'Acessar menu', 'Clique em "Simulador de Reunião" no menu lateral.');
    addStep('Passo 2', 'Criar reunião', 'Clique em "Nova Reunião", informe Título, Data, Duração e Participantes.');
    addStep('Passo 3', 'Simular perfil', 'Selecione a postura do cliente (Receptivo, Cético, Exigente ou Colaborativo) e monte a pauta com objeções.');
    addStep('Passo 4', 'Salvar atas', 'Preencha as deliberações finais e clique em "Salvar Reunião".');

    addSection('MÓDULO 6: COMO CRIAR UMA MATRIZ SWOT (PASSO A PASSO)');
    addIntro('Finalidade: Mapear Forças, Fraquezas, Oportunidades e Ameaças da organização.');
    addStep('Passo 1', 'Acessar tela SWOT', 'No menu lateral, clique em "Análise SWOT" (seção FERRAMENTAS DE DIAGNÓSTICOS).');
    addStep('Passo 2', 'Adicionar item', 'Clique no botão azul "+ Adicionar Fator" no topo ou no ícone "+" dentro do quadrante desejado.');
    addStep('Passo 3', 'Escolher quadrante', 'Selecione: Forças, Fraquezas, Oportunidades ou Ameaças.');
    addStep('Passo 4', 'Preencher o fator', 'Informe o título do Fator Estratégico e descreva o contexto e justificativa no campo Descrição.');
    addStep('Passo 5', 'Impacto e Prioridade', 'Ajuste a régua de Impacto (1 a 5) e escolha a Prioridade (Alta, Média ou Baixa).');
    addStep('Passo 6', 'Salvar', 'Clique em "Salvar Item". O item surgirá imediatamente dentro do quadrante correto.');
    addStep('Passo 7', 'Editar/Excluir', 'Passe o cursor sobre o card e clique no ícone de Lápis para alterar ou no ícone de Lixeira para excluir.');

    addSection('MÓDULO 7: DIAGRAMA DE PARETO (REGRA 80/20)');
    addIntro('Finalidade: Priorizar causas vitais por volume e custos acumulados.');
    addStep('Passo 1', 'Acessar menu', 'Clique em "Diagrama de Pareto" no menu lateral.');
    addStep('Passo 2', 'Cadastrar causa', 'Clique em "Adicionar Causa / Ocorrência", preencha Categoria, Ocorrências e Custo (R$).');
    addStep('Passo 3', 'Visualizar', 'Clique em Salvar. O sistema atualiza o gráfico com a linha de corte de 80%.');

    addSection('MÓDULO 8: MATRIZ DE RISCOS');
    addIntro('Finalidade: Mapear vulnerabilidades com cálculo de probabilidade e impacto.');
    addStep('Passo 1', 'Acessar menu', 'Clique em "Matriz de Riscos" no menu lateral.');
    addStep('Passo 2', 'Novo risco', 'Clique em "Novo Risco", descreva a ameaça e a categoria.');
    addStep('Passo 3', 'Graduar severidade', 'Defina Probabilidade (1 a 5) e Impacto (1 a 5). O Risk Score será calculado automaticamente.');
    addStep('Passo 4', 'Planos e salvar', 'Preencha Ação Preventiva e Plano de Contingência e clique em "Salvar Risco".');

    addSection('MÓDULO 9: DIAGRAMA DE GANTT');
    addIntro('Finalidade: Cronograma em linha do tempo das tarefas e entregas.');
    addStep('Passo 1', 'Acessar menu', 'Clique em "Diagrama de Gantt" no menu lateral.');
    addStep('Passo 2', 'Nova tarefa', 'Clique em "Nova Tarefa", preencha Nome, Início, Fim, Responsável e Progresso (0 a 100%).');
    addStep('Passo 3', 'Salvar', 'Clique em "Salvar Tarefa" para atualizar as barras de execução.');

    addSection('MÓDULO 10: BALANCED SCORECARD (BSC)');
    addIntro('Finalidade: Estruturar objetivos nas 4 perspectivas estratégicas.');
    addStep('Passo 1', 'Acessar menu', 'Clique em "Balanced Scorecard (BSC)" no menu lateral.');
    addStep('Passo 2', 'Novo objetivo', 'Clique em "+ Novo Objetivo BSC".');
    addStep('Passo 3', 'Preencher dados', 'Escolha a Perspectiva (Financeira, Clientes, Processos ou Aprendizado), KPI, Realizado Atual e Meta.');
    addStep('Passo 4', 'Salvar', 'Clique em "Salvar Objetivo" para acompanhar a barra de progresso e status.');

    addSection('MÓDULO 11: COMO CRIAR UM PLANO DE AÇÃO (5W2H) PASSO A PASSO');
    addIntro('Finalidade: Quadro de execução tática com as 7 dimensões operacionais.');
    addStep('Passo 1', 'Acessar tela 5W2H', 'No menu lateral, seção CULTURA ORGANIZACIONAL, clique em "Plano de Ação (5W2H)".');
    addStep('Passo 2', 'Nova ação', 'Clique no botão azul "Nova Ação 5W2H" no canto superior direito.');
    addStep('Passo 3', 'Preencher What (O que)', 'Escreva a ação prática com clareza (ex: "Instalar sistema de controle de ponto biométrico").');
    addStep('Passo 4', 'Preencher Why (Por que)', 'Descreva a motivação estratégica ou problema a sanar.');
    addStep('Passo 5', 'Preencher Where (Onde)', 'Informe o local, setor ou filial de execução.');
    addStep('Passo 6', 'Preencher When (Quando)', 'Selecione a data limite improrrogável no calendário.');
    addStep('Passo 7', 'Preencher Who (Quem)', 'Indique nominalmente o responsável pela entrega.');
    addStep('Passo 8', 'Preencher How (Como)', 'Detalhe o método prático ou procedimento a ser adotado.');
    addStep('Passo 9', 'Preencher How Much (Quanto)', 'Informe o custo estimado em reais (R$) para viabilizar a ação.');
    addStep('Passo 10', 'Prioridade e status', 'Defina a Prioridade (Baixa, Média, Alta, Crítica) e o Status inicial (Não iniciada ou Em andamento).');
    addStep('Passo 11', 'Salvar', 'Clique no botão "Salvar Ação". A nova linha será adicionada à tabela de ações.');
    addStep('Passo 12', 'Como Duplicar', 'Na tabela, clique no ícone de Folhas Sobrepostas (Duplicar) para criar uma cópia rápida da ação.');
    addStep('Passo 13', 'Como Editar/Concluir', 'Clique no ícone de Lápis para alterar dados ou altere o status diretamente na coluna Status.');
    addStep('Passo 14', 'Como Excluir', 'Clique no ícone de Lixeira na linha da ação e confirme na caixa de diálogo de segurança.');

    addSection('MÓDULO 12: PESQUISA DE CLIMA ORGANIZACIONAL');
    addIntro('Finalidade: Apuração de satisfação interna e cálculo de eNPS.');
    addStep('Passo 1', 'Acessar menu', 'Clique em "Pesquisa de Clima Organizacional" no menu lateral.');
    addStep('Passo 2', 'Criar ciclo', 'Clique em "Novo Ciclo de Pesquisa", informe Total de Colaboradores e Respondentes.');
    addStep('Passo 3', 'Apurar dimensões', 'Cadastre as notas das 7 dimensões e a quantidade de Promotores/Detratores para apuração do eNPS.');
    addStep('Passo 4', 'Salvar', 'Clique em "Salvar Pesquisa".');

    addSection('MÓDULO 13: RELATÓRIOS EXECUTIVOS & EXPORTAÇÃO');
    addIntro('Finalidade: Gerar o dossiê formal de entrega do projeto para o cliente.');
    addStep('Passo 1', 'Acessar menu', 'Clique em "Relatórios Executivos" no menu lateral.');
    addStep('Passo 2', 'Selecionar módulos', 'Marque as caixas de seleção correspondentes aos módulos que devem constar no relatório.');
    addStep('Passo 3', 'Redigir parecer', 'Preencha o Parecer Geral da Consultoria e as Recomendações Estratégicas.');
    addStep('Passo 4', 'Exportar DOCX (Word)', 'Clique no botão "Exportar DOCX (Word)" para baixar o documento nativo do Word totalmente editável.');
    addStep('Passo 5', 'Exportar PDF', 'Clique em "Exportar PDF / Imprimir" e selecione "Salvar como PDF" no diálogo de impressão.');
    addStep('Passo 6', 'Exportar CSV', 'Clique em "Exportar Planilha (CSV)" para baixar os dados tabulados para Excel.');

    doc.end();

    stream.on('finish', () => {
      console.log('PDF manual updated at:', pdfPath);
      resolve(pdfPath);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  await generateDocx();
  await generatePdf();
  console.log('Finished updating manual files in /public!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
