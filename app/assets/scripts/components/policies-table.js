'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import c from 'classnames'

import { environment } from '../config'
import { LoadingSkeleton } from '../components/loading-skeleton'
import { initializeArrayWithRange } from '../utils/array'

export default class PoliciesTable extends React.PureComponent {
  componentDidUpdate () {
    ReactTooltip.rebuild()
  }

  onSort (field, e) {
    e.preventDefault()
    const { sortDirection, onSort } = this.props
    onSort(field, sortDirection === 'asc' ? 'desc' : 'asc')
  }

  renderTableHeader () {
    const headings = [
      {
        id: 'name',
        sortable: true,
        title: 'Sort by policy name',
        value: 'Policy name'
      },
      {
        id: 'country',
        sortable: true,
        title: 'Sort by geography',
        value: 'Geography'
      },
      {
        id: 'mechanism',
        sortable: false,
        value: 'Policy Mechanism'
      },
      {
        id: 'status',
        sortable: true,
        title: 'Sort by status',
        value: 'Status'
      }
    ]

    return (
      <thead>
        <tr>
          {headings.map(o => {
            if (!o.sortable) return <th key={o.id}>{o.value}</th>

            const { sortField, sortDirection } = this.props
            const klass = c('table__sort', {
              'table__sort--none': sortField !== o.id,
              'table__sort--asc': sortField === o.id && sortDirection === 'asc',
              'table__sort--desc': sortField === o.id && sortDirection === 'desc'
            })
            return <th key={o.id}><a href='#' title={o.title} className={klass} onClick={this.onSort.bind(this, o.id)}>{o.value}</a></th>
          })}
        </tr>
      </thead>
    )
  }

  renderLoadingRows () {
    return initializeArrayWithRange(10).map(v => (
      <tr key={v}>
        <td><LoadingSkeleton /></td>
        <td><LoadingSkeleton /></td>
        <td><LoadingSkeleton /></td>
        <td><LoadingSkeleton /></td>
      </tr>
    ))
  }

  renderRows () {
    const renderArrayField = (data) => {
      if (!data.length) return 'N/A'
      if (data.length === 1) return data[0].name

      return (
        <div data-for='array-field-tooltip' data-tip={data.map(o => o.name).join(', ')}>
          {data[0].name}
          {data.length > 1 ? <small>+ {data.length - 1}</small> : null}
        </div>
      )
    }

    return this.props.policies.map(policy => {
      return (
        <tr key={policy.id}>
          <th>
            <Link to={`/policies/${policy.id}`} title='Go to policy page'>{policy.name}</Link>
          </th>
          <td>{renderArrayField(policy.country)}</td>
          <td>{renderArrayField(policy.type.mechanism)}</td>
          <td>{policy.status.name}</td>
        </tr>
      )
    })
  }

  renderTooltip () {
    const popoverContent = (tipContent) => {
      return (
        <div className='popover__contents'>
          <div className='popover__body'>
            {tipContent}
          </div>
        </div>
      )
    }

    return (
      <ReactTooltip
        id='array-field-tooltip'
        effect='solid'
        type='custom'
        className='popover'
        wrapper='article'
        getContent={popoverContent}
      />
    )
  }

  render () {
    if (!this.props.loading && !this.props.policies.length) return null

    return (
      <>
        <table className='table policies-table'>
          {this.renderTableHeader()}
          <tbody>
            {
              this.props.loading
                ? this.renderLoadingRows()
                : this.renderRows()
            }
          </tbody>
        </table>
        {this.renderTooltip()}
      </>
    )
  }
}

if (environment !== 'production') {
  PoliciesTable.propTypes = {
    sortField: T.string,
    sortDirection: T.string,
    policies: T.array,
    loading: T.bool,
    onSort: T.func
  }
}
