import { useForm } from 'react-hook-form';
import { Building2, Globe, MapPin, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { CreateApiKeyData } from '@/types';

interface ApiKeyFormProps {
  onSubmit: (data: CreateApiKeyData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateApiKeyData>;
}

function ApiKeyForm({ onSubmit, isLoading, defaultValues }: ApiKeyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateApiKeyData>({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Organization Name Field */}
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Organization Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            {...register('name', { required: 'Organization name is required' })}
            placeholder="e.g., ZLA vARTCC, Boston ARTCC"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Division Field */}
        <div className="space-y-2">
          <label htmlFor="division" className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Division <span className="text-destructive">*</span>
          </label>
          <Input
            id="division"
            {...register('division', { required: 'Division is required' })}
            placeholder="e.g., EUR"
            className={errors.division ? 'border-destructive' : ''}
          />
          {errors.division && (
            <p className="text-sm text-destructive">{errors.division.message}</p>
          )}
        </div>

        {/* Subdivision Field */}
        <div className="space-y-2">
          <label htmlFor="subdivision" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Subdivision
          </label>
          <Input
            id="subdivision"
            {...register('subdivision')}
            placeholder="e.g., GBR (optional)"
          />
        </div>

        {/* Portal Access Toggle */}
        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('portalEnabled')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Enable Portal Access</span>
            </div>
          </label>
          <p className="text-xs text-muted-foreground mt-1 ml-7">
            Allow members to log in via VATSIM OAuth and manage bookings through the web portal.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create API Key'}
        </Button>
      </div>
    </form>
  );
}

export default ApiKeyForm;
