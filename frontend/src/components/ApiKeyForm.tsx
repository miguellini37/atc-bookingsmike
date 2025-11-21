import { useForm } from 'react-hook-form';
import type { CreateApiKeyData } from '../types';

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cid" className="block text-sm font-medium text-gray-700 mb-2">
            CID *
          </label>
          <input
            id="cid"
            {...register('cid', { required: 'CID is required' })}
            className="input"
            placeholder="e.g., 1234567"
          />
          {errors.cid && (
            <p className="text-red-600 text-sm mt-1">{errors.cid.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            id="name"
            {...register('name', { required: 'Name is required' })}
            className="input"
            placeholder="e.g., John Doe"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-2">
            Division *
          </label>
          <input
            id="division"
            {...register('division', { required: 'Division is required' })}
            className="input"
            placeholder="e.g., EUR"
          />
          {errors.division && (
            <p className="text-red-600 text-sm mt-1">{errors.division.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="subdivision" className="block text-sm font-medium text-gray-700 mb-2">
            Subdivision
          </label>
          <input
            id="subdivision"
            {...register('subdivision')}
            className="input"
            placeholder="e.g., GBR (optional)"
          />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="btn-primary">
        {isLoading ? 'Saving...' : 'Save API Key'}
      </button>
    </form>
  );
}

export default ApiKeyForm;
