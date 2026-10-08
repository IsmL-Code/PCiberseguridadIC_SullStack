import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../services/authApi';
import protegerImage from '../../img/proteger.png';

export default function App() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const respuesta = await iniciarSesion(email, password);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authToken', respuesta.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    if (recoveryEmail.trim()) {
      setRecoverySent(true);
      setTimeout(() => {
        setRecoverySent(false);
        setShowRecovery(false);
        setRecoveryEmail('');
      }, 3000);
    }
  };

  return (
    <div className="login-page min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased relative overflow-x-hidden">
      
      {/* Background Cyber Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="dashboard-topbar login-dashboard-header">
        <div className="dashboard-brand login-dashboard-brand">
          <img className="app-header__icon" src={protegerImage} alt="" aria-hidden="true" />
          <span>
            <strong>PCiberseguridadIC</strong>
            <small>Plataforma centralizada para registro y seguimiento de amenazas</small>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="login-main flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 z-10">
        
        {isLoggedIn ? (
          /* Success Screen Dashboard Redirect */
          <div className="login-card w-full max-w-md bg-slate-900/90 border border-emerald-500/40 p-8 rounded-2xl shadow-2xl text-center space-y-6 backdrop-blur-xl animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <svg className="w-8 h-8 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">¡Autenticación Exitosa!</h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Sesión iniciada con éxito para <span className="text-emerald-400 font-medium">{email}</span>. Redirigiendo al panel central de incidentes...
              </p>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full rounded-full animate-pulse w-full"></div>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-xs text-slate-400 hover:text-emerald-400 underline transition-colors"
            >
              Cerrar sesión simulada
            </button>
          </div>
        ) : (
          /* Login Card Form */
          <div className="login-card w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl relative">
            
            <div className="text-center mt-3 mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-white">Bienvenido</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Accede a tu cuenta para continuar</p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-6 bg-red-950/40 border border-red-800/60 text-red-300 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-start space-x-3 shadow-lg">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"></line>
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email / Username Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-slate-300">
                    Correo Electrónico
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ej. analista.soc@empresa.com"
                    className="login-input w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-slate-300">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium focus:outline-none"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="login-input w-full pl-10 pr-11 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 font-semibold rounded-xl shadow-lg shadow-emerald-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

          </div>
        )}
      </main>

      {/* Forgot Password Modal / Drawer */}
      {showRecovery && (
        <div className="login-recovery-overlay fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="login-recovery-card bg-slate-900 border border-slate-800 max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => { setShowRecovery(false); setRecoverySent(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl border border-emerald-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Recuperación de Credenciales</h3>
              <p className="text-xs text-slate-400 mt-1">Ingrese su correo registrado para recibir un enlace de restablecimiento seguro o notificar al Administrador de Red.</p>
            </div>

            {recoverySent ? (
              <div className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 p-4 rounded-xl text-center text-xs space-y-2">
                <p className="font-semibold text-emerald-200">¡Instrucciones enviadas con éxito!</p>
                <p>Revise su bandeja de entrada corporativa o contacte al SOC central.</p>
              </div>
            ) : (
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico Corporativo</label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="analista@empresa.com"
                    className="login-input w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                  >
                    Enviar Enlace
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="login-footer w-full py-5 text-center text-[11px] text-slate-500 border-t border-slate-900/80 z-10">
        <p>&copy; 2026 PCiberseguridadIC. Todos los derechos reservados. Sistema Centralizado de Incidentes.</p>
      </footer>
    </div>
  );
}