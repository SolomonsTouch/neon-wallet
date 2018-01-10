// @flow
import React, { Component } from 'react'
import { mapValues } from 'lodash'

import BaseModal from '../BaseModal'
import AddRecipientDisplay from './AddRecipientDisplay'
import ConfirmDisplay from './ConfirmDisplay'
import withAddressCheck from './withAddressCheck'

import { validateTransactionBeforeSending } from '../../../core/wallet'
import { ASSETS } from '../../../core/constants'
import { toBigNumber } from '../../../core/math'

const ConfirmDisplayContainer = withAddressCheck()(ConfirmDisplay)

const DISPLAY_MODES = {
  ADD_RECIPIENT: 'ADD_RECIPIENT',
  CONFIRM: 'CONFIRM'
}

type Props = {
  NEO: string,
  GAS: string,
  tokens: Object,
  showErrorNotification: Function,
  hideModal: Function,
  sendTransaction: Function,
  net: string,
  address: string,
}

type BalancesType = {
  [key: SymbolType]: any
}

type State = {
  entries: Array<SendEntryType>,
  display: $Values<typeof DISPLAY_MODES>,
  balances: BalancesType
}

export default class SendModal extends Component<Props, State> {
  canvas: ?HTMLCanvasElement
  state = {
    entries: [],
    display: DISPLAY_MODES.ADD_RECIPIENT,
    balances: {
      [ASSETS.NEO]: this.props.NEO,
      [ASSETS.GAS]: this.props.GAS,
      ...mapValues(this.props.tokens, (token) => token.balance)
    }
  }

  render () {
    const { hideModal } = this.props

    return (
      <BaseModal
        title='Send'
        hideModal={hideModal}
        style={{ content: { width: '925px', height: '410px' } }}>
        {this.renderDisplay()}
      </BaseModal>
    )
  }

  renderDisplay = () => {
    const { net, address } = this.props
    const { display, balances, entries } = this.state

    if (display === DISPLAY_MODES.ADD_RECIPIENT) {
      return (
        <AddRecipientDisplay
          balances={balances}
          onCancel={this.handleCancelAddRecipient}
          onConfirm={this.handleConfirmAddRecipient} />
      )
    } else {
      return (
        <ConfirmDisplayContainer
          net={net}
          address={address}
          entries={entries}
          onConfirm={this.handleConfirmTransaction}
          onCancel={this.handleCancelTransaction}
          onAddRecipient={this.handleAddRecipient}
          {...this.state} />
      )
    }
  }

  handleAddRecipient = () => {
    this.setState({ display: DISPLAY_MODES.ADD_RECIPIENT })
  }

  handleConfirmAddRecipient = (entry: SendEntryType) => {
    const { showErrorNotification } = this.props
    const { balances } = this.state
    const error = validateTransactionBeforeSending(balances[entry.symbol], entry)

    if (error) {
      showErrorNotification({ message: error })
    } else {
      const newBalance = toBigNumber(balances[entry.symbol]).minus(entry.amount).toString()

      this.setState({
        entries: [...this.state.entries, entry],
        balances: { ...balances, [entry.symbol]: newBalance },
        display: DISPLAY_MODES.CONFIRM
      })
    }
  }

  handleCancelAddRecipient = () => {
    const { entries } = this.state

    if (entries.length === 0) {
      this.close()
    } else {
      this.setState({ display: DISPLAY_MODES.CONFIRM })
    }
  }

  handleConfirmTransaction = () => {
    const { sendTransaction } = this.props
    const { entries } = this.state
    sendTransaction(entries).then(this.close)
  }

  handleCancelTransaction = () => {
    this.close()
  }

  close = () => {
    this.props.hideModal()
  }
}
