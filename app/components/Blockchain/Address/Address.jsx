// @flow
import React from 'react'
import classNames from 'classnames'

import { openExplorerAddress } from '../../../core/explorer'
import styles from './Address.scss'

type Props = {
  className?: string,
  net: NetworkType,
  explorer: ExplorerType,
  address: string
}

export default class Address extends React.Component<Props> {
  render = () => {
    const { address, className } = this.props

    return (
      <span className={classNames(styles.address, className)} onClick={this.handleClick}>
        {address}
      </span>
    )
  }

  handleClick = () => {
    const { net, explorer, address } = this.props
    openExplorerAddress(net, explorer, address)
  }
}
