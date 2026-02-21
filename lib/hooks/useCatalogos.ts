'use client'

import { useEffect, useState } from 'react'
import { getCatalogos } from '@/lib/actions/requisiciones'
import type { Catalogos } from '@/types'

export function useCatalogos() {
    const [catalogos, setCatalogos] = useState<Catalogos>({
        proveedores: [],
        productos: [],
        presentaciones: [],
        destinos: [],
        estatus: [],
        unidades: [],
    })
    const [loading, setLoading] = useState(true)

    const fetchCatalogos = async () => {
        setLoading(true)
        try {
            const data = await getCatalogos()
            setCatalogos(data)
        } catch (error) {
            console.error('Failed to load catalogs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCatalogos()
    }, [])

    return { catalogos, loading, refresh: fetchCatalogos }
}
