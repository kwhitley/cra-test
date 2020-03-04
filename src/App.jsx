import { h, Fragment } from 'preact'
import { Suspense } from 'preact/compat'
import { useState, useEffect, useRef } from 'preact/hooks'
import { 
  BrowserRouter as Router, 
  Link, 
  NavLink, 
  Route, 
  Switch, 
  useHistory,
  useLocation,
  useParams, 
} from 'react-router-dom'
import './App.scss'
import styled from 'styled-components'
import { lazy } from './utils/lazy'
import useStore from 'use-store'
import ContentEditable from 'react-contenteditable'
import { UIProvider, useUIContext } from './contexts/UIContext'

const AsyncDetails = lazy(() => import('./async/AsyncDetails'))

const PAGE_TRANSITIONS = 400
const PADDING = '3em'

const Welcome = styled.div`
  font-size: 2em;
  font-weight: lighter;
`

const Loading = () => <Fragment>Loading...</Fragment>

const StyledPage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: ${PADDING};
  overflow-y: ${({ visible }) => visible ? 'auto' : 'hidden'};
  overflow-x: hidden;
  // opacity: ${({ visible }) => visible ? 1 : 0};
  transition: all ${PAGE_TRANSITIONS / 1000}s ease;
  transform: translate3D(${({ visible }) => visible ? 0 : '-100%'},0,0);
`

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(7em, 1fr));
  grid-gap: 0.2rem;
`

const StyledGridItem = styled.div`
  display: flex;
  background-color: #eee;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: black;
  text-decoration: none;
  font-size: 3em;

  &:hover {
    background-color: #ddd;
    text-decoration: none;
  }
  
  &:after {
    content: '';
    display: block;
    padding-bottom: 100%;
    
    background-color: #eee;
  }
`

const BigNumber = styled.span`
  font-size: 2em;
  margin-left: 0.2em;
`

export const GridItem = ({ collection, id }) => {
  return (
    <StyledGridItem as={Link} to={`/${collection}/${id}`}>
      { id }
    </StyledGridItem>
  )
}

export const Index = ({ collection, id }) => {
  let items = new Array(40).fill(null).map((c, i) => i + 1)

  return (
    <StyledPage visible={!id}>
      <StyledGrid>
        {
          items.map((item, i) =>
            <GridItem key={i} collection={collection} id={item} />
          )
        }
      </StyledGrid>
    </StyledPage>
  )
}

const StyledDetails = styled(StyledPage)`
  transform: translate3D(${props => props.visible ? 0 : '100%'},0,0);
`

const Button = styled.div`
  flex: 1;
  display: block;
  border: 0;
  padding: 0.5em;
  font-size: 2em;
  background-color: #f3f3f3;
  color: ${({ secondary }) => secondary ? '#888' : '#000'};
  text-decoration: none;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: #e5e5e5;
    text-decoration: none;
  }
`

const FlexBox = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: stretch;
`

 // pass in id to only trigger scroll top when new id loaded
const useScrollTop = (scroll) => {
  let ref = useRef(null)

  useEffect(() => {
    if (ref.current && scroll) {
      ref.current.scrollTop = 0
    }
  }, [scroll])

  return ref
}

const movements = {
  PREV: 0,
  STATIC: 1,
  NEXT: 2,
}
const translations = [`calc(100% + ${PADDING})`, 0, `calc(-100% - ${PADDING})`]

const StyledPageStack = styled(FlexBox)`
  pointer-events: ${({ movement }) => movement === movements.STATIC ? 'auto' : 'none'};
  transition: all ${({ movement }) => movement === movements.STATIC ? 0 : (PAGE_TRANSITIONS / 1000)}s ease;
  transform: translate3D(${({ movement }) => translations[movement]},0,0);
