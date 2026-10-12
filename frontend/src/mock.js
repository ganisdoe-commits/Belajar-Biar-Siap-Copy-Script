// ============================================================
// MOCK DATA — Simulator CAT USKP Tingkat A
// NOTE: Data ini adalah CONTOH (mock). Nanti diganti dengan
// 100 soal pilihan ganda + 25 soal esai asli milik Anda.
// ============================================================

// Token contoh yang dibagikan "pengawas" pada layar pra-ujian
// Enam mata ujian USKP Tingkat A (sesuai panduan)
export const SUBJECTS = [
  {
    id: "pph-op",
    code: "A1",
    name: "PPh OP & SPT PPh OP",
    short: "PPh OP",
    durationMin: 120,
    totalQuestions: 40,
    color: "#4338CA",
    desc: "Pajak Penghasilan Orang Pribadi dan Surat Pemberitahuan Tahunan PPh OP.",
  },
  {
    id: "kup",
    code: "A1",
    name: "KUP, PPSP, dan PP",
    short: "KUP",
    durationMin: 90,
    totalQuestions: 40,
    color: "#0891b2",
    desc: "Ketentuan Umum & Tata Cara Perpajakan, Penagihan Pajak dengan Surat Paksa, Pengadilan Pajak.",
  },
  {
    id: "potput",
    code: "A2",
    name: "PPh Pot/Put",
    short: "Pot/Put",
    durationMin: 120,
    totalQuestions: 40,
    color: "#7c3aed",
    desc: "Pajak Penghasilan Pemotongan dan Pemungutan (PPh 21, 22, 23, 26, 4(2)).",
  },
  {
    id: "ppn",
    code: "A2",
    name: "PPN & SPT PPN",
    short: "PPN",
    durationMin: 90,
    totalQuestions: 40,
    color: "#059669",
    desc: "Pajak Pertambahan Nilai dan Surat Pemberitahuan Masa PPN.",
  },
  {
    id: "pbb",
    code: "A3",
    name: "PBB-P5L & Bea Meterai",
    short: "PBB",
    durationMin: 90,
    totalQuestions: 40,
    color: "#d97706",
    desc: "PBB Perkebunan, Perhutanan, Pertambangan, Perikanan, dan sektor Lainnya serta Bea Meterai.",
  },
];

// Helper membuat soal contoh (akan diulang agar simulator terasa penuh)
const opt = (a, b, c, d) => [
  { key: "A", text: a },
  { key: "B", text: b },
  { key: "C", text: c },
  { key: "D", text: d },
];

