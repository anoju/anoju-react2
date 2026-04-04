import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BaseLayout from './components/templates/BaseLayout';

const Home = () => (
  <BaseLayout>
    <div className="container">
      <h2>Welcome to anoju-react2</h2>
      <p>모바일 최우선 반응형 웹 프로젝트입니다.</p>
    </div>
  </BaseLayout>
);

const NotFound = () => (
  <BaseLayout title="404 Not Found">
    <div className="container">
      <h2>페이지를 찾을 수 없습니다.</h2>
    </div>
  </BaseLayout>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
