import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormItem, FormLabel } from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Form, TextField } from '@/lib/forms';
import { PasswordField } from '@/lib/forms/fields/password-field';
import { cn } from '@/lib/utils';
import { getLoginLink } from '@/routes/router-link';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import { AuthTokens, User } from '../types';

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .refine(
    (value) =>
      value.length >= 8 && /[0-9]/.test(value) && /[a-zA-Z]/.test(value),
    {
      message:
        'Must contain at least 8 characters with both letters and numbers',
    },
  )
  .refine((value) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value), {
    message: 'Add at least 1 special character for better security',
  });

export const registrationSchema = z
  .object({
    email: z.string().email(),
    password: passwordSchema,
    name: z.string().min(1, 'Name is required'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Type exports
export type PasswordType = z.infer<typeof passwordSchema>;
export type RegistrationFormType = z.infer<typeof registrationSchema>;

const RegisterForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: AuthApi.register,
    onSuccess: ({ user, tokens }: { user: User; tokens: AuthTokens }) => {
      login({ user, tokens });
      navigate('/dashboard');
      setApiError(null);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error.response?.data?.message || 'An unexpected error occurred';
      setApiError(errorMessage);
      console.error('Registration error:', error);
    },
  });

  const handleSubmit = (data: RegistrationFormType) => {
    setApiError(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registrationData } = data;
    mutate(registrationData);
  };

  return (
    <div className={cn('mx-auto w-full max-w-2xl px-4', className)} {...props}>
      <div className='bg-card rounded-2xl border p-7 shadow-lg'>
        <Form schema={registrationSchema} onSubmit={handleSubmit}>
          <div className='flex flex-col gap-8'>
            {/* Header Section */}
            <div className='flex flex-col items-center gap-4'>
              <div className='bg-primary/15 rounded-sm px-2'>
                <h1 className='text-lg font-bold'>Sync-Workbench</h1>
              </div>
              <div className='text-center'>
                <h1 className='text-2xl font-bold tracking-tight'>
                  Create Your Account
                </h1>
                <p className='mt-2 text-sm text-muted-foreground'>
                  Get started with our service in just a few steps
                </p>
              </div>
            </div>

            {apiError && (
              <div className='border-l-4 border-destructive bg-destructive/5 pl-4 py-3 rounded-lg flex items-start gap-3'>
                <AlertCircle className='h-5 w-5 text-destructive mt-0.5' />
                <div className='flex-1'>
                  <p className='text-sm text-destructive/90 mt-1'>{apiError}</p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <TooltipProvider>
              <div className='flex flex-col gap-6'>
                <div className='space-y-4'>
                  <TextField
                    name='name'
                    label='Full Name'
                    placeholder='John Doe'
                    autoComplete='name'
                    containerClass='space-y-2'
                    inputClass='h-11'
                  />

                  <TextField
                    name='email'
                    label='Email Address'
                    placeholder='name@company.com'
                    autoComplete='email'
                    containerClass='space-y-2'
                    inputClass='h-11'
                  />

                  <PasswordField
                    name='password'
                    label='Password'
                    placeholder='Enter your password'
                    autoComplete='new-password'
                    containerClass='space-y-2'
                    inputClass='h-11'
                    showStrength
                    validateWhileTyping
                  />

                  <PasswordField
                    name='confirmPassword'
                    label='Confirm Password'
                    placeholder='Confirm your password'
                    autoComplete='new-password'
                    containerClass='space-y-2'
                    inputClass='h-11'
                  />
                </div>

                <FormItem className='flex items-start space-x-2'>
                  <Checkbox
                    id='terms'
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(Boolean(checked))
                    }
                    className='mt-[.1rem] h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                  />
                  <div className='grid gap-1.5 leading-none'>
                    <FormLabel
                      htmlFor='terms'
                      className='text-sm font-medium text-foreground'
                    >
                      I agree to the{' '}
                      <Link
                        to='/terms'
                        className='font-medium text-primary hover:text-primary/80'
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        to='/privacy'
                        className='font-medium text-primary hover:text-primary/80'
                      >
                        Privacy Policy
                      </Link>
                    </FormLabel>
                  </div>
                </FormItem>

                <Tooltip>
                  {' '}
                  <TooltipTrigger
                    disabled={!isPending}
                    className='flex items-center cursor-pointer'
                  >
                    <Button
                      type='submit'
                      className='h-11 w-full text-base font-semibold whitespace-nowrap cursor-pointer'
                      disabled={isPending || !termsAccepted}
                    >
                      {isPending ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : null}
                      {isPending ? 'Creating account...' : 'Create Account'}
                      <TooltipContent className='max-w-[400px] text-center'>
                        <p className='text-sm'>
                          Note: Our backend service might take 20-30 seconds to
                          wake up on first request (free deployment). Subsequent
                          requests will be faster. Thank you for your patience!
                        </p>
                      </TooltipContent>
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Footer Links */}
            <div className='text-center text-sm text-muted-foreground'>
              Already have an account?{' '}
              <Link
                to={getLoginLink()}
                className='font-semibold text-primary hover:text-primary/80'
              >
                Sign in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RegisterForm;