// Bank soal contoh per mata ujian (pilihan ganda)
export const MCQ_BANK = {
  "pph-op": [
    {
      q: "Penghasilan Tidak Kena Pajak (PTKP) untuk Wajib Pajak orang pribadi yang belum menikah (TK/0) per tahun adalah sebesar...",
      options: opt("Rp36.000.000", "Rp54.000.000", "Rp58.500.000", "Rp67.500.000"),
      answer: "B",
      pembahasan:
        "Berdasarkan PMK-101/PMK.010/2016, PTKP untuk WP OP sendiri (TK/0) adalah Rp54.000.000 per tahun.",
    },
    {
      q: "Tarif PPh Pasal 17 ayat (1) huruf a untuk lapisan penghasilan kena pajak sampai dengan Rp60.000.000 adalah...",
      options: opt("5%", "10%", "15%", "25%"),
      answer: "A",
      pembahasan:
        "Sesuai UU HPP, lapisan pertama PKP s.d. Rp60.000.000 dikenai tarif 5%.",
    },
    {
      q: "Seorang WP OP memperoleh penghasilan neto dalam negeri. Penghitungan penghasilan neto dengan Norma Penghitungan Penghasilan Neto diperbolehkan apabila peredaran bruto dalam satu tahun kurang dari...",
      options: opt("Rp2.400.000.000", "Rp4.800.000.000", "Rp600.000.000", "Rp50.000.000.000"),
      answer: "B",
      pembahasan:
        "WP OP boleh menggunakan NPPN jika peredaran bruto kurang dari Rp4.800.000.000 setahun (Pasal 14 UU PPh).",
    },
    {
      q: "Batas waktu penyampaian SPT Tahunan PPh Orang Pribadi paling lambat adalah...",
      options: opt("akhir bulan ke-3 setelah tahun pajak", "akhir bulan ke-4 setelah tahun pajak", "20 hari setelah masa pajak", "akhir tahun pajak"),
      answer: "A",
      pembahasan:
        "SPT Tahunan PPh OP paling lambat 3 bulan setelah akhir tahun pajak (31 Maret untuk tahun kalender).",
    },
    {
      q: "Zakat atas penghasilan yang dibayarkan kepada badan amil zakat yang disahkan pemerintah, terhadap PPh dapat diperlakukan sebagai...",
      options: opt("tidak boleh dikurangkan", "pengurang penghasilan bruto", "kredit pajak", "tambahan PTKP"),
      answer: "B",
      pembahasan:
        "Zakat kepada BAZ/LAZ yang disahkan pemerintah dapat menjadi pengurang penghasilan bruto (Pasal 9 ayat (1) huruf g UU PPh).",
    },
    {
      q: "Penghasilan dari hadiah undian dikenakan PPh yang bersifat...",
      options: opt("final sebesar 25%", "final sebesar 25% dari jumlah bruto", "tidak final 15%", "final sebesar 25% PP 132/2000"),
      answer: "D",
      pembahasan:
        "Hadiah undian dikenai PPh final 25% dari jumlah bruto sesuai PP Nomor 132 Tahun 2000.",
    },
    {
      q: "Tambahan PTKP untuk status Wajib Pajak kawin adalah...",
      options: opt("Rp4.500.000", "Rp54.000.000", "Rp9.000.000", "Rp2.025.000"),
      answer: "A",
      pembahasan:
        "Tambahan untuk WP kawin adalah Rp4.500.000; tambahan tanggungan juga Rp4.500.000 (maks 3).",
    },
    {
      q: "Penghasilan berupa bunga deposito dan tabungan dikenakan PPh Pasal 4 ayat (2) dengan tarif...",
      options: opt("10%", "15%", "20%", "25%"),
      answer: "C",
      pembahasan:
        "Bunga deposito/tabungan dikenai PPh final 20% dari jumlah bruto (PP 131 Tahun 2000 jo. PP 123/2015).",
    },
  ],
  kup: [
    {
      q: "Nomor Pokok Wajib Pajak (NPWP) berfungsi sebagai...",
      options: opt("bukti pembayaran pajak", "sarana administrasi perpajakan dan identitas WP", "pengganti KTP", "izin usaha"),
      answer: "B",
      pembahasan:
        "NPWP adalah sarana dalam administrasi perpajakan sekaligus tanda pengenal/identitas WP (Pasal 1 UU KUP).",
    },
    {
      q: "Jangka waktu penyimpanan buku, catatan, dan dokumen yang menjadi dasar pembukuan adalah...",
      options: opt("5 tahun", "10 tahun", "3 tahun", "selama-lamanya"),
      answer: "B",
      pembahasan:
        "Dokumen wajib disimpan selama 10 tahun di Indonesia (Pasal 28 ayat (11) UU KUP).",
    },
    {
      q: "Surat Ketetapan Pajak Kurang Bayar (SKPKB) dapat diterbitkan dalam jangka waktu...",
      options: opt("5 tahun setelah saat terutangnya pajak", "10 tahun", "2 tahun", "tidak terbatas"),
      answer: "A",
      pembahasan:
        "SKPKB diterbitkan dalam jangka waktu 5 tahun setelah saat terutangnya pajak (Pasal 13 UU KUP).",
    },
    {
      q: "Sanksi administrasi berupa bunga atas keterlambatan pembayaran pajak dihitung berdasarkan...",
      options: opt("tarif tetap 2% per bulan", "suku bunga acuan + uplift dibagi 12", "tarif tetap 48%", "tidak ada sanksi"),
      answer: "B",
      pembahasan:
        "Sejak UU Cipta Kerja, bunga mengikuti suku bunga acuan ditambah uplift, dibagi 12, maksimal 24 bulan.",
    },
    {
      q: "Keberatan atas suatu SKP harus diajukan dalam jangka waktu...",
      options: opt("3 bulan sejak tanggal SKP dikirim", "1 bulan", "6 bulan", "12 bulan"),
      answer: "A",
      pembahasan:
        "Keberatan diajukan paling lama 3 bulan sejak tanggal dikirim SKP (Pasal 25 UU KUP).",
    },
    {
      q: "Banding atas keputusan keberatan diajukan ke...",
      options: opt("Direktur Jenderal Pajak", "Pengadilan Pajak", "Mahkamah Agung", "Kantor Pelayanan Pajak"),
      answer: "B",
      pembahasan:
        "Banding diajukan ke Pengadilan Pajak paling lama 3 bulan sejak keputusan keberatan diterima.",
    },
    {
      q: "Surat Paksa dalam penagihan pajak mempunyai kekuatan eksekutorial dan kedudukan hukum yang sama dengan...",
      options: opt("putusan pengadilan yang berkekuatan hukum tetap", "surat teguran", "surat himbauan", "nota dinas"),
      answer: "A",
      pembahasan:
        "Surat Paksa berkekuatan eksekutorial setara putusan pengadilan yang inkracht (UU PPSP).",
    },
    {
      q: "Pembetulan SPT atas kemauan sendiri dapat dilakukan sepanjang...",
      options: opt("belum dilakukan pemeriksaan", "sudah terbit SKP", "sudah banding", "kapan saja tanpa syarat"),
      answer: "A",
      pembahasan:
        "WP dapat membetulkan SPT sepanjang DJP belum melakukan tindakan pemeriksaan (Pasal 8 UU KUP).",
    },
  ],
  potput: [
    {
      q: "Tarif PPh Pasal 23 atas sewa dan penghasilan lain sehubungan dengan penggunaan harta (selain tanah/bangunan) adalah...",
      options: opt("2% dari jumlah bruto", "15% dari jumlah bruto", "10% dari jumlah bruto", "4% dari jumlah bruto"),
      answer: "A",
      pembahasan:
        "PPh 23 atas sewa harta (bukan tanah/bangunan) adalah 2% dari jumlah bruto.",
    },
    {
      q: "PPh Pasal 21 bagi penerima penghasilan yang tidak memiliki NPWP dikenakan tarif lebih tinggi sebesar...",
      options: opt("10%", "20% lebih tinggi", "15%", "50% lebih tinggi"),
      answer: "B",
      pembahasan:
        "Bagi yang tidak ber-NPWP, tarif PPh 21 lebih tinggi 20% dari tarif normal (Pasal 21 ayat (5a)).",
    },
    {
      q: "PPh Pasal 22 atas impor barang oleh importir yang memiliki Angka Pengenal Impor (API) umumnya sebesar...",
      options: opt("2,5% dari nilai impor", "7,5% dari nilai impor", "0,5%", "10%"),
      answer: "A",
      pembahasan:
        "Importir ber-API umumnya dikenai PPh 22 sebesar 2,5% dari nilai impor.",
    },
    {
      q: "Dividen yang diterima Wajib Pajak orang pribadi dalam negeri dapat dikecualikan dari objek PPh sepanjang...",
      options: opt("diinvestasikan di wilayah NKRI dalam jangka waktu tertentu", "jumlahnya kecil", "dibayar tunai", "berasal dari luar negeri"),
      answer: "A",
      pembahasan:
        "Berdasarkan UU Cipta Kerja/HPP, dividen dikecualikan sepanjang diinvestasikan di Indonesia sesuai ketentuan.",
    },
    {
      q: "Tarif PPh Pasal 26 atas penghasilan bunga/royalti kepada WP luar negeri (tanpa P3B) adalah...",
      options: opt("15%", "20%", "25%", "10%"),
      answer: "B",
      pembahasan:
        "PPh 26 umumnya 20% dari jumlah bruto, kecuali diatur lain dalam P3B/tax treaty.",
    },
    {
      q: "PPh Pasal 4 ayat (2) atas pengalihan hak atas tanah dan/atau bangunan pada umumnya dikenakan tarif...",
      options: opt("2,5% dari jumlah bruto", "5% dari jumlah bruto", "10%", "1% dari NJOP"),
      answer: "A",
      pembahasan:
        "Pengalihan hak atas tanah/bangunan umumnya dikenai PPh final 2,5% dari jumlah bruto (PP 34/2016).",
    },
    {
      q: "Pemotong PPh Pasal 23 wajib menyetor paling lambat tanggal...",
      options: opt("10 bulan berikutnya", "15 bulan berikutnya", "20 bulan berikutnya", "akhir bulan berikutnya"),
      answer: "A",
      pembahasan:
        "Penyetoran PPh 23 paling lambat tanggal 10 bulan berikutnya setelah masa pajak berakhir.",
    },
    {
      q: "Jasa teknik, jasa manajemen, dan jasa konsultan dikenakan PPh Pasal 23 dengan tarif...",
      options: opt("2% dari jumlah bruto", "15% dari jumlah bruto", "4% dari jumlah bruto", "10%"),
      answer: "A",
      pembahasan:
        "Imbalan jasa teknik/manajemen/konsultan dikenai PPh 23 sebesar 2% dari jumlah bruto.",
    },
  ],
  ppn: [
    {
      q: "Tarif Pajak Pertambahan Nilai (PPN) yang berlaku umum sesuai UU HPP adalah...",
      options: opt("10%", "11%", "12%", "0%"),
      answer: "B",
      pembahasan:
        "Sejak 1 April 2022, tarif PPN umum menjadi 11% (UU HPP).",
    },
    {
      q: "Dasar Pengenaan Pajak (DPP) untuk penyerahan Barang Kena Pajak pada umumnya adalah...",
      options: opt("Harga Jual", "Nilai Impor", "Nilai Ekspor", "Nilai lain"),
      answer: "A",
      pembahasan:
        "DPP untuk penyerahan BKP pada umumnya menggunakan Harga Jual.",
    },
    {
      q: "Pengusaha Kena Pajak wajib menerbitkan Faktur Pajak pada saat...",
      options: opt("penyerahan BKP/JKP atau penerimaan pembayaran mendahului penyerahan", "akhir tahun", "saat pelaporan SPT", "saat ditagih DJP"),
      answer: "A",
      pembahasan:
        "Faktur Pajak dibuat saat penyerahan atau saat penerimaan pembayaran jika mendahului penyerahan.",
    },
    {
      q: "Batas waktu penyetoran PPN yang terutang dalam satu Masa Pajak adalah...",
      options: opt("akhir bulan berikutnya sebelum SPT Masa disampaikan", "tanggal 10 bulan berikutnya", "tanggal 15 bulan berikutnya", "akhir tahun pajak"),
      answer: "A",
      pembahasan:
        "PPN disetor paling lama akhir bulan berikutnya sebelum SPT Masa PPN disampaikan.",
    },
    {
      q: "Ekspor Barang Kena Pajak Berwujud dikenakan PPN dengan tarif...",
      options: opt("11%", "0%", "dibebaskan", "tidak dikenakan"),
      answer: "B",
      pembahasan:
        "Ekspor BKP Berwujud dikenai tarif 0% sehingga Pajak Masukan tetap dapat dikreditkan.",
    },
    {
      q: "Pajak Masukan yang tidak dapat dikreditkan antara lain atas perolehan...",
      options: opt("BKP/JKP sebelum pengusaha dikukuhkan sebagai PKP", "bahan baku produksi", "mesin pabrik", "jasa angkutan"),
      answer: "A",
      pembahasan:
        "Pasal 9 ayat (8) UU PPN mengatur Pajak Masukan atas perolehan sebelum dikukuhkan PKP tidak dapat dikreditkan.",
    },
    {
      q: "Pengusaha yang wajib dikukuhkan sebagai PKP adalah yang peredaran brutonya dalam satu tahun melebihi...",
      options: opt("Rp4.800.000.000", "Rp600.000.000", "Rp2.400.000.000", "Rp50.000.000.000"),
      answer: "A",
      pembahasan:
        "Batasan Pengusaha Kecil adalah Rp4,8 miliar; di atasnya wajib dikukuhkan sebagai PKP (PMK-197/2013).",
    },
    {
      q: "Faktur Pajak yang tidak mencantumkan identitas pembeli secara lengkap dikategorikan sebagai Faktur Pajak...",
      options: opt("tidak lengkap", "batal", "pengganti", "gabungan"),
      answer: "A",
      pembahasan:
        "Faktur Pajak yang tidak memenuhi syarat formal/material termasuk Faktur Pajak tidak lengkap.",
    },
  ],
  pbb: [
    {
      q: "Objek PBB sektor P5L meliputi antara lain, kecuali...",
      options: opt("Perkebunan", "Perhutanan", "Pertambangan", "Perdagangan eceran"),
      answer: "D",
      pembahasan:
        "P5L = Perkebunan, Perhutanan, Pertambangan, Perikanan, dan sektor Lainnya. Perdagangan eceran bukan objek PBB P5L.",
    },
    {
      q: "Dasar pengenaan PBB adalah...",
      options: opt("Nilai Jual Objek Pajak (NJOP)", "Harga Pasar", "Harga Perolehan", "NJKP saja"),
      answer: "A",
      pembahasan:
        "Dasar pengenaan PBB adalah NJOP (Pasal 6 UU PBB).",
    },
    {
      q: "Nilai Jual Kena Pajak (NJKP) ditetapkan serendah-rendahnya 20% dan setinggi-tingginya...",
      options: opt("40%", "100%", "50%", "60%"),
      answer: "B",
      pembahasan:
        "NJKP ditetapkan antara 20% sampai dengan 100% dari NJOP.",
    },
    {
      q: "Bea Meterai untuk dokumen yang berlaku saat ini adalah sebesar...",
      options: opt("Rp3.000", "Rp6.000", "Rp10.000", "Rp9.000"),
      answer: "C",
      pembahasan:
        "Berdasarkan UU No. 10 Tahun 2020, tarif Bea Meterai tunggal menjadi Rp10.000.",
    },
    {
      q: "Dokumen yang dikenai Bea Meterai antara lain...",
      options: opt("surat perjanjian dan surat berharga dengan nominal tertentu", "kuitansi di bawah Rp1.000", "faktur internal", "nota pengiriman barang"),
      answer: "A",
      pembahasan:
        "Bea Meterai dikenakan atas dokumen yang bersifat perdata, termasuk perjanjian & surat berharga di atas nilai tertentu (Rp5.000.000).",
    },
    {
      q: "Saat terutang PBB ditentukan menurut keadaan objek pajak pada tanggal...",
      options: opt("1 Januari", "31 Desember", "1 Juli", "akhir tahun pajak"),
      answer: "A",
      pembahasan:
        "Saat terutang PBB ditentukan menurut keadaan objek pajak pada tanggal 1 Januari.",
    },
    {
      q: "NJOP Tidak Kena Pajak (NJOPTKP) ditetapkan paling rendah sebesar...",
      options: opt("Rp10.000.000", "Rp12.000.000", "Rp8.000.000", "Rp15.000.000"),
      answer: "B",
      pembahasan:
        "NJOPTKP ditetapkan paling rendah Rp12.000.000 untuk setiap Wajib Pajak.",
    },
    {
      q: "Bea Meterai yang dibayar kemudian (pemeteraian kemudian) atas dokumen dilakukan melalui...",
      options: opt("Pejabat Pos / kantor pajak", "bank umum", "notaris", "pengadilan"),
      answer: "A",
      pembahasan:
        "Pemeteraian kemudian dilakukan oleh Pejabat Pos atau melalui ketentuan yang ditetapkan DJP.",
    },
  ],
  etik: [
    {
      q: "Kode Etik Konsultan Pajak Indonesia ditetapkan oleh...",
      options: opt("Ikatan Konsultan Pajak Indonesia (IKPI)", "Direktorat Jenderal Pajak", "Kementerian Keuangan", "Pengadilan Pajak"),
      answer: "A",
      pembahasan:
        "Kode Etik profesi konsultan pajak ditetapkan oleh asosiasi, salah satunya IKPI.",
    },
    {
      q: "Seorang konsultan pajak dalam menjalankan profesinya wajib menjunjung tinggi prinsip...",
      options: opt("integritas dan profesionalisme", "mengutamakan keuntungan pribadi", "kerahasiaan tanpa batas hukum", "menghindari pajak klien"),
      answer: "A",
      pembahasan:
        "Prinsip dasar kode etik meliputi integritas, objektivitas, kompetensi, dan profesionalisme.",
    },
    {
      q: "Konsultan pajak dilarang memberikan jasa kepada Wajib Pajak apabila...",
      options: opt("terdapat benturan kepentingan yang tidak dapat diatasi", "klien berasal dari luar kota", "honor terlalu kecil", "klien baru pertama kali"),
      answer: "A",
      pembahasan:
        "Benturan kepentingan yang tidak dapat diatasi menjadi alasan konsultan tidak memberikan jasa.",
    },
    {
      q: "Terhadap kerahasiaan informasi klien, konsultan pajak wajib...",
      options: opt("menjaga kerahasiaan kecuali diwajibkan oleh ketentuan hukum", "membuka data kepada siapa pun", "menjualnya bila perlu", "mengabaikannya"),
      answer: "A",
      pembahasan:
        "Prinsip kerahasiaan: menjaga informasi klien kecuali ada kewajiban hukum untuk mengungkapkan.",
    },
    {
      q: "Izin praktik konsultan pajak diterbitkan oleh...",
      options: opt("Sekretariat Jenderal Kementerian Keuangan", "IKPI", "DJP", "Pengadilan Pajak"),
      answer: "A",
      pembahasan:
        "Izin praktik konsultan pajak diterbitkan oleh Kementerian Keuangan (Sekretariat Jenderal).",
    },
    {
      q: "Pelanggaran kode etik oleh anggota ditindak oleh...",
      options: opt("Dewan Kehormatan asosiasi", "Kepolisian", "DPR", "KPK"),
      answer: "A",
      pembahasan:
        "Penegakan kode etik dilakukan oleh Dewan Kehormatan asosiasi profesi.",
    },
    {
      q: "Konsultan pajak sebaiknya terus meningkatkan kompetensi melalui...",
      options: opt("Pengembangan Profesional Berkelanjutan (PPL)", "mengurangi jam kerja", "menolak klien baru", "menghindari pelatihan"),
      answer: "A",
      pembahasan:
        "Kompetensi dijaga melalui PPL (Continuing Professional Development) secara berkelanjutan.",
    },
    {
      q: "Dalam menetapkan imbalan jasa, konsultan pajak tidak boleh...",
      options: opt("mendasarkan pada hasil yang akan diperoleh dengan cara melanggar ketentuan", "menyepakati di awal", "memberikan rincian", "menggunakan kontrak tertulis"),
      answer: "A",
      pembahasan:
        "Imbalan jasa tidak boleh didasarkan pada cara-cara yang melanggar ketentuan perpajakan.",
    },
  ],
};

