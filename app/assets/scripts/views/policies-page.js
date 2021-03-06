'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import { environment } from '../config'
import { fetchPolicy } from '../redux/policies'
import { wrapApiResult, getFromState } from '../utils/utils'
import { reactNl2Br } from '../utils/string'

import App from './app'
import UhOh from './uhoh'
import { LoadingSkeleton, LoadingSkeletonGroup } from '../components/loading-skeleton'
import ShareOptions from '../components/share'

class PolicyPage extends React.Component {
  componentDidMount () {
    this.props.fetchPolicy(this.props.match.params.policyId)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.match.params.policyId !== this.props.match.params.policyId) {
      this.props.fetchPolicy(this.props.match.params.policyId)
    }
  }

  renderOverview (policy) {
    return (
      <section className='blk'>
        <h1>Overview</h1>
        <div className='abstract'>{reactNl2Br(policy.abstract)}</div>
        <div className='description'>{reactNl2Br(policy.description)}</div>
      </section>
    )
  }

  renderPolicyActions (policy) {
    const fields = [
      {
        key: 'effectiveStartDate',
        value: 'Effective start date'
      },
      {
        key: 'legislationOrGovernance',
        value: 'Legislation or governance'
      },
      {
        key: 'legislationOrGovernanceInformation',
        value: 'Legislation or governance information'
      }
    ]

    const hasData = fields.some(({ key }) => !!policy[key]) || policy.legislationOrGovernanceUrl.length

    return (
      <section className='blk'>
        <h1>Policy actions</h1>
        {hasData ? (
          <dl>
            {fields.map(({ key, value }) => policy[key] ? (
              <React.Fragment key={key}>
                <dt>{value}</dt>
                <dd>{policy[key]}</dd>
              </React.Fragment>
            ) : null)}
            {policy.legislationOrGovernanceUrl.length ? (
              <>
                <dt>Legislation or governance url</dt>
                <dd>
                  <ul>
                    {policy.legislationOrGovernanceUrl.map(policyUrl => (
                      <li key={policyUrl.url}>
                        <a href={policyUrl.url} title={`Go to ${policyUrl.label}`}>{policyUrl.label}</a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </>
            ) : null}
          </dl>
        ) : (
          <p>There are no policy actions</p>
        )}
      </section>
    )
  }

  renderSubsectors (policy) {
    return (
      <section className='blk'>
        <h1>Subsector</h1>
        <ul>
          {policy.subsector.map(sb => (
            <li key={sb.name}>{sb.name}</li>
          ))}
        </ul>
      </section>
    )
  }

  renderGeographies (policy) {
    return (
      <section className='blk'>
        <h1>Geographies</h1>
        <ul>
          {policy.country.map(country => (
            <li key={country.name}>{country.name}</li>
          ))}
        </ul>
      </section>
    )
  }

  renderAttributes (policy) {
    return (
      <section className='blk'>
        <h1>Attributes</h1>
        <dl>
          <dt>Status</dt>
          <dd>{policy.status.name}</dd>
          {policy.fundingMethod && (
            <>
              <dt>Funding method</dt>
              <dd>{policy.fundingMethod}</dd>
            </>
          )}
          {policy.process && (
            <>
              <dt>Process</dt>
              <dd>{reactNl2Br(policy.process)}</dd>
            </>
          )}
        </dl>
      </section>
    )
  }

  renderLoadingSkeleton () {
    return (
      <div className='row--contained'>
        <div className='col--main'>
          <LoadingSkeletonGroup>
            <LoadingSkeleton type='heading' width={1 / 3} />
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton width={3 / 4} />
          </LoadingSkeletonGroup>
        </div>
        <div className='col--sec'>
          <div>
            <LoadingSkeletonGroup>
              <LoadingSkeleton type='heading' width={1 / 3} />
              <LoadingSkeleton width={3 / 4} />
              <LoadingSkeleton />
            </LoadingSkeletonGroup>
            <LoadingSkeletonGroup>
              <LoadingSkeleton type='heading' width={1 / 2} />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </LoadingSkeletonGroup>
          </div>
        </div>
      </div>
    )
  }

  render () {
    const { isReady, hasError, getData } = this.props.policy
    const policy = getData()

    if (hasError()) {
      return <UhOh />
    }

    return (
      <App pageTitle='Policy' >
        <article className='inpage inpage--single inpage--policies'>
          <header className='inpage__header'>
            <div className='inner'>
              <div className='inpage__headline'>
                <p className='inpage__subtitle'>
                  <Link to='/policies' title='Browse the policy database'><span>View all policies</span></Link>
                </p>
                <h1 className='inpage__title'>
                  {isReady() ? policy.name : <LoadingSkeleton size='large' type='heading' inline />}
                </h1>
              </div>
              <div className='inpage__actions'>
                <ShareOptions url={window.location.toString()} />
              </div>
            </div>
          </header>

          <div className='inpage__body'>
            {isReady() ? (
              <div className='inner'>
                <div className='col col--main prose'>
                  {this.renderOverview(policy)}
                  {this.renderPolicyActions(policy)}
                  {this.renderSubsectors(policy)}
                </div>
                <div className='col--sec prose'>
                  {this.renderGeographies(policy)}
                  {this.renderAttributes(policy)}
                </div>
              </div>
            ) : (
              <div className='inner'>
                <div className='col col--full prose'>
                  {this.renderLoadingSkeleton()}
                </div>
              </div>
            )}
          </div>

        </article>
      </App>
    )
  }
}

if (environment !== 'production') {
  PolicyPage.propTypes = {
    fetchPolicy: T.func,
    match: T.object,
    policy: T.object
  }
}

function mapStateToProps (state, props) {
  return {
    policy: wrapApiResult(getFromState(state.policies.individualPolicies, props.match.params.policyId))
  }
}

function dispatcher (dispatch) {
  return {
    fetchPolicy: (...args) => dispatch(fetchPolicy(...args))
  }
}

export default connect(mapStateToProps, dispatcher)(PolicyPage)
