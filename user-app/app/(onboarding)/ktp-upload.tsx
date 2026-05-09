import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { stitchColors } from '../../src/theme/stitch';
import ProgressHeader from '../../src/components/onboarding/ProgressHeader';
import CalmanHero from '../../src/components/onboarding/CalmanHero';
import CalmanChat from '../../src/components/onboarding/CalmanChat';

export default function KtpUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('Membaca KTP (OCR Smart)...');

  // Membersihkan nama dari karakter aneh & substitusi angka→huruf yang umum salah dibaca OCR
  // Contoh: "BUDl" → "BUDI", "5UPRIYANTO" → "SUPRIYANTO", "M0HAMMAD" → "MOHAMMAD"
  const normalizeName = (raw: string): string => {
    if (!raw) return '';
    let cleaned = raw.toUpperCase();

    // Hanya boleh ada huruf, spasi, titik, apostrof, dan hyphen (untuk nama gabungan)
    // Sisanya diganti spasi dulu (digit kita handle di langkah berikut)
    cleaned = cleaned.replace(/[^A-Z0-9\s.'-]/g, ' ');

    // Substitusi angka→huruf bila angka berada bersebelahan dengan huruf
    // (kemungkinan besar itu salah baca OCR, bukan angka beneran)
    const digitToLetter: Record<string, string> = {
      '0': 'O', '1': 'I', '5': 'S', '8': 'B', '2': 'Z', '6': 'G',
    };
    const chars = cleaned.split('');
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (digitToLetter[c]) {
        const prev = chars[i - 1] || '';
        const next = chars[i + 1] || '';
        if (/[A-Z]/.test(prev) || /[A-Z]/.test(next)) {
          chars[i] = digitToLetter[c];
        }
      }
    }
    cleaned = chars.join('');

    // Hapus angka yang masih tersisa (nama tidak punya angka)
    cleaned = cleaned.replace(/\d+/g, ' ');

    // Rapikan spasi berlebih
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  };

  const processOCR = async (base64Image: string, uri: string) => {
    setIsProcessing(true);
    setLoadingText('Menganalisis gambar...');

    try {
      // Panggil API OCR.space dengan Engine 3 (engine terbaru, akurasi paling tinggi
      // untuk teks Latin termasuk KTP). Engine 2 kadang melewatkan 1-2 huruf di nama.
      const formData = new FormData();
      formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
      formData.append('language', 'eng');
      formData.append('apikey', 'helloworld');
      formData.append('isOverlayRequired', 'false');
      formData.append('OCREngine', '3');
      formData.append('scale', 'true');
      formData.append('detectOrientation', 'true');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result || result.IsErroredOnProcessing || !result.ParsedResults || result.ParsedResults.length === 0) {
        throw new Error('Gagal memproses gambar. Pastikan gambar jelas.');
      }

      const parsedText = result.ParsedResults[0].ParsedText || '';
      
      // Validasi: Apakah gambar ini KTP? (Cari kata kunci NIK, PROVINSI, atau angka panjang)
      const isKtp = /NIK|PROVINSI|KABUPATEN|KOTA|AGAMA|STATUS/i.test(parsedText) || /\b\d{14,16}\b/.test(parsedText.replace(/O|I|L|S/gi, '0'));

      if (!isKtp && parsedText.length > 0) {
        setIsProcessing(false);
        setImage(null);
        Alert.alert(
          'Bukan KTP',
          'Gambar yang Anda unggah tidak terlihat seperti KTP. Mohon unggah foto KTP yang benar dan jelas.'
        );
        return;
      } else if (parsedText.trim().length === 0) {
        setIsProcessing(false);
        setImage(null);
        Alert.alert(
          'Gambar Tidak Terbaca',
          'Tidak ada teks yang dapat dibaca dari gambar ini. Pastikan foto jelas dan tidak blur.'
        );
        return;
      }

      setLoadingText('Mengekstrak data...');

      // Bersihkan teks
      const cleanText = parsedText.replace(/\r/g, '');
      const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let nik = '';
      let nama = '';
      let tempatTglLahir = '';
      let jenisKelamin = '';
      let alamat = '';

      // Normalisasi NIK (memperbaiki huruf yang sering terbaca sebagai angka oleh OCR)
      const normalizedForNumbers = cleanText
        .toUpperCase()
        .replace(/O/g, '0')
        .replace(/I|L/g, '1')
        .replace(/S/g, '5')
        .replace(/Z/g, '2')
        .replace(/B/g, '8')
        .replace(/G/g, '6')
        .replace(/\s+/g, ''); // Hapus spasi

      // Cari 15 atau 16 digit angka berurutan di teks yang sudah dinormalisasi
      const nikMatches = normalizedForNumbers.match(/\d{15,16}/g);
      if (nikMatches && nikMatches.length > 0) {
        nik = nikMatches[0];
      }

      // Looping baris untuk mencari data lain
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toUpperCase();
        
        // Cadangan pencarian NIK jika RegEx di atas gagal
        if (!nik && line.includes('NIK')) {
          const digits = line.replace(/\D/g, '');
          if (digits.length >= 14) nik = digits;
        }

        // Cari NAMA (Biasanya diakhiri spasi, huruf kapital)
        if (line.includes('NAMA') || line.includes('N A M A')) {
          let n = line.replace(/NAMA|N A M A|:|;/gi, '').trim();
          if (n.length > 2) {
            nama = n;
          } else if (i + 1 < lines.length) {
            nama = lines[i+1].replace(/:|;/g, '').trim();
          }
        }

        // Cari TTL (Lebih kuat dengan mencari pola tanggal DD-MM-YYYY atau deteksi label)
        const normalizedForDate = line.replace(/O/g, '0').replace(/I|L/g, '1');
        const hasDate = /\d{2}[-/\s]+\d{2}[-/\s]+\d{4}/.test(normalizedForDate);

        if (!tempatTglLahir && (hasDate || line.includes('LAHIR') || line.includes('TEMPAT') || line.includes('1 GL') || line.includes('T GL'))) {
          // Hapus label jika ada yang nempel, hindari menghapus '/' di dalam tanggal
          // Antisipasi typo OCR seperti "1 GL" atau "T GL" yang sering terbaca dari "TGL"
          let ttl = line.replace(/TEMPAT|T[\s]*G[\s]*L|1[\s]*G[\s]*L|7[\s]*G[\s]*L|LAHIR|:|;/gi, '').replace(/^[\/\s\\]+/, '').trim();
          
          if (ttl.length > 2) {
            // Jika ada angka (minimal 2 digit berurutan untuk membedakan dari typo 1 huruf), kemungkinan tanggal sudah lengkap
            if (/\d{2}/.test(ttl)) {
              tempatTglLahir = ttl;
            } else if (i + 1 < lines.length) {
              // Jika tidak ada angka (hanya nama kota), gabungkan dengan baris selanjutnya
              tempatTglLahir = ttl + ' ' + lines[i+1].trim();
            } else {
              tempatTglLahir = ttl;
            }
          } else if (i + 1 < lines.length) {
            // Jika baris ini hanya label, ambil baris selanjutnya
            tempatTglLahir = lines[i+1].trim();
          }
          
          // Terkadang koma terpisah di depan
          if (tempatTglLahir.startsWith(',')) {
            tempatTglLahir = tempatTglLahir.substring(1).trim();
          }
        }

        // Cari JK
        if (line.includes('KELAMIN') || line.includes('LAKI') || line.includes('PEREMPUAN')) {
          if (line.includes('LAKI') || line.includes('LAK!')) jenisKelamin = 'Laki-laki';
          else if (line.includes('PEREMPUAN')) jenisKelamin = 'Perempuan';
        }

        // Cari Alamat
        if (line.includes('ALAMAT')) {
          let alm = line.replace(/ALAMAT|:|;/gi, '').trim();
          if (alm.length > 2) alamat = alm;
          else if (i + 1 < lines.length) alamat = lines[i+1].trim();
        }
      }

      // Jika Nama masih kosong, ambil baris pertama yang isinya huruf besar semua
      // dan tidak mengandung kata NIK, PROVINSI, dsb. (heuristik tambahan)
      if (!nama) {
        for (const line of lines) {
          const l = line.toUpperCase();
          if (
            l.length > 3 && l.length < 30 &&
            !l.includes('PROVINSI') && !l.includes('KOTA') && 
            !l.includes('KABUPATEN') && !l.includes('NIK') &&
            /^[A-Z\s]+$/.test(l) // Hanya huruf dan spasi
          ) {
            nama = line;
            break;
          }
        }
      }

      // Bersihkan nama dari noise OCR (huruf l→I, angka 0→O, dsb) sebelum ditampilkan
      const namaBersih = normalizeName(nama);

      const ocrData = {
        nik: nik || 'Gagal dibaca',
        nama: namaBersih || 'Gagal dibaca',
        tempatTglLahir: tempatTglLahir || '-',
        jenisKelamin: jenisKelamin || '-',
        alamat: alamat || '-',
        rawText: parsedText,
      };

      setIsProcessing(false);
      
      router.push({
        pathname: '/(onboarding)/ktp-review',
        params: {
          ...params,
          imageUri: uri,
          ocrData: JSON.stringify(ocrData),
        },
      });

    } catch (error) {
      console.log('OCR Error:', error);
      setIsProcessing(false);
      setImage(null);
      Alert.alert(
        'Gagal Membaca KTP',
        'Terjadi kesalahan saat menghubungi layanan OCR. Pastikan ukuran foto tidak terlalu besar.'
      );
    }
  };

  const pickImage = async (useCamera: boolean = false) => {
    try {
      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') {
          alert('Maaf, kami butuh izin akses kamera untuk mengambil foto KTP.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7, // Naikkan dari 0.5 → 0.7 agar teks kecil di KTP tetap tajam untuk OCR
          base64: true,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== 'granted') {
          alert('Maaf, kami butuh izin akses galeri untuk mengunggah foto KTP.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const base64 = result.assets[0].base64;
        setImage(uri);
        if (base64) {
          processOCR(base64, uri);
        } else {
          Alert.alert('Error', 'Gagal memuat gambar');
        }
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Gagal memuat gambar');
    }
  };

  return (
    <View style={styles.screen}>
      <ProgressHeader percentage={85} totalSteps={14} currentStep={12} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CalmanHero variant="avatar" size={150} showGlow />

        <CalmanChat
          messages={[
            'Yuk verifikasi! 📸',
            'Foto KTP kamu, sistem akan otomatis baca data (OCR Smart). Cuma butuh 3 detik!',
          ]}
        />

        {/* Upload area */}
        <View style={styles.uploadSection}>
          <TouchableOpacity 
            style={styles.uploadBox} 
            onPress={() => pickImage(false)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color={stitchColors.gold} />
                <Text style={styles.processingTitle}>{loadingText}</Text>
                <Text style={styles.processingSubtitle}>Harap tunggu sebentar</Text>
              </View>
            ) : image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.uploadTitle}>Tap untuk pilih dari galeri</Text>
                <Text style={styles.uploadSubtitle}>atau gunakan tombol kamera di bawah</Text>
                <View style={styles.cardPreview}>
                  <View style={styles.cardRect} />
                  <View style={styles.cardLines}>
                    <View style={styles.cardLine} />
                    <View style={[styles.cardLine, { width: '60%' }]} />
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* OCR Smart info */}
        <View style={styles.ocrBox}>
          <Text style={styles.ocrTitle}>✨ OCR Smart aktif</Text>
          <Text style={styles.ocrDesc}>
            Sistem otomatis menganalisis gambar untuk mendeteksi NIK, Nama, dan format KTP lainnya.
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsRow}>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>Pencahayaan{'\n'}cukup</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>📐</Text>
            <Text style={styles.tipText}>Sejajar{'\n'}bingkai</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🚫</Text>
            <Text style={styles.tipText}>Tidak{'\n'}buram</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cameraBtn, isProcessing && styles.cameraBtnDisabled]}
          onPress={() => pickImage(true)}
          disabled={isProcessing}
        >
          <Text style={styles.cameraBtnText}>Buka Kamera  📷</Text>
        </TouchableOpacity>

        <View style={styles.skipRow}>
          <TouchableOpacity style={styles.muteBtn}>
            <Text style={{ fontSize: 18 }}>🔇</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(onboarding)/ktp-review', params })}
            disabled={isProcessing}
          >
            <Text style={[styles.skipText, isProcessing && { opacity: 0.5 }]}>Lewati</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: stitchColors.page,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  uploadSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: stitchColors.inputBorder,
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    minHeight: 200,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  processingContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
  },
  processingTitle: {
    color: stitchColors.gold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  processingSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  cameraIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtitle: {
    color: stitchColors.gold,
    fontSize: 13,
    marginBottom: 16,
  },
  cardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    opacity: 0.4,
  },
  cardRect: {
    width: 30,
    height: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 4,
  },
  cardLines: {
    gap: 5,
  },
  cardLine: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  ocrBox: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: 'rgba(212,168,71,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212,168,71,0.25)',
    borderRadius: 14,
    padding: 14,
  },
  ocrTitle: {
    color: stitchColors.gold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  ocrDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 19,
  },
  tipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 20,
  },
  tipItem: {
    alignItems: 'center',
    gap: 6,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  cameraBtn: {
    backgroundColor: stitchColors.gold,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cameraBtnDisabled: {
    backgroundColor: 'rgba(212,168,71,0.3)',
  },
  cameraBtnText: {
    color: '#1A0606',
    fontSize: 16,
    fontWeight: '700',
  },
  skipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});
