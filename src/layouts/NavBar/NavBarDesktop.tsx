import type { Component } from 'solid-js'

import IconMongo from '@/components/Icons/IconMongo'
import MenuList from './MenuList'

const NavBarDesktop: Component = () => {

  return (
    <div class="menu menu-horizontal px-1 py-0">
      <a href="/" aria-current="page" aria-label="mongoPWA" class="btn btn-ghost flex-1 gap-1 px-2 md:gap-2">
        <IconMongo />

        <span class="font-title text-base-content text-lg md:text-xl">Mongo PWA</span>
      </a>

      <div class="breadcrumbs text-sm p-0">
        <MenuList />
      </div>
    </div>
  )
}

export default NavBarDesktop
