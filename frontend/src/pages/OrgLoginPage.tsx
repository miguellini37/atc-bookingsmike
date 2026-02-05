import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Key, Building2 } from 'lucide-react';
import { setAuthToken, orgApi, handleApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginForm {
  apiKey: string;
}

function OrgLoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      // Set the API key in the header
      setAuthToken(data.apiKey);

      // Try to fetch org info to verify the key is valid
      const org = await orgApi.getMyOrganization();

      // Store the API key in session storage for persistence
      sessionStorage.setItem('orgApiKey', data.apiKey);

      toast.success(`Welcome, ${org.name}!`);
      navigate('/org');
    } catch (err) {
      setAuthToken(null);
      sessionStorage.removeItem('orgApiKey');
      const message = handleApiError(err);
      setError(message === 'An error occurred' ? 'Invalid API key' : message);
      toast.error('Login failed', { description: 'Invalid API key' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Organization Portal</CardTitle>
          <CardDescription>
            Enter your organization's API key to manage your bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                {...register('apiKey', { required: 'API key is required' })}
                className={errors.apiKey || error ? 'border-destructive' : ''}
              />
              {errors.apiKey && (
                <p className="text-sm text-destructive">{errors.apiKey.message}</p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Don't have an API key?</p>
            <p>Contact your division administrator to get one.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrgLoginPage;
