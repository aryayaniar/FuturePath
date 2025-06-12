import TestPresenter from './test-presenter';

class TestPage {
  constructor() {
    this._presenter = null;
  }

  async render() {
    return `
      <div id="test-page-content-area" class="test-page-content-area"></div>
    `;
  }

  async afterRender() {
    const testContentAreaElement = document.querySelector(
      '#test-page-content-area'
    );

    if (!testContentAreaElement) {
      console.error('Elemen #test-page-content-area tidak ditemukan!');
      return;
    }

    this._presenter = new TestPresenter({
      view: this,
      container: testContentAreaElement,
    });

    await this._presenter.showTestPageContent();
  }

  displayContent(containerElement) {
    console.warn(
      'displayContent dipanggil tetapi tidak digunakan karena test-page memakai _renderTestForm dari presenter.'
    );
  }
}

export default TestPage;
