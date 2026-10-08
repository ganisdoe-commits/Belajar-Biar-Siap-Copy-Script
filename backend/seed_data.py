"""
Data contoh (seed) untuk Belajar Biar Pintar.
Akan diganti dengan soal asli melalui Panel Admin / impor.
"""

SUBJECTS = [
    {"code": "A1", "name": "PPh OP & SPT PPh OP", "short": "PPh OP", "level": "A",
     "durationMin": 120, "color": "#4338CA", "order": 1,
     "desc": "Pajak Penghasilan Orang Pribadi dan Surat Pemberitahuan Tahunan PPh OP."},
    {"code": "A1", "name": "KUP, PPSP, dan PP", "short": "KUP", "level": "A",
     "durationMin": 90, "color": "#0891b2", "order": 2,
     "desc": "Ketentuan Umum & Tata Cara Perpajakan, Penagihan Pajak dengan Surat Paksa, Pengadilan Pajak."},
    {"code": "A2", "name": "PPh Pot/Put", "short": "Pot/Put", "level": "A",
     "durationMin": 120, "color": "#7c3aed", "order": 3,
     "desc": "Pajak Penghasilan Pemotongan dan Pemungutan (PPh 21, 22, 23, 26, 4(2))."},
    {"code": "A2", "name": "PPN & SPT PPN", "short": "PPN", "level": "A",
     "durationMin": 90, "color": "#059669", "order": 4,
     "desc": "Pajak Pertambahan Nilai dan Surat Pemberitahuan Masa PPN."},
    {"code": "A3", "name": "PBB-P5L & Bea Meterai", "short": "PBB", "level": "A",
     "durationMin": 90, "color": "#d97706", "order": 5,
     "desc": "PBB Perkebunan, Perhutanan, Pertambangan, Perikanan, sektor Lainnya, serta Bea Meterai."},
    {"code": "A3", "name": "Kode Etik Profesi", "short": "Etik", "level": "A",
     "durationMin": 60, "color": "#dc2626", "order": 6,
     "desc": "Kode Etik dan Standar Profesi Konsultan Pajak Indonesia."},
]


def _opt(a, b, c, d):
    return [
        {"key": "A", "text": a},
        {"key": "B", "text": b},
        {"key": "C", "text": c},
        {"key": "D", "text": d},
    ]