// Bank soal ESAI contoh (mode terpisah / bonus)
export const ESSAY_BANK = {
  "pph-op": [
    {
      q: "Tuan Budi (K/2) memperoleh penghasilan neto setahun Rp350.000.000. Hitunglah PTKP dan PPh terutang Tuan Budi menggunakan tarif Pasal 17 UU HPP. Jelaskan langkah perhitungannya.",
      model:
        "PTKP K/2 = 54.000.000 + 4.500.000 (kawin) + 2×4.500.000 (tanggungan) = 67.500.000. PKP = 350.000.000 − 67.500.000 = 282.500.000. PPh: 5%×60.000.000 = 3.000.000; 15%×(250.000.000−60.000.000=190.000.000) = 28.500.000; 25%×(282.500.000−250.000.000=32.500.000) = 8.125.000. Total PPh = 39.625.000.",
    },
    {
      q: "Jelaskan perbedaan penggunaan pembukuan dan Norma Penghitungan Penghasilan Neto (NPPN) bagi Wajib Pajak Orang Pribadi, beserta syarat penggunaannya.",
      model:
        "Pembukuan wajib bagi WP OP yang melakukan kegiatan usaha/pekerjaan bebas dengan peredaran bruto ≥ Rp4,8 miliar. NPPN boleh digunakan bila peredaran bruto < Rp4,8 miliar dan WP memberitahukan ke DJP dalam 3 bulan pertama tahun pajak. NPPN menghitung penghasilan neto dengan persentase tertentu dari peredaran bruto berdasarkan jenis usaha/wilayah.",
    },
  ],
  kup: [
    {
      q: "Jelaskan upaya hukum yang dapat ditempuh Wajib Pajak atas Surat Ketetapan Pajak Kurang Bayar (SKPKB), mulai dari keberatan hingga peninjauan kembali, beserta jangka waktunya.",
      model:
        "1) Keberatan ke DJP dalam 3 bulan sejak SKP dikirim; DJP memutus dalam 12 bulan. 2) Banding ke Pengadilan Pajak dalam 3 bulan sejak keputusan keberatan; disertai pembayaran 50% (ketentuan tertentu). 3) Peninjauan Kembali ke Mahkamah Agung dalam 3 bulan atas alasan terbatas (Pasal 25, 27 UU KUP & UU Pengadilan Pajak).",
    },
  ],
  potput: [
    {
      q: "PT ABC membayar jasa konsultan kepada CV XYZ (ber-NPWP) sebesar Rp100.000.000 (belum termasuk PPN). Hitung PPh Pasal 23 yang harus dipotong dan jelaskan kewajiban pemotong.",
      model:
        "PPh 23 atas jasa konsultan = 2% × 100.000.000 = 2.000.000. PT ABC wajib memotong saat terutang/dibayar, menyetor paling lambat tgl 10 bulan berikutnya, membuat bukti potong, dan melaporkan dalam SPT Masa PPh 23 paling lambat tgl 20 bulan berikutnya.",
    },
  ],
  ppn: [
    {
      q: "PKP 'A' pada Masa Pajak memiliki Pajak Keluaran Rp55.000.000 dan Pajak Masukan yang dapat dikreditkan Rp40.000.000. Hitung PPN kurang/lebih bayar dan jelaskan mekanisme pengkreditannya.",
      model:
        "PPN kurang bayar = Pajak Keluaran − Pajak Masukan = 55.000.000 − 40.000.000 = 15.000.000 (kurang bayar). Harus disetor paling lama akhir bulan berikutnya sebelum SPT Masa PPN disampaikan. Mekanisme: PM dikreditkan terhadap PK pada Masa yang sama sepanjang memenuhi syarat formal & material.",
    },
  ],
  pbb: [
    {
      q: "Sebuah objek PBB sektor perkebunan memiliki NJOP bumi dan bangunan total Rp2.000.000.000. Dengan NJOPTKP Rp12.000.000, NJKP 40%, dan tarif 0,5%, hitunglah PBB terutang.",
      model:
        "NJOP − NJOPTKP = 2.000.000.000 − 12.000.000 = 1.988.000.000. NJKP = 40% × 1.988.000.000 = 795.200.000. PBB terutang = 0,5% × 795.200.000 = 3.976.000.",
    },
  ],
  etik: [
    {
      q: "Seorang konsultan pajak menerima klien yang ternyata merupakan pesaing langsung dari klien lama. Jelaskan bagaimana kode etik mengatur situasi benturan kepentingan ini dan langkah yang sebaiknya diambil.",
      model:
        "Konsultan harus mengidentifikasi benturan kepentingan, melakukan pengungkapan (disclosure) kepada kedua pihak, dan memperoleh persetujuan. Bila benturan tidak dapat diatasi/dikelola (mengancam objektivitas & kerahasiaan), konsultan wajib menolak atau menghentikan penugasan sesuai prinsip integritas, objektivitas, dan kerahasiaan.",
    },
  ],
};

