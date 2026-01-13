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
import { AuthProvider } from '@/context/auth-context'

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

          {/* Placeholder routes for now */}
          <Route path="/free" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>자유게시판 (준비중)</h2></div>} />
          <Route path="/info" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>정보게시판 (준비중)</h2></div>} />

          <Route path="/ksa/greeting" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>인사말 (준비중)</h2></div>} />
          <Route path="/ksa/executives" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>KSA 임원진 (준비중)</h2></div>} />
          <Route path="/ksa/history" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>역대 임원진 (준비중)</h2></div>} />
          <Route path="/job/consulting" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>채용설명회/상담 (준비중)</h2></div>} />
          <Route path="/contact" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>CONTACT US (준비중)</h2></div>} />

          <Route path="/admin/login" element={<div className="container max-w-screen-2xl mx-auto py-20 px-4"><h2>관리자 로그인 (준비중)</h2></div>} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App
