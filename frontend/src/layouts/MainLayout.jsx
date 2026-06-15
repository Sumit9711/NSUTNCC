import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackgroundOrbs from '../components/BackgroundOrbs'
import LoadingScreen from '../components/LoadingScreen'

export default function MainLayout() {
  const location = useLocation()
  const [showSite, setShowSite] = useState(false)

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (!showSite) {
    return <LoadingScreen onComplete={() => setShowSite(true)} />
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundOrbs />
      <Navbar />
      <main className="relative z-[1] min-h-[calc(100vh-62px-80px)] animate-page-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
