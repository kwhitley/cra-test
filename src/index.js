import { h, Fragment, render } from 'preact'
import App from './App'
import * as serviceWorker from './serviceWorker'

// const App = () => {
//   return (
//     <Fragment>
//       Foo
//     </Fragment>
//   )
// }

render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
