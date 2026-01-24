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
import { BannedPage } from '@/pages/BannedPage'

import { RecruitPage } from '@/pages/market/recruit/RecruitPage'
import { RecruitNewPage } from '@/pages/market/recruit/RecruitNewPage'
import { RecruitDetailPage } from '@/pages/market/recruit/RecruitDetailPage'
import { ConsultingPage } from '@/pages/job/consulting/ConsultingPage'
import { ConsultingNewPage } from '@/pages/job/consulting/ConsultingNewPage'
import { ConsultingDetailPage } from '@/pages/job/consulting/ConsultingDetailPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          {/* Market Routes */}
          <Route path="/market/flea" element={<FleaPage />} />
          <Route path="/market/flea/new" element={<FleaNewPage />} />
          <Route path="/market/flea/:id" element={<FleaDetailPage />} />
          <Route path="/market/flea/:id/edit" element={<FleaEditPage />} />
          <Route path="/market/job" element={<JobPage />} />
          <Route path="/market/job/new" element={<JobNewPage />} />
          <Route path="/market/job/:id" element={<JobDetailPage />} />
          <Route path="/market/job/:id/edit" element={<JobEditPage />} />
          <Route path="/market/cars" element={<CarsPage />} />
          <Route path="/market/cars/new" element={<CarsNewPage />} />
          <Route path="/market/cars/:id" element={<CarsDetailPage />} />
          <Route path="/market/cars/:id/edit" element={<CarsEditPage />} />
          <Route path="/market/housing" element={<HousingPage />} />
          <Route path="/market/housing/new" element={<HousingNewPage />} />
          <Route path="/market/housing/:id" element={<HousingDetailPage />} />
          <Route path="/market/housing/:id/edit" element={<HousingEditPage />} />

          {/* Community Routes */}
          <Route path="/community/news" element={<NewsBoardList />} />
          <Route path="/community/news/new" element={<NewsBoardNew />} />
          <Route path="/community/news/:id" element={<NewsBoardDetail />} />
          <Route path="/community/news/:id/edit" element={<NewsBoardEdit />} />
          <Route path="/community/free" element={<FreeBoardList />} />
          <Route path="/community/free/new" element={<FreeBoardNew />} />
          <Route path="/community/free/:id" element={<FreeBoardDetail />} />
          <Route path="/community/free/:id/edit" element={<FreeBoardEdit />} />
          <Route path="/market/recruit" element={<RecruitPage />} />
          <Route path="/market/recruit/new" element={<RecruitNewPage />} />
          <Route path="/market/recruit/:id" element={<RecruitDetailPage />} />
          <Route path="/info" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>정보게시판 (준비중)</h2></div>} />

          <Route path="/ksa/greeting" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>인사말 (준비중)</h2></div>} />
          <Route path="/ksa/executives" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>KSA 임원진 (준비중)</h2></div>} />
          <Route path="/ksa/history" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>역대 임원진 (준비중)</h2></div>} />
          <Route path="/job/consulting" element={<ConsultingPage />} />
          <Route path="/job/consulting/new" element={<ConsultingNewPage />} />
          <Route path="/job/consulting/:id" element={<ConsultingDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />


          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users/:id" element={<UserDetailPage />} />
          <Route path="/admin/popups" element={<PopupManagement />} />
          <Route path="/admin/popups/new" element={<PopupForm />} />
          <Route path="/admin/popups/:id/edit" element={<PopupForm />} />
          <Route path="/banned" element={<BannedPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/chat/room/:id" element={<ChatRoomPage />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App
