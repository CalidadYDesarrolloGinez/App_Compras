import { z } from 'zod'

export const requisicionSchema = z.object({
    fecha_recepcion: z.string().min(1, 'La fecha es requerida'),
    proveedor_id: z.string().uuid('Selecciona un proveedor'),
    producto_id: z.string().uuid('Selecciona un producto'),
    presentacion_id: z.string().uuid('Selecciona una presentación'),
    destino_id: z.string().uuid('Selecciona un destino'),
    estatus_id: z.string().uuid('Selecciona un estatus'),
    cantidad_solicitada: z.number().positive('Debe ser mayor a 0'),
    unidad_cantidad_id: z.string().uuid('Selecciona una unidad'),
    numero_oc: z.string().optional().or(z.literal('')),
    requisicion_numero: z.string().optional().or(z.literal('')),
    fecha_oc: z.string().optional().or(z.literal('')).nullable(),
    fecha_solicitada_entrega: z.string().optional().or(z.literal('')).nullable(),
    fecha_confirmada: z.string().optional().or(z.literal('')).nullable(),
    fecha_entregado: z.string().optional().or(z.literal('')).nullable(),
    cantidad_entregada: z.number().optional().nullable(),
    factura_remision: z.string().optional().or(z.literal('')),
    comentarios: z.string().optional().or(z.literal('')),
})

export type RequisicionSchema = z.infer<typeof requisicionSchema>

export const loginSchema = z.object({
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const signUpSchema = z.object({
    nombre_completo: z.string().min(2, 'Nombre requerido, mínimo 2 caracteres'),
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
})

export type SignUpSchema = z.infer<typeof signUpSchema>

export const proveedorSchema = z.object({
    nombre: z.string().min(2, 'Nombre requerido, mínimo 2 caracteres'),
    activo: z.boolean().default(true),
})

export const productoSchema = z.object({
    nombre: z.string().min(2, 'Nombre requerido, mínimo 2 caracteres'),
    descripcion: z.string().optional(),
    activo: z.boolean().default(true),
})

export const catalogoBaseSchema = z.object({
    nombre: z.string().min(2, 'Nombre requerido, mínimo 2 caracteres'),
    activo: z.boolean().default(true),
})

export const estatusSchema = z.object({
    nombre: z.string().min(2, 'Nombre requerido, mínimo 2 caracteres'),
    color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido (ej: #FF5733)'),
    activo: z.boolean().default(true),
})

export const unidadSchema = z.object({
    nombre: z.string().min(2, 'Nombre requerido, mínimo 2 caracteres'),
    abreviatura: z.string().min(1, 'Abreviatura requerida'),
    activo: z.boolean().default(true),
})
