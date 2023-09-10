import React from 'react'
import data from '../testData/marketData.json'

const DropDown = () => {
  const [menu, setMenu] = React.useState('TBD')
  const handleMenuClick = (event, stock) => {
    setMenu(stock)
  }

  const generateHeading = () => {
    return <h1>{menu}</h1>
  }

  const generateMenus = () => {
    return (
      <ul>
        {data.TopStockMarkets.map((market) => {
          return (
            <li>
              <a href="#" aria-haspopup="true">
                {market.MarketName}
              </a>
              <ul className="dropdown" aria-label="submenu">
                {data.TopStockMarkets.find((val) => {
                  return val.MarketName === market.MarketName
                }).TopIndustries.map((industry) => {
                  return (
                    <li>
                      <a href="#">{industry.IndustryName}</a>
                      <ul className="dropdown" aria-label="submenu">
                        {industry.TopStocks.map((stock) => {
                          return (
                            <li>
                              <a
                                href="#"
                                onClick={(event) => {
                                  handleMenuClick(event, stock)
                                }}
                              >
                                {stock}
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="dropDownCss">
      {generateHeading()}
      <nav role="navigation">{generateMenus()}</nav>
    </div>
  )
}

export default DropDown
