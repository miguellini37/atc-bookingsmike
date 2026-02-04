import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Plane, Shield, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authApi, handleApiError } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function LoginPage() {
  const [secretKey, setSecretKey] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [shake, setShake] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.authenticateSecretKey(secretKey);
      toast.success('Login successful');
      navigate('/admin');
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error('Login failed', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Plane className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ATC Booking System</h1>
          <p className="text-muted-foreground">Admin Access</p>
        </div>

        {/* Login Card */}
        <Card className={cn('animate-fade-in', shake && 'animate-shake')}>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your secret key to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="secretKey" className="text-sm font-medium">
                  Secret Key
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="secretKey"
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter your secret key"
                    className={cn('pl-10', error && 'border-destructive')}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full gap-2">
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Protected area for authorized personnel only
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
