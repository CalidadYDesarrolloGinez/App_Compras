'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginSchema } from '@/lib/validations/schemas'
import { signIn, signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ShoppingCart, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)

    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    async function onSubmit(values: LoginSchema) {
        setLoading(true)
        const result = isSignUp ? await signUp(values) : await signIn(values)
        if (result?.error) {
            toast.error(isSignUp ? 'Error al registrar' : 'Error de acceso', {
                description: result.error === 'Invalid login credentials'
                    ? 'Correo o contraseña incorrectos'
                    : result.error,
            })
            setLoading(false)
        }
        // On success, server action redirects
    }

    return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1A2B4A 0%, #243660 50%, #1B3D8F 100%)' }}>

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, white 2px, transparent 0)', backgroundSize: '50px 50px' }} />

            <div className="w-full max-w-md px-6 py-8 relative">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header band */}
                    <div className="bg-gradient-to-r from-[#1A2B4A] to-[#1B3D8F] px-8 py-7 text-white text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="bg-white/20 rounded-xl p-2.5">
                                <ShoppingCart className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <div className="text-xl font-bold tracking-tight">Compras</div>
                                <div className="text-xs text-blue-200">Ginéz® Sistema Interno</div>
                            </div>
                        </div>
                        <p className="text-sm text-blue-100 mt-3">
                            Calendario de Recepción de Materias Primas
                        </p>
                    </div>

                    {/* Form */}
                    <div className="px-8 py-7">
                        <h1 className="text-lg font-semibold text-[#1A2B4A] mb-6">
                            {isSignUp ? 'Registrar Nueva Cuenta' : 'Iniciar Sesión'}
                        </h1>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm text-gray-700">
                                    Correo electrónico
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="usuario@empresa.com"
                                        className="pl-9 border-gray-200 focus-visible:ring-[#1B3D8F]"
                                        {...form.register('email')}
                                    />
                                </div>
                                {form.formState.errors.email && (
                                    <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-sm text-gray-700">
                                    Contraseña
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-9 border-gray-200 focus-visible:ring-[#1B3D8F]"
                                        {...form.register('password')}
                                    />
                                </div>
                                {form.formState.errors.password && (
                                    <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 bg-[#1B3D8F] hover:bg-[#1A2B4A] text-white font-semibold py-5 rounded-xl transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    isSignUp ? 'Registrarse' : 'Ingresar al Sistema'
                                )}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-sm border-none bg-transparent underline text-[#1B3D8F] hover:text-[#1A2B4A]"
                            >
                                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Registrate aquí'}
                            </button>
                        </div>

                        <p className="text-xs text-center text-gray-400 mt-6">
                            Acceso restringido · Solo personal autorizado
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-white/40 mt-4">
                    © {new Date().getFullYear()} Ginéz® · Sistema de Compras v1.0
                </p>
            </div>
        </div>
    )
}