# MCQ per nama subject
MCQ = {
    "PPh OP & SPT PPh OP": [
        {"question": "PTKP untuk Wajib Pajak orang pribadi yang belum menikah (TK/0) per tahun adalah sebesar...",
         "options": _opt("Rp36.000.000", "Rp54.000.000", "Rp58.500.000", "Rp67.500.000"), "answer": "B",
         "pembahasan": "Berdasarkan PMK-101/PMK.010/2016, PTKP untuk WP OP sendiri (TK/0) adalah Rp54.000.000 per tahun."},
        {"question": "Tarif PPh Pasal 17 untuk lapisan penghasilan kena pajak sampai dengan Rp60.000.000 adalah...",
         "options": _opt("5%", "10%", "15%", "25%"), "answer": "A",
         "pembahasan": "Sesuai UU HPP, lapisan pertama PKP s.d. Rp60.000.000 dikenai tarif 5%."},
        {"question": "Penghitungan penghasilan neto dengan NPPN diperbolehkan apabila peredaran bruto setahun kurang dari...",
         "options": _opt("Rp2.400.000.000", "Rp4.800.000.000", "Rp600.000.000", "Rp50.000.000.000"), "answer": "B",
         "pembahasan": "WP OP boleh menggunakan NPPN jika peredaran bruto kurang dari Rp4.800.000.000 setahun (Pasal 14 UU PPh)."},
        {"question": "Batas waktu penyampaian SPT Tahunan PPh Orang Pribadi paling lambat adalah...",
         "options": _opt("akhir bulan ke-3 setelah tahun pajak", "akhir bulan ke-4 setelah tahun pajak", "20 hari setelah masa pajak", "akhir tahun pajak"), "answer": "A",
         "pembahasan": "SPT Tahunan PPh OP paling lambat 3 bulan setelah akhir tahun pajak (31 Maret)."},
        {"question": "Penghasilan berupa bunga deposito dan tabungan dikenakan PPh Pasal 4 ayat (2) dengan tarif...",
         "options": _opt("10%", "15%", "20%", "25%"), "answer": "C",
         "pembahasan": "Bunga deposito/tabungan dikenai PPh final 20% dari jumlah bruto (PP 131/2000 jo. PP 123/2015)."},
    ],
    "KUP, PPSP, dan PP": [
        {"question": "Nomor Pokok Wajib Pajak (NPWP) berfungsi sebagai...",
         "options": _opt("bukti pembayaran pajak", "sarana administrasi perpajakan dan identitas WP", "pengganti KTP", "izin usaha"), "answer": "B",
         "pembahasan": "NPWP adalah sarana administrasi perpajakan sekaligus identitas WP (Pasal 1 UU KUP)."},
        {"question": "Jangka waktu penyimpanan buku, catatan, dan dokumen dasar pembukuan adalah...",
         "options": _opt("5 tahun", "10 tahun", "3 tahun", "selama-lamanya"), "answer": "B",
         "pembahasan": "Dokumen wajib disimpan selama 10 tahun di Indonesia (Pasal 28 ayat (11) UU KUP)."},
        {"question": "SKPKB dapat diterbitkan dalam jangka waktu...",
         "options": _opt("5 tahun setelah saat terutangnya pajak", "10 tahun", "2 tahun", "tidak terbatas"), "answer": "A",
         "pembahasan": "SKPKB diterbitkan dalam jangka waktu 5 tahun setelah saat terutangnya pajak (Pasal 13 UU KUP)."},
        {"question": "Keberatan atas suatu SKP harus diajukan dalam jangka waktu...",
         "options": _opt("3 bulan sejak tanggal SKP dikirim", "1 bulan", "6 bulan", "12 bulan"), "answer": "A",
         "pembahasan": "Keberatan diajukan paling lama 3 bulan sejak tanggal dikirim SKP (Pasal 25 UU KUP)."},
        {"question": "Surat Paksa dalam penagihan pajak mempunyai kekuatan eksekutorial setara dengan...",
         "options": _opt("putusan pengadilan yang berkekuatan hukum tetap", "surat teguran", "surat himbauan", "nota dinas"), "answer": "A",
         "pembahasan": "Surat Paksa berkekuatan eksekutorial setara putusan pengadilan yang inkracht (UU PPSP)."},
    ],
    "PPh Pot/Put": [
        {"question": "Tarif PPh Pasal 23 atas sewa harta (selain tanah/bangunan) adalah...",
         "options": _opt("2% dari jumlah bruto", "15% dari jumlah bruto", "10% dari jumlah bruto", "4% dari jumlah bruto"), "answer": "A",
         "pembahasan": "PPh 23 atas sewa harta (bukan tanah/bangunan) adalah 2% dari jumlah bruto."},
        {"question": "PPh Pasal 21 bagi penerima penghasilan tanpa NPWP dikenakan tarif lebih tinggi sebesar...",
         "options": _opt("10%", "20% lebih tinggi", "15%", "50% lebih tinggi"), "answer": "B",
         "pembahasan": "Bagi yang tidak ber-NPWP, tarif PPh 21 lebih tinggi 20% (Pasal 21 ayat (5a))."},
        {"question": "PPh Pasal 22 atas impor oleh importir ber-API umumnya sebesar...",
         "options": _opt("2,5% dari nilai impor", "7,5% dari nilai impor", "0,5%", "10%"), "answer": "A",
         "pembahasan": "Importir ber-API umumnya dikenai PPh 22 sebesar 2,5% dari nilai impor."},
        {"question": "Tarif PPh Pasal 26 atas bunga/royalti kepada WP luar negeri (tanpa P3B) adalah...",
         "options": _opt("15%", "20%", "25%", "10%"), "answer": "B",
         "pembahasan": "PPh 26 umumnya 20% dari jumlah bruto, kecuali diatur lain dalam P3B."},
        {"question": "Jasa teknik, jasa manajemen, dan jasa konsultan dikenakan PPh Pasal 23 dengan tarif...",
         "options": _opt("2% dari jumlah bruto", "15% dari jumlah bruto", "4% dari jumlah bruto", "10%"), "answer": "A",
         "pembahasan": "Imbalan jasa teknik/manajemen/konsultan dikenai PPh 23 sebesar 2% dari jumlah bruto."},
    ],
    "PPN & SPT PPN": [
        {"question": "Tarif Pajak Pertambahan Nilai (PPN) umum sesuai UU HPP adalah...",
         "options": _opt("10%", "11%", "12%", "0%"), "answer": "B",
         "pembahasan": "Sejak 1 April 2022, tarif PPN umum menjadi 11% (UU HPP)."},
        {"question": "Dasar Pengenaan Pajak (DPP) untuk penyerahan BKP pada umumnya adalah...",
         "options": _opt("Harga Jual", "Nilai Impor", "Nilai Ekspor", "Nilai lain"), "answer": "A",
         "pembahasan": "DPP untuk penyerahan BKP pada umumnya menggunakan Harga Jual."},
        {"question": "Ekspor Barang Kena Pajak Berwujud dikenakan PPN dengan tarif...",
         "options": _opt("11%", "0%", "dibebaskan", "tidak dikenakan"), "answer": "B",
         "pembahasan": "Ekspor BKP Berwujud dikenai tarif 0% sehingga Pajak Masukan tetap dapat dikreditkan."},
        {"question": "Pengusaha wajib dikukuhkan sebagai PKP bila peredaran bruto setahun melebihi...",
         "options": _opt("Rp4.800.000.000", "Rp600.000.000", "Rp2.400.000.000", "Rp50.000.000.000"), "answer": "A",
         "pembahasan": "Batasan Pengusaha Kecil Rp4,8 miliar; di atasnya wajib dikukuhkan sebagai PKP."},
        {"question": "Faktur Pajak dibuat pada saat...",
         "options": _opt("penyerahan BKP/JKP atau penerimaan pembayaran mendahului penyerahan", "akhir tahun", "saat pelaporan SPT", "saat ditagih DJP"), "answer": "A",
         "pembahasan": "Faktur Pajak dibuat saat penyerahan atau saat penerimaan pembayaran bila mendahului penyerahan."},
    ],
    "PBB-P5L & Bea Meterai": [
        {"question": "Objek PBB sektor P5L meliputi antara lain, kecuali...",
         "options": _opt("Perkebunan", "Perhutanan", "Pertambangan", "Perdagangan eceran"), "answer": "D",
         "pembahasan": "P5L = Perkebunan, Perhutanan, Pertambangan, Perikanan, dan Lainnya. Perdagangan eceran bukan objek PBB P5L."},
        {"question": "Dasar pengenaan PBB adalah...",
         "options": _opt("Nilai Jual Objek Pajak (NJOP)", "Harga Pasar", "Harga Perolehan", "NJKP saja"), "answer": "A",
         "pembahasan": "Dasar pengenaan PBB adalah NJOP (Pasal 6 UU PBB)."},
        {"question": "Bea Meterai untuk dokumen yang berlaku saat ini sebesar...",
         "options": _opt("Rp3.000", "Rp6.000", "Rp10.000", "Rp9.000"), "answer": "C",
         "pembahasan": "Berdasarkan UU No. 10 Tahun 2020, tarif Bea Meterai tunggal menjadi Rp10.000."},
        {"question": "Saat terutang PBB ditentukan menurut keadaan objek pajak pada tanggal...",
         "options": _opt("1 Januari", "31 Desember", "1 Juli", "akhir tahun pajak"), "answer": "A",
         "pembahasan": "Saat terutang PBB ditentukan menurut keadaan objek pada tanggal 1 Januari."},
        {"question": "NJOP Tidak Kena Pajak (NJOPTKP) ditetapkan paling rendah sebesar...",
         "options": _opt("Rp10.000.000", "Rp12.000.000", "Rp8.000.000", "Rp15.000.000"), "answer": "B",
         "pembahasan": "NJOPTKP ditetapkan paling rendah Rp12.000.000 untuk setiap Wajib Pajak."},
    ],
    "Kode Etik Profesi": [
        {"question": "Seorang konsultan pajak dalam menjalankan profesinya wajib menjunjung tinggi prinsip...",
         "options": _opt("integritas dan profesionalisme", "mengutamakan keuntungan pribadi", "kerahasiaan tanpa batas hukum", "menghindari pajak klien"), "answer": "A",
         "pembahasan": "Prinsip dasar kode etik meliputi integritas, objektivitas, kompetensi, dan profesionalisme."},
        {"question": "Konsultan pajak dilarang memberikan jasa apabila...",
         "options": _opt("terdapat benturan kepentingan yang tidak dapat diatasi", "klien dari luar kota", "honor terlalu kecil", "klien baru pertama kali"), "answer": "A",
         "pembahasan": "Benturan kepentingan yang tidak dapat diatasi menjadi alasan konsultan tidak memberikan jasa."},
        {"question": "Terhadap kerahasiaan informasi klien, konsultan pajak wajib...",
         "options": _opt("menjaga kerahasiaan kecuali diwajibkan oleh ketentuan hukum", "membuka data kepada siapa pun", "menjualnya bila perlu", "mengabaikannya"), "answer": "A",
         "pembahasan": "Prinsip kerahasiaan: menjaga informasi klien kecuali ada kewajiban hukum untuk mengungkapkan."},
        {"question": "Izin praktik konsultan pajak diterbitkan oleh...",
         "options": _opt("Sekretariat Jenderal Kementerian Keuangan", "IKPI", "DJP", "Pengadilan Pajak"), "answer": "A",
         "pembahasan": "Izin praktik konsultan pajak diterbitkan oleh Kementerian Keuangan (Sekretariat Jenderal)."},
        {"question": "Kompetensi konsultan pajak dijaga melalui...",
         "options": _opt("Pengembangan Profesional Berkelanjutan (PPL)", "mengurangi jam kerja", "menolak klien baru", "menghindari pelatihan"), "answer": "A",
         "pembahasan": "Kompetensi dijaga melalui PPL (Continuing Professional Development) secara berkelanjutan."},
    ],
}

