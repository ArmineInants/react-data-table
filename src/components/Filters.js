/**
 * @author Armine Inants <armine.inants@gmail.com>
 */

import React, { Component } from 'react';
import { Collapsible, FormSelect } from 'materialize-css';
import { connect } from 'react-redux';
import { setFilters, resetFilters } from '../actions.js';
import { Link } from 'react-router-dom';

const countries = require('../data/Countries.json');

class Filters extends Component {
  state = {
    filters: {},
    ids: [],
    arrow: 'keyboard_arrow_down',
    search: ''
  };
  componentDidMount() {
    document.addEventListener('DOMContentLoaded', function() {
      var elems1 = document.querySelectorAll('.collapsible');
      var instances1 = Collapsible.init(elems1, this.options);
      var elems2 = document.querySelectorAll('select');
      var instances2 = FormSelect.init(elems2, this.options);
    });
  }
  handleChange = e => {
    let value = e.target.value;
    if (e.target.id === 'website_id') {
      value = this.props.websites.find(site => {
        return site.name === e.target.value;
      });
      value = value ? value.id : e.target.value;
    }
    if (e.target.id === 'channel_id') {
      value = this.props.channels.find(channel => {
        return channel.type.toLowerCase() === e.target.value.toLowerCase();
      });
      value = value ? value.id : e.target.value;
    }
    if (e.target.id === 'user_group_id') {
      value = this.props.userGroups.find(group => {
        return group.name.toLowerCase() === e.target.value.toLowerCase();
      });
      value = value ? value.id : e.target.value;
    }
    if (e.target.id === 'user_status_id') {
      value = this.props.userStatuses.find(status => {
        return (
          status.type.toLowerCase() ===
          e.target.value
            .toLowerCase()
            .split(' ')
            .join('_')
        );
      });
      value = value ? value.id : e.target.value;
    }
    if (e.target.id === 'user_country_id') {
      value = countries.find(country => {
        return (
          country.name.toLowerCase() === e.target.value.toLowerCase() ||
          country.code.toLowerCase() === e.target.value.toLowerCase()
        );
      });
      value = value ? value.code : e.target.value;
    }
    if (e.target.id === 'deposit_type_id') {
      value = this.props.depositTypes.find(type => {
        return (
          type.type.toLowerCase() ===
          e.target.value
            .toLowerCase()
            .split(' ')
            .join('_')
        );
      });
      value = value ? value.id : e.target.value;
    }
    if (e.target.id === 'deposit_source') {
      value = this.props.depositSources.find(source => {
        return source.type.toLowerCase() === e.target.value.toLowerCase();
      });
      value = value ? value.id : e.target.value;
    }
    if (e.target.id === 'deposit_currency_id') {
      value =
        this.props.currencies && this.props.currencies.length > 0
          ? this.props.currencies.find(currency => {
              return (
                currency.code.toLowerCase() === e.target.value.toLowerCase() ||
                currency.description.toLowerCase() ===
                  e.target.value.toLowerCase()
              );
            })
          : null;
      value = value ? value.id : e.target.value;
    }
    if (e.target.id === 'deposit_status_id') {
      value = this.props.depositStatuses.find(status => {
        return (
          status.status.toLowerCase() ===
          e.target.value
            .toLowerCase()
            .split(' ')
            .join('_')
        );
      });
      value = value ? value.id : e.target.value;
    }
    if (e.target.id === 'deposit_bonus_type') {
      value = this.props.bonusTypes.find(bonus => {
        return (
          bonus.type.toLowerCase() ===
          e.target.value
            .toLowerCase()
            .split(' ')
            .join('_')
        );
      });
      value = value ? value.id : e.target.value;
    }

    let search = this.state.search;
    let ids = [...this.state.ids];
    const index = ids.indexOf(e.target.id);
    if (index === -1) {
      ids.push(e.target.id);
      search += e.target.id + '=' + value + '&';
    } else {
      let reg = new RegExp(e.target.id + '=(.*)?');
      let newSearch = search.split('&');
      for (let i = 0, j = newSearch.length; i < j; i++) {
        if (reg.exec(newSearch[i])) {
          newSearch[i] = newSearch[i].replace(reg, e.target.id + '=' + value);
          if (!e.target.value) {
            newSearch = newSearch.slice(i + 1);
            ids = ids.slice(index + 1);
          }
        }
      }
      search = newSearch.join('&');
    }

    this.setState({
      ...this.state,
      filters: {
        ...this.state.filters,
        [e.target.id]: value || null
      },
      search: search,
      ids: ids
    });
  };
  handleSearch = () => {
    this.props.setFilters(this.state.filters);
  };
  handleReset = () => {
    for (let id of this.state.ids) {
      document.getElementById(id).value = '';
    }
    let fields = [];
    for (let key in this.state.filters) {
      fields.push(key);
      this.setState({
        ...this.state,
        ids: [],
        filters: {},
        search: ''
      });
    }
    this.props.resetFilters(fields);
  };
  changeArrowType = () => {
    if (this.state.arrow === 'keyboard_arrow_down') {
      this.setState({
        ...this.state,
        arrow: 'keyboard_arrow_up'
      });
    }
    if (this.state.arrow === 'keyboard_arrow_up') {
      this.setState({
        ...this.state,
        arrow: 'keyboard_arrow_down'
      });
    }
  };
  render() {
    return (
      <div className="filters">
        <div className="row input-field">
          <div className="col s1">Transaction ID</div>
          <div className="col s2">
            <input type="text" id="id" onChange={this.handleChange} />
          </div>
          <div className="col s1">Partner Website</div>
          <div className="col s2">
            <input type="text" id="website_id" onChange={this.handleChange} />
          </div>
          <div className="col s1">Customer Country</div>
          <div className="col s2">
            <input
              type="text"
              id="user_country_id"
              onChange={this.handleChange}
            />
          </div>
          <div className="col s1">Deposit Chanel</div>
          <div className="col s2">
            <input type="text" id="channel_id" onChange={this.handleChange} />
          </div>
        </div>

        <div className="row">
          <div className="col s1">Customer ID</div>
          <div className="col s2">
            <input type="text" id="user_id" onChange={this.handleChange} />
          </div>
          <div className="col s1">Customer Username</div>
          <div className="col s2">
            <input type="text" id="user_name" onChange={this.handleChange} />
          </div>
          <div className="col s1">Deposit Number</div>
          <div className="col s2 from-to-fields">
            <input
              type="text"
              id="deposit_number_from"
              onChange={this.handleChange}
            />
            <span>/</span>
            <input
              type="text"
              id="deposit_number_to"
              onChange={this.handleChange}
            />
          </div>
          <div className="col s1">Customer User Group</div>
          <div className="col s2">
            <input
              type="text"
              id="user_group_id"
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col s1">User Status</div>
          <div className="col s2">
            <input
              type="text"
              id="user_status_id"
              onChange={this.handleChange}
            />
          </div>
          <div className="col s1">Bonus Type</div>
          <div className="col s2">
            <input
              type="text"
              id="deposit_bonus_type"
              onChange={this.handleChange}
            />
          </div>
          <div className="col s1">Deposit IP</div>
          <div className="col s2">
            <input type="text" id="deposit_ip" onChange={this.handleChange} />
          </div>
          <div className="col s1">Deposit IP Country</div>
          <div className="col s2">
            <input
              type="text"
              id="deposit_country_id"
              onChange={this.handleChange}
            />
          </div>
        </div>

        <ul className="collapsible">
          <li>
            <div
              className="collapsible-header grey lighten-3"
              onClick={this.changeArrowType}
            >
              <i className="material-icons">{this.state.arrow}</i>
              Advanced Filters
            </div>
            <div className="collapsible-body">
              <div className="row input-field">
                <div className="col s1">Placement Time</div>
                <div className="col s3 from-to-fields">
                  <input
                    type="date"
                    id="deposit_placement_time_datefrom"
                    onChange={this.handleChange}
                  />
                  <span>~</span>
                  <input
                    type="date"
                    id="deposit_placement_time_dateto"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="col s1">Deposit Type</div>
                <div className="col s3">
                  <input
                    type="text"
                    id="deposit_type_id"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="col s1">Deposit Source</div>
                <div className="col s3">
                  <input
                    type="text"
                    id="deposit_source"
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div className="row input-field">
                <div className="col s1">Deposit Amount</div>
                <div className="col s3 from-to-fields">
                  <input
                    type="text"
                    id="deposit_amount_from"
                    onChange={this.handleChange}
                  />
                  <span>/</span>
                  <input
                    type="text"
                    id="deposit_amount_to"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="col s1">Transaction Currency</div>
                <div className="col s3">
                  <input
                    type="text"
                    id="deposit_currency_id"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="col s1">Deposit Status</div>
                <div className="col s3">
                  <input
                    type="text"
                    id="deposit_status_id"
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div className="row input-field">
                <div className="col s1">Deposit Source Account</div>
                <div className="col s3">
                  <input
                    type="text"
                    id="deposit_source_account"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="col s1">Bonus Eligibility</div>
                <div className="col s3">
                  <select
                    id="deposit_bonus_eligibility"
                    onChange={this.handleChange}
                  >
                    <option value="" disabled>
                      Not use filter
                    </option>
                  </select>
                </div>
                <div className="col s1">Deposit Total Amount</div>
                <div className="col s3 from-to-fields">
                  <input
                    type="text"
                    id="deposit_total_amount_from"
                    onChange={this.handleChange}
                  />
                  <span>/</span>
                  <input
                    type="text"
                    id="deposit_total_amount_to"
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div className="row input-field">
                <div className="col s1">Bonus Wagering</div>
                <div className="col s3">
                  <select>
                    <option value="" disabled>
                      Not use filter
                    </option>
                  </select>
                </div>
                <div className="col s1">User Balance Before</div>
                <div className="col s3 from-to-fields">
                  <input
                    type="text"
                    id="user_balance_before_from"
                    onChange={this.handleChange}
                  />
                  <span>/</span>
                  <input
                    type="text"
                    id="user_balance_before_to"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="col s1">User Balance After</div>
                <div className="col s3 from-to-fields">
                  <input
                    type="text"
                    id="user_balance_after_from"
                    onChange={this.handleChange}
                  />
                  <span>/</span>
                  <input
                    type="text"
                    id="user_balance_after_to"
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div className="row input-field">
                <div className="col s1">Bonus Wagering Demand Type</div>
                <div className="col s3">
                  <input type="text" />
                </div>
                <div className="col s1" />
                <div className="col s3" />
                <div className="col s1" />
                <div className="col s3" />
              </div>
            </div>
          </li>
        </ul>
        <div className="btn-wrapper">
          <Link
            to={{
              pathname: '/'
            }}
            className="btn white black-text reset-btn"
            onClick={this.handleReset}
          >
            Reset
          </Link>
          <Link
            to={{
              pathname: this.state.search ? '/deposits/filters' : '/',
              query: this.state.filters,
              search: this.state.search.slice(0, -1)
            }}
            className="btn blue search-btn"
            onClick={this.handleSearch}
          >
            <i className="material-icons align-center">search</i>
            <span>Search</span>
          </Link>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    filters: state.filters,
    perPage: state.perPage,
    websites: state.websites,
    channels: state.channels,
    userGroups: state.userGroups,
    userStatuses: state.userStatuses,
    depositTypes: state.depositTypes,
    depositSources: state.depositSources,
    currencies: state.currencies,
    depositStatuses: state.depositStatuses,
    bonusTypes: state.bonusTypes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setFilters: filter => {
      dispatch(setFilters(filter));
    },
    resetFilters: fields => {
      dispatch(resetFilters(fields));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Filters);
