import { addMessages, getLocaleFromNavigator, init } from 'svelte-i18n'

import en from '../config/translations/en.json'
import es from '../config/translations/es.json'

const setupI18N = () => {
  addMessages('en', en)
  addMessages('es', es)

  init({
    fallbackLocale: 'en',
    initialLocale: getLocaleFromNavigator(),
  })
}

export default setupI18N
