import type { Component } from 'solid-js'

import NavBarDesktop from './NavBarDesktop'
import NavBarMobile from './NavBarMobile'

const NavBar: Component = () => {
  return (
    <header class="sticky top-0 z-1">
      <nav class="bg-gray-800 text-neutral-content shadow-lg">
        <div class="md:container mx-auto flex items-center justify-between">
          {/* Section #1 → Use z-index to go on top of other div sections */}
          <div class="z-1">
            <div class="md:hidden">
              <NavBarMobile />
            </div>
          </div>

          {/* Section #2 */}
          <div>
            <div class="hidden md:block">
              <NavBarDesktop />
            </div>
          </div>

          {/* Section #3 */}
          <div />
        </div>
      </nav>
    </header>
  )
}

export default NavBar
