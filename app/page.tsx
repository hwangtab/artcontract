import WizardContainer from './components/wizard/WizardContainer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="bg-primary-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">ArtContract</h1>
          <p className="text-xl text-primary-100 mb-2">
            예술가를 위한 계약서 자동 생성
          </p>
          <p className="text-primary-200">
            5분만에 안전한 계약서를 만드세요 • AI가 위험을 미리 경고합니다 • 완전 무료
          </p>
        </div>
      </div>

      {/* Wizard */}
      <WizardContainer />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            ⚠️ 본 계약서는 참고용이며 법률 자문을 대체하지 않습니다.
            고액 계약 시 반드시 전문가와 상담하세요.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            © 2025 ArtContract. 모든 예술가의 권리를 보호합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
