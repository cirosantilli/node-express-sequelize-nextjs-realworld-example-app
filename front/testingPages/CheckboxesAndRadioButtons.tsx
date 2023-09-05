import React from 'react'

const CheckboxesAndRadioButtons = () => {
  // const carBrands = ['Toyota']

  const carBrands = [
    { Japan: ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Lexus', 'Subaru'] },
    { 'United States': ['Ford', 'Chevrolet', 'Jeep', 'Tesla'] },
    { Germany: ['Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi'] },
  ]

  const handleChangeCountry = (event, brands) => {
    if (event.target.checked === true) {
      brands.map((brand) => {
        const el = document.getElementById(brand) as HTMLInputElement
        if (el.checked === false) {
          document.getElementById(brand).click()
        }
      })
    } else {
      brands.map((brand) => {
        const el = document.getElementById(brand) as HTMLInputElement
        if (el.checked === true) {
          document.getElementById(brand).click()
        }
      })
    }
  }

  const handleChangeBrand = (event, country, brand) => {
    const brandElement = document.getElementById(brand) as HTMLInputElement
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
        countryElement.checked = true
      } else {
        countryElement.indeterminate = true
      }
    } else {
      if (checkedBrands.every((val) => val === false)) {
        countryElement.checked = false
        countryElement.indeterminate = false
      } else {
        countryElement.checked = false
        countryElement.indeterminate = true
      }
    }
  }

  return (
    <div>
      <div>
        <ul>
          {carBrands.map((values) => {
            const country = Object.keys(values)[0]
            return (
              <ul id="checkbox-list" className="row">
                <li>
                  <label>
                    <input
                      type="checkbox"
                      id={`${country}`}
                      onChange={(event) =>
                        handleChangeCountry(event, values[country])
                      }
                    />
                    {`${country}`}
                  </label>
                  <ul>
                    {values[country].map((brand) => {
                      return (
                        <li>
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
    </div>
  )
}
export default CheckboxesAndRadioButtons
