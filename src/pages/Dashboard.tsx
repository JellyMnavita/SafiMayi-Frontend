
import { OverviewAnalyticsView as DashboardView } from '../sections/overview/view';

// ----------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <>
      <title>{`Dashboard - SafiMayi`}</title>
      <meta
        name="description"
        content="The starting point for your next project with Minimal UI Kit, built on the newest version of Material-UI ©, ready to be customized to your style"
      />
      <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />

      <DashboardView />
    </>
  );
}
