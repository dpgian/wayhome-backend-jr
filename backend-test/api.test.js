const supertest = require('supertest')
const app = require('./index')
const request = supertest(app)

describe('/ping endpoint', () => {
    test('returns correct values', async () => {
        const res = await request.get('/ping')

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('name')
        expect(res.body).toHaveProperty('status')
        expect(res.body).toHaveProperty('version')
        
    })
})

describe('/forecast/ endpoint', () => {
    test('returns error no city provided', async () => {
        const res = await request.get('/forecast')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe("no city provided")
        expect(res.body.error_code).toBe("invalid request")
    })
})

describe('/forecast/:id endpoint', () => {
    test('return some data', async () => {
        const city = 'london'
        const res = await request.get(`/forecast/${city}`)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('clouds')
        expect(res.body).toHaveProperty('humidity')
        expect(res.body).toHaveProperty('pressure')
        expect(res.body).toHaveProperty('temperature')
    })
    
    test('return data with query temperature', async () => {
        const city = 'london'
        const temp = 'K' // K F C
        const res = await request.get(`/forecast/${city}?tunit=${temp}`)
        
        expect(res.status).toBe(200)
        expect(res.body.temperature.slice(-1)).toBe(temp)
    })
    
    // This test returns failed even though the api response is correct
    test('return 404 does not exist', async () => {
        const city = 'this city does not exist'
        const res = await request.get(`/forecast/${city}`)

        expect(res.status).toBe(404)
        expect(res.body.error).toBe(`Cannot find country '${city}'`)
        expect(res.body.error_code).toBe("country not found")
    })
})
