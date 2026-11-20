/**
 * Typed translation key constants for @pranora/i18n.
 *
 * Prevents magic strings in components. Import the namespace object and
 * use the dot-paths it provides, e.g.:
 *
 *   import { KEYS } from '@pranora/i18n';
 *   t(KEYS.common.actions.confirm)   // → 'common:actions.confirm'
 *   t(KEYS.pets.species.dog)         // → 'pets:species.dog'
 *
 * Keys are `<namespace>:<dot.path>` so they work with i18next's `ns:key`
 * format and next-intl's `useTranslations(namespace)` pattern.
 */

type NamespacedKey<NS extends string, K extends string> = `${NS}:${K}`;

function ns<NS extends string>(namespace: NS) {
  return <const K extends string>(key: K): NamespacedKey<NS, K> =>
    `${namespace}:${key}` as NamespacedKey<NS, K>;
}

const k = {
  common: {
    appName:         ns('common')('appName'),
    tagline:         ns('common')('tagline'),
    emergency:       ns('common')('emergency'),
    // nav
    nav: {
      home:          ns('common')('nav.home'),
      map:           ns('common')('nav.map'),
      rescue:        ns('common')('nav.rescue'),
      adoption:      ns('common')('nav.adoption'),
      services:      ns('common')('nav.services'),
      profile:       ns('common')('nav.profile'),
      notifications: ns('common')('nav.notifications'),
    },
    // actions
    actions: {
      confirm:  ns('common')('actions.confirm'),
      cancel:   ns('common')('actions.cancel'),
      save:     ns('common')('actions.save'),
      call:     ns('common')('actions.call'),
      book:     ns('common')('actions.book'),
      retry:    ns('common')('actions.retry'),
      back:     ns('common')('actions.back'),
      next:     ns('common')('actions.next'),
      done:     ns('common')('actions.done'),
      edit:     ns('common')('actions.edit'),
      delete:   ns('common')('actions.delete'),
      add:      ns('common')('actions.add'),
      search:   ns('common')('actions.search'),
      filter:   ns('common')('actions.filter'),
      share:    ns('common')('actions.share'),
      report:   ns('common')('actions.report'),
      close:    ns('common')('actions.close'),
      viewAll:  ns('common')('actions.viewAll'),
      submit:   ns('common')('actions.submit'),
      apply:    ns('common')('actions.apply'),
      accept:   ns('common')('actions.accept'),
      decline:  ns('common')('actions.decline'),
      approve:  ns('common')('actions.approve'),
      reject:   ns('common')('actions.reject'),
    },
    // states
    states: {
      loading:    ns('common')('states.loading'),
      empty:      ns('common')('states.empty'),
      error:      ns('common')('states.error'),
      noInternet: ns('common')('states.noInternet'),
      noResults:  ns('common')('states.noResults'),
      success:    ns('common')('states.success'),
      saved:      ns('common')('states.saved'),
    },
    // errors
    errors: {
      generic:      ns('common')('errors.generic'),
      network:      ns('common')('errors.network'),
      unauthorized: ns('common')('errors.unauthorized'),
      required:     ns('common')('errors.required'),
      invalidPhone: ns('common')('errors.invalidPhone'),
      invalidEmail: ns('common')('errors.invalidEmail'),
    },
    disclaimer: {
      notVetAdvice: ns('common')('disclaimer.notVetAdvice'),
      humanDecides: ns('common')('disclaimer.humanDecides'),
    },
  },

  pets: {
    add:    ns('pets')('add'),
    edit:   ns('pets')('edit'),
    delete: ns('pets')('delete'),
    noPets: ns('pets')('noPets'),
    species: {
      dog:     ns('pets')('species.dog'),
      cat:     ns('pets')('species.cat'),
      bird:    ns('pets')('species.bird'),
      rabbit:  ns('pets')('species.rabbit'),
      fish:    ns('pets')('species.fish'),
      cow:     ns('pets')('species.cow'),
      goat:    ns('pets')('species.goat'),
      poultry: ns('pets')('species.poultry'),
      other:   ns('pets')('species.other'),
    },
    gender: {
      male:    ns('pets')('gender.male'),
      female:  ns('pets')('gender.female'),
      unknown: ns('pets')('gender.unknown'),
    },
  },

  health: {
    disclaimer: ns('health')('disclaimer'),
    vaccines: {
      label:     ns('health')('vaccines.label'),
      upToDate:  ns('health')('vaccines.upToDate'),
      overdue:   ns('health')('vaccines.overdue'),
      nextDue:   ns('health')('vaccines.nextDue'),
    },
  },

  rescue: {
    types: {
      injured:   ns('rescue')('report.types.injured'),
      lost:      ns('rescue')('report.types.lost'),
      found:     ns('rescue')('report.types.found'),
      abandoned: ns('rescue')('report.types.abandoned'),
    },
    status: {
      submitted:  ns('rescue')('status.submitted'),
      reviewing:  ns('rescue')('status.reviewing'),
      inProgress: ns('rescue')('status.inProgress'),
      resolved:   ns('rescue')('status.resolved'),
    },
  },

  map: {
    openNow:  ns('map')('filters.openNow'),
    open247:  ns('map')('filters.open247'),
    noGps:    ns('map')('noGps'),
    offline:  ns('map')('offline'),
    noResults: ns('map')('noResults'),
    emergency: {
      mode:   ns('map')('emergency.mode'),
      button: ns('map')('emergency.button'),
    },
  },

  booking: {
    confirmBooking: ns('booking')('confirmBooking'),
    myBookings:     ns('booking')('myBookings'),
    status: {
      pending:   ns('booking')('status.pending'),
      confirmed: ns('booking')('status.confirmed'),
      completed: ns('booking')('status.completed'),
      cancelled: ns('booking')('status.cancelledByOwner'),
    },
  },

  auth: {
    login: {
      title:   ns('auth')('login.title'),
      sendOtp: ns('auth')('login.sendOtp'),
      verify:  ns('auth')('login.verify'),
    },
    logout: ns('auth')('logout'),
  },

  notifications: {
    empty:       ns('notifications')('empty'),
    markAllRead: ns('notifications')('markAllRead'),
  },

  ai: {
    disclaimer:        ns('ai')('disclaimer'),
    emergencyDetected: ns('ai')('emergencyDetected'),
    noDiagnosis:       ns('ai')('noDiagnosis'),
    noMedicine:        ns('ai')('noMedicine'),
  },

  shelter: {
    title:       ns('shelter')('title'),
    onboarding:  ns('shelter')('onboarding.title'),
    dashboard:   ns('shelter')('dashboard.title'),
  },

  provider: {
    onboarding:  ns('provider')('onboarding.title'),
    dashboard:   ns('provider')('dashboard.title'),
  },
} as const;

export { k as KEYS };
