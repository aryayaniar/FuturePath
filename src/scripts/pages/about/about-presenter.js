class AboutPresenter {
  constructor({ view, container }) {
    this._view = view;
    this._container = container;

    if (!this._view || typeof this._view.displayContent !== "function") {
      throw new Error(
        "Presenter membutuhkan View dengan metode displayContent!"
      );
    }
    if (!this._container) {
      throw new Error("Presenter membutuhkan elemen container!");
    }
  }

  async showAboutPageContent() {
    try {
      this._view.displayContent(this._container);
    } catch (error) {
      console.error("Gagal menampilkan konten halaman About:", error);
      this._container.innerHTML =
        '<p class="text-danger text-center">Terjadi kesalahan saat memuat konten.</p>';
    }
  }
}

export default AboutPresenter;
