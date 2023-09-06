import React from 'react'

const Checkboxes = () => {
  const [checkBoxValues, setCheckBoxValues] = React.useState({})

  const carBrands = [
    { Japan: ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Lexus', 'Subaru'] },
    { 'United States': ['Ford', 'Chevrolet', 'Jeep', 'Tesla'] },
    { Germany: ['Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi'] },
  ]

  const handleChangeCountry = (event, country, brands) => {
    const temp = new Object()
    temp[country] = { checked: event.target.checked }

    if (event.target.checked === true) {
      brands.map((brand) => {
        const el = document.getElementById(brand) as HTMLInputElement
        if (el.checked === false) {
          document.getElementById(brand).click()
        }
        temp[brand] = { checked: true }
      })
    } else {
      brands.map((brand) => {
        const el = document.getElementById(brand) as HTMLInputElement
        if (el.checked === true) {
          document.getElementById(brand).click()
        }
        temp[brand] = { checked: false }
      })
    }
    setCheckBoxValues({ ...checkBoxValues, ...temp })
  }

  const handleChangeBrand = (event, country, brand) => {
    const temp = new Object()
    temp[brand] = { checked: event.target.checked }
    temp[country] = {}

    const countryElement = document.getElementById(country) as HTMLInputElement
    const brandsOfSameCountry = carBrands.find(
      (val) => Object.keys(val)[0] === country
    )
    const checkedBrands = brandsOfSameCountry[country].map(
      (brand) => (document.getElementById(brand) as HTMLInputElement).checked
    )

    if (event.target.checked === true) {
      if (checkedBrands.every((val) => val === true)) {
        countryElement.indeterminate = false
        temp[country].indeterminate = false
        countryElement.checked = true
        temp[country].checked = true
      } else {
        countryElement.indeterminate = true
        temp[country].indeterminate = true
      }
    } else {
      if (checkedBrands.every((val) => val === false)) {
        countryElement.checked = false
        temp[country].checked = false
        countryElement.indeterminate = false
        temp[country].indeterminate = false
      } else {
        countryElement.checked = false
        temp[country].checked = false
        countryElement.indeterminate = true
        temp[country].indeterminate = true
      }
    }
    setCheckBoxValues({ ...checkBoxValues, ...temp })
  }

  const generateSummary = () => {
    return carBrands.map((brandHash) => {
      const country = Object.keys(brandHash)[0]
      if (
        checkBoxValues[country] !== undefined &&
        (checkBoxValues[country].checked === true ||
          checkBoxValues[country].indeterminate === true)
      ) {
        return (
          <h5 key={`${country}`} id={`${country.replace(/\s/g, '')}Block`}>
            {`${country}: `}
            {brandHash[country].map((brand) => {
              if (
                checkBoxValues[brand] !== undefined &&
                checkBoxValues[brand].checked
              ) {
                return `${brand} `
              }
            })}
          </h5>
        )
      }
    })
  }

  return (
    <div>
      <div>
        <ul>
          {carBrands.map((values) => {
            const country = Object.keys(values)[0]
            return (
              <ul
                id="checkbox-list"
                className="row"
                key={`${country}-checkbox-list`}
              >
                <li key={`${country}`}>
                  <label>
                    <input
                      type="checkbox"
                      id={`${country}`}
                      onChange={(event) =>
                        handleChangeCountry(event, country, values[country])
                      }
                    />
                    {`${country}`}
                  </label>
                  <ul key={`${country}`}>
                    {values[country].map((brand) => {
                      return (
                        <li key={`${brand}`}>
                          <label>
                            <input
                              type="checkbox"
                              id={`${brand}`}
                              onChange={(event) => {
                                handleChangeBrand(event, country, brand)
                              }}
                            />
                            {`${brand}`}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              </ul>
            )
          })}
        </ul>
      </div>
      <div>{generateSummary()}</div>
    </div>
  )
}
export default Checkboxes
