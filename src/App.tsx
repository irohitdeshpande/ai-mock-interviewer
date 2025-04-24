import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/layouts/public-layout';
import HomePage from '@/routes/home';
import AuthenticationLayout from '@/layouts/auth-layout';
import { SignInPage } from './routes/sign-in';
import { SignUpPage } from './routes/sign-up';
import ProtectedRoutes from '@/layouts/protected-routes';
import { MainLayout } from '@/layouts/main-layout';
import { Dashboard } from './routes/dashboard';
import { Generate } from './components/generate';
import { CreateEditPage } from './routes/create-edit-page';
import { MockLoadPage } from './routes/mock-load-page';
import { MockInterviewPage } from './routes/mock-interview-page';
import { Feedback } from './routes/feedback';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* public route */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* authentication layout */}
        <Route element={<AuthenticationLayout />}>
          <Route path="/signin/*" element={<SignInPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
        </Route>

        {/* protected route */}
        {/* ensures user authenticated before doing tasks like interview section, renders it like in public layout */}
        <Route element=
          {<ProtectedRoutes>
            <MainLayout />
          </ProtectedRoutes>
          }>
            {/* add all the protected routes, one after another */}
            <Route element = {<Generate />} path = "/interview">
              <Route index element = {<Dashboard />} ></Route>
              <Route path = ":interviewId" element = {<CreateEditPage />} />
              <Route path = "simulate/:interviewId" element = {<MockLoadPage />} />
              <Route path = "simulate/:interviewId/start" element = {<MockInterviewPage />} />
              <Route path = "feedback/:interviewId" element = {<Feedback />} />
            </Route>

        </Route>
      </Routes>
    </Router>
  );
};

export default App