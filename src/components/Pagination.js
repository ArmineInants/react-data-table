/**
 * @author Armine Inants <armine.inants@gmail.com>
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { nextPage, prevPage, setPage } from '../actions.js';

class Pagination extends Component {
  handleSetPage = page => {
    if (this.props.currentPage !== page) {
      this.props.setPage(page);
    }
  };
  render() {
    let filterSearch = this.props.search;
    filterSearch = /(.*)&per_page=/.exec(filterSearch)
      ? /(.*)&per_page=/.exec(filterSearch)[1] + '&'
      : '';
    const currentPage = this.props.currentPage;
    const pagesQuantity = this.props.quantity;
    let pagesList = [];
    for (let i = 1, j = pagesQuantity; i <= j; i++) {
      pagesList.push(i);
    }
    const pages =
      pagesQuantity > 1
        ? pagesList.map(page => {
            return (
              <li
                className={page === currentPage ? 'active' : 'waves-effect'}
                key={Math.random()}
                onClick={() => {
                  this.handleSetPage(page);
                }}
              >
                <Link
                  to={{
                    pathname: filterSearch ? '/deposits/filters' : '/deposits',
                    query: {
                      per_page: this.props.perPage,
                      current_page: page
                    },
                    search:
                      filterSearch +
                      'per_page=' +
                      this.props.perPage +
                      '&current_page=' +
                      page
                  }}
                >
                  {page}
                </Link>
              </li>
            );
          })
        : null;

    const prevArrow =
      currentPage === 1 ? (
        <li className="disabled">
          <a>
            <i className="material-icons">chevron_left</i>
          </a>
        </li>
      ) : (
        <li
          className="waves-effect"
          onClick={() => {
            this.props.prevPage();
          }}
        >
          <Link
            to={{
              pathname: filterSearch ? '/deposits/filters' : '/deposits',
              query: {
                per_page: this.props.perPage,
                current_page: currentPage - 1
              },
              search:
                filterSearch +
                'per_page=' +
                this.props.perPage +
                '&current_page=' +
                (currentPage - 1)
            }}
          >
            <i className="material-icons">chevron_left</i>
          </Link>
        </li>
      );

    const nextArrow =
      currentPage === pagesQuantity ? (
        <li className="disabled">
          <a>
            <i className="material-icons">chevron_right</i>
          </a>
        </li>
      ) : (
        <li
          className="waves-effect"
          onClick={() => {
            this.props.nextPage();
          }}
        >
          <Link
            to={{
              pathname: filterSearch ? '/deposits/filters' : '/deposits',
              query: {
                per_page: this.props.perPage,
                current_page: currentPage + 1
              },
              search:
                filterSearch +
                'per_page=' +
                this.props.perPage +
                '&current_page=' +
                (currentPage + 1)
            }}
          >
            <i className="material-icons">chevron_right</i>
          </Link>
        </li>
      );

    return pagesQuantity > 1 ? (
      <div className="pagination">
        <ul className="pagination right">
          {prevArrow}
          {pages}
          {nextArrow}
        </ul>
      </div>
    ) : null;
  }
}

const mapStateToProps = state => {
  return {
    deposits: state.deposits,
    perPage: state.perPage,
    currentPage: state.currentPage,
    quantity: state.quantity,
    filters: state.filters
  };
};

const mapDispatchToProps = dispatch => {
  return {
    prevPage: () => {
      dispatch(prevPage());
    },
    nextPage: () => {
      dispatch(nextPage());
    },
    setPage: page => {
      dispatch(setPage(page));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pagination);
