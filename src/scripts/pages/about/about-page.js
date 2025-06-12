import AboutPresenter from './about-presenter';

class AboutPage {
  constructor() {
    this._presenter = null;
    this._aboutImageUrl = '/bocah_buka_buku.png';
    this._presenterName = 'CC25-CF325';
  }

  async render() {
    return `
      <div id="about-page-content-area" class="about-page-content-area"></div>
    `;
  }

  async afterRender() {
    const aboutContentAreaElement = document.querySelector(
      '#about-page-content-area'
    );
    if (!aboutContentAreaElement) {
      console.error('Elemen #about-page-content-area tidak ditemukan!');
      return;
    }

    this._presenter = new AboutPresenter({
      view: this,
      container: aboutContentAreaElement,
    });

    await this._presenter.showAboutPageContent();
  }

  _getAboutContentTemplate() {
    return `
      <section class="about-section" style="background:#1c0c2b; padding: 60px 0 30px 0;">
        <div class="container">
          <div class="row mb-4">
            <div class="col-12 text-center mb-5">
              <h2 class="fw-bold display-6" style="color: #ffd600;">About FuturePath</h2>
            </div>
          </div>
          <div class="row align-items-center">
            <div class="col-lg-6 col-md-12 text-center mb-4 mb-lg-0">
              <img src="${this._aboutImageUrl}" alt="Ilustrasi kecemasan atau depresi" class="img-fluid" style="max-width: 60%; height: auto; border-radius: 25px;">
            </div>
            <div class="col-lg-6 col-md-12">
              <div class="about-text" style="color: #fff; font-size: 1.1rem; line-height: 1.7; text-align: justify;">
                <p>
                  Future Path adalah platform inovatif yang dirancang untuk membantu para calon mahasiswa dalam menentukan jurusan kuliah yang tepat berdasarkan minat, bakat, dan tujuan karir mereka.
                </p>
                <p>
                  Kami memahami bahwa memilih jurusan kuliah adalah keputusan besar yang mempengaruhi perjalanan hidup dan karir seseorang. Oleh karena itu, Future Path hadir untuk memberikan panduan yang sistematis, berbasis data, dan relevan, agar setiap individu dapat memilih jalur pendidikan yang paling sesuai dengan potensi dan aspirasi mereka.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="about-why-section">
        <div class="about-why-container">
          <h2 class="about-why-title">Why choose us?</h2>
          <div class="about-why-cards">
            <div class="about-why-card">
              <h3>Powerful insights<br>and analytics</h3>
              <p>
                Kami menyediakan data dan insight mendalam untuk membantu Anda memahami performa dan kebutuhan Anda. Data ini dapat digunakan untuk mengoptimalkan masa depan Anda.
              </p>
            </div>
            <div class="about-why-card">
              <h3>No more wasted<br>effort</h3>
              <p>
                Atur tujuan Anda, dan kami bantu prosesnya! Sistem kami akan membantu Anda menemukan solusi terbaik secara efisien dan efektif.
              </p>
            </div>
            <div class="about-why-card">
              <h3>Target your<br>future better</h3>
              <p>
                Temukan potensi dan arah terbaik sesuai kebutuhan dan karakter Anda, sehingga langkah ke depan lebih terarah dan optimal.
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  displayContent(containerElement) {
    if (containerElement) {
      containerElement.innerHTML = this._getAboutContentTemplate();
    } else {
      console.error(
        'Container element untuk AboutPage tidak ditemukan oleh View.'
      );
    }
  }
}

export default AboutPage;
