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
  setPagesQuantity,
  changeWidths,
  changeOrder,
  changeSorting
} from '../actions.js';
import axios from 'axios';
import io from 'socket.io-client';
// import Pagination from './Pagination';
import Paper from '@material-ui/core/Paper';
import {
  SortingState,
  IntegratedSorting,
  PagingState,
  IntegratedPaging
} from '@devexpress/dx-react-grid';
import {
  Grid,
  DragDropProvider,
  Table,
  TableHeaderRow,
  TableColumnResizing,
  TableColumnReordering,
  PagingPanel
} from '@devexpress/dx-react-grid-material-ui';
import { stat } from 'fs';

class TableMy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // columns: [
      //   { id: 'code', name: 'code', title: 'Transaction Code' },
      //   { id: 'web', name: 'web', title: 'Partner Website' },
      //   { id: 'user', name: 'user', title: 'Customer Username' },
      //   { id: 'dep-num', name: 'dep-num', title: 'Deposit Number' },
      //   { id: 'time', name: 'time', title: 'Placement Time' },
      //   { id: 'type', name: 'type', title: 'Deposit Type' },
      //   { id: 'amount', name: 'amount', title: 'Deposit Amount' },
      //   { id: 'currency', name: 'currency', title: 'Transaction Currency' },
      //   { id: 'status', name: 'status', title: 'Deposit Status' }
      // ],
      // columnWidths: [
      //   { columnName: 'code', width: 200 },
      //   { columnName: 'web', width: 120 },
      //   { columnName: 'user', width: 150 },
      //   { columnName: 'dep-num', width: 100 },
      //   { columnName: 'time', width: 150 },
      //   { columnName: 'type', width: 120 },
      //   { columnName: 'amount', width: 120 },
      //   { columnName: 'currency', width: 120 },
      //   { columnName: 'status', width: 120 }
      // ],
      // columnOrder: [
      //   'code',
      //   'web',
      //   'user',
      //   'dep-num',
      //   'time',
      //   'type',
      //   'amount',
      //   'currency',
      //   'status'
      // ],
      tableColumnExtensions: [{ columnName: 'code', width: 200 }],
      // sorting: [{ columnName: 'code', direction: 'asc' }],
      currentPage: 1,
      pageSize: 20,
      pageSizes: [10, 20, 50, 100, 500, 1000]
    };
    this.changeColumnWidths = columnWidths => {
      this.props.changeWidths(columnWidths);
      // this.setState({ columnWidths });
      axios
        .post(
          'https://api.bmakers.site/v1/personal/table',
          [
            {
              type_id: 3,
              settings: {
                columnWidths: columnWidths,
                columnOrder: this.props.columnOrder,
                sorting: this.props.sorting
              }
            }
          ],
          {
            headers: {
              Authorization: this.props.token
            }
          }
        )
        .then(res => {})
        .catch(err => {
          console.log(err);
        });
    };
    this.changeColumnOrder = newOrder => {
      // this.setState({ columnOrder: newOrder });
      this.props.changeOrder(newOrder);
      axios
        .post(
          'https://api.bmakers.site/v1/personal/table',
          [
            {
              type_id: 3,
              settings: {
                columnWidths: this.props.columnWidths,
                columnOrder: newOrder,
                sorting: this.props.sorting
              }
            }
          ],
          {
            headers: {
              Authorization: this.props.token
            }
          }
        )
        .then(res => {})
        .catch(err => {
          console.log(err);
        });
    };
    this.changeSorting = sorting => {
      this.props.changeSorting(sorting);
      axios
        .post(
          'https://api.bmakers.site/v1/personal/table',
          [
            {
              type_id: 3,
              settings: {
                columnWidths: this.props.columnWidths,
                columnOrder: this.props.columnOrder,
                sorting: sorting
              }
            }
          ],
          {
            headers: {
              Authorization: this.props.token
            }
          }
        )
        .then(res => {})
        .catch(err => {
          console.log(err);
        });
    };
    this.changeCurrentPage = currentPage => this.setState({ currentPage });
    this.changePageSize = pageSize => this.setState({ pageSize });
  }
  componentWillMount() {
    this.props.fetchDeposits();
    this.props.fetchCurrencies();
  }
  componentWillUpdate() {
    const search = this.props.history.location.search;

    // if (search) {
    //   const per_page = /per_page=(.*)\&/.exec(search)
    //     ? /per_page=(.*)\&/.exec(search)[1]
    //     : this.props.perPage;
    //   const current_page = /current_page=(.*)\&/.exec(search)
    //     ? /current_page=(.*)\&/.exec(search)[1]
    //     : /current_page=(.*)/.exec(search)
    //     ? /current_page=(.*)/.exec(search)[1]
    //     : this.props.currentPage;
    //   if (per_page !== this.props.perPage) {
    //     this.props.setPerPage(parseFloat(per_page));
    //   }
    //   if (current_page !== this.props.currentPage) {
    //     this.props.setPage(parseFloat(current_page));
    //   }
    // }
  }
  componentDidUpdate() {
    if (
      this.props.count &&
      this.props.total &&
      !document.getElementById('summary') &&
      document.getElementsByClassName('Pager-pager-111')[0]
    ) {
      document
        .getElementsByClassName('Pager-pager-111')[0]
        .insertAdjacentHTML(
          'beforebegin',
          '<div id="summary" class="summary-line grey lighten-3"><div class="bold">Summary</div><div>Deposit Count</div><div class="bold">' +
            this.props.total.deposit_count +
            '</div><div>Deposit Amount</div><div class="bold">' +
            this.props.total.deposit_amount +
            '</div><div>Bonus Amount</div><div class="bold">' +
            this.props.total.deposit_bonus_amount +
            '</div><div>Deposit Total Amount</div><div class="bold">' +
            this.props.total.deposit_total_amount +
            '</div></div>'
        );
    }
    // let filtered = this.getFiltered();
    // let quantity = Math.ceil(filtered.length / this.props.perPage);
    // this.props.setPagesQuantity(quantity);
  }

  getTransactionStatus = id => {
    let status = this.props.depositStatuses.find(status => {
      return status.id === id;
    }).status;
    return this.formatString(status);
  };
  getSuffix = num => {
    if (!num || num === '0') return '';
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

  // dragStart = event => {
  //   if (event.target.id) {
  //     event.dataTransfer.setData('text', event.target.id);
  //   }
  // };

  // drop = event => {
  //   var bb = event.target.getBoundingClientRect();
  //   if (event.target.id) {
  //     if (event.target.id === event.dataTransfer.getData('text')) return;
  //     const column = columns.filter(col => {
  //       return col.id === event.dataTransfer.getData('text');
  //     });
  //     let columns = columns.filter(col => {
  //       return col.id !== event.dataTransfer.getData('text');
  //     });
  //     let columnsNew = [];
  //     for (let i = 0, j = columns.length; i < j; i++) {
  //       if (columns[i].id === event.target.id) {
  //         if (event.clientX >= bb.x + parseFloat(bb.width) / 2) {
  //           columnsNew.push(columns[i]);
  //           columnsNew.push(column[0]);
  //         } else {
  //           columnsNew.push(column[0]);
  //           columnsNew.push(columns[i]);
  //         }
  //       } else {
  //         columnsNew.push(columns[i]);
  //       }
  //     }
  //     this.setState({ columns: columnsNew });
  //     event.dataTransfer.clearData();
  //   }
  // };

  render() {
    // let perPage = this.props.perPage;
    // let currentPage = this.props.currentPage;
    const columns = this.props.columns;
    const columnWidths = this.props.columnWidths;
    const columnOrder = this.props.columnOrder;
    const sorting = this.props.sorting;
    let filtered = this.getFiltered();
    // filtered = filtered.slice(
    //   (currentPage - 1) * perPage,
    //   perPage * currentPage
    // );
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

    // const columnsList = columns.map(col => {
    //   return (
    //     <th
    //       key={col.id}
    //       id={col.id}
    //       draggable="true"
    //       onDrop={this.drop}
    //       onDragStart={this.dragStart}
    //       onDragOver={event => event.preventDefault()}
    //       onDragEnd={this.dragEnd}
    //     >
    //       {col.title}
    //     </th>
    //   );
    // });

    const getColumn = (deposit, index) => {
      // const span = (
      //   <span className="suffix">{this.getSuffix(deposit.deposit_number)}</span>
      // );
      if (columns[index] && columns[index].id === 'code') return deposit.code;
      if (columns[index] && columns[index].id === 'web')
        return this.getWebsite(deposit.website_id);
      if (columns[index] && columns[index].id === 'user')
        return deposit.user_name;
      if (columns[index] && columns[index].id === 'dep-num')
        return (
          (deposit.deposit_number && deposit.deposit_number !== '0'
            ? deposit.deposit_number
            : '') + this.getSuffix(deposit.deposit_number)
        );
      // '<span className="suffix">' +
      // ' ' +
      // this.getSuffix(deposit.deposit_number) +
      // '</span>';
      if (columns[index] && columns[index].id === 'time')
        return this.formatDate(deposit.deposit_placement_time);
      if (columns[index] && columns[index].id === 'type')
        return this.getDepositType(deposit.deposit_type_id);
      if (columns[index] && columns[index].id === 'amount')
        return Math.round(deposit.deposit_amount);
      if (columns[index] && columns[index].id === 'currency')
        return this.getCurrency(deposit.deposit_currency_id);
      if (columns[index] && columns[index].id === 'status')
        return this.getTransactionStatus(deposit.deposit_status_id);
    };

    const depositRows = filtered.map(deposit => {
      return {
        [columns[0].id]: getColumn(deposit, 0),
        [columns[1].id]: getColumn(deposit, 1),
        [columns[2].id]: getColumn(deposit, 2),
        [columns[3].id]: getColumn(deposit, 3),
        [columns[4].id]: getColumn(deposit, 4),
        [columns[5].id]: getColumn(deposit, 5),
        [columns[6].id]: getColumn(deposit, 6),
        [columns[7].id]: getColumn(deposit, 7),
        [columns[8].id]: getColumn(deposit, 8)
      };
    });

    // const depositList = filtered.length
    //   ? filtered.map(deposit => {
    //       return (
    //         <tr key={deposit.id}>
    //           <td>{getColumn(deposit, 0)}</td>
    //           <td>{getColumn(deposit, 1)}</td>
    //           <td>{getColumn(deposit, 2)}</td>
    //           <td>{getColumn(deposit, 3)}</td>
    //           <td>{getColumn(deposit, 4)}</td>
    //           <td>{getColumn(deposit, 5)}</td>
    //           <td>{getColumn(deposit, 6)}</td>
    //           <td>{getColumn(deposit, 7)}</td>
    //           <td>{getColumn(deposit, 8)}</td>
    //         </tr>
    //       );
    //     })
    //   : null;

    return this.props.columns.length ? (
      <div className="table">
        <Paper>
          <Grid rows={depositRows} columns={columns}>
            <PagingState
              currentPage={this.state.currentPage}
              onCurrentPageChange={this.changeCurrentPage}
              pageSize={this.state.pageSize}
              onPageSizeChange={this.changePageSize}
            />
            <IntegratedPaging />
            <SortingState
              sorting={sorting}
              onSortingChange={this.changeSorting}
            />
            <IntegratedSorting />
            <DragDropProvider />
            <Table columnExtensions={this.state.tableColumnExtensions} />
            <TableColumnResizing
              columnWidths={columnWidths}
              onColumnWidthsChange={this.changeColumnWidths}
            />
            <TableColumnReordering
              order={columnOrder}
              onOrderChange={this.changeColumnOrder}
            />
            <TableHeaderRow showSortingControls />
            <PagingPanel pageSizes={this.state.pageSizes} />
          </Grid>
        </Paper>
        {/* <table className="highlight">
          <thead className="grey lighten-3">
            <tr>{columnsList}</tr>
          </thead>

          <tbody>{depositList}</tbody>
        </table> */}
        {/* <div className="summary-line grey lighten-3">
          <div className="bold">Summary</div>
          <div>Deposit Count</div>
          <div className="bold">{this.props.total.deposit_count}</div>
          <div>Deposit Amount</div>
          <div className="bold">{this.props.total.deposit_amount}</div>
          <div>Bonus Amount</div>
          <div className="bold">{this.props.total.deposit_bonus_amount}</div>
          <div>Deposit Total Amount</div>
          <div className="bold">{this.props.total.deposit_total_amount}</div>
        </div> */}
        {/* <Pagination search={this.props.history.location.search} /> */}
      </div>
    ) : (
      <div className="center">
        <div className="preloader-wrapper big active">
          <div className="spinner-layer spinner-blue-only">
            <div className="circle-clipper left">
              <div className="circle" />
            </div>
            <div className="gap-patch">
              <div className="circle" />
            </div>
            <div className="circle-clipper right">
              <div className="circle" />
            </div>
          </div>
        </div>
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
    depositTypes: state.depositTypes,
    total: state.total,
    count: state.count,
    columnWidths: state.columnWidths,
    columnOrder: state.columnOrder,
    sorting: state.sorting,
    columns: state.columns
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDeposits: () => {
      return axios
        .post('https://api.bmakers.site/v1/login', {
          username: 'george.gevorgyan@gmail.com',
          password: 'george.gevorgyan@gmail.com'
        })
        .then(res => {
          const token = res.data.data.access_token;
          axios
            .get('https://api.bmakers.site/v1/personal/table', {
              headers: {
                Authorization: token
              }
            })
            .then(res => {
              const data = res.data.data.filter(a => {
                return a.type_id == 3;
              });
              const settings = data ? data[0].settings : null;
              const columnWidths =
                settings && settings.columnWidths
                  ? settings.columnWidths
                  : null;
              const columnOrder =
                settings && settings.columnOrder ? settings.columnOrder : null;
              const sorting =
                settings && settings.sorting ? settings.sorting : null;
              dispatch(changeOrder(columnOrder));
              dispatch(changeWidths(columnWidths));
              dispatch(changeSorting(sorting));

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
                        .get(
                          'https://api.bmakers.site/v1/rtm/deposits?limit=2900&page=1',
                          {
                            headers: {
                              Authorization: token
                            }
                          }
                        )
                        .then(res => {
                          const total = res.data.data.total;
                          const count = res.headers['x-total-count'];

                          const data = res.data.data.data;
                          console.log('data', res.data.data.data);

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
                                groups,
                                total,
                                count
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
                                groups,
                                total,
                                count
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
    // setPage: page => {
    //   dispatch(setPage(page));
    // },
    // setPerPage: num => {
    //   dispatch(setPerPage(num));
    // },
    setFilters: filter => {
      dispatch(setFilters(filter));
    },
    changeWidths: widths => {
      dispatch(changeWidths(widths));
    },
    changeOrder: order => {
      dispatch(changeOrder(order));
    },
    changeSorting: sorting => {
      dispatch(changeSorting(sorting));
    }
    // setPagesQuantity: quantity => {
    //   dispatch(setPagesQuantity(quantity));
    // }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TableMy);
