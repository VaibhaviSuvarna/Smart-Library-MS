'use client'

import Link from 'next/link'
import React, { useState, useTransition, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
}
const ButtonComponent = ({ children, className, ...props }: ButtonProps) => (
  <button
    {...props}
    className={`rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 ${className}`}
  >
    {children}
  </button>
)
export const Button = React.memo(ButtonComponent)

type InputProps = React.InputHTMLAttributes<HTMLInputElement>
const InputComponent = (props: InputProps) => (
  <input
    {...props}
    className={`w-full rounded-xl px-4 py-3 border border-gray-300 bg-white/60 backdrop-blur-md placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${props.className}`}
  />
)
export const Input = React.memo(InputComponent)

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  children?: React.ReactNode
}
const LabelComponent = ({ children, className, ...props }: LabelProps) => (
  <label {...props} className={`font-medium text-gray-700 ${className}`}>{children}</label>
)
export const Label = React.memo(LabelComponent)

type SelectProps = {
  value: string
  onValueChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}
const SelectComponent = ({ value, onValueChange, options, className }: SelectProps) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`w-full rounded-xl px-4 py-3 border border-gray-300 bg-white/60 backdrop-blur-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${className}`}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
)
export const Select = React.memo(SelectComponent)

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }, [])

  const onRoleChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to register')
      const data = await res.json()
      startTransition(() => {
        router.push(data.user.role === 'USER' ? '/user/dashboard' : '/librarian/dashboard')
      })
    } catch (err) {
      if (err instanceof Error) setError(err.message)
      else setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-200 px-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-10 shadow-2xl space-y-6"
      >
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Create Your Account
          </h2>
          <p className="text-sm text-gray-600">Join <span className="font-semibold text-blue-600">LibraryMS</span> to manage your books smartly.</p>
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required autoComplete="name" />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required autoComplete="email" />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={onRoleChange}
              options={useMemo(
                () => [
                  { value: 'USER', label: 'Student' },
                  { value: 'LIBRARIAN', label: 'Librarian' },
                ],
                []
              )}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center animate-pulse font-medium">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg shadow-lg rounded-xl"
          disabled={isPending}
        >
          {isPending ? 'Creating Account…' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-indigo-600 font-medium underline underline-offset-2">
            Log in
          </Link>
        </p>
      </form>
    </main>
  )
}
