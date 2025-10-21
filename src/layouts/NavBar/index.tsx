import type { Component } from 'solid-js'

import NavBarDesktop from './NavBarDesktop'
import NavBarMobile from './NavBarMobile'

const NavBar: Component<{ data: DataLayout }> = (props) => {
  return (
    <nav class="bg-gray-800 text-neutral-content shadow-lg">
      <div class="flex md:container mx-auto">
        {/* Section #1 → Use z-index to go on top of other div sections */}
        <div class="z-1">
          <div class="md:hidden">
            <NavBarMobile data={props.data} />
          </div>
        </div>

        {/* Section #2 */}
        <div>
          <div class="hidden md:block">
            <NavBarDesktop data={props.data} />
          </div>
        </div>

        {/* Section #3 */}
        <div />
      </div>
    </nav>
  )
}

export default NavBar
