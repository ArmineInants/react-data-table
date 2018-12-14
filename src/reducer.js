/**
 * @author Armine Inants <armine.inants@gmail.com>
 */

const initState = {
  deposits: [],
  depositStatuses: [
    { id: 1, status: 'SUCCESS' },
    { id: 2, status: 'PENDING' },
    { id: 3, status: 'FAILED' },
    { id: 4, status: 'IN_REVIEW' },
    { id: 5, status: 'CANCELLED' },
    { id: 6, status: 'CANCELLED_BY_ADMIN' },
    { id: 7, status: 'REFUND' },
    { id: 8, status: 'REFUNDING' },
    { id: 9, status: 'EXPIRED' },
    { id: 10, status: 'PROCCESSING' },
    { id: 11, status: 'PARTIAL_REFUND' }
  ],
  depositTypes: [
    { id: 1, type: 'FEED' },
    { id: 2, type: 'ADMIN' },
    { id: 3, type: 'ADMIN' },
    { id: 4, type: 'PAYMENT_SYSTEM' },
    { id: 5, type: 'SYSTEM' }
  ],
  channels: [
    { id: 1, type: 'WEB' },
    { id: 2, type: 'MOBILE' },
    { id: 3, type: 'TABLET' },
    { id: 4, type: 'DESKTOP' },
    { id: 5, type: 'BACKEND' }
  ],
  userStatuses: [
    { id: 1, type: 'VERIFIED' },
    { id: 2, type: 'PARTLY_VERIFIED' },
    { id: 3, type: 'NOT_VERIFIED' },
    { id: 4, type: 'NOT_REQUIRED_TO_BE_VERIFIED' },
    { id: 5, type: 'AWAITING_VERIFICATION' }
  ],
  depositSources: [
    { id: 1, type: 'INTERKASSA' },
    { id: 2, type: 'PAYMEGA' },
    { id: 3, type: 'MALDOPAY' }
  ],
  bonusTypes: [
    { id: 1, type: 'REGISTRATION_BONUS' },
    { id: 2, type: 'DEPOSIT_BONUS' },
    { id: 3, type: 'GAMING_BONUS' },
    { id: 4, type: 'SPECIAL_OFFER_BONUS' },
    { id: 5, type: 'MANUAL_ADJUSTMENT' },
    { id: 6, type: 'OTHER' }
  ],
  perPage: 5,
  currentPage: 1,
  filters: {},
  quantity: 0,
  token: '',
  socket: null,
  connected: false,
  websites: [],
  currencies: [],
  userGroups: []
};

const reducer = (state = initState, action) => {
  const produceRes = obj => Object.assign({}, state, obj);

  switch (action.type) {
    case 'FETCH_DEPOSITS':
      return produceRes({
        deposits: action.deposits,
        token: action.token,
        socket: action.socket,
        connected: action.connected,
        websites: action.websites,
        userGroups: action.groups
      });
    case 'FETCH_CURRENCIES':
      return produceRes({
        currencies: action.currencies
      });
    case 'PREV_PAGE':
      const prev = state.currentPage - 1;
      return produceRes({ currentPage: prev });
    case 'NEXT_PAGE':
      const next = state.currentPage + 1;
      return produceRes({ currentPage: next });
    case 'SET_PAGE':
      return produceRes({ currentPage: action.currentPage });
    case 'SET_PER_PAGE':
      return produceRes({ perPage: action.perPage });
    case 'SET_FILTERS':
      return produceRes({ filters: action.filters });
    case 'RESET_FILTERS':
      return produceRes({ filters: {} });
    case 'SET_PAGES_QUANTITY':
      return produceRes({ quantity: action.quantity });
    default:
      return state;
  }
};

export default reducer;
