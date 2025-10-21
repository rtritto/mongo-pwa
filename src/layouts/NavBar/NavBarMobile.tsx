import type { Component } from 'solid-js'

import IconHamburger from '@/components/Icons/IconHamburger'
import MenuList from './MenuList'

const NavBarMobile: Component<{ data: DataLayout }> = (props) => {
  return (
    <div class="drawer">
      <input id="my-drawer" type="checkbox" class="drawer-toggle" />

      <div class="drawer-content">
        <label for="my-drawer" class="btn btn-sm btn-ghost drawer-button bg-gray-800">
          <IconHamburger />
        </label>
      </div>

      <div class="drawer-side">
        <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay" />

        <ul class="menu min-h-full w-80 bg-base-200 p-4 pt-0 text-base-content">
          <li>
            <label for="my-drawer" class="btn btn-circle btn-ghost">✕</label>
          </li>

          <MenuList data={props.data} />
        </ul>
      </div>
    </div>
  )
}

export default NavBarMobile
