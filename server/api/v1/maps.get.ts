type Coordinate = [number, number]

type ProcessedState = {
  id: string
  name: string
  sigla: string
  coordinates: Coordinate[]
  center: { lat: number, lng: number }
  mockData: { value: number, premium: number, corretores: number }
}

function seededRandom() {
  const x = Math.sin(12345) * 10000
  return x - Math.floor(x)
}

export default defineEventHandler(async (event) => {
  const { productSlug } = getRouterParams(event)

  if (!productSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product slug is required',
    })
  }

  try {
    const TARGET_STATES = {
      SP: { name: 'São Paulo', color: '#F59E0B', mockData: { value: 45, premium: 18500000, corretores: 32 } },
      SC: { name: 'Santa Catarina', color: '#10B981', mockData: { value: 28, premium: 8200000, corretores: 18 } },
      MT: { name: 'Mato Grosso', color: '#EF4444', mockData: { value: 35, premium: 12800000, corretores: 24 } },
      PR: { name: 'Paraná', color: '#3B82F6', mockData: { value: 22, premium: 7600000, corretores: 15 } },
      RJ: { name: 'Rio de Janeiro', color: '#8B5CF6', mockData: { value: 30, premium: 9500000, corretores: 20 } },
      MG: { name: 'Minas Gerais', color: '#EC4899', mockData: { value: 27, premium: 7000000, corretores: 17 } },
    }

    // Ler o arquivo mock-state.json usando $fetch (Nuxt way)
    const mockStateData = await $fetch('/mock-state.json')

    function calculatePolygonCenter(coordinates: Coordinate[]): { lat: number, lng: number } {
      let latSum = 0
      let lngSum = 0
      let count = 0
      for (const coord of coordinates) {
        const [lng, lat] = coord
        latSum += lat
        lngSum += lng
        count++
      }
      return {
        lat: latSum / count,
        lng: lngSum / count,
      }
    }

    function simplifyPolygon(coordinates: Coordinate[], tolerance = 0.01): Coordinate[] {
      if (coordinates.length <= 2)
        return coordinates
      const simplified: Coordinate[] = [coordinates[0]!]
      for (let i = 1; i < coordinates.length - 1; i++) {
        const prev = coordinates[i - 1]!
        const current = coordinates[i]!
        const distToPrev = Math.sqrt(
          (current[0] - prev[0]) ** 2 + (current[1] - prev[1]) ** 2,
        )
        if (distToPrev > tolerance) {
          simplified.push(current)
        }
      }
      simplified.push(coordinates[coordinates.length - 1]!)
      return simplified
    }

    const processedStates: ProcessedState[] = []

    for (const feature of (mockStateData as any).features) {
      const sigla = feature.properties.sigla
      if (!TARGET_STATES[sigla as keyof typeof TARGET_STATES])
        continue
      const stateInfo = TARGET_STATES[sigla as keyof typeof TARGET_STATES]
      const geometry = feature.geometry
      if (geometry.type !== 'MultiPolygon' || !geometry.coordinates.length)
        continue
      const mainPolygon = geometry.coordinates[0][0] as Coordinate[]
      const simplifiedCoordinates = simplifyPolygon(mainPolygon, 0.02)
      const center = calculatePolygonCenter(simplifiedCoordinates)
      processedStates.push({
        id: feature.properties.codigo_ibg,
        name: stateInfo.name,
        sigla: feature.properties.sigla,
        coordinates: simplifiedCoordinates,
        center,
        mockData: stateInfo.mockData,
      })
    }

    const centerLat = processedStates.reduce((sum, state) => sum + state.center.lat, 0) / processedStates.length
    const centerLng = processedStates.reduce((sum, state) => sum + state.center.lng, 0) / processedStates.length

    return {
      success: true,
      data: {
        productSlug,
        markers: processedStates.map(state => ({
          lat: state.center.lat,
          lng: state.center.lng,
          title: state.name,
          value: state.mockData.value,
          color: TARGET_STATES[state.sigla as keyof typeof TARGET_STATES].color,
          size: Math.max(25, state.mockData.value + 10),
          metrics: {
            seguros: state.mockData.value,
            premium: state.mockData.premium,
            corretores: state.mockData.corretores,
          },
        })),
        polygons: processedStates.map(state => ({
          id: `polygon-${state.sigla.toLowerCase()}`,
          paths: state.coordinates.map(coord => ({
            lat: coord[1],
            lng: coord[0],
          })),
          strokeColor: TARGET_STATES[state.sigla as keyof typeof TARGET_STATES].color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: TARGET_STATES[state.sigla as keyof typeof TARGET_STATES].color,
          fillOpacity: 0.2,
          label: `Estado de ${state.name}`,
          metrics: {
            seguros: state.mockData.value,
            premium: state.mockData.premium,
            area: Math.floor(seededRandom() * 500000 + 50000),
          },
        })),
        heatmapPoints: [],
        mapSettings: {
          center: { lat: centerLat, lng: centerLng },
          zoom: 5,
        },
        regionalStats: {
          totalRegions: processedStates.length,
          totalPolicies: processedStates.reduce((sum: number, state) => sum + state.mockData.value, 0),
          totalPremium: processedStates.reduce((sum: number, state) => sum + state.mockData.premium, 0),
        },
        metadata: {
          dataSource: 'geojson-real-coordinates',
          generatedAt: new Date().toISOString(),
        },
      },
    }
  }
  catch (error) {
    console.error('Erro ao processar dados regionais:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
    })
  }
})
