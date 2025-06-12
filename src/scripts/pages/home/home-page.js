import HomePresenter from './home-presenter.js';

export default class HomePage {
  #presenter;

  async render() {
    return `
      <section class="custom-hero-section">
        <div class="custom-hero-container">
          <div class="custom-hero-left">
            <h5 class="custom-hero-subtitle">Future Path </h5>
            <h1 class="custom-hero-title">UNLOCKING<br>YOUR FUTURE <br>TO SUCCESS</h1>
            <p class="custom-hero-desc">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tempus aliquam velit ac mattis. Vestibulum scelerisque orci dui, eget dignissim tellus interdum non.
            </p>
            <a href="#/test" class="custom-hero-btn">GET STARTED</a>
          </div>
          <div class="custom-hero-right">
            <img src="/buka_buku.png" alt="books" class="custom-hero-img" />
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({ view: this });
  }
}
