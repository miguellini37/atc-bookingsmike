import { useForm } from 'react-hook-form';
import { User, Hash, Globe, MapPin } from 'lucide-react';
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
        {/* CID Field */}
        <div className="space-y-2">
          <label htmlFor="cid" className="text-sm font-medium flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            CID <span className="text-destructive">*</span>
          </label>
          <Input
            id="cid"
            {...register('cid', { required: 'CID is required' })}
            placeholder="e.g., 1234567"
            className={errors.cid ? 'border-destructive' : ''}
          />
          {errors.cid && (
            <p className="text-sm text-destructive">{errors.cid.message}</p>
          )}
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="e.g., John Doe"
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
