import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminSession } from './useAdminSession';
import type { AdminPageId } from '../../lib/adminPermissions';
import { PageLoader } from './ui/Skeleton';

type ProtectedAdminRouteProps = {
  pageId: AdminPageId;
  children: React.ReactNode;
};

export function ProtectedAdminRoute({ pageId, children }: ProtectedAdminRouteProps) {
  const { ready, pageAccess, isSuperAdmin } = useAdminSession();

  if (!ready) {
    return (
      <div className="admin-shell flex-1 min-h-screen" data-theme="light">
        <PageLoader variant="dashboard" />
      </div>
    );
  }

  if (isSuperAdmin || pageAccess(pageId)) {
    return <>{children}</>;
  }

  return <Navigate to="/admin/dashboard" replace />;
}
