import { ArrowLeft, Github, Triangle } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className='relative flex min-h-screen items-center justify-center bg-black px-4 font-["Outfit"]'>
      
      <div className="absolute top-8 left-8 flex items-center gap-3">
         <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Triangle className="w-4 h-4 text-black fill-black rotate-180" />
         </div>
         <span className="font-semibold tracking-tight text-white text-lg">MiniShinobi</span>
      </div>

      <div className='relative z-10 w-full max-w-sm'>
        <div className='bg-black border border-white/10 rounded-xl p-8 text-center shadow-2xl'>
          <div className='mb-8'>
            <h1 className='text-2xl font-semibold leading-tight tracking-tight text-white'>
              Log in to MiniShinobi
            </h1>
            <p className='mt-2 text-sm text-gray-400'>
              Secure access to your edge deployment control plane.
            </p>
          </div>

          <button
            onClick={() => (window.location.href = '/auth/github')}
            className='flex h-12 w-full items-center justify-center gap-3 px-6 bg-white text-black rounded-md font-medium hover:bg-gray-200 transition-colors'
          >
            <Github className='h-5 w-5' />
            Continue with GitHub
          </button>
        </div>

        <div className='mt-8 text-center'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
