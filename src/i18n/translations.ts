export const translations = {
    en: {
        // Layout / Navigation
        "nav.dashboard": "Dashboard",
        "nav.stores": "Stores",
        "nav.analytics": "Analytics",
        "nav.settings": "Settings",
        "nav.logout": "Logout",
        "header.addStore": "Add Store",
        
        // Dashboard Overview
        "overview.title": "Global Overview",
        "overview.totalStores": "Total Stores",
        "overview.activeSynced": "Active Synced Stores",
        "overview.syncingNow": "Syncing Now",
        "overview.failedSyncs": "Failed Syncs",
        "overview.welcome.title": "Welcome to Haciéndola Analytics",
        "overview.welcome.desc1": "Select a store from the top menu or go to the ",
        "overview.welcome.desc2": " tab to see specific store metrics.",

        // Analytics
        "analytics.noStore.title": "No Store Selected",
        "analytics.noStore.desc": "Please select a store to view its analytics.",
        "analytics.loading": "Loading analytics...",
        "analytics.revenueOverview": "Revenue Overview",
        "analytics.topProducts": "Top Products",
        "analytics.noProducts": "No products found",
        "analytics.tryAdjustingDate": "Try selecting a different date range",
        "analytics.lastPeriod": "last period",
        
        // Success Case Banner
        "banner.performanceAnalysis": "Performance Case Analysis",
        "banner.comparing": "Comparing",
        "banner.daysOfAccompaniment": "days of accompaniment vs previous period.",
        "banner.revenueIncrease": "Revenue Increase",
        "banner.refRevenue": "Reference Period Revenue",
        "banner.prevRevenue": "Previous Period Revenue",

        // Success Badge
        "badge.analysis": "Analysis",
        "badge.refIncrease": "Reference Increase",
        "badge.duration": "Duration",
        "badge.currPeriodRev": "Current Period Rev",
        "badge.prevPeriodRev": "Previous Period Rev",
        "badge.thresholds": "Thresholds",
        "badge.compareDesc": "Compares current accompaniment duration vs same duration prior to start date.",

        // QuickView / Stores Overview
        "quickview.title": "Quick View",
        "quickview.header": "Quick View",
        "quickview.noSelect.title": "No Store Selected",
        "quickview.noSelect.desc": "Select a store to see the quick view.",
        "quickview.search.placeholder": "Search stores...",
        "table.storeName": "Store Name",
        "table.url": "URL",
        "table.tags": "Tags",
        "table.performance": "Performance Status",
        "table.noStores": "No stores found",
        "table.tryAdjusting": "Try adjusting your search or filters.",
        
        // Metrics
        "metric.revenue": "Total Revenue",
        "metric.orders": "Total Orders",
        "metric.aov": "Average Order Value",
        "metric.sessions": "Total Sessions",
        "metric.conversion": "Conversion Rate",
        "metric.vsLastPeriod": "vs last period",
        "metric.fromComparison": "from comparison",
        "metric.comparedWith": "compared with",
        
        // Status Levels
        "status.fixed": "Fixed",
        "status.growth": "Growth",
        "status.synced": "Synced",
        "status.syncing": "Syncing",
        "status.failed": "Failed",
        "status.all": "All Stores",

        // Analytics Tooltip
        "tooltip.autoCalc.refStart": "Start Date: Based on your selection or store configuration.",
        "tooltip.autoCalc.refEnd": "End Date: If the selected end is in the future, today is used to ensure data accuracy.",
        "tooltip.autoCalc.compLogic": "Calculates the total days in your Reference Period and automatically looks back the same duration ending the day before selected Start Date.",
        "tooltip.autoCalc.methodology": "Matches the standard methodology for period-over-period Performance Benchmarking.",

        "tooltip.autoCalc.refDesc": "Reference Period:",
        "tooltip.autoCalc.compDesc": "Comparison Period:",

        // Store Selector
        "selector.currentStore": "Current Store",
        "selector.selectStore": "Select a store...",

        "level.high": "High",
        "level.medium": "Medium",
        "level.low": "Low",
        "level.none": "None",
        "level.negative": "Negative",

        // Time Periods
        "period.reference": "Reference Period",
        "period.setToRef": "Set to Reference Period",
        "period.previous": "Previous Period",
        "period.autoCalculated": "Auto-Calculated",
        "period.calculationLogic": "Calculation Logic",

        // Tooltips
        "tooltip.searchName": "Search by Name",
        "tooltip.searchNameDesc": "Search across all store names.",
        "tooltip.filterUrl": "Filter by URL",
        "tooltip.filterUrlDesc": "Partial match on store URLs.",
        "tooltip.filterTags": "Filter by Tags",
        "tooltip.filterTagsDesc": "Search stores containing specific tags.",
        "tooltip.filterStatus": "Filter by Status",
        "tooltip.filterStatusDesc": "Filter based on success levels.",
        "tooltip.availableLevels": "Available Levels:",
        
        // Common
        "common.vs": "vs",
        "common.loading": "Loading...",
        "common.error": "An error occurred",
        "common.success": "Success",
        "common.cancel": "Cancel",
        "common.save": "Save",
    },
    es: {
        // Layout / Navigation
        "nav.dashboard": "Panel de Control",
        "nav.stores": "Tiendas",
        "nav.analytics": "Analítica",
        "nav.settings": "Configuración",
        "nav.logout": "Cerrar Sesión",
        "header.addStore": "Agregar Tienda",
        
        // Dashboard Overview
        "overview.title": "Resumen Global",
        "overview.totalStores": "Total de Tiendas",
        "overview.activeSynced": "Tiendas Activas Sincronizadas",
        "overview.syncingNow": "Sincronizando Ahora",
        "overview.failedSyncs": "Sincronizaciones Fallidas",
        "overview.welcome.title": "Bienvenido a Haciéndola Analytics",
        "overview.welcome.desc1": "Selecciona una tienda desde el menú superior o ve a la pestaña ",
        "overview.welcome.desc2": " para ver los detalles de las métricas de una tienda en particular.",

        // Analytics
        "analytics.noStore.title": "Ninguna Tienda Seleccionada",
        "analytics.noStore.desc": "Por favor selecciona una tienda para ver sus métricas.",
        "analytics.loading": "Cargando analítica...",
        "analytics.revenueOverview": "Resumen de Ingresos",
        "analytics.topProducts": "Productos Top",
        "analytics.noProducts": "No se encontraron productos",
        "analytics.tryAdjustingDate": "Intenta seleccionar otro rango de fechas",
        "analytics.lastPeriod": "periodo anterior",
        
        // Success Case Banner
        "banner.performanceAnalysis": "Análisis de Caso de Éxito",
        "banner.comparing": "Comparando",
        "banner.daysOfAccompaniment": "días de acompañamiento vs periodo anterior.",
        "banner.revenueIncrease": "Incremento de Ingresos",
        "banner.refRevenue": "Ingresos Período Referencia",
        "banner.prevRevenue": "Ingresos Período Anterior",

        // Success Badge
        "badge.analysis": "Análisis",
        "badge.refIncrease": "Incremento de Referencia",
        "badge.duration": "Duración",
        "badge.currPeriodRev": "Ingresos Per. Actual",
        "badge.prevPeriodRev": "Ingresos Per. Anterior",
        "badge.thresholds": "Umbrales",
        "badge.compareDesc": "Compara la duración actual de acompañamiento vs la misma duración antes de la fecha de inicio.",

        // QuickView / Vista Rápida
        "quickview.title": "Vista Rápida",
        "quickview.header": "Vista Rápida",
        "quickview.noSelect.title": "Ninguna Tienda Seleccionada",
        "quickview.noSelect.desc": "Selecciona una tienda para ver el resumen.",
        "quickview.search.placeholder": "Buscar tiendas...",
        "table.storeName": "Nombre de la Tienda",
        "table.url": "URL",
        "table.tags": "Etiquetas",
        "table.performance": "Rendimiento",
        "table.noStores": "No se encontraron tiendas",
        "table.tryAdjusting": "Intenta ajustar tu búsqueda o filtros.",
        
        // Metrics
        "metric.revenue": "Ingresos Totales",
        "metric.orders": "Pedidos Totales",
        "metric.aov": "Ticket Promedio",
        "metric.sessions": "Sesiones Totales",
        "metric.conversion": "Tasa de Conversión",
        "metric.vsLastPeriod": "vs periodo anterior",
        "metric.fromComparison": "vs comparación",
        "metric.comparedWith": "comparado con",
        
        // Status Levels
        "status.fixed": "Fijo",
        "status.growth": "Crecimiento",
        "status.synced": "Sincronizado",
        "status.syncing": "Sincronizando...",
        "status.failed": "Fallo Sinc",
        "status.all": "Todas las Tiendas",

        // Analytics Tooltip
        "tooltip.autoCalc.refStart": "Fecha Inicio: Basado en tu selección o configuración.",
        "tooltip.autoCalc.refEnd": "Fecha Fin: Si el fin seleccionado es futuro, se usa hoy para asegurar precisión.",
        "tooltip.autoCalc.compLogic": "Calcula los días totales en tu Período de Referencia y mira hacia atrás la misma duración terminando el día antes de la Fecha de Inicio.",
        "tooltip.autoCalc.methodology": "Coincide con la metodología estándar para comparaciones de rendimiento período a período.",

        "tooltip.autoCalc.refDesc": "Período de Referencia:",
        "tooltip.autoCalc.compDesc": "Período de Comparación:",

        // Store Selector
        "selector.currentStore": "Tienda Actual",
        "selector.selectStore": "Selecciona una tienda...",

        "level.high": "Alto",
        "level.medium": "Medio",
        "level.low": "Leve",
        "level.none": "Ninguno",
        "level.negative": "Negativo",
        // Time Periods
        "period.reference": "Período de Referencia",
        "period.setToRef": "Fijar a Período de Referencia",
        "period.previous": "Período Anterior",
        "period.autoCalculated": "Calculado Automáticamente",
        "period.calculationLogic": "Lógica de Cálculo",
                // Tooltips
        "tooltip.searchName": "Buscar por Nombre",
        "tooltip.searchNameDesc": "Busca en todos los nombres de tiendas.",
        "tooltip.filterUrl": "Filtrar por URL",
        "tooltip.filterUrlDesc": "Coincidencia parcial en URLs.",
        "tooltip.filterTags": "Filtrar por Etiquetas",
        "tooltip.filterTagsDesc": "Busca tiendas con etiquetas específicas.",
        "tooltip.filterStatus": "Filtrar por Estado",
        "tooltip.filterStatusDesc": "Filtrar basado en niveles de éxito.",
        "tooltip.availableLevels": "Niveles Disponibles:",
        
        // Common
        "common.vs": "vs",
        "common.loading": "Cargando...",
        "common.error": "Ocurrió un error",
        "common.success": "Éxito",
        "common.cancel": "Cancelar",
        "common.save": "Guardar",
    }
};

export type Language = 'en' | 'es';
export type TranslationKey = keyof typeof translations.en;
