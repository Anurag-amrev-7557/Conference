import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

/** Persistent chrome for marketing routes — avoids full-screen blank state during lazy loads. */
export function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}