`

export const PageStack = ({ id }) => {
  let [useId, setUseId] = useState(id)
  let [movement, setMovement] = useState(movements.STATIC)

  useEffect(() => {
    console.log('route id changed', id)

    if (id > useId) {
      setMovement(movements.NEXT)
    }

    if (id < useId) {
      setMovement(movements.PREV)
    }

    if (!useId && id || !id) {
      console.log('setting id to', id)
      setMovement(movements.STATIC)
      setUseId(id)
    }

    if (id && useId && id !== useId) {
      setTimeout(() => {
        setMovement(movements.STATIC)
        console.log('setting id after animation to', id)
        setUseId(id)
      }, PAGE_TRANSITIONS)
    }
  }, [id])

  return (
    <StyledPageStack movement={movement}>
      <PageItem id={useId-1} prev />
      <PageItem id={useId} />
      <PageItem id={useId+1} next />
    </StyledPageStack>
  )
}

const StyledPageItem = styled.div`
  flex: 1;
  position: absolute;
  left: 0;
  right: 0;
  padding-bottom: ${PADDING};
  transform: translate3D(${({ next, prev }) => next ? ('calc(100% + ' + PADDING + ')') : (prev ? ('calc(-100% - ' + PADDING + ')') : 0)},0,0);
`

const Editable = ({ 
  value, 
  placeholder = '',
  onBlur = () => {},
  ...props 
}) => {
  let [ local, setLocal ] = useState(value)
  let [ dirty, setDirty ] = useState(false)
  let { editmode } = useUIContext()

  useEffect(() => {
    if (!dirty && local !== value) {
      setDirty(true)
    }

    if (dirty && local === value) {
      setDirty(false)
    }
  }, [local, value])
  
  return (
    <Fragment>
      <ContentEditable
        html={local} // innerHTML of the editable div
        disabled={!editmode} // use true to disable edition
        onChange={e => setLocal(e.target.value)} // handle innerHTML change
        tagName={props.as}
      />
      value:{ value }<br />
      local:{ local }<br />
      dirty: { dirty ? 'yes' : 'no' }
    </Fragment>
  )
}

const EditToggle = () => {
  let { editmode, setEditmode, toggleEditmode } = useUIContext()

  return <a onClick={toggleEditmode}>{ editmode ? 'Done Editing' : 'Edit This Page' }</a>
}

export const PageItem = ({ id, ...props }) => {
  let [showDetails, setShowDetails] = useState(false)

  return (
    <StyledPageItem {...props}>
      <h2>item { id }</h2>

      
    </StyledPageItem>
  )
}

export const ItemView = ({ collection, visible, id }) => {
  let history = useHistory()
  let el = useScrollTop(id)

  return (
    <StyledDetails ref={el} visible={visible}>
      <Button as={Link} onClick={() => history.push(`/${collection}`)}>Return to Index</Button>
      <FlexBox>
        <Button secondary="true" as={Link} to={`/${collection}/${Number(id)-1}`}>Prev</Button>
        <Button secondary="true" as={Link} to={`/${collection}/${Number(id)+1}`}>Next</Button>
      </FlexBox>
      
      <PageStack id={id} />
    </StyledDetails>
  )
}

const StyledMultiPage = styled.div`
  overflow-x: hidden;
`

export const MultiPage = () => {
  let { collection, id } = useParams()
  let [lastId, setLastId] = useState(id)
  id = Number(id)

  useEffect(() => {
    if (id) {
      setLastId(id)
    } else {
      setTimeout(() => {
        setLastId(undefined)
      }, PAGE_TRANSITIONS)
    }
  }, [id])

  return (
    <StyledMultiPage>
      <Index collection={collection} id={id} />
      <ItemView collection={collection} visible={id} id={lastId} />
    </StyledMultiPage>
  )
}

const Home = () => <p>invisible page? go to /foo</p>

export const MultiPageApp = () => {
  return (
    <div>
        <Router className="main">
          <UIProvider>
            <Switch>
              <Route path="/:collection/:id?" component={MultiPage} />
              <Route path="/" component={Home} />
            </Switch>
          </UIProvider>
        </Router>   
    </div>
  )
}

export default MultiPageApp