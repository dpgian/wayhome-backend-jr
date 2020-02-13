import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'

let App = () => {
    // admin: secret
    let [username, setUsername] = React.useState("admin")
    let [password, setPassword] = React.useState('secret')
    let [error, setError] = React.useState('')
    let [city, setCity] = React.useState('')
    let [temp, setTemp] = React.useState('')
    let [pressure, setPressure] = React.useState('')

    let [data, setData] = React.useState({})

    let fetchData = async () => {
        //let auth = { username, password }
        let error = ''
        
        let data = await axios.get(`http://localhost:8080/htmlForecast/${city}?tunit=${temp}&punit=${pressure}`)
                    .catch((e) => error= e.response.status)
                
        if(error === 401) {
            setError('Bad Credentials')
        } else if (error === 400) {
            setError('Enter a City')
        } else if (error === 404) {
            setError('City does not exist')
        } else {
        setData(data.data)
        }
    }

/*

    let getAuth = async () => {
         let session_url = `http://localhost:8080/`;
        let auth = { username, password }
// await axios.post(session_url, {}, {
//   auth
// }).then(function(response) {
//   console.log('Authenticated');
// }).catch(function(error) {
//     console.log(error)
//   console.log('Error on Authentication');
// });


axios.post(session_url, {
    withCredentials: true,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    }
  },{
    auth}).then(function(response) {
    console.log('Authenticated');
  }).catch(function(error) {
    console.log('Error on Authentication');
  });


    }

    */

    return (
        <div style={{textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <input type='text' placeholder='username' value={username} onChange={(e)=> setUsername(e.target.value)}/>
          <input type='text' placeholder='password' value={password} onChange={(e)=> setPassword(e.target.value)}/>
          {error}
          <hr />
          {/*<button type='text' onClick={e => getAuth()}>AUTH</button>*/}
          <form
            onSubmit={e => {
                e.preventDefault()
                setError('')
                fetchData()
            }}
          
          >
              <input type='text' placeholder='Search city' value={city} onChange={(e)=> setCity(e.target.value)}/>
            <br/>
              <input type="radio" id="Kelvin" name="temp" value="K" onClick={(e)=> setTemp(e.target.value)}/>
              <label htmlFor="Kelvin">Kelvin</label>
              <input type="radio" id="Celsius" name="temp" value="C" onClick={(e)=> setTemp(e.target.value)}/>
              <label htmlFor="Celsius">Celsius</label>
              <input type="radio" id="Fahrenheit " name="temp" value="F" onClick={(e)=> setTemp(e.target.value)}/>
              <label htmlFor="Fahrenheit ">Fahrenheit</label>
              <br/>
              <input type="radio" id="pascal " name="pressure" value="pascal" onClick={(e)=> setPressure(e.target.value)}/>
              <label htmlFor="pascal ">hPascal</label>
              <input type="radio" id="Bars" name="pressure" value="bars" onClick={(e)=> setPressure(e.target.value)}/>
              <label htmlFor="Bars">Bars</label>
              <input type="radio" id="Tor" name="pressure" value="tor" onClick={(e)=> setPressure(e.target.value)}/>
              <label htmlFor="Tor">Tor</label>
              <input type="radio" id="Atmospheres " name="pressure" value="atm" onClick={(e)=> setPressure(e.target.value)}/>
              <label htmlFor="Atmospheres ">Atmospheres</label>
              <input type="radio" id="Mercury " name="pressure" value="mercury" onClick={(e)=> setPressure(e.target.value)}/>
              <label htmlFor="Mercury ">Mercury</label>
              <br/>
              <button type='submit'>Search</button>
          </form>

            <hr/>

          <table>
            <thead>
                <tr>
                    <th>
                      Name: {city}
                    </th>
                </tr>
                <tr>
                    <th>Clouds</th>
                    <th>Humidity</th>
                    <th>Pressure</th>
                    <th>Temperature</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td>{data.clouds}</td>
                    <td>{data.humidity}</td>
                    <td>{data.pressure}</td>
                    <td>{data.temperature}</td>
                </tr>
            </tbody>
          </table>

          

        </div>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));

