import type { Component } from 'solid-js'

import IconMongo from '@/components/Icons/IconMongo'
import MenuList from './MenuList'

const NavBarDesktop: Component = () => {

  return (
    <div class="flex shadow-sm">
      <a class="btn btn-ghost flex-1 gap-1 px-2 md:gap-2" href="/" aria-current="page" aria-label="mongoPWA">
        <IconMongo />

        <span class="font-title text-base-content text-lg md:text-xl">Mongo PWA</span>
      </a>

      <MenuList />
    </div>
  )
}

export default NavBarDesktop
