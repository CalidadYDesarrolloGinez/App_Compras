// ============================================================
// CATALOG TYPES
// ============================================================

export interface Proveedor {
    id: string
    nombre: string
    activo: boolean
    created_at: string
}

export interface Producto {
    id: string
    nombre: string
    descripcion: string | null
    activo: boolean
    created_at: string
}

export interface Presentacion {
    id: string
    nombre: string
    activo: boolean
    created_at: string
}

export interface Destino {
    id: string
    nombre: string
    activo: boolean
    created_at: string
}

export interface Estatus {
    id: string
    nombre: string
    color_hex: string
    activo: boolean
    created_at: string
}

export interface Unidad {
    id: string
    nombre: string
    abreviatura: string
    activo: boolean
    created_at: string
}

// ============================================================
// MAIN ENTITIES
// ============================================================

export interface Requisicion {
    id: string
    fecha_recepcion: string
    proveedor_id: string
    producto_id: string
    presentacion_id: string
    destino_id: string
    estatus_id: string
    cantidad_solicitada: number
    unidad_cantidad_id: string
    numero_oc: string | null
    requisicion_numero: string | null
    fecha_oc: string | null
    fecha_solicitada_entrega: string | null
    fecha_confirmada: string | null
    fecha_entregado: string | null
    cantidad_entregada: number | null
    factura_remision: string | null
    comentarios: string | null
    created_by: string
    created_at: string
    updated_at: string
    // Joined relations
    proveedor?: Proveedor
    producto?: Producto
    presentacion?: Presentacion
    destino?: Destino
    estatus?: Estatus
    unidad_cantidad?: Unidad
}

export interface RequisicionHistorial {
    id: string
    requisicion_id: string
    campo_modificado: string
    valor_anterior: string | null
    valor_nuevo: string | null
    usuario_id: string
    created_at: string
    profiles?: Profile
}

// ============================================================
// AUTH / ROLES
// ============================================================

export type UserRole = 'admin' | 'coordinadora' | 'consulta'

export interface Profile {
    id: string
    nombre_completo: string | null
    rol: UserRole
    created_at: string
    updated_at: string
}

// ============================================================
// FORM TYPES
// ============================================================

export interface RequisicionFormData {
    fecha_recepcion: string
    proveedor_id: string
    producto_id: string
    presentacion_id: string
    destino_id: string
    estatus_id: string
    cantidad_solicitada: number
    unidad_cantidad_id: string
    numero_oc?: string | null
    requisicion_numero?: string | null
    fecha_oc?: string | null
    fecha_solicitada_entrega?: string | null
    fecha_confirmada?: string | null
    fecha_entregado?: string | null
    cantidad_entregada?: number | null
    factura_remision?: string | null
    comentarios?: string | null
}

// ============================================================
// FILTER TYPES
// ============================================================

export interface RequisicionFilters {
    proveedor_id?: string
    destino_id?: string
    estatus_id?: string
    fecha_desde?: string
    fecha_hasta?: string
    search?: string
}

// ============================================================
// CALENDAR TYPES
// ============================================================

export interface CalendarEvent {
    id: string
    title: string
    start: string
    backgroundColor: string
    borderColor: string
    extendedProps: {
        requisicion: Requisicion
        proveedor_nombre: string
        estatus_nombre: string
        estatus_color: string
    }
}

// ============================================================
// CATALOG AGGREGATED
// ============================================================

export interface Catalogos {
    proveedores: Proveedor[]
    productos: Producto[]
    presentaciones: Presentacion[]
    destinos: Destino[]
    estatus: Estatus[]
    unidades: Unidad[]
}
