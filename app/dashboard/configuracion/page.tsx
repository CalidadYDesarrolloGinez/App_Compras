'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthRole } from '@/lib/hooks/useAuthRole'
import { updateProfile, changePassword } from '@/lib/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, User, Lock, Shield, Mail } from 'lucide-react'
import { toast } from 'sonner'

// ─── Schemas ───────────────────────────────────────────────
const profileSchema = z.object({
    nombre_completo: z.string().min(2, 'Mínimo 2 caracteres'),
})
type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z.object({
    new_password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
})
type PasswordForm = z.infer<typeof passwordSchema>

// ─── Role display label map ─────────────────────────────────
const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    admin: { label: 'Administrador', color: '#fff', bg: '#4266ac' },
    coordinadora: { label: 'Coordinadora', color: '#fff', bg: '#7c3aed' },
    laboratorio: { label: 'Laboratorio', color: '#fff', bg: '#0891b2' },
    cedis: { label: 'CEDIS', color: '#fff', bg: '#059669' },
    consulta: { label: 'Consulta', color: '#fff', bg: '#64748b' },
    pendiente: { label: 'Pendiente de aprobación', color: '#fff', bg: '#d97706' },
}

// ─── Section card wrapper ───────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#4266ac]" />
                </div>
                <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    )
}

// ─── Main Page ─────────────────────────────────────────────
export default function ConfiguracionPage() {
    const { user, profile, loading } = useAuthRole()

    // ── Profile form ──
    const profileForm = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: { nombre_completo: '' },
    })
    const [savingProfile, setSavingProfile] = useState(false)

    useEffect(() => {
        if (profile) {
            profileForm.reset({ nombre_completo: profile.nombre_completo ?? '' })
        }
    }, [profile])

    async function onSubmitProfile(values: ProfileForm) {
        setSavingProfile(true)
        const { error } = await updateProfile(values)
        setSavingProfile(false)
        if (error) { toast.error('Error al guardar', { description: error }); return }
        toast.success('Perfil actualizado correctamente')
    }

    // ── Password form ──
    const passwordForm = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { new_password: '', confirm_password: '' },
    })
    const [savingPwd, setSavingPwd] = useState(false)

    async function onSubmitPassword(values: PasswordForm) {
        setSavingPwd(true)
        const { error } = await changePassword(values.new_password)
        setSavingPwd(false)
        if (error) { toast.error('Error al cambiar contraseña', { description: error }); return }
        toast.success('Contraseña actualizada')
        passwordForm.reset()
    }

    if (loading) return (
        <div className="max-w-xl mx-auto flex flex-col gap-5">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
        </div>
    )

    const roleMeta = ROLE_LABELS[profile?.rol ?? ''] ?? { label: profile?.rol ?? '—', color: '#fff', bg: '#64748b' }

    return (
        <div className="max-w-xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#4266ac]">Configuración de Perfil</h1>
                <p className="text-sm text-gray-500 mt-1">Administra tu información personal y contraseña.</p>
            </div>

            {/* Identity card */}
            <div className="bg-gradient-to-r from-[#2d4a80] to-[#4266ac] rounded-xl p-6 text-white flex items-center gap-5">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
                    {(profile?.nombre_completo ?? user?.email ?? 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-lg leading-tight truncate">
                        {profile?.nombre_completo || '(Sin nombre)'}
                    </p>
                    <p className="text-sm text-blue-200 truncate">{user?.email}</p>
                    <span
                        className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                    >
                        {roleMeta.label}
                    </span>
                </div>
            </div>

            {/* Edit name */}
            <Section title="Información Personal" icon={User}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre_completo" className="text-sm text-gray-700">Nombre completo</Label>
                        <Input
                            id="nombre_completo"
                            placeholder="Tu nombre completo"
                            className="border-gray-200 focus-visible:ring-[#4266ac]"
                            {...profileForm.register('nombre_completo')}
                        />
                        {profileForm.formState.errors.nombre_completo && (
                            <p className="text-xs text-red-500">{profileForm.formState.errors.nombre_completo.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm text-gray-700">Correo electrónico</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                            <Input
                                value={user?.email ?? ''}
                                disabled
                                className="pl-9 bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-[11px] text-gray-400">El correo electrónico no se puede modificar.</p>
                    </div>
                    <Button
                        type="submit"
                        disabled={savingProfile}
                        className="bg-[#4266ac] hover:bg-[#62a4dc] text-white"
                    >
                        {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Guardar cambios
                    </Button>
                </form>
            </Section>

            {/* Change password */}
            <Section title="Cambiar Contraseña" icon={Lock}>
                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="new_password" className="text-sm text-gray-700">Nueva contraseña</Label>
                        <Input
                            id="new_password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            className="border-gray-200 focus-visible:ring-[#4266ac]"
                            {...passwordForm.register('new_password')}
                        />
                        {passwordForm.formState.errors.new_password && (
                            <p className="text-xs text-red-500">{passwordForm.formState.errors.new_password.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="confirm_password" className="text-sm text-gray-700">Confirmar contraseña</Label>
                        <Input
                            id="confirm_password"
                            type="password"
                            placeholder="Repite la nueva contraseña"
                            className="border-gray-200 focus-visible:ring-[#4266ac]"
                            {...passwordForm.register('confirm_password')}
                        />
                        {passwordForm.formState.errors.confirm_password && (
                            <p className="text-xs text-red-500">{passwordForm.formState.errors.confirm_password.message}</p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={savingPwd}
                        variant="outline"
                        className="border-[#4266ac] text-[#4266ac] hover:bg-indigo-50"
                    >
                        {savingPwd && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Cambiar contraseña
                    </Button>
                </form>
            </Section>

            {/* Role info (read-only) */}
            <Section title="Rol Asignado" icon={Shield}>
                <div className="flex items-center gap-3">
                    <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                        style={{ backgroundColor: roleMeta.bg, color: roleMeta.color }}
                    >
                        {roleMeta.label}
                    </span>
                    <p className="text-sm text-gray-500">
                        Tu rol es asignado por un administrador y define a qué secciones tienes acceso.
                    </p>
                </div>
            </Section>
        </div>
    )
}
