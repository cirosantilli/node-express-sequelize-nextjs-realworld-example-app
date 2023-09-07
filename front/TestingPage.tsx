import Head from 'next/head'
import React from 'react'

import { AppContext } from 'front/ts'

import CalendarWidget from './testingPages/CalendarWidget'
import TextFieldWidget from './testingPages/TextFieldWidget'
import ToastMessages from './testingPages/ToastMessages'
import Checkboxes from './testingPages/Checkboxes'
import RadioButton from './testingPages/RadioButtons'

const TestingPage = () => {
  const title = 'Testing'
  const testAmount = 10

  return function TestingPage() {
    const { page, setPage, tab, setTab, tag, setTag, setTitle } =
      React.useContext(AppContext)

    React.useEffect(() => {
      setTitle(title)
    }, [setTitle])

    const generateNavigationTabs = () => {
      let options = Array.from(Array(testAmount).keys()).map(
        (item) => `TEST_${item + 1}`
      )
      return (
        <ul className="nav nav-pills outline-active">
          {options.map((val) => {
            return (
              <li className="nav-item" key={val}>
                <a
                  className={`link nav-link ${tab === val ? 'active' : ''}`}
                  onClick={() => {
                    setTab(val)
                  }}
                >
                  {val}
                </a>
              </li>
            )
          })}
        </ul>
      )
    }

    const testingSubPages = (tab) => {
      switch (tab) {
        case 'TEST_1':
          return <TextFieldWidget />
        case 'TEST_2':
          return <RadioButton />
        case 'TEST_3':
          return <Checkboxes />
        case 'TEST_4':
          return <ToastMessages />
        case 'TEST_5':
          return <CalendarWidget />
        default:
          return (
            <div>
              <p>{`${tab} is`} not yet implemented</p>
            </div>
          )
      }
    }

    // ===== MAIN
    return (
      <>
        <Head>
          <meta name="description" />
        </Head>
        <div className="home-page">
          <div className="container page">
            <div className="row">
              <div className="col-md-9">
                <div className="feed-toggle">{generateNavigationTabs()}</div>
                <div className="table-active">
                  <h1>{title}</h1>
                  {testingSubPages(tab)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default TestingPage
