'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, signUpSchema, type LoginSchema, type SignUpSchema } from '@/lib/validations/schemas'
import { signIn, signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, Mail, User, KeyRound, CalendarDays, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

// ─── Login Form ────────────────────────────────────────────
function LoginForm() {
    const [loading, setLoading] = useState(false)
    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    async function onSubmit(values: LoginSchema) {
        setLoading(true)
        const result = await signIn(values)
        if (result?.error) {
            toast.error('Error de acceso', {
                description: result.error === 'Invalid login credentials'
                    ? 'Correo o contraseña incorrectos'
                    : result.error,
            })
            setLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-[var(--foreground)]">Correo electrónico</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    <Input id="email" type="email" placeholder="usuario@empresa.com"
                        className="pl-9 border-[var(--border)] focus-visible:ring-[#4266ac]"
                        {...form.register('email')} />
                </div>
                {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-[var(--foreground)]">Contraseña</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    <Input id="password" type="password" placeholder="••••••••"
                        className="pl-9 border-[var(--border)] focus-visible:ring-[#4266ac]"
                        {...form.register('password')} />
                </div>
                {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading}
                className="w-full mt-2 bg-[#1A2B4A] hover:bg-[#2d4a80] text-white font-bold h-12 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? 'Validando...' : 'Acceder al Tablero'}
            </Button>
        </form>
    )
}

// ─── Sign Up Form ──────────────────────────────────────────
function SignUpForm() {
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const form = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { nombre_completo: '', email: '', password: '', confirm_password: '' },
    })

    async function onSubmit(values: SignUpSchema) {
        setLoading(true)
        const result = await signUp({
            nombre_completo: values.nombre_completo,
            email: values.email,
            password: values.password,
        })
        if (result?.error) {
            toast.error('Error al registrar', { description: result.error })
            setLoading(false)
            return
        }
        setDone(true)
    }

    if (done) return (
        <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="h-6 w-6 text-amber-500" />
            </div>
            <p className="font-semibold text-[var(--foreground)] mb-1">¡Solicitud enviada!</p>
            <p className="text-sm text-[var(--muted)]">Un administrador revisará tu cuenta y te asignará acceso.<br />Recibirás confirmación pronto.</p>
        </div>
    )

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="nombre_completo" className="text-sm text-[var(--foreground)]">Nombre completo</Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    <Input id="nombre_completo" type="text" placeholder="Nombre Apellido"
                        className="pl-9 border-[var(--border)] focus-visible:ring-[#4266ac]"
                        {...form.register('nombre_completo')} />
                </div>
                {form.formState.errors.nombre_completo && <p className="text-xs text-red-500">{form.formState.errors.nombre_completo.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-sm text-[var(--foreground)]">Correo electrónico</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    <Input id="signup-email" type="email" placeholder="usuario@empresa.com"
                        className="pl-9 border-[var(--border)] focus-visible:ring-[#4266ac]"
                        {...form.register('email')} />
                </div>
                {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-sm text-[var(--foreground)]">Contraseña</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    <Input id="signup-password" type="password" placeholder="Mínimo 6 caracteres"
                        className="pl-9 border-[var(--border)] focus-visible:ring-[#4266ac]"
                        {...form.register('password')} />
                </div>
                {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="confirm_password" className="text-sm text-[var(--foreground)]">Confirmar contraseña</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    <Input id="confirm_password" type="password" placeholder="Repite tu contraseña"
                        className="pl-9 border-[var(--border)] focus-visible:ring-[#4266ac]"
                        {...form.register('confirm_password')} />
                </div>
                {form.formState.errors.confirm_password && <p className="text-xs text-red-500">{form.formState.errors.confirm_password.message}</p>}
            </div>

            <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                ⚠️ Tu acceso será habilitado una vez que un administrador apruebe tu solicitud.
            </p>

            <Button type="submit" disabled={loading}
                className="w-full mt-2 bg-[#1A2B4A] hover:bg-[#2d4a80] text-white font-bold h-12 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
                {loading ? 'Enviando...' : 'Solicitar Registro'}
            </Button>
        </form>
    )
}

// ─── Main Page ─────────────────────────────────────────────
export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false)

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#1A2B4A]">
            {/* Shared Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-105 scale-110"
                style={{ backgroundImage: 'url("/panel.jpg")' }}
            />
            {/* Global Overlay - Reduced opacity to reveal background image */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A2B4A]/70 via-transparent to-[#1A2B4A]/70 lg:from-[#1A2B4A]/60 lg:to-transparent" />

            <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
                {/* Left Side: Hero Section */}
                <div className="hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden border-r border-white/10">
                    <div className="relative z-10 text-center max-w-xl">
                        <div className="bg-white/10 backdrop-blur-xl rounded-[40px] p-12 border border-white/20 shadow-2xl">
                            <CalendarDays className="h-24 w-24 text-[#FFD700] mx-auto mb-8 drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
                            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter leading-[1.1] uppercase italic">
                                Gestión de Compras
                            </h1>
                            <p className="text-3xl font-bold text-[#FFD700] tracking-widest uppercase mb-8 drop-shadow-md">
                                Cloro de Hidalgo
                            </p>
                            <div className="h-1.5 w-24 bg-[#FFD700] mx-auto rounded-full mb-8 shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                            <p className="text-lg text-white/80 font-medium leading-relaxed max-w-md mx-auto">
                                Precisión operacional y control total en cada suministro.
                            </p>
                        </div>
                    </div>

                    <div className="absolute bottom-12 flex items-center gap-4 text-white/40 text-xs font-bold uppercase tracking-[0.3em]">
                        <div className="h-1 w-12 bg-[#FFD700] rounded-full" />
                        <span>Operación Certificada 2026</span>
                    </div>
                </div>

                {/* Right Side: Form Section */}
                <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
                    {/* Glassy Background Container for Form side to improve legibility */}
                    <div className="absolute inset-0 bg-[#1A2B4A]/30 backdrop-blur-sm lg:bg-transparent" />

                    <div className="w-full max-w-[440px] space-y-8 relative z-10">
                        <div className="text-center">
                            {/* Logo Container - Made subtle with glassmorphism */}
                            <div className="inline-flex items-center justify-center p-6 rounded-[32px] bg-white/5 backdrop-blur-md border border-white/10 shadow-xl mb-8 transform transition-all hover:scale-105">
                                <img src="/LogoCH.png" alt="Cloro de Hidalgo Logo" className="h-16 w-auto object-contain brightness-110 drop-shadow-lg" />
                            </div>
                            <p className="text-white/90 text-xl font-bold tracking-tight drop-shadow-sm">Sistema de Gestión de Suministros</p>
                        </div>

                        <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] border border-white/40 overflow-hidden ring-1 ring-black/5">
                            {/* Premium Tab Switcher */}
                            <div className="flex p-1.5 bg-slate-100/80 m-2 rounded-2xl">
                                <button
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isSignUp ? 'bg-white text-[var(--navy)] shadow-md' : 'text-[var(--muted)] hover:text-[var(--navy)]'}`}
                                    onClick={() => setIsSignUp(false)}
                                >
                                    Ingresar
                                </button>
                                <button
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isSignUp ? 'bg-white text-[var(--navy)] shadow-md' : 'text-[var(--muted)] hover:text-[var(--navy)]'}`}
                                    onClick={() => setIsSignUp(true)}
                                >
                                    Registro
                                </button>
                            </div>

                            <div className="p-10">
                                {isSignUp ? <SignUpForm /> : <LoginForm />}
                            </div>
                        </div>

                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-6 text-white/20">
                                <div className="h-px w-16 bg-current" />
                                <div className="p-1.5 rounded-full border border-current">
                                    <Lock className="h-3 w-3" />
                                </div>
                                <div className="h-px w-16 bg-current" />
                            </div>

                            <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/5 shadow-inner">
                                <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.25em] leading-relaxed">
                                    Propiedad Privada · Cloro de Hidalgo S.A. de C.V.<br />
                                    Personal Autorizado Únicamente
                                </p>
                            </div>
                        </div>
                    </div>

                    <footer className="mt-auto pt-12 text-white/30 text-[9px] font-black uppercase tracking-[0.4em] text-center">
                        © 2026 Procurement System · All Rights Reserved
                    </footer>
                </div>
            </div>
        </div>
    )
}
