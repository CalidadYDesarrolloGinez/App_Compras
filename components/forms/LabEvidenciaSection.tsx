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
    const [previews, setPreviews] = useState<string[]>([])
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
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
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        const totalFiles = [...selectedFiles, ...files].slice(0, 5)
        setSelectedFiles(totalFiles)
        
        // Clear existing previews to avoid memory leaks if needed, though simple for now
        const newPreviews: string[] = []
        let processed = 0

        totalFiles.forEach((file) => {
            const reader = new FileReader()
            reader.onload = (ev) => {
                newPreviews.push(ev.target?.result as string)
                processed++
                if (processed === totalFiles.length) {
                    setPreviews(newPreviews)
                }
            }
            reader.readAsDataURL(file)
        })

        // Reset input value to allow selecting same files if needed
        if (e.target) e.target.value = ''
    }

    const removeFile = (index: number) => {
        const newFiles = [...selectedFiles]
        newFiles.splice(index, 1)
        setSelectedFiles(newFiles)

        const newPreviews = [...previews]
        newPreviews.splice(index, 1)
        setPreviews(newPreviews)
    }

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Selecciona al menos una foto')
            return
        }

        setUploading(true)
        const formData = new FormData()
        selectedFiles.forEach((file) => {
            formData.append('fotos', file)
        })
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
            setSelectedFiles([])
            setPreviews([])
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
                <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs font-bold text-[#1A2B4A] dark:text-blue-400 uppercase tracking-wider">
                        Nueva Evidencia
                    </p>

                    {/* Photo Upload Area */}
                    <div className="space-y-2">
                        <div
                            className="border-2 border-dashed border-blue-300 dark:border-blue-500/30 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="flex flex-col items-center gap-1 text-blue-500 dark:text-blue-400">
                                <Camera className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase tracking-tight">
                                    Añadir fotos (hasta 5)
                                </span>
                            </div>
                        </div>

                        {/* Previews Grid */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-5 gap-2 pt-1">
                                {previews.map((src, idx) => (
                                    <div key={idx} className="relative aspect-square group">
                                        <img
                                            src={src}
                                            alt={`Preview ${idx + 1}`}
                                            className="w-full h-full rounded-lg object-cover border border-blue-200 shadow-sm"
                                        />
                                        <button
                                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeFile(idx)
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
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
                        className="h-24 text-sm resize-none bg-white dark:bg-black/20 dark:border-white/10"
                    />

                    {/* Resultado Selection */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                                resultado === 'liberado'
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-300 dark:bg-black/10 dark:border-white/5'
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
                                    ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-red-300 dark:bg-black/10 dark:border-white/5'
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
                                setPreviews([])
                                setSelectedFiles([])
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
                            disabled={uploading || selectedFiles.length === 0}
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
                <div className="space-y-3">
                    {evidencias.map((ev) => {
                        const allFotos = ev.fotos && ev.fotos.length > 0 ? ev.fotos : [ev.foto_url]
                        return (
                            <div
                                key={ev.id}
                                className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                                    ev.resultado === 'liberado'
                                        ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20'
                                        : 'bg-red-50/50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Gallery Masonry-style */}
                                    <div className={`grid gap-2 shrink-0 ${
                                        allFotos.length === 1 ? 'grid-cols-1' : 
                                        allFotos.length === 2 ? 'grid-cols-2' : 
                                        'grid-cols-2'
                                    }`}>
                                        {allFotos.map((foto, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`relative group ${
                                                    allFotos.length === 1 ? 'w-32 h-32' : 
                                                    allFotos.length === 3 && idx === 0 ? 'col-span-2 w-full h-24' :
                                                    'w-20 h-20'
                                                }`}
                                            >
                                                <img
                                                    src={foto}
                                                    alt={`Evidencia ${idx + 1}`}
                                                    className="w-full h-full rounded-xl object-cover cursor-pointer border-2 border-white dark:border-white/10 shadow-md group-hover:scale-105 transition-transform"
                                                    onClick={() => setExpandedImage(foto)}
                                                />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
                                                    <ImageIcon className="h-4 w-4 text-white" />
                                                </div>
                                                {allFotos.length > 1 && (
                                                    <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                                                        {idx + 1}/{allFotos.length}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] px-2 py-0 border font-bold uppercase tracking-wider ${
                                                    ev.resultado === 'liberado'
                                                        ? 'bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                                                        : 'bg-red-100/80 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                                                }`}
                                            >
                                                {ev.resultado === 'liberado' ? 'LIBERADO' : 'RECHAZADO'}
                                            </Badge>
                                            <span className="text-[10px] text-[var(--muted)] font-medium">
                                                {format(new Date(ev.created_at), "dd/MMM/yy HH:mm", { locale: es })}
                                            </span>
                                        </div>

                                        {ev.notas && (
                                            <div className="bg-[var(--bg)]/60 dark:bg-black/20 p-3 rounded-lg border border-white/20 dark:border-white/5 shadow-inner">
                                                <p className="text-xs text-[var(--foreground)] leading-relaxed whitespace-pre-wrap font-medium indent-0">
                                                    {ev.notas}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]/30">
                                            <div className="h-5 w-5 rounded-full bg-[var(--navy)]/10 flex items-center justify-center text-[8px] font-bold text-[var(--navy)] border border-[var(--navy)]/20 shadow-sm">
                                                {(ev.profiles?.nombre_completo || 'L')[0].toUpperCase()}
                                            </div>
                                            <span className="text-[10px] font-bold text-[var(--foreground)] tracking-tight">
                                                {ev.profiles?.nombre_completo || 'PERSONAL DE LABORATARIO'}
                                            </span>
                                            <span className="text-[9px] text-[var(--muted)] opacity-60 ml-auto flex items-center gap-1 font-medium">
                                                <FlaskConical className="h-2.5 w-2.5" /> Lab
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
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
