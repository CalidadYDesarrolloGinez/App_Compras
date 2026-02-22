'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPendingUsers, getActiveUsers, approveUser, rejectUser, updateUserRole } from '@/lib/actions/users'
import type { Profile, UserRole } from '@/types'
import { useAuthRole } from '@/lib/hooks/useAuthRole'
import { useRouter } from 'next/navigation'
import {
    Shield,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    UserCog,
    AlertTriangle,
    Loader2,
    ChevronDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

// ─── Role metadata ─────────────────────────────────────────
const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
    admin: { label: 'Admin', color: '#ffffff', bg: '#0e0c9b' },
    coordinadora: { label: 'Coordinadora', color: '#ffffff', bg: '#7c3aed' },
    laboratorio: { label: 'Laboratorio', color: '#ffffff', bg: '#0891b2' },
    cedis: { label: 'CEDIS', color: '#ffffff', bg: '#059669' },
    consulta: { label: 'Consulta (deprecado)', color: '#ffffff', bg: '#64748b' },
    pendiente: { label: 'Pendiente', color: '#ffffff', bg: '#d97706' },
}

const ASSIGNABLE_ROLES: UserRole[] = ['admin', 'coordinadora', 'laboratorio', 'cedis']
// ───────────────────────────────────────────────────────────

function RoleBadge({ rol }: { rol: string }) {
    const meta = ROLE_META[rol] ?? { label: rol, color: '#fff', bg: '#64748b' }
    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: meta.bg, color: meta.color }}
        >
            {meta.label}
        </span>
    )
}