# Esai per nama subject
ESSAY = {
    "PPh OP & SPT PPh OP": [
        {"question": "Tuan Budi (K/2) memperoleh penghasilan neto setahun Rp350.000.000. Hitunglah PTKP dan PPh terutang menggunakan tarif Pasal 17 UU HPP. Jelaskan langkahnya.",
         "model_answer": "PTKP K/2 = 54.000.000 + 4.500.000 + 2×4.500.000 = 67.500.000. PKP = 350.000.000 − 67.500.000 = 282.500.000. PPh: 5%×60.000.000 = 3.000.000; 15%×190.000.000 = 28.500.000; 25%×32.500.000 = 8.125.000. Total PPh = 39.625.000."},
    ],
    "KUP, PPSP, dan PP": [
        {"question": "Jelaskan upaya hukum Wajib Pajak atas SKPKB, mulai keberatan hingga peninjauan kembali, beserta jangka waktunya.",
         "model_answer": "1) Keberatan ke DJP dalam 3 bulan sejak SKP dikirim; diputus dalam 12 bulan. 2) Banding ke Pengadilan Pajak dalam 3 bulan sejak keputusan keberatan. 3) Peninjauan Kembali ke Mahkamah Agung dalam 3 bulan atas alasan terbatas."},
    ],
    "PPh Pot/Put": [
        {"question": "PT ABC membayar jasa konsultan kepada CV XYZ (ber-NPWP) Rp100.000.000 (belum termasuk PPN). Hitung PPh Pasal 23 dan jelaskan kewajiban pemotong.",
         "model_answer": "PPh 23 = 2% × 100.000.000 = 2.000.000. PT ABC wajib memotong saat terutang/dibayar, menyetor paling lambat tgl 10 bulan berikutnya, membuat bukti potong, dan melaporkan SPT Masa PPh 23 paling lambat tgl 20 bulan berikutnya."},
    ],
    "PPN & SPT PPN": [
        {"question": "PKP 'A' memiliki Pajak Keluaran Rp55.000.000 dan Pajak Masukan dapat dikreditkan Rp40.000.000. Hitung PPN kurang/lebih bayar dan jelaskan mekanismenya.",
         "model_answer": "PPN kurang bayar = 55.000.000 − 40.000.000 = 15.000.000. Disetor paling lama akhir bulan berikutnya sebelum SPT Masa PPN disampaikan. PM dikreditkan terhadap PK pada Masa yang sama sepanjang memenuhi syarat formal & material."},
    ],
    "PBB-P5L & Bea Meterai": [
        {"question": "Objek PBB perkebunan dengan NJOP total Rp2.000.000.000, NJOPTKP Rp12.000.000, NJKP 40%, tarif 0,5%. Hitung PBB terutang.",
         "model_answer": "NJOP − NJOPTKP = 1.988.000.000. NJKP = 40% × 1.988.000.000 = 795.200.000. PBB = 0,5% × 795.200.000 = 3.976.000."},
    ],
    "Kode Etik Profesi": [
        {"question": "Konsultan pajak menerima klien yang ternyata pesaing langsung klien lama. Jelaskan pengaturan kode etik atas benturan kepentingan ini dan langkah yang sebaiknya diambil.",
         "model_answer": "Identifikasi benturan kepentingan, lakukan pengungkapan kepada kedua pihak, dan peroleh persetujuan. Bila benturan tidak dapat dikelola (mengancam objektivitas & kerahasiaan), konsultan wajib menolak/menghentikan penugasan sesuai prinsip integritas, objektivitas, dan kerahasiaan."},
    ],
}
