import { useForm } from 'react-hook-form';
import { Hash, Radio, Calendar, Globe, MapPin, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingType, type CreateBookingData, type ApiKey } from '@/types';

interface BookingFormProps {
  onSubmit: (data: CreateBookingData, apiKeyId?: number) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreateBookingData>;
  apiKeys: ApiKey[];
  mode?: 'create' | 'edit';
  lockedCid?: string;
}

const bookingTypeOptions = [
  { value: BookingType.BOOKING, label: 'Booking' },
  { value: BookingType.EVENT, label: 'Event' },
  { value: BookingType.EXAM, label: 'Exam' },
  { value: BookingType.TRAINING, label: 'Training' },
];

function BookingForm({ onSubmit, isLoading, defaultValues, apiKeys, mode = 'create', lockedCid }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateBookingData & { apiKeyId?: number }>({
    defaultValues: {
      type: BookingType.BOOKING,
      ...defaultValues,
    },
  });

  const selectedType = watch('type');
  const selectedApiKeyId = watch('apiKeyId');

  // When API key is selected, auto-fill division/subdivision
  const handleApiKeyChange = (value: string) => {
    const id = parseInt(value);
    setValue('apiKeyId', id);
    const apiKey = apiKeys.find(k => k.id === id);
    if (apiKey) {
      setValue('division', apiKey.division);
      if (apiKey.subdivision) {
        setValue('subdivision', apiKey.subdivision);
      }
    }
  };

  const onFormSubmit = (data: CreateBookingData & { apiKeyId?: number }) => {
    // Remove apiKeyId from the data sent to API (it's used for auth header)
    const { apiKeyId, ...bookingData } = data;

    // Convert datetime-local format to ISO 8601 format
    const formattedData = {
      ...bookingData,
      start: new Date(bookingData.start).toISOString(),
      end: new Date(bookingData.end).toISOString(),
      ...(lockedCid && { cid: lockedCid }),
    };

    onSubmit(formattedData, apiKeyId);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Organization Selection (for admin creating bookings) */}
      {mode === 'create' && apiKeys.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Organization <span className="text-destructive">*</span>
          </label>
          <Select onValueChange={handleApiKeyChange} value={selectedApiKeyId?.toString()}>
            <SelectTrigger className={!selectedApiKeyId ? 'text-muted-foreground' : ''}>
              <SelectValue placeholder="Select organization..." />
            </SelectTrigger>
            <SelectContent>
              {apiKeys.map((key) => (
                <SelectItem key={key.id} value={key.id.toString()}>
                  {key.name} ({key.division}{key.subdivision ? `/${key.subdivision}` : ''})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select the organization this booking is for
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* CID Field */}
        <div className="space-y-2">
          <label htmlFor="cid" className="text-sm font-medium flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Controller CID <span className="text-destructive">*</span>
          </label>
          {lockedCid ? (
            <Input
              id="cid"
              value={lockedCid}
              disabled
              className="bg-muted"
            />
          ) : (
            <Input
              id="cid"
              {...register('cid', { required: 'CID is required' })}
              placeholder="e.g., 1234567"
              className={errors.cid ? 'border-destructive' : ''}
            />
          )}
          {errors.cid && (
            <p className="text-sm text-destructive">{errors.cid.message}</p>
          )}
        </div>

        {/* Callsign Field */}
        <div className="space-y-2">
          <label htmlFor="callsign" className="text-sm font-medium flex items-center gap-2">
            <Radio className="h-4 w-4 text-muted-foreground" />
            Callsign <span className="text-destructive">*</span>
          </label>
          <Input
            id="callsign"
            {...register('callsign', {
              required: 'Callsign is required',
              pattern: {
                value: /^.+_(DEL|GND|TWR|APP|DEP|CTR|FSS)$/i,
                message: 'Must end with _DEL, _GND, _TWR, _APP, _DEP, _CTR, or _FSS'
              }
            })}
            placeholder="e.g., KLAX_TWR"
            className={errors.callsign ? 'border-destructive' : ''}
          />
          {errors.callsign && (
            <p className="text-sm text-destructive">{errors.callsign.message}</p>
          )}
        </div>

        {/* Booking Type Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Booking Type <span className="text-destructive">*</span>
          </label>
          <Select
            value={selectedType}
            onValueChange={(value) => setValue('type', value as BookingType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bookingTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Placeholder for grid alignment */}
        <div className="hidden sm:block" />

        {/* Start Time Field */}
        <div className="space-y-2">
          <label htmlFor="start" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Start Time (UTC) <span className="text-destructive">*</span>
          </label>
          <Input
            id="start"
            type="datetime-local"
            {...register('start', { required: 'Start time is required' })}
            className={errors.start ? 'border-destructive' : ''}
          />
          {errors.start && (
            <p className="text-sm text-destructive">{errors.start.message}</p>
          )}
        </div>

        {/* End Time Field */}
        <div className="space-y-2">
          <label htmlFor="end" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            End Time (UTC) <span className="text-destructive">*</span>
          </label>
          <Input
            id="end"
            type="datetime-local"
            {...register('end', { required: 'End time is required' })}
            className={errors.end ? 'border-destructive' : ''}
          />
          {errors.end && (
            <p className="text-sm text-destructive">{errors.end.message}</p>
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
            placeholder="e.g., VATUSA"
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
            placeholder="e.g., ZLA (optional)"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading || (mode === 'create' && apiKeys.length > 0 && !selectedApiKeyId)}>
          {isLoading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create Booking')}
        </Button>
      </div>
    </form>
  );
}

export default BookingForm;
