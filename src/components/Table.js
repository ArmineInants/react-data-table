/**
 * @author Armine Inants <armine.inants@gmail.com>
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  fetchDeposits,
  fetchCurrencies,
  setPage,
  setPerPage,
  setFilters,
  setPagesQuantity
} from '../actions.js';
import axios from 'axios';
import io from 'socket.io-client';
import Pagination from './Pagination';

class Table extends Component {
  componentWillMount() {
    this.props.fetchDeposits();
    this.props.fetchCurrencies();
  }
  componentWillUpdate() {
    const search = this.props.history.location.search;

    if (search) {
      const per_page = /per_page=(.*)\&/.exec(search)
        ? /per_page=(.*)\&/.exec(search)[1]
        : this.props.perPage;
      const current_page = /current_page=(.*)\&/.exec(search)
        ? /current_page=(.*)\&/.exec(search)[1]
        : /current_page=(.*)/.exec(search)
        ? /current_page=(.*)/.exec(search)[1]
        : this.props.currentPage;
      if (per_page !== this.props.perPage) {
        this.props.setPerPage(parseFloat(per_page));
      }
      if (current_page !== this.props.currentPage) {
        this.props.setPage(parseFloat(current_page));
      }
    }
  }
  componentDidUpdate() {
    let filtered = this.getFiltered();
    let quantity = Math.ceil(filtered.length / this.props.perPage);
    this.props.setPagesQuantity(quantity);
  }

  getTransactionStatus = id => {
    let status = this.props.depositStatuses.find(status => {
      return status.id === id;
    }).status;
    return this.formatString(status);
  };
  getSuffix = num => {
    if (!num || num === '0') return;
    switch (num) {
      case '1':
        return 'st';
      case '2':
        return 'nd';
      default:
        return 'th';
    }
  };
  getWebsite = id => {
    return this.props.websites && this.props.websites.length > 0
      ? this.props.websites.find(web => {
          return web.id == id;
        }).name
      : '';
  };
  getCurrency = id => {
    return this.props.currencies && this.props.currencies.length > 0
      ? this.props.currencies.find(cur => {
          return cur.id == id;
        }).code
      : '';
  };
  getDepositType = id => {
    let type = this.props.depositTypes.find(type => {
      return type.id == id;
    }).type;
    return this.formatString(type);
  };
  formatDate = date => {
    return date
      .substr(0, 19)
      .split('T')
      .join(' ');
  };
  formatString = string => {
    string = string.split('_');
    for (let i = 0, j = string.length; i < j; i++) {
      string[i] = string[i].charAt(0) + string[i].toLowerCase().slice(1);
    }
    string = string.join(' ');

    return string;
  };
  compareDates = (big, small) => big >= small;
  getFiltered = () => {
    let filtered = this.props.deposits;
    for (let filter in this.props.filters) {
      if (/(.*)_from/.exec(filter)) {
        if (!this.props.filters[filter]) continue;
        filtered = filtered.filter(deposit => {
          return (
            parseFloat(deposit[/(.*)_from/.exec(filter)[1]]) >=
            parseFloat(this.props.filters[filter])
          );
        });
      } else if (/(.*)_to/.exec(filter)) {
        if (!this.props.filters[filter]) continue;
        filtered = filtered.filter(deposit => {
          return (
            parseFloat(deposit[/(.*)_to/.exec(filter)[1]]) <=
            parseFloat(this.props.filters[filter])
          );
        });
      } else if (/(.*)_datefrom/.exec(filter)) {
        if (!this.props.filters[filter]) continue;
        filtered = filtered.filter(deposit => {
          return this.compareDates(
            deposit[/(.*)_datefrom/.exec(filter)[1]].slice(0, 10),
            this.props.filters[filter]
          );
        });
      } else if (/(.*)_dateto/.exec(filter)) {
        if (!this.props.filters[filter]) continue;
        filtered = filtered.filter(deposit => {
          return this.compareDates(
            this.props.filters[filter],
            deposit[/(.*)_dateto/.exec(filter)[1]].slice(0, 10)
          );
        });
      } else {
        filtered = filtered.filter(deposit => {
          return deposit[filter] == this.props.filters[filter];
        });
      }
    }
    return filtered;
  };

  render() {
    let depositAmount = 0;
    let bonusAmount = 0;
    let totalAmount = 0;
    for (let deposit of this.props.deposits) {
      depositAmount += parseFloat(deposit.deposit_amount);
      bonusAmount += parseFloat(deposit.deposit_bonus_amount);
      totalAmount += parseFloat(deposit.deposit_total_amount);
    }
    let perPage = this.props.perPage;
    let currentPage = this.props.currentPage;
    let filtered = this.getFiltered();
    filtered = filtered.slice(
      (currentPage - 1) * perPage,
      perPage * currentPage
    );
    const { socket, connected } = this.props;
    let ids = filtered.map(deposit => {
      return deposit.id;
    });
    if (socket && connected && ids.length > 0) {
      socket.emit('subscribe', { subjectType: 6, ids }, response => {
        socket.on('create', response => {
          this.props.fetchDeposits();
        });
      });
    }

    const depositList = filtered.length
      ? filtered.map(deposit => {
          return (
            <tr key={deposit.id}>
              <td>{deposit.code}</td>
              <td>{this.getWebsite(deposit.website_id)}</td>
              <td className="blue-text">{deposit.user_name}</td>
              <td>
                {deposit.deposit_number && deposit.deposit_number !== '0'
                  ? deposit.deposit_number
                  : ''}
                <span className="suffix">
                  {this.getSuffix(deposit.deposit_number)}
                </span>
              </td>
              <td>{this.formatDate(deposit.deposit_placement_time)}</td>
              <td>{this.getDepositType(deposit.deposit_type_id)}</td>
              <td>{Math.round(deposit.deposit_amount)}</td>
              <td>{this.getCurrency(deposit.deposit_currency_id)}</td>
              <td>{this.getTransactionStatus(deposit.deposit_status_id)}</td>
            </tr>
          );
        })
      : null;
    return (
      <div className="table">
        <table className="highlight">
          <thead className="grey lighten-3">
            <tr>
              <th>Transaction Code</th>
              <th>Partner Website</th>
              <th>Customer Username</th>
              <th>Deposit Number</th>
              <th>Placement Time</th>
              <th>Deposit Type</th>
              <th>Deposit Amount</th>
              <th>Transaction Currency</th>
              <th>Deposit Status</th>
            </tr>
          </thead>

          <tbody>{depositList}</tbody>
        </table>
        <div className="summary-line grey lighten-3">
          <div className="bold">Summary</div>
          <div>Deposit Amount</div>
          <div className="bold">{depositAmount}</div>
          <div>Bonus Amount</div>
          <div className="bold">{bonusAmount}</div>
          <div>Deposit Total Amount</div>
          <div className="bold">{totalAmount}</div>
        </div>
        <Pagination search={this.props.history.location.search} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.token,
    deposits: state.deposits,
    perPage: state.perPage,
    currentPage: state.currentPage,
    depositStatuses: state.depositStatuses,
    filters: state.filters,
    socket: state.socket,
    connected: state.connected,
    websites: state.websites,
    currencies: state.currencies,
    depositTypes: state.depositTypes
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDeposits: () => {
      return axios
        .post('https://api.bmakers.site/v1/login', {
          username: 'armine.inants@bmakers.com',
          password: 'qwe123'
        })
        .then(res => {
          const token = res.data.data.access_token;
          axios
            .get('https://api.bmakers.site/v1/riskGroup?lang_id=1', {
              headers: {
                Authorization: token
              }
            })
            .then(res => {
              const groups = res.data.data.map(group => {
                return {
                  id: group.id,
                  name: group.name
                };
              });
              axios
                .get('https://api.bmakers.site/v1/websites', {
                  headers: {
                    Authorization: token
                  }
                })
                .then(res => {
                  const websites = res.data.data.map(website => {
                    return {
                      id: website.id,
                      name: website.domain
                    };
                  });
                  axios
                    .get('https://api.bmakers.site/v1/rtm/deposits', {
                      headers: {
                        Authorization: token
                      }
                    })
                    .then(res => {
                      const data = res.data.data.data;
                      console.log('data', res.data);
                      let connected = false;
                      const socketUrl = 'wss://wsapi.bmakers.site';
                      const socket = io(socketUrl, {
                        query: {
                          token: token
                        }
                      });
                      socket.on('connect', () => {
                        connected = true;
                        console.log('Connected');
                        dispatch(
                          fetchDeposits(
                            token,
                            socket,
                            connected,
                            data,
                            websites,
                            groups
                          )
                        );
                      });
                      socket.on('disconnect', () => {
                        connected = false;
                        console.log('Disconnected');
                        dispatch(
                          fetchDeposits(
                            token,
                            socket,
                            connected,
                            data,
                            websites,
                            groups
                          )
                        );
                      });
                    })
                    .catch(err => {
                      console.log(err);
                    });
                })
                .catch(err => {
                  console.log(err);
                });
            });
        })
        .catch(err => {
          console.log(err);
        });
    },
    fetchCurrencies: () => {
      axios
        .get('https://api.bmakers.site/v1/currency?lang_id=1')
        .then(res => {
          dispatch(fetchCurrencies(res.data.data));
        })
        .catch(err => {
          console.log(err);
        });
    },
    setPage: page => {
      dispatch(setPage(page));
    },
    setPerPage: num => {
      dispatch(setPerPage(num));
    },
    setFilters: filter => {
      dispatch(setFilters(filter));
    },
    setPagesQuantity: quantity => {
      dispatch(setPagesQuantity(quantity));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Table);
