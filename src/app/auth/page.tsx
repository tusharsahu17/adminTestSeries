'use client';
import { useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuthLoading, selectAuthError } from './authSlice';
import { AppDispatch } from '../../store/store';
import { useRouter } from 'next/navigation';
import './auth.css';
import { Loader2 } from 'lucide-react';

function AuthContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    console.log('========>',username, password);
    e.preventDefault();
    const resultAction = await dispatch(loginUser({ username, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <div className="auth-background">
        <div className="auth-gradient one"></div>
        <div className="auth-gradient two"></div>
        <div className="auth-gradient three"></div>
      </div>

      <main className="auth-page-container">
        <div className="auth-wrapper">
          
          {/* LEFT PANEL */}
          <section className="auth-left-panel">
            <div>
              <div className="auth-brand">
                <div className="auth-brand-icon">✦</div>
                <div className="auth-brand-name">Quizly</div>
              </div>

              <div className="auth-hero-content">
                <h1>
                  Learn smarter.<br /><span>Test better.</span>
                </h1>
                <p>
                  Challenge yourself with curated tests, track your performance and improve your knowledge every day.
                </p>

                <div className="auth-stats">
                  <div className="auth-stat">
                    <strong>10K+</strong>
                    <span>Students</span>
                  </div>
                  <div className="auth-stat">
                    <strong>500+</strong>
                    <span>Tests</span>
                  </div>
                  <div className="auth-stat">
                    <strong>95%</strong>
                    <span>Success Rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating quiz card */}
            <div className="auth-floating-card">
              <div className="auth-floating-top">
                <div className="auth-floating-icon">✓</div>
                <div className="auth-score">+18%</div>
              </div>
              <h4>Mathematics Progress</h4>
              <div className="auth-progress">
                <div></div>
              </div>
            </div>

            <div style={{ color: '#64748b', fontSize: '12px' }}>
              © 2026 Quizly. Learn. Practice. Achieve.
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section className="auth-right-panel">
            <div className="auth-form-container">
              
              <div className="auth-form-header">
                <h2>Welcome back</h2>
                <p>Sign in to continue your learning journey.</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}

              {/* LOGIN FORM */}
              <form
                className="auth-form active"
                onSubmit={handleLogin}
              >
                <div className="auth-field">
                  <label>Username</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">👤</span>
                    <input
                      type="text"
                      placeholder="Username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Password</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔒</span>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-options">
                  <label className="auth-remember">
                    <input type="checkbox" /> Remember me
                  </label>
                  <a href="#" className="auth-forgot">Forgot password?</a>
                </div>

                <button className="auth-submit-btn flex justify-center items-center gap-2" type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign In →
                </button>

                <div className="auth-divider">OR</div>

                <button type="button" className="auth-google-btn">
                  Continue with Google
                </button>
              </form>

            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
