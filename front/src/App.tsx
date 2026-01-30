import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/layout'
import { HomePage } from '@/pages/home'
import { OAuthCallback } from '@/pages/oauth-callback'
import { MyPage } from '@/pages/mypage'
import { Toaster } from "@/components/ui/sonner"

// Market Pages
import { FleaPage } from '@/pages/market/flea'
import { FleaNewPage } from '@/pages/market/flea-new'
import { FleaDetailPage } from '@/pages/market/flea-detail'
import { FleaEditPage } from '@/pages/market/flea-edit'
import { JobPage } from '@/pages/market/job'
import { JobNewPage } from '@/pages/market/job-new'
import { JobDetailPage } from '@/pages/market/job-detail'
import { JobEditPage } from '@/pages/market/job-edit'
import { CarsPage } from '@/pages/market/cars'
import { CarsNewPage } from '@/pages/market/cars-new'
import { CarsDetailPage } from '@/pages/market/cars-detail'
import { CarsEditPage } from '@/pages/market/cars-edit'
import { HousingPage } from '@/pages/market/housing'
import { HousingNewPage } from '@/pages/market/housing-new'
import { HousingDetailPage } from '@/pages/market/housing-detail'
import { HousingEditPage } from '@/pages/market/housing-edit'
import { ChatRoomPage } from '@/pages/chat/ChatRoomPage'
import ContactPage from '@/pages/contact/ContactPage'
// Community Pages
import { FreeBoardList } from '@/pages/community/FreeBoardList'
import { FreeBoardNew } from '@/pages/community/FreeBoardNew'
import { FreeBoardDetail } from '@/pages/community/FreeBoardDetail'
import { FreeBoardEdit } from '@/pages/community/FreeBoardEdit'
import { NewsBoardList } from '@/pages/community/NewsBoardList'
import { NewsBoardNew } from '@/pages/community/NewsBoardNew'
import { NewsBoardDetail } from '@/pages/community/NewsBoardDetail'
import { NewsBoardEdit } from '@/pages/community/NewsBoardEdit'
import { AuthProvider } from '@/context/auth-context'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { UserDetailPage } from '@/pages/admin/UserDetailPage'
import { PopupManagement } from '@/pages/admin/PopupManagement'
import { PopupForm } from '@/pages/admin/PopupForm'
import { AdManagement } from '@/pages/admin/AdManagement'
import { AdForm } from '@/pages/admin/AdForm'
import { BannedPage } from '@/pages/BannedPage'
import { ProtectedRoute } from '@/components/auth/protected-route'

import { RecruitPage } from '@/pages/market/recruit/RecruitPage'
import { RecruitNewPage } from '@/pages/market/recruit/RecruitNewPage'
import { RecruitDetailPage } from '@/pages/market/recruit/RecruitDetailPage'
import { RecruitEditPage } from '@/pages/market/recruit/RecruitEditPage'
import { FairPage } from '@/pages/market/fair/FairPage'
import { FairNewPage } from '@/pages/market/fair/FairNewPage'
import { FairDetailPage } from '@/pages/market/fair/FairDetailPage'
import { FairEditPage } from '@/pages/market/fair/FairEditPage'
import { ExecutivesPage } from '@/pages/about/ExecutivesPage'
import { HistoryPage } from '@/pages/about/HistoryPage'
import { GreetingPage } from '@/pages/about/GreetingPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          {/* Market Routes */}
          <Route path="/market/flea" element={<FleaPage />} />
          <Route path="/market/flea/new" element={<ProtectedRoute allowedRoles={['USER']}><FleaNewPage /></ProtectedRoute>} />
          <Route path="/market/flea/:id" element={<FleaDetailPage />} />
          <Route path="/market/flea/:id/edit" element={<ProtectedRoute allowedRoles={['USER']}><FleaEditPage /></ProtectedRoute>} />
          <Route path="/market/job" element={<JobPage />} />
          <Route path="/market/job/new" element={<ProtectedRoute allowedRoles={['USER']}><JobNewPage /></ProtectedRoute>} />
          <Route path="/market/job/:id" element={<JobDetailPage />} />
          <Route path="/market/job/:id/edit" element={<ProtectedRoute allowedRoles={['USER']}><JobEditPage /></ProtectedRoute>} />
          <Route path="/market/cars" element={<CarsPage />} />
          <Route path="/market/cars/new" element={<ProtectedRoute allowedRoles={['USER']}><CarsNewPage /></ProtectedRoute>} />
          <Route path="/market/cars/:id" element={<CarsDetailPage />} />
          <Route path="/market/cars/:id/edit" element={<ProtectedRoute allowedRoles={['USER']}><CarsEditPage /></ProtectedRoute>} />
          <Route path="/market/housing" element={<HousingPage />} />
          <Route path="/market/housing/new" element={<ProtectedRoute allowedRoles={['USER']}><HousingNewPage /></ProtectedRoute>} />
          <Route path="/market/housing/:id" element={<HousingDetailPage />} />
          <Route path="/market/housing/:id/edit" element={<ProtectedRoute allowedRoles={['USER']}><HousingEditPage /></ProtectedRoute>} />

          <Route path="/market/recruit" element={<RecruitPage />} />
          <Route path="/market/recruit/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><RecruitNewPage /></ProtectedRoute>} />
          <Route path="/market/recruit/:id" element={<RecruitDetailPage />} />
          <Route path="/market/recruit/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><RecruitEditPage /></ProtectedRoute>} />

          <Route path="/market/fair" element={<FairPage />} />
          <Route path="/market/fair/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><FairNewPage /></ProtectedRoute>} />
          <Route path="/market/fair/:id" element={<FairDetailPage />} />
          <Route path="/market/fair/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><FairEditPage /></ProtectedRoute>} />

          {/* Community Routes */}
          <Route path="/community/news" element={<NewsBoardList />} />
          <Route path="/community/news/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><NewsBoardNew /></ProtectedRoute>} />
          <Route path="/community/news/:id" element={<NewsBoardDetail />} />
          <Route path="/community/news/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><NewsBoardEdit /></ProtectedRoute>} />
          <Route path="/community/free" element={<FreeBoardList />} />
          <Route path="/community/free/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MASTER']}><FreeBoardNew /></ProtectedRoute>} />
          <Route path="/community/free/:id" element={<FreeBoardDetail />} />
          <Route path="/community/free/:id/edit" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MASTER']}><FreeBoardEdit /></ProtectedRoute>} />

          <Route path="/info" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>정보게시판 (준비중)</h2></div>} />

          <Route path="/ksa/greeting" element={<GreetingPage />} />
          <Route path="/ksa/executives" element={<ExecutivesPage />} />
          <Route path="/ksa/history" element={<HistoryPage />} />

          <Route path="/contact" element={<ContactPage />} />


          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><UserDetailPage /></ProtectedRoute>} />
          <Route path="/admin/popups" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><PopupManagement /></ProtectedRoute>} />
          <Route path="/admin/popups/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><PopupForm /></ProtectedRoute>} />
          <Route path="/admin/popups/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><PopupForm /></ProtectedRoute>} />
          <Route path="/admin/ads" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><AdManagement /></ProtectedRoute>} />
          <Route path="/admin/ads/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><AdForm /></ProtectedRoute>} />
          <Route path="/admin/ads/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}><AdForm /></ProtectedRoute>} />
          <Route path="/banned" element={<BannedPage />} />
          <Route path="/mypage" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MASTER']}><MyPage /></ProtectedRoute>} />
          <Route path="/chat/room/:id" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MASTER']}><ChatRoomPage /></ProtectedRoute>} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App