// Instruksi/aturan pada layar pra-ujian (meniru suasana CAT + SEB)
export const INTEGRITY_PACT = [
  "Mengerjakan soal secara jujur, mandiri, dan tidak bekerja sama dengan pihak lain.",
  "Tidak mencari jawaban di internet maupun bertanya kepada orang lain selama ujian.",
  "Tidak mengambil gambar, menyalin, merekam, atau menyebarluaskan soal dan jawaban dalam bentuk apa pun.",
  "Menjaga kerahasiaan soal serta bersikap objektif dan bertanggung jawab atas hasil yang diperoleh.",
];

export const EXAM_PROHIBITIONS = [
  "Merokok/vape dan makan (kecuali snack serta air minum secukupnya).",
  "Mencari jawaban di internet atau bertanya kepada orang di sekitar.",
  "Membawa dan menggunakan catatan atau buku dalam bentuk apa pun; kertas buram juga tidak diperkenankan.",
  "Menggunakan perangkat komunikasi apa pun dan alat hitung/kalkulator fisik (disediakan tab Excel di aplikasi ujian).",
  "Mengambil gambar, menyalin, merekam, atau menyebarluaskan soal dan jawaban ujian.",
  "Meninggalkan area pengawasan kamera, termasuk keluar ruangan atau ke kamar kecil.",
  "Pelanggaran dicatat dalam berita acara dan peserta dapat dinyatakan gugur. Selalu ikuti panduan resmi terbaru dari penyelenggara.",
];

