const path = require('path')
const {search, memoize } = require('cerebro-tools')
const {getApps, startApp} = require('./store')
const icon = require('./icon.png');


const fn = (async ({ term, display }) => {
  // Put your plugin code here
  const apps = await getApps();
  const results = search(apps, term, el => el.title).map(el => {
    return {
      icon,
      title: el.title,
      subtitle: 'Windows Store App',
      onSelect: (event) => {
        startApp(el.package)
      }
    };
  }).filter(el => el.title && el.title.trim());

  display(results);
})

module.exports = {
  fn
}