// ─── Pending Users Section ─────────────────────────────────
function PendingUsersSection({ onRefresh }: { onRefresh: () => void }) {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [approveModal, setApproveModal] = useState<{ open: boolean; user: Profile | null; role: UserRole }>({
        open: false, user: null, role: 'laboratorio'
    })
    const [rejectModal, setRejectModal] = useState<{ open: boolean; user: Profile | null }>({ open: false, user: null })
    const [saving, setSaving] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        const { data } = await getPendingUsers()
        setUsers((data as Profile[]) ?? [])
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const handleApprove = async () => {
        if (!approveModal.user) return
        setSaving(true)
        const { error } = await approveUser(approveModal.user.id, approveModal.role)
        setSaving(false)
        setApproveModal({ open: false, user: null, role: 'laboratorio' })
        if (error) { toast.error('Error al aprobar usuario'); return }
        toast.success('Usuario aprobado correctamente')
        load(); onRefresh()
    }

    const handleReject = async () => {
        if (!rejectModal.user) return
        setSaving(true)
        const { error } = await rejectUser(rejectModal.user.id)
        setSaving(false)
        setRejectModal({ open: false, user: null })
        if (error) { toast.error('Error al rechazar usuario'); return }
        toast.success('Usuario rechazado y eliminado')
        load()
    }

    if (loading) return (
        <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
    )

    if (users.length === 0) return (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <CheckCircle2 className="h-12 w-12 mb-3 text-emerald-300" />
            <p className="font-semibold text-gray-600">Sin solicitudes pendientes</p>
            <p className="text-sm mt-1">Todos los usuarios están aprobados.</p>
        </div>
    )

    return (
        <>
            <div className="space-y-3">
                {users.map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{u.nombre_completo || '(sin nombre)'}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                Registro: {new Date(u.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0 ml-4">
                            <Button
                                size="sm"
                                className="bg-[#0e0c9b] hover:bg-[#1614b5] text-white text-xs"
                                onClick={() => setApproveModal({ open: true, user: u, role: 'laboratorio' })}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                Aprobar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-[#c41f1a] border-red-200 hover:bg-red-50 hover:border-[#c41f1a] text-xs"
                                onClick={() => setRejectModal({ open: true, user: u })}
                            >
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                Rechazar
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Approve Modal */}
            <Dialog open={approveModal.open} onOpenChange={o => !o && setApproveModal(p => ({ ...p, open: false }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aprobar usuario</DialogTitle>
                        <DialogDescription>
                            Selecciona el rol que se asignará a <strong>{approveModal.user?.nombre_completo || approveModal.user?.email}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-2">
                        {ASSIGNABLE_ROLES.map(r => (
                            <button
                                key={r}
                                onClick={() => setApproveModal(p => ({ ...p, role: r }))}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${approveModal.role === r
                                        ? 'border-[#0e0c9b] bg-indigo-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: ROLE_META[r]?.bg }}
                                />
                                {ROLE_META[r]?.label}
                            </button>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveModal(p => ({ ...p, open: false }))}>Cancelar</Button>
                        <Button className="bg-[#0e0c9b] hover:bg-[#1614b5]" onClick={handleApprove} disabled={saving}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Confirmar aprobación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={rejectModal.open} onOpenChange={o => !o && setRejectModal({ open: false, user: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-[#c41f1a] flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Rechazar usuario
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro? Esto eliminará permanentemente la cuenta de <strong>{rejectModal.user?.email}</strong>. El usuario deberá registrarse nuevamente.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectModal({ open: false, user: null })}>Cancelar</Button>
                        <Button className="bg-[#c41f1a] hover:bg-[#a31a16]" onClick={handleReject} disabled={saving}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Sí, rechazar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── Active Users Section ──────────────────────────────────
function ActiveUsersSection({ refresh }: { refresh: number }) {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        const { data } = await getActiveUsers()
        setUsers((data as Profile[]) ?? [])
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load, refresh])

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setSaving(userId)
        const { error } = await updateUserRole(userId, newRole)
        setSaving(null)
        if (error) { toast.error('Error al actualizar rol'); return }
        toast.success('Rol actualizado correctamente')
        load()
    }

    if (loading) return (
        <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
    )

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left border-b border-gray-100">
                        <th className="pb-3 font-semibold text-[#0e0c9b] pr-4">Nombre</th>
                        <th className="pb-3 font-semibold text-[#0e0c9b] pr-4">Email</th>
                        <th className="pb-3 font-semibold text-[#0e0c9b] pr-4">Rol Actual</th>
                        <th className="pb-3 font-semibold text-[#0e0c9b] pr-4">Alta</th>
                        <th className="pb-3 font-semibold text-[#0e0c9b] text-right">Cambiar Rol</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 pr-4 font-medium text-gray-900">{u.nombre_completo || '—'}</td>
                            <td className="py-3 pr-4 text-gray-500 text-xs">{u.email}</td>
                            <td className="py-3 pr-4"><RoleBadge rol={u.rol} /></td>
                            <td className="py-3 pr-4 text-xs text-gray-400">
                                {new Date(u.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-3 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5" disabled={saving === u.id}>
                                            {saving === u.id && <Loader2 className="h-3 w-3 animate-spin" />}
                                            Cambiar <ChevronDown className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {ASSIGNABLE_ROLES.map(r => (
                                            <DropdownMenuItem
                                                key={r}
                                                className="gap-2 text-xs"
                                                onClick={() => handleRoleChange(u.id, r)}
                                                disabled={u.rol === r}
                                            >
                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ROLE_META[r]?.bg }} />
                                                {ROLE_META[r]?.label}
                                                {u.rol === r && <span className="ml-auto text-[10px] text-gray-400">actual</span>}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {users.length === 0 && (
                <p className="text-center text-gray-400 py-10">No hay usuarios activos registrados.</p>
            )}
        </div>
    )
}

// ─── Main Page ─────────────────────────────────────────────
export default function AdminPage() {
    const [tab, setTab] = useState<'pendientes' | 'activos'>('pendientes')
    const [activeRefresh, setActiveRefresh] = useState(0)
    const { canAccessAdmin, loading } = useAuthRole()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !canAccessAdmin) {
            router.replace('/dashboard/calendar')
        }
    }, [loading, canAccessAdmin, router])

    if (loading) return null

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0e0c9b]">Administración de Usuarios</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Aprueba solicitudes de acceso y gestiona los roles del equipo.
                </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex gap-1 p-1 border-b border-gray-100">
                    <button
                        onClick={() => setTab('pendientes')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'pendientes'
                                ? 'bg-[#0e0c9b] text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Clock className="h-4 w-4" />
                        Solicitudes Pendientes
                    </button>
                    <button
                        onClick={() => setTab('activos')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'activos'
                                ? 'bg-[#0e0c9b] text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        Usuarios Activos
                    </button>
                </div>

                <div className="p-6">
                    {tab === 'pendientes' && (
                        <PendingUsersSection onRefresh={() => setActiveRefresh(p => p + 1)} />
                    )}
                    {tab === 'activos' && (
                        <ActiveUsersSection refresh={activeRefresh} />
                    )}
                </div>
            </div>
        </div>
    )
}
