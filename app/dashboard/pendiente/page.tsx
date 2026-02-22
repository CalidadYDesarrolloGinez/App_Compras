'use client'

import { signOut } from '@/lib/actions/auth'
import { Clock, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PendientePage() {
    return (
        <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                {/* Icon */}
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-100 mx-auto mb-6">
                    <Clock className="h-9 w-9 text-amber-500" />
                </div>

                {/* Logo */}
                <img
                    src="/Logo.png"
                    alt="GínEZ"
                    className="h-8 w-auto object-contain mx-auto mb-6"
                />

                <h1 className="text-xl font-bold text-[#0e0c9b] mb-2">
                    Solicitud en revisión
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    Tu cuenta ha sido creada exitosamente. Un administrador revisará tu solicitud y te asignará un rol para que puedas acceder al sistema.<br /><br />
                    <span className="font-medium text-gray-700">Por favor, espera a ser aprobado.</span>
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="outline"
                        className="w-full text-gray-600 border-gray-200 hover:bg-gray-50"
                        onClick={() => window.location.reload()}
                    >
                        Verificar acceso
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-[#c41f1a] hover:bg-red-50 hover:text-[#c41f1a]"
                        onClick={() => signOut()}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                    </Button>
                </div>
            </div>
        </div>
    )
}
