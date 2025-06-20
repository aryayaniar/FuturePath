# -*- coding: utf-8 -*-
"""CAPSTONE-Sistem Rekomendasi Jurusan.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1aEZv0UzE11f2cgUfwDj1NYDyZCJzn0XF

Import Library
"""

from google.colab import files
import random
import json
import nltk

!pip install nltk googletrans
from nltk.corpus import wordnet
from googletrans import Translator
import pandas as pd                          # Untuk load dan manipulasi dataset
import numpy as np                           # Operasi numerik
from sklearn.model_selection import train_test_split   # Split data train-test
from sklearn.preprocessing import LabelEncoder         # Encode label kategori

import tensorflow as tf                      # Framework deep learning
from tensorflow.keras.preprocessing.text import Tokenizer       # Tokenisasi teks
from tensorflow.keras.preprocessing.sequence import pad_sequences # Padding sequence
from tensorflow.keras.models import Sequential     # Model Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Bidirectional

"""## Data Collection

### Tujuan: Mengimpor / Load data dari Google Form.
"""

# Upload file manual
uploaded = files.upload()

# Ambil nama file dari upload (biasanya hanya satu file)
file_name = list(uploaded.keys())[0]

# Baca file
df = pd.read_csv(file_name)

# Tampilkan 5 baris awal
df

"""## Data Understanding

### Tujuan: Memahami struktur data dan mengecek isi kolom.
"""

# Lihat semua nama kolom yang tersedia
print(df.columns.tolist())

# Informasi ringkas tentang data
df.info()

print('Jumlah Prodi : ', len(df['Label'].unique()))

print('Jumlah Deskripsi : ', len(df['Deskripsi']))

print('Jumlah Deskripsi Per Label', df.groupby('Label')['Deskripsi'].count())

"""## Data Preprocessing

### Tujuan: Membersihkan dan menyiapkan data.
"""

# Cek missing value
print("\nCek Missing Values:")
print(df.isnull().sum())

df['cleaned_text'] = df['Deskripsi'].str.lower()

df

"""Augmentasi data teks menggunakan dua teknik:
1. Synonym Replacement
2. Back Translation

"""

# Download resource
nltk.download('punkt_tab')
nltk.download('wordnet')
nltk.download('omw-1.4')

# Inisialisasi translator
translator = Translator()

""" FUNGSI 1: Synonym Replacement"""

def synonym_replacement(text, n=2):
    words = nltk.word_tokenize(text)
    new_words = words.copy()
    random.shuffle(words)

    num_replaced = 0
    for word in words:
        synonyms = set()
        for syn in wordnet.synsets(word):
            for lemma in syn.lemmas():
                if lemma.name().lower() != word.lower():
                    synonyms.add(lemma.name().replace("_", " "))
        if synonyms:
            new_words = [w if w != word else random.choice(list(synonyms)) for w in new_words]
            num_replaced += 1
        if num_replaced >= n:
            break

    return ' '.join(new_words)

"""FUNGSI 2: Back Translation

"""

def back_translation(text, lang='en'):
    try:
        translated = translator.translate(text, dest=lang).text
        back_translated = translator.translate(translated, dest='id').text
        return back_translated
    except Exception as e:
        print("Error in back translation:", e)
        return text

# Buat Data Tambahan Otomatis untuk Label yang Kurang dari 250
target_count = 250
current_counts = df['Label'].value_counts()
labels_to_expand = current_counts[current_counts < target_count]

# Define the missing function
def generate_descriptions(label, count):
    generated_list = []
    # Example placeholder: Simply create dummy descriptions
    # You should replace this with a proper text generation method
    for i in range(count):
        generated_list.append(f"Ini adalah deskripsi tambahan untuk {label} {i+1}")
    return generated_list


additional_data = []
for label, current_count in labels_to_expand.items():
    missing_count = target_count - current_count
    # Call the newly defined function
    new_descriptions = generate_descriptions(label, missing_count)
    for desc in new_descriptions:
        additional_data.append({"Deskripsi": desc, "Label": label})

# Gabungkan ke DataFrame Asli
df_extra = pd.DataFrame(additional_data)
df_augmented = pd.concat([df, df_extra], ignore_index=True)

# Cek Distribusi Terbaru
print("Distribusi label setelah augmentasi:")
print(df_augmented['Label'].value_counts().sort_index())

# Encode label string ke angka
label_encoder = LabelEncoder()
df["label_id"] = label_encoder.fit_transform(df["Label"])

# Simpan mapping label ke nama jurusan
label_map = {i: label for i, label in enumerate(label_encoder.classes_)}

# Simpan ke file JSON
with open("label_map.json", "w") as f:
    json.dump(label_map, f)

"""## Modelling

### Tujuan: Membangun sistem rekomendasi.
"""

max_words = 10000
max_len = 100

tokenizer = Tokenizer(num_words=max_words)
tokenizer.fit_on_texts(df['cleaned_text'])
sequences = tokenizer.texts_to_sequences(df['cleaned_text'])
padded_sequences = pad_sequences(sequences, maxlen=max_len, padding='post')

num_classes = df["label_id"].nunique()

# Simpan word_index ke file
with open('word_index.json', 'w') as f:
    json.dump(tokenizer.word_index, f)

X_train, X_test, y_train, y_test = train_test_split(
    padded_sequences, df['label_id'], test_size=0.2, random_state=42)

model2 = tf.keras.Sequential([
    tf.keras.layers.Embedding(input_dim=5000, output_dim=64, input_length=100),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64)),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(df["label_id"].nunique(), activation='softmax')  # num_classes
])

model2.compile(
    loss='sparse_categorical_crossentropy',
    optimizer='adam',
    metrics=['accuracy']
)

model2.fit(
    X_train, y_train,
    epochs=10,
    batch_size=32
)

model3 = Sequential([
    Embedding(input_dim=max_words, output_dim=128, input_length=max_len),
    Bidirectional(LSTM(64, return_sequences=False)),  # tambah Bidirectional
    Dropout(0.5),
    Dense(64, activation='relu'),
    Dropout(0.5),
    Dense(num_classes, activation='softmax')
])

model3.compile(
    loss='sparse_categorical_crossentropy',
    optimizer='adam',
    metrics=['accuracy']
)

history = model3.fit(
    X_train, y_train,
    epochs=10,
    batch_size=32
)

"""## Evaluasi

### Tujuan: Fungsi untuk memberikan rekomendasi jurusan.
"""

def predict(text):
    sequence = tokenizer.texts_to_sequences([text])
    padded_sequence = pad_sequences(sequence, maxlen=max_len, padding='post')
    prediction = model2.predict(padded_sequence)
    predicted_label = label_encoder.inverse_transform([np.argmax(prediction)])
    return predicted_label[0]

print(predict("saya suka kimia dan membuat obat obatan"))

"""# Save Model"""

model2.save('model.h5')

# Install tensorflowjs
!pip install tensorflowjs

!tensorflowjs_converter --input_format=keras model.h5 tfjs_model_keras

!zip  -r tfjs_model_fix.zip tfjs_model_keras

files.download('tfjs_model_fix.zip')

from tensorflow import keras

try:
    model = keras.models.load_model("model.h5")
    print("✅ Model berhasil dimuat.")
except Exception as e:
    print("❌ Gagal memuat model:", e)