export const EXAM_TOKENS = ["1234", "USKP2026"];

// Susunan mata ujian per tingkat (A, B, C) — untuk landing page
export const LEVELS = [
  {
    id: "A",
    title: "Tingkat A",
    tagline: "Dasar Kompetensi Perpajakan",
    accent: "#4338CA",
    days: 3,
    subjects: [
      { name: "PPh OP & SPT PPh OP", durasi: "2 jam" },
      { name: "KUP, PPSP, dan Pengadilan Pajak", durasi: "1,5 jam" },
      { name: "PPh Pot/Put", durasi: "2 jam" },
      { name: "PPN & SPT PPN", durasi: "1,5 jam" },
      { name: "PBB-P5L & Bea Meterai", durasi: "1,5 jam" },
    ],
  },
  {
    id: "B",
    title: "Tingkat B",
    tagline: "Kompetensi Menengah",
    accent: "#D97706",
    days: 3,
    subjects: [
      { name: "PPh OP & SPT PPh OP", durasi: "1,5 jam" },
      { name: "KUP, PPSP, dan Pengadilan Pajak", durasi: "1,5 jam" },
      { name: "PPh Pot/Put", durasi: "1,5 jam" },
      { name: "PPN & SPT PPN", durasi: "1,5 jam" },
      { name: "Bea Meterai", durasi: "1,5 jam" },
      { name: "PBB-P5L", durasi: "1,5 jam" },
      { name: "Akuntansi Perpajakan", durasi: "1,5 jam" },
      { name: "PPh Badan & SPT PPh Badan", durasi: "1,5 jam" },
    ],
  },
  {
    id: "C",
    title: "Tingkat C",
    tagline: "Kompetensi Lanjutan",
    accent: "#15803D",
    days: 3,
    subjects: [
      { name: "PPh Orang Pribadi dan SPT PPh Orang Pribadi (Aspek Transaksi Internasional dan P3B)", durasi: "1,5 jam" },
      { name: "KUP, PPSP, dan Pengadilan Pajak (Aspek Transaksi Internasional dan P3B)", durasi: "1,5 jam" },
      { name: "PPh Pot/Put", durasi: "1,5 jam" },
      { name: "PPN & SPT PPN", durasi: "1,5 jam" },
      { name: "Bea Meterai", durasi: "1,5 jam" },
      { name: "PBB-P5L", durasi: "1,5 jam" },
      { name: "Akuntansi Perpajakan", durasi: "1,5 jam" },
      { name: "PPh Badan & SPT PPh Badan (DN)", durasi: "1,5 jam" },
      { name: "PPh Badan (Transaksi Internasional)", durasi: "1,5 jam" },
      { name: "Pajak Internasional", durasi: "1,5 jam" },
    ],
  },
];

// Membuat daftar soal lengkap (mengulang contoh agar mencapai jumlah soal)
export function buildQuestions(subjectId, count) {
  const bank = MCQ_BANK[subjectId] || [];
  if (bank.length === 0) return [];
  const result = [];
  for (let i = 0; i < count; i++) {
    const base = bank[i % bank.length];
    result.push({ id: i + 1, ...base });
  }
  return result;
}
