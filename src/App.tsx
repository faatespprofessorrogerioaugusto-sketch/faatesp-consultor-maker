import React from 'react';
import { ConsultingProvider, useConsulting } from './context/ConsultingContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { LoginView } from './components/auth/LoginView';

// Views
import { DashboardView } from './components/views/DashboardView';
import { ProjectsView } from './components/views/ProjectsView';
import { ClientsView } from './components/views/ClientsView';
import { BSCView } from './components/views/BSCView';
import { ContractView } from './components/views/ContractView';
import { MeetingSimulatorView } from './components/views/MeetingSimulatorView';
import { SwotView } from './components/views/SwotView';
import { GanttView } from './components/views/GanttView';
import { Action5W2HView } from './components/views/Action5W2HView';
import { RiskMatrixView } from './components/views/RiskMatrixView';
import { ParetoView } from './components/views/ParetoView';
import { ClimateSurveyView } from './components/views/ClimateSurveyView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

const MainContent: React.FC = () => {
  const { activeModule, currentUser } = useConsulting();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardView />;
      case 'projects':
        return <ProjectsView />;
      case 'clients':
        return <ClientsView />;
      case 'bsc':
        return <BSCView />;
      case 'contract':
        return <ContractView />;
      case 'meeting':
        return <MeetingSimulatorView />;
      case 'swot':
        return <SwotView />;
      case 'gantt':
        return <GanttView />;
      case 'actions5w2h':
      case '5w2h':
        return <Action5W2HView />;
      case 'risks':
        return <RiskMatrixView />;
      case 'pareto':
        return <ParetoView />;
      case 'climate':
        return <ClimateSurveyView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col font-sans antialiased text-slate-100 selection:bg-blue-600 selection:text-white">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
        <footer className="py-5 px-6 border-t border-slate-800/80 text-center text-xs text-slate-400 bg-slate-950/60 mt-auto">
          <strong className="font-bold text-slate-200">Todos os direitos reservados &bull; MISTER ROGER</strong>
        </footer>
      </div>

      <ToastContainer />
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <ConsultingProvider>
      <MainContent />
    </ConsultingProvider>
  );
}
