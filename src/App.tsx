import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCurrentUser,
  logout,
  requestOtp,
  verifyOtp,
  type AuthUser,
} from './api/auth'

type AuthStep = 'email' | 'otp'

const currentUserQueryKey = ['auth', 'current-user'] as const

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong'
}

function App() {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')

  const currentUserQuery = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
  })

  const requestOtpMutation = useMutation({
    mutationFn: requestOtp,
    onSuccess: (response, submittedEmail) => {
      setEmail(submittedEmail.trim().toLowerCase())
      setStep('otp')
      setMessage(response.message)
    },
  })

  const verifyOtpMutation = useMutation({
    mutationFn: ({ email: submittedEmail, code: submittedCode }: {
      email: string
      code: string
    }) => verifyOtp(submittedEmail, submittedCode),
    onSuccess: (currentUser) => {
      queryClient.setQueryData<AuthUser>(currentUserQueryKey, currentUser)
      setCode('')
      setMessage('')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData<AuthUser | null>(currentUserQueryKey, null)
      setStep('email')
      setCode('')
      setMessage('')
      requestOtpMutation.reset()
      verifyOtpMutation.reset()
    },
  })

  function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    verifyOtpMutation.reset()
    requestOtpMutation.mutate(email)
  }

  function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    verifyOtpMutation.mutate({ email, code })
  }

  function handleChangeEmail() {
    setStep('email')
    setCode('')
    setMessage('')
    requestOtpMutation.reset()
    verifyOtpMutation.reset()
  }

  if (currentUserQuery.isPending) {
    return <p>Checking session...</p>
  }

  const user = currentUserQuery.data
  const isSubmitting =
    requestOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    logoutMutation.isPending

  if (user) {
    const error = logoutMutation.error ?? currentUserQuery.error

    return (
      <main>
        <h1>Current user</h1>
        <p>{user.email}</p>
        {error && <p role="alert">{getErrorMessage(error)}</p>}
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </button>
      </main>
    )
  }

  const error =
    (step === 'email'
      ? requestOtpMutation.error
      : verifyOtpMutation.error) ?? currentUserQuery.error

  return (
    <main>
      <h1>Sign in</h1>

      {step === 'email' ? (
        <form onSubmit={handleRequestOtp}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {requestOtpMutation.isPending ? 'Sending...' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <p>Code sent to {email}</p>
          <label htmlFor="code">OTP code</label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={isSubmitting}
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {verifyOtpMutation.isPending ? 'Checking...' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={handleChangeEmail}
            disabled={isSubmitting}
          >
            Change email
          </button>
        </form>
      )}

      {message && <p>{message}</p>}
      {error && <p role="alert">{getErrorMessage(error)}</p>}
    </main>
  )
}

export default App
