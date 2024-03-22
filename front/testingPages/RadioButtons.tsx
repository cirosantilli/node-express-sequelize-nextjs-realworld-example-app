import React from 'react'
import data from '../testData/marketData.json'

const RadioButton = () => {
  const [radioValues, setRadioValues] = React.useState({})
  const handleMarketChange = (event, market) => {
    setRadioValues({ market: market, value: event.target.checked })
  }

  const handleIndustryChange = (event, industry) => {
    setRadioValues({
      ...radioValues,
      ...{ industry: industry, value: event.target.checked },
    })
  }

  const handleStockChange = (event, stock) => {
    setRadioValues({
      ...radioValues,
      ...{ stock: stock, value: event.target.checked },
    })
  }

  const generateMarketList = () => {
    return (
      <div className="card">
        <h1>World Markets</h1>
        {data.TopStockMarkets.map((val) => {
          return (
            <div key={val.MarketName}>
              <input
                type="radio"
                id={val.MarketName}
                name={'topMarkets'}
                onClick={(event) => handleMarketChange(event, val.MarketName)}
              />
              <label key={val.MarketName}>{val.MarketName}</label>
            </div>
          )
        })}
      </div>
    )
  }

  const generateIndustries = () => {
    const market = data.TopStockMarkets.find(
      (market) => market.MarketName === radioValues['market']
    )
    if (market === undefined) {
      return <p></p>
    } else {
      return (
        <div className="card">
          <h1>Industries</h1>
          {market.TopIndustries.map((val) => {
            return (
              <div key={val.IndustryName}>
                <input
                  type="radio"
                  id={val.IndustryName}
                  name={'topIndustries'}
                  onClick={(event) =>
                    handleIndustryChange(event, val.IndustryName)
                  }
                />
                <label key={val.IndustryName}>{val.IndustryName}</label>
              </div>
            )
          })}
        </div>
      )
    }
  }

  const generateStocks = () => {
    const market = data.TopStockMarkets.find(
      (market) => market.MarketName === radioValues['market']
    )

    if (market === undefined || radioValues['industry'] === undefined) {
      return <p></p>
    } else {
      const industry = market.TopIndustries.find(
        (market) => market.IndustryName === radioValues['industry']
      )

      return (
        <div className="card">
          <h1>Stocks</h1>
          {industry.TopStocks.map((val) => {
            return (
              <div key={val}>
                <input
                  type="radio"
                  id={val}
                  name={'topStocks'}
                  onChange={(event) => handleStockChange(event, val)}
                />
                <label key={val}>{val}</label>
              </div>
            )
          })}
        </div>
      )
    }
  }

  const generateSummary = () => {
    let temp
    ;['market', 'industry', 'stock'].forEach((val, idx) => {
      if (idx === 0 && radioValues[val] !== undefined) {
        temp = `${radioValues[val]}`
      } else if (radioValues[val] !== undefined) {
        temp += ` - ${radioValues[val]}`
      }
    })
    return <h5 id="results">{temp}</h5>
  }

  return (
    <div>
      <form>
        <fieldset>
          <legend>{generateSummary()}</legend>
          {generateMarketList()}
          {generateIndustries()}
          {generateStocks()}
        </fieldset>
      </form>
    </div>
  )
}

export default RadioButton
