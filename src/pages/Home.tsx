import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Diagnostic RGA
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Évaluez le risque de retrait-gonflement des argiles de votre maison
        </p>
        <p className="text-gray-500 mb-8">
          Durée estimée : ~10 minutes
        </p>
        <button
          onClick={() => navigate('/diagnostic')}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Démarrer le diagnostic
        </button>
      </div>
    </div>
  )
}
