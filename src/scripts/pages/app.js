import routes from "../routes/routes";
import { getActiveRoute, getActivePathname } from "../routes/url-parser";

class App {
  #content = null;

  constructor({ content }) {
    this.#content = content;
  }

  async renderPage() {
    const currentPath = getActivePathname();
    const url = getActiveRoute();
    const page = routes[url];

    if (page) {
      try {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      } catch (error) {
        console.error("Error rendering page:", error);
        this.#content.innerHTML = `<div class="container text-center py-5">
                                     <h2>Halaman tidak ditemukan</h2>
                                     <p>Maaf, konten yang Anda cari tidak tersedia.</p>
                                   </div>`;
      }
    } else {
      console.warn(`No route found for URL: ${url}`);
      this.#content.innerHTML = `<div class="container text-center py-5">
                                   <h2>Halaman tidak ditemukan</h2>
                                   <p>URL tidak valid atau halaman belum dibuat.</p>
                                 </div>`;
    }
    this._updateActiveNavLink(currentPath);
  }

  _updateActiveNavLink(currentPath) {
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    navLinks.forEach((link) => {
      link.classList.remove("active");
      const linkPath = link.getAttribute("href").substring(1);
      if (
        currentPath === linkPath ||
        (currentPath === "/" && linkPath === "/")
      ) {
        link.classList.add("active");
      }
    });
  }
}

export default App;
