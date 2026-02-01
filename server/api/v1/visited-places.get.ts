export default defineEventHandler(async (event) => {
  try {
    // Dados dos locais visitados - inicialmente vazio
    const visitedPlaces = {
      success: true,
      data: {
        places: [],
        mapSettings: {
          center: { lat: -27.5954, lng: -48.548 },
          zoom: 7,
        },
      },
    }

    return visitedPlaces
  } catch (error) {
    console.error('Erro ao retornar dados de locais visitados:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao carregar dados de locais visitados',
    })
  }
})
