'use client'

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    Camera,
    FlaskConical,
    CheckCircle2,
    XCircle,
    Loader2,
    User,
    ImageIcon,
    X,
} from 'lucide-react'
import type { LabEvidencia } from '@/types'
import { getLabEvidencias, uploadLabEvidencia } from '@/lib/actions/laboratorio'

interface LabEvidenciaSectionProps {
    requisicionId: string
    isLab: boolean
    estatusNombre: string
    onStatusChange?: () => void
}

export function LabEvidenciaSection({
    requisicionId,
    isLab,
    estatusNombre,
    onStatusChange,
}: LabEvidenciaSectionProps) {
    const [evidencias, setEvidencias] = useState<LabEvidencia[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [notas, setNotas] = useState('')
    const [resultado, setResultado] = useState<'liberado' | 'rechazado'>('liberado')
    const [expandedImage, setExpandedImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const canUpload = isLab && estatusNombre.toLowerCase() === 'en revisión'

    useEffect(() => {
        loadEvidencias()
    }, [requisicionId])

    const loadEvidencias = async () => {
        setLoading(true)
        const { data, error } = await getLabEvidencias(requisicionId)
        if (!error && data) {
            setEvidencias(data as LabEvidencia[])
        }
        setLoading(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onload = (ev) => setPreview(ev.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async () => {
        if (!selectedFile) {
            toast.error('Selecciona una foto')
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('foto', selectedFile)
        formData.append('notas', notas)
        formData.append('resultado', resultado)

        const res = await uploadLabEvidencia(requisicionId, formData)

        if (res.error) {
            toast.error('Error', { description: res.error })
        } else {
            toast.success(
                resultado === 'liberado' ? 'Material liberado ✅' : 'Material rechazado ❌'
            )
            setShowForm(false)
            setSelectedFile(null)
            setPreview(null)
            setNotas('')
            setResultado('liberado')
            loadEvidencias()
            onStatusChange?.()
        }
        setUploading(false)
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                    <FlaskConical className="h-3.5 w-3.5" />
                    Análisis de Laboratorio
                </div>
                {canUpload && !showForm && (
                    <Button
                        size="sm"
                        className="h-7 text-xs bg-[#3558a0] hover:bg-[#1A2B4A] text-white"
                        onClick={() => setShowForm(true)}
                    >
                        <Camera className="h-3 w-3 mr-1" />
                        Subir Evidencia
                    </Button>
                )}
            </div>

            {/* Upload Form (Lab only, En Revisión) */}
            {showForm && canUpload && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs font-bold text-[#1A2B4A] uppercase tracking-wider">
                        Nueva Evidencia
                    </p>

                    {/* Photo Upload */}
                    <div
                        className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors relative"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {preview ? (
                            <div className="relative">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-40 mx-auto rounded-lg object-cover"
                                />
                                <button
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setPreview(null)
                                        setSelectedFile(null)
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-blue-500">
                                <ImageIcon className="h-8 w-8" />
                                <span className="text-xs font-medium">
                                    Click para seleccionar foto
                                </span>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Notes */}
                    <Textarea
                        placeholder="Notas del análisis (observaciones, resultados, etc.)"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        className="h-20 text-sm resize-none bg-white"
                    />

                    {/* Resultado Selection */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                                resultado === 'liberado'
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-300'
                            }`}
                            onClick={() => setResultado('liberado')}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Liberar
                        </button>
                        <button
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                                resultado === 'rechazado'
                                    ? 'bg-red-50 border-red-500 text-red-700'
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-red-300'
                            }`}
                            onClick={() => setResultado('rechazado')}
                        >
                            <XCircle className="h-4 w-4" />
                            Rechazar
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-[var(--muted)]"
                            onClick={() => {
                                setShowForm(false)
                                setPreview(null)
                                setSelectedFile(null)
                                setNotas('')
                            }}
                            disabled={uploading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            className={`text-xs text-white ${
                                resultado === 'liberado'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }`}
                            onClick={handleSubmit}
                            disabled={uploading || !selectedFile}
                        >
                            {uploading && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                            {resultado === 'liberado' ? '✅ Liberar Material' : '❌ Rechazar Material'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Evidencias List */}
            {evidencias.length === 0 && !loading ? (
                <div className="text-xs text-[var(--muted)] italic py-2">
                    Sin evidencias de laboratorio registradas.
                </div>
            ) : (
                <div className="space-y-2">
                    {evidencias.map((ev) => (
                        <div
                            key={ev.id}
                            className={`rounded-lg border p-3 flex gap-3 ${
                                ev.resultado === 'liberado'
                                    ? 'bg-emerald-50/50 border-emerald-200'
                                    : 'bg-red-50/50 border-red-200'
                            }`}
                        >
                            {/* Thumbnail */}
                            <img
                                src={ev.foto_url}
                                alt="Evidencia"
                                className="w-16 h-16 rounded-lg object-cover cursor-pointer border shadow-sm hover:opacity-80 transition-opacity"
                                onClick={() => setExpandedImage(ev.foto_url)}
                            />

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        className={`text-[10px] px-1.5 py-0 border-0 ${
                                            ev.resultado === 'liberado'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {ev.resultado === 'liberado' ? '✅ Liberado' : '❌ Rechazado'}
                                    </Badge>
                                    <span className="text-[10px] text-[var(--muted)]">
                                        {format(new Date(ev.created_at), "dd/MMM/yy HH:mm", { locale: es })}
                                    </span>
                                </div>
                                {ev.notas && (
                                    <p className="text-xs text-[var(--foreground)] leading-relaxed">
                                        {ev.notas}
                                    </p>
                                )}
                                <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                                    <User className="h-2.5 w-2.5" />
                                    {ev.profiles?.nombre_completo || 'Lab'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Expanded Image Modal */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setExpandedImage(null)}
                >
                    <div className="relative max-w-3xl max-h-[90vh]">
                        <img
                            src={expandedImage}
                            alt="Evidencia ampliada"
                            className="max-h-[85vh] rounded-xl shadow-2xl object-contain"
                        />
                        <button
                            className="absolute -top-3 -right-3 bg-white text-black rounded-full p-1.5 shadow-lg hover:bg-gray-100"
                            onClick={() => setExpandedImage(null)}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
