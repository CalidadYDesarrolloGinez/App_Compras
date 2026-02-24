'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, signUpSchema, type LoginSchema, type SignUpSchema } from '@/lib/validations/schemas'
import { signIn, signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, Mail, User, KeyRound } from 'lucide-react'
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
                <Label htmlFor="email" className="text-sm text-gray-700">Correo electrónico</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="email" type="email" placeholder="usuario@empresa.com"
                        className="pl-9 border-gray-200 focus-visible:ring-[#4266ac]"
                        {...form.register('email')} />
                </div>
                {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-gray-700">Contraseña</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="password" type="password" placeholder="••••••••"
                        className="pl-9 border-gray-200 focus-visible:ring-[#4266ac]"
                        {...form.register('password')} />
                </div>
                {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading}
                className="w-full mt-2 bg-[#4266ac] hover:bg-[#62a4dc] text-white font-semibold py-5 rounded-xl transition-all">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</> : 'Ingresar al Sistema'}
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
            <p className="font-semibold text-gray-800 mb-1">¡Solicitud enviada!</p>
            <p className="text-sm text-gray-500">Un administrador revisará tu cuenta y te asignará acceso.<br />Recibirás confirmación pronto.</p>
        </div>
    )

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="nombre_completo" className="text-sm text-gray-700">Nombre completo</Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="nombre_completo" type="text" placeholder="Nombre Apellido"
                        className="pl-9 border-gray-200 focus-visible:ring-[#4266ac]"
                        {...form.register('nombre_completo')} />
                </div>
                {form.formState.errors.nombre_completo && <p className="text-xs text-red-500">{form.formState.errors.nombre_completo.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-sm text-gray-700">Correo electrónico</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="signup-email" type="email" placeholder="usuario@empresa.com"
                        className="pl-9 border-gray-200 focus-visible:ring-[#4266ac]"
                        {...form.register('email')} />
                </div>
                {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-sm text-gray-700">Contraseña</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="signup-password" type="password" placeholder="Mínimo 6 caracteres"
                        className="pl-9 border-gray-200 focus-visible:ring-[#4266ac]"
                        {...form.register('password')} />
                </div>
                {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="confirm_password" className="text-sm text-gray-700">Confirmar contraseña</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="confirm_password" type="password" placeholder="Repite tu contraseña"
                        className="pl-9 border-gray-200 focus-visible:ring-[#4266ac]"
                        {...form.register('confirm_password')} />
                </div>
                {form.formState.errors.confirm_password && <p className="text-xs text-red-500">{form.formState.errors.confirm_password.message}</p>}
            </div>

            <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                ⚠️ Tu acceso será habilitado una vez que un administrador apruebe tu solicitud.
            </p>

            <Button type="submit" disabled={loading}
                className="w-full mt-2 bg-[#4266ac] hover:bg-[#62a4dc] text-white font-semibold py-5 rounded-xl transition-all">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando solicitud...</> : 'Solicitar Acceso'}
            </Button>
        </form>
    )
}

// ─── Main Page ─────────────────────────────────────────────
export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false)

    return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2d4a80 0%, #4266ac 50%, #62a4dc 100%)' }}>

            {/* Background dot pattern */}
            <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, white 2px, transparent 0)', backgroundSize: '50px 50px' }} />

            <div className="w-full max-w-md px-6 py-8 relative">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header band */}
                    <div className="bg-white border-b border-gray-100 px-8 py-6 text-center">
                        <img src="/LogoCH.png" alt="Cloro de Hidalgo Logo" className="h-14 w-auto object-contain mx-auto mb-2" />
                        <p className="text-sm text-[#5a5a59] font-medium">Sistema de Gestión de Compras</p>
                    </div>

                    {/* Tab toggle */}
                    <div className="flex border-b border-gray-100">
                        <button
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${!isSignUp ? 'text-[#4266ac] border-b-2 border-[#4266ac]' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={() => setIsSignUp(false)}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            className={`flex-1 py-3 text-sm font-semibold transition-colors ${isSignUp ? 'text-[#4266ac] border-b-2 border-[#4266ac]' : 'text-gray-400 hover:text-gray-600'}`}
                            onClick={() => setIsSignUp(true)}
                        >
                            Solicitar Acceso
                        </button>
                    </div>

                    {/* Form body */}
                    <div className="px-8 py-7">
                        {isSignUp ? <SignUpForm /> : <LoginForm />}
                        <p className="text-xs text-center text-gray-400 mt-6">
                            Acceso restringido · Solo personal autorizado
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-white/40 mt-4">
                    © 2026. Cloro de Hidalgo S.A. de C.V. Sistema de Compras.
                </p>
            </div>
        </div>
    )
}
