import React, { useContext, useState, useEffect } from 'react'
import {
  useLocation,
  useParams, 
} from 'react-router-dom'
import useStore from 'use-store'

export const UIContext = React.createContext({})

const useRoutes = () => {
  let location = useLocation()

  let search = location.search
    .replace(/\?/gi, '')
    .split('&')
    .reduce((acc, pair) => {
      let [attr, value] = pair.split('=')

      if (attr && attr !== '') {
        acc[attr] = typeof value === 'undefined' ? true : decodeURIComponent(value)
      }

      return acc
    }, {})

  
  let [editmode, setEditmode] = useStore('editmode', search.edit)

  useEffect(() => {
    if (editmode !== search.edit) {
      console.log('edit mode changed', search.edit)
      setEditmode(search.edit)
    }
  }, [location])

  return {
    search,
    path: location.pathname
  }
}

export const UIProvider = ({ children }) => {
  const route = useRoutes()
  const [ editmode, setEditmode ] = useStore('editmode', false)
  const toggleEditmode = () => setEditmode(!editmode)

  return (
    <UIContext.Provider
      value={{
        route,
        editmode,
        setEditmode,
        toggleEditmode,
      }}
    >
      { children }
    </UIContext.Provider>
  )
}

export const useUIContext = () => useContext(UIContext)