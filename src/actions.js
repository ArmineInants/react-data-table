/**
 * @author Armine Inants <armine.inants@gmail.com>
 */

export const fetchDeposits = (
  token,
  socket,
  connected,
  deposits,
  websites,
  groups
) => {
  return {
    type: 'FETCH_DEPOSITS',
    deposits: deposits,
    token: token,
    socket: socket,
    connected: connected,
    websites: websites,
    groups: groups
  };
};

export const fetchCurrencies = currencies => {
  return {
    type: 'FETCH_CURRENCIES',
    currencies: currencies
  };
};

export const prevPage = () => {
  return {
    type: 'PREV_PAGE'
  };
};

export const nextPage = () => {
  return {
    type: 'NEXT_PAGE'
  };
};

export const setPage = page => {
  return {
    type: 'SET_PAGE',
    currentPage: page
  };
};

export const setPerPage = num => {
  return {
    type: 'SET_PER_PAGE',
    perPage: num
  };
};

export const setFilters = filter => {
  return {
    type: 'SET_FILTERS',
    filters: filter
  };
};

export const resetFilters = fields => {
  return {
    type: 'RESET_FILTERS',
    fields: fields
  };
};

export const setPagesQuantity = quantity => {
  return {
    type: 'SET_PAGES_QUANTITY',
    quantity: quantity
  };
};
