const express = require('express')
require('dotenv').config()
const path = require('path')
const cors = require('cors')

const axios = require('axios')
const app = express()
module.exports = app
const basicAuth = require('express-basic-auth')

const PORT = process.env.PORT
const APIKEY = process.env.APIKEY
const URI = process.env.URI

app.use(cors())
//Basic Auth
// app.use(basicAuth({
//     users: { 'admin': 'secret' },
//     challenge: true,
//     unauthorizedResponse: getUnauthorizedResponse
// }))

function getUnauthorizedResponse(req) {
    console.log(req.auth)
    return req.auth ? 'Credentials rejected' : 'No credentials provided'
}

// GET /ping
app.get('/ping', (req, res) => {
    const response = {
    "name": "weatherservice",
    "status": "ok",
    "version": process.env.npm_package_version    
    }
    
    res.status(200).send(response)
})

//GET /forecast with no city provided
app.get('/forecast', (req, res) => {
    res.status(400).send({
        "error": "no city provided",
        "error_code": "invalid request"
    })
})

// Middleware to cache results
var memoMiddleware = (req, res, next) => {
    const key = req.url
    if (cache[key]) {
        res.send(JSON.parse(cache[key]))    
    } else {
        res.sendResponse = res.send
        res.send = (body) => {
            cache[key] = body
            res.sendResponse(body)
        }
        next()
    }
}

let cache = {}
// GET /forecast/<city>
app.get('/forecast/:city', (req, res) => {

    let key = req.url
    if (cache[key]) {
        res.send(cache[key])
        return
    } else {
        getData()
    }

    async function getData() {

        try {
            // Temperature F , K , C (default)
            const tunit = req.query.tunit == 'K' ? '' :
                          req.query.tunit == 'F' ? 'imperial' : 'metric'
            const tsymbol = (req.query.tunit=='K' || req.query.tunit=='F') ? req.query.tunit : 'C'
            // Pressure bars, tor, atm, mercury, default to hPa
            const punit = req.query.punit ? req.query.punit : 'pascal'

            // Functions to convert pressure and cloud
            const getPressure = (pressureValue, punit) => {
                let pascal = pressureValue * 100
                
                switch(punit) {
                    case 'bars':
                        return (pascal / 100000).toFixed(4) + ' bar'
                    case 'tor':
                        return (pascal * 0.007501).toFixed(4) + ' torr'
                    case 'atm': 
                        return (pascal / 101325).toFixed(4) + ' atm'
                    case 'mercury':
                        return (pascal * 0.00750062).toFixed(4) + ' mmHg';
                    default :
                        return pressureValue + ' hPa'
                }

            }

            const getCloud = (cloudValue) => {
    
                switch(true) {
                    case cloudValue < 11:
                        return 'clear sky'
                    case  (37 > cloudValue && cloudValue > 10):
                        return 'few clouds'
                    case (61 > cloudValue && cloudValue > 36):
                        return 'scattered clouds'
                    case (85 > cloudValue && cloudValue > 60):
                        return 'broken clouds'
                    case cloudValue > 85 :
                        return "overcast"
                }

            }

            const fetchedData = await axios.get(`${URI}?q=${req.params.city}&appid=${APIKEY}&units=${tunit}`)
            
            const temperature = fetchedData.data.main.temp+tsymbol
            const humidity = fetchedData.data.main.humidity+'%'
            const pressureValue = fetchedData.data.main.pressure
            const cloudValue = fetchedData.data.clouds.all
            
            let pressure = getPressure(pressureValue, punit)
            
            let clouds = getCloud(cloudValue)

            const response = {
                clouds,
                humidity,
                pressure,
                temperature
            }

            cache[key] = response
            res.status(200).send(response)
            return 

        } catch (e) {
            
            if(e.response.data.cod=='404'){
                //response.data.message = 'city not found'
                res.status(404).send({
                    "error": `Cannot find country '${req.params.city}'`,
                    "error_code": "country not found"
                })
                return
            }

            res.status(500).send({
                "error": "Something went wrong",
                "error_code": "internal server error"
            })
            return

        }
    }

})

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('./client/build' ))
}

// app.get('*', (req,res) => {
//      res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
// })

app.listen(PORT, () => console.log(`Server running on ${PORT}`))

/*
        Caching could be improved by saving as key only the name of the city requested
            This would need to store the temperature from the request and a function to 
            calculate the different units (same as getPressure)

    !!! After implementing caching sometimes takes too long for the first fetch and it
        might timeout the request

    !  Caching fetches two times instead of one

    !!! There is no limit on caching

    !! Caching is not working properly. After caching and searching again with a different 
        pressure unit, it send the cached one ignoring our request
        
*/