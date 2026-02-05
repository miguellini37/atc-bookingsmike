import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2, AlertCircle, Loader2 } from 'lucide-react';
import { vatsimAuthApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// VATSIM logo SVG
const VatsimLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const errorMessages: Record<string, string> = {
  access_denied: 'You denied access to your VATSIM account.',
  invalid_request: 'Invalid OAuth request. Please try again.',
  invalid_state: 'Security validation failed. Please try again.',
  token_exchange_failed: 'Failed to authenticate with VATSIM. Please try again.',
  user_fetch_failed: 'Failed to get your VATSIM profile. Please try again.',
  no_organization: 'You are not a member of any organization. Contact your division administrator.',
  server_error: 'An unexpected error occurred. Please try again.',
};

function OrgLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  // Check if already logged in
  const { data: session, isLoading } = useQuery({
    queryKey: ['orgSession'],
    queryFn: vatsimAuthApi.getSession,
    retry: false,
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (session?.currentOrg) {
      navigate('/org');
    }
  }, [session, navigate]);

  // Show error toast if there's an OAuth error
  React.useEffect(() => {
    if (error) {
      toast.error('Login failed', {
        description: errorMessages[error] || 'An unknown error occurred.',
      });
    }
  }, [error]);

  const handleVatsimLogin = () => {
    // Redirect to VATSIM OAuth
    window.location.href = vatsimAuthApi.getLoginUrl();
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Organization Portal</CardTitle>
          <CardDescription>
            Sign in with your VATSIM account to manage your organization's bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessages[error] || 'An unknown error occurred.'}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleVatsimLogin}
            className="w-full gap-2"
            size="lg"
          >
            <VatsimLogo />
            Sign in with VATSIM
          </Button>

          <div className="text-center text-sm text-muted-foreground space-y-2 pt-4">
            <p>
              You must be added as a member of an organization by your division administrator
              before you can access the portal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrgLoginPage;
