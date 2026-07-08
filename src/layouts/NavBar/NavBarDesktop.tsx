import type { Component } from 'solid-js'

import IconMongo from '@/components/Icons/IconMongo'
import MenuList from './MenuList'

const NavBarDesktop: Component<{ data: DataLayout }> = (props) => {
  return (
    <div class="flex shadow-sm">
      <a class="btn flex-1 gap-1 btn-ghost px-2 md:gap-2" href="/" aria-current="page" aria-label="mongoPWA">
        <IconMongo />

        <span class="text-lg text-base-content md:text-xl">Mongo PWA</span>
      </a>

      <MenuList data={props.data} />
    </div>
  )
}

export default NavBarDesktop
