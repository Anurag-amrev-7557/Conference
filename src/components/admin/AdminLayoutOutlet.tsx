import { Outlet, useLocation } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { adminRouteMetaForPath } from './adminRouteMeta';

type AdminLayoutOutletProps = {
  onLogout: () => void;
};

/** Persistent admin chrome — child routes render in `<Outlet />` without remounting the shell. */
export function AdminLayoutOutlet({ onLogout }: AdminLayoutOutletProps) {
  const location = useLocation();
  const meta = adminRouteMetaForPath(location.pathname);

  return (
    <AdminLayout title={meta.title} onLogout={onLogout} wide={meta.wide}>
      <Outlet key={location.pathname} />
    </AdminLayout>
  );
}
