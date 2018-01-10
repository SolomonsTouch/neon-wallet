import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import thunk from 'redux-thunk'
import { shallow, mount } from 'enzyme'
import { createMemoryHistory } from 'history'

import LoginNep2 from '../../app/containers/LoginNep2'
import { SHOW_NOTIFICATION, HIDE_NOTIFICATIONS, HIDE_NOTIFICATION, DEFAULT_POSITION } from '../../app/modules/notifications'
import { LOGIN } from '../../app/modules/account'
import { NOTIFICATION_LEVELS } from '../../app/core/constants'

jest.useFakeTimers()
jest.mock('neon-js')

const setup = (shallowRender = true) => {
  const store = configureStore([thunk])({})

  let wrapper
  if (shallowRender) {
    wrapper = shallow(<LoginNep2 store={store} />)
  } else {
    const history = createMemoryHistory('/dashboard')
    wrapper = mount(
      <Provider store={store}>
        <BrowserRouter>
          <LoginNep2 history={history} />
        </BrowserRouter>
      </Provider>
    )
  }

  return {
    store,
    wrapper
  }
}

describe('LoginNep2', () => {
  test('renders without crashing', (done) => {
    const { wrapper } = setup()
    expect(wrapper).toMatchSnapshot()
    done()
  })
  test('renders correctly with initial state', (done) => {
    const { wrapper } = setup(false)

    const fields = wrapper.find('input[type="password"]')
    expect(fields.length).toEqual(2)

    const passwordField = fields.get(0)
    const keyField = fields.get(1)

    expect(passwordField.props.value).toEqual('')
    expect(passwordField.props.placeholder).toEqual('Enter your passphrase here')
    expect(passwordField.props.type).toEqual('password')
    expect(keyField.props.value).toEqual('')
    expect(keyField.props.placeholder).toEqual(('Enter your encrypted key here'))
    expect(keyField.props.type).toEqual('password')
    done()
  })
  test('the login button is working correctly with no passphrase or wif', (done) => {
    const { wrapper, store } = setup(false)

    wrapper.find('#loginButton').first().simulate('click')
    Promise.resolve('pause').then(() => {
      const actions = store.getActions()
      expect(actions.length).toEqual(0)
      done()
    })
  })
  // test('the login button is working correctly with only a short passphrase', (done) => {
  //   const { wrapper, store } = setup(false)

  //   const passwordField = wrapper.find('input[placeholder="Enter your passphrase here"]')
  //   passwordField.instance().value = 'T'
  //   passwordField.simulate('change')

  //   const keyField = wrapper.find('input[placeholder="Enter your encrypted key here"]')
  //   keyField.instance().value = '6PYUGtvXiT5TBetgWf77QyAFidQj61V8FJeFBFtYttmsSxcbmP4vCFRCWu'
  //   keyField.simulate('change')

  //   wrapper.find('#loginButton').simulate('click')

  //   Promise.resolve('pause').then(() => {
  //     jest.runAllTimers()
  //     const actions = store.getActions()
  //     expect(actions.length).toEqual(2)
  //     expect(actions[0]).toEqual({
  //       type: SEND_TRANSACTION,
  //       success: false,
  //       message: 'Passphrase too short'
  //     })
  //     expect(actions[1]).toEqual({
  //       type: CLEAR_TRANSACTION
  //     })
  //     done()
  //   })
  // })
  test('the login button is working correctly with key and passphrase', (done) => {
    const { wrapper, store } = setup(false)

    const passwordField = wrapper.find('input[placeholder="Enter your passphrase here"]')
    passwordField.instance().value = 'Th!s1$@FakePassphrase'
    passwordField.simulate('change')

    const keyField = wrapper.find('input[placeholder="Enter your encrypted key here"]')
    keyField.instance().value = '6PYUGtvXiT5TBetgWf77QyAFidQj61V8FJeFBFtYttmsSxcbmP4vCFRCWu'
    keyField.simulate('change')

    wrapper.find('#loginButton').first().simulate('submit')
    Promise.resolve('Pause').then().then()
    jest.runAllTimers()
    const actions = store.getActions()
    expect(actions.length).toEqual(4)
    expect(actions[0]).toEqual({
      type: HIDE_NOTIFICATIONS,
      payload: {
        dismissible: true,
        position: DEFAULT_POSITION
      }
    })
    expect(actions[1]).toEqual({
      type: SHOW_NOTIFICATION,
      payload: expect.objectContaining({
        message: 'Decrypting encoded key...',
        level: NOTIFICATION_LEVELS.INFO
      })
    })
    expect(actions[2]).toEqual({
      type: HIDE_NOTIFICATION,
      payload: expect.objectContaining({
        id: 'notification_1'
      })
    })
    expect(actions[3]).toHaveProperty('type', LOGIN)
    done()
  })
})
