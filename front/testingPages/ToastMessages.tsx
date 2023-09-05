import React from 'react'
import { ToastContainer, ToastOptions, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ToastMessages = () => {
  const messages = ['info', 'success', 'warning', 'error', 'default'].map(
    (val) => generateToastMessageContent(val)
  )
  const notify = (type = 'default') => {
    const settings: ToastOptions = {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: 'dark',
    }

    switch (type) {
      case 'info':
      case 'success':
      case 'warning':
      case 'error':
        return toast[type](`${type.toUpperCase()} toast message`, settings)
      default:
        return toast(`${type.toUpperCase()} toast message`, settings)
    }
  }

  return (
    <div>
      <ToastContainer />
      <fieldset>
        <fieldset className="form-group">
          {messages.map((val) => {
            return (
              <li className="row offset-md-1 media-heading">
                <button
                  className="btn btn-lg btn-primary pull-xs-left"
                  onClick={() => {
                    notify(val.msgType)
                  }}
                >
                  {`${val.buttonMsg}`}
                </button>
              </li>
            )
          })}
        </fieldset>
      </fieldset>
    </div>
  )
}

const generateToastMessageContent = (msgType) => {
  return { msgType: msgType, buttonMsg: `Click for ${msgType} toast message` }
}

export default ToastMessages
