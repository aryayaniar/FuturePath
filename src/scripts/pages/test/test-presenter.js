import * as tf from '@tensorflow/tfjs';

class TestPresenter {
  constructor({ view, container }) {
    this._view = view;
    this._container = container;

    // Parameter untuk preprocessing dan model
    this._maxLen = 100;
    this._model = null;
    this._wordIndex = {};
    this._labelMap = {};
  }

  async showTestPageContent() {
    await this._loadWordIndex();
    await this._loadLabelMap();
    await this._loadModel();
    this._renderTestForm();
  }

  async _loadModel() {
    try {
      this._model = await tf.loadLayersModel('/model/model.json');
      console.log('✅ Model berhasil dimuat');
    } catch (error) {
      console.error('❌ Gagal memuat model:', error);
    }
  }

  async _loadLabelMap() {
    try {
      const res = await fetch('/label_map.json');
      if (!res.ok) throw new Error('Gagal memuat label_map.json');
      this._labelMap = await res.json();
      console.log('✅ label_map berhasil dimuat');
    } catch (error) {
      console.error('❌ Gagal memuat label_map:', error);
    }
  }

  async _loadWordIndex() {
    try {
      const res = await fetch('/word_index.json');
      if (!res.ok) throw new Error('Gagal memuat word_index.json');
      this._wordIndex = await res.json();
      console.log('✅ word_index berhasil dimuat');
    } catch (error) {
      console.error('❌ Gagal memuat word_index:', error);
    }
  }

  _renderTestForm() {
    this._container.innerHTML = `
      <section class="test-page" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 3rem 1rem;">
        <div class="test-form" style="width: 100%; max-width: 700px; background: #1c0c2b; padding: 2rem; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); color: white;">
          <h2 class="text-center mb-4" style="color: #ffd600;">Tes Minat Studi</h2>
          <textarea id="inputText" rows="5" placeholder="Tulis deskripsi minat atau cita-cita Anda..." style="width: 100%; padding: 1rem; border-radius: 10px; border: none; font-size: 1rem;"></textarea>
          <button id="predictBtn" style="margin-top: 1rem; padding: 0.75rem 1.5rem; border: none; background-color: #ffd600; color: #1c0c2b; font-weight: bold; border-radius: 10px; cursor: pointer;">Prediksi Jurusan</button>
          <div id="result" style="margin-top: 1.5rem; font-size: 1.2rem;"></div>
        </div>
      </section>
    `;

    const predictBtn = document.getElementById('predictBtn');
    predictBtn.addEventListener('click', () => this._predict());
  }

  _preprocessText(text) {
    const words = text.toLowerCase().split(/\s+/);
    const sequence = words.map((word) => {
      return this._wordIndex[word] || this._wordIndex['<OOV>'] || 0;
    });

    if (sequence.length < this._maxLen) {
      const padded = Array(this._maxLen).fill(0);
      for (let i = 0; i < sequence.length; i++) {
        padded[i] = sequence[i];
      }
      return padded;
    } else {
      return sequence.slice(0, this._maxLen);
    }
  }

  async _predict() {
    const inputText = document.getElementById('inputText').value
    const resultEl = document.getElementById('result');

    if (!inputText) {
      resultEl.innerText = 'Masukkan deskripsi terlebih dahulu.';
      return;
    }

    if (!this._model) {
      resultEl.innerText = 'Model belum dimuat.';
      return;
    }

    const tokens = this._preprocessText(inputText);
    const inputTensor = tf.tensor2d([tokens], [1, this._maxLen]);
    const prediction = this._model.predict(inputTensor);
    const predictedClass = prediction.argMax(-1).dataSync()[0];

    const predictedLabel = this._labelMap[predictedClass] || 'Tidak diketahui';

    resultEl.innerText = `Prediksi Jurusan: ${predictedLabel}`;
  }
}

export default TestPresenter;
