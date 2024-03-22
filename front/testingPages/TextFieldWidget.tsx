import React from 'react'

const TextFieldWidget = () => {
  const generateFields = () => {
    const textFields = ['First Name', 'Last Name', 'Country', 'Year of Birth']
    const [submitted, setSubmitted] = React.useState(false)
    const [fieldData, setFieldData] = React.useState(
      textFields.map((val) => generateFieldValueSet(val))
    )

    const handleSubmit = () => {
      setFieldData(fieldData)
      setSubmitted(true)
    }

    const generateSummary = () => {
      if (submitted) {
        return (
          <div>
            {fieldData.map((val) => {
              return (
                <h4
                  id={`${val.key}Heading`}
                  key={`${val.key}Heading`}
                >{`${val.str}: ${val.currentValue}`}</h4>
              )
            })}
          </div>
        )
      } else {
        return (
          <div>
            <h4 id="noValuesHeading">No values set</h4>
          </div>
        )
      }
    }

    return (
      <div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit()
          }}
        >
          <fieldset>
            {fieldData.map((val) => {
              return (
                <fieldset className="form-group" key={val.key}>
                  <input
                    className="form-control form-control-lg"
                    placeholder={val.str}
                    required={true}
                    onChange={(event) => {
                      val.currentValue = event.target.value
                    }}
                    type="text"
                    pattern={
                      val.key === 'yearOfBirth' ? '[0-9]{4}' : '[a-zA-Z]*'
                    }
                  ></input>
                </fieldset>
              )
            })}
            <button
              className="btn btn-lg btn-primary pull-xs-right"
              type="submit"
            >
              Submit
            </button>
          </fieldset>
          <div>{generateSummary()}</div>
        </form>
      </div>
    )
  }

  return <div>{generateFields()}</div>
}

const camelize = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
}

const generateFieldValueSet = (value) => {
  return { str: value, key: camelize(value), currentValue: '' }
}

export default TextFieldWidget
