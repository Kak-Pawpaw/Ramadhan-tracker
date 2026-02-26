// Nama key untuk LocalStorage
const STORAGE_KEY = 'ramadhanAppData';

// Struktur Data Default (Variabel yang sudah kita sepakati)
const defaultData = {
    dailyTracker: {}, 
    quranProgress: { targetJuz: 30, currentJuz: 0, currentSurah: "", currentAyah: 0 },
    gamification: { currentStreak: 0, longestStreak: 0, earnedBadges: [] },
    financeTracker: { budgetBukber: 0, expenses: [], totalSedekah: 0 },
    moodJournal: {}, 
    imsakiyahSettings: { cityId: "1628", cityName: "Surakarta" } // Default sementara
};

// Fungsi untuk mengambil data dari LocalStorage
function loadData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        // Jika belum ada, simpan data default
        saveData(defaultData);
        return defaultData;
    }
}

// Fungsi untuk menyimpan data ke LocalStorage
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Mengambil tanggal hari ini (Format YYYY-MM-DD)
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Menampilkan tanggal di Header
function displayHeaderDate() {
    const dateElement = document.getElementById('current-date-display');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('id-ID', options);
}

// --- INISIALISASI APLIKASI ---
let appData = loadData();
displayHeaderDate();

console.log("Data aplikasi berhasil dimuat:", appData);
// Selanjutnya: Kita akan buat fungsi untuk merender UI Daily Tracker di sini
// --- LOGIKA DAILY TRACKER & MOOD ---

const todayDate = getTodayDate(); // Ambil tanggal hari ini (contoh: "2026-02-26")

// 1. Siapkan struktur data untuk hari ini jika belum ada
if (!appData.dailyTracker[todayDate]) {
    appData.dailyTracker[todayDate] = {
        puasa: false,
        shalat: { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false },
        olahraga: { status: false, jenis: "", waktu: "" } // Tambahan baru
    };
} else if (!appData.dailyTracker[todayDate].olahraga) {
    // Ini agar data kemarin yang belum ada fitur olahraga tidak error
    appData.dailyTracker[todayDate].olahraga = { status: false, jenis: "", waktu: "" };
}
if (!appData.moodJournal[todayDate]) {
    appData.moodJournal[todayDate] = { mood: "", sahur: "", buka: "" };
}

// 2. Fungsi untuk menampilkan data hari ini ke dalam UI (HTML)
// 2. Fungsi untuk menampilkan data hari ini ke dalam UI (HTML)
function renderDailyTracker() {
    // PENTING: Variabel ini harus dideklarasikan paling atas!
    const todayTracker = appData.dailyTracker[todayDate];
    const todayMood = appData.moodJournal[todayDate];

    // --- Render Data Olahraga ---
    const olahragaData = todayTracker.olahraga || { status: false, jenis: "", waktu: "" };
    const detailBox = document.getElementById('olahraga-details');
    
    if (document.getElementById('check-olahraga')) {
        document.getElementById('check-olahraga').checked = olahragaData.status;
    }
    if (document.getElementById('input-jenis-olahraga')) {
        document.getElementById('input-jenis-olahraga').value = olahragaData.jenis;
    }
    if (document.getElementById('select-waktu-olahraga')) {
        document.getElementById('select-waktu-olahraga').value = olahragaData.waktu;
    }

    // Logika menyembunyikan/memunculkan kolom isian
    if (detailBox) {
        if (olahragaData.status) {
            detailBox.style.display = "flex";
        } else {
            detailBox.style.display = "none";
        }
    }

    // --- Render Ibadah & Mood ---
    document.getElementById('check-puasa').checked = todayTracker.puasa;

    const shalatList = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    shalatList.forEach(waktu => {
        if (document.getElementById(`check-${waktu}`)) {
            document.getElementById(`check-${waktu}`).checked = todayTracker.shalat[waktu];
        }
    });

    if (document.getElementById('input-sahur')) document.getElementById('input-sahur').value = todayMood.sahur;
    if (document.getElementById('input-buka')) document.getElementById('input-buka').value = todayMood.buka;

    document.querySelectorAll('.mood-btn').forEach(btn => {
        if (btn.dataset.mood === todayMood.mood) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 3. Pasang Event Listener untuk mendeteksi perubahan dan menyimpannya
function setupEventListeners() {
    // Listener Olahraga
    const checkOlahraga = document.getElementById('check-olahraga');
    if (checkOlahraga) {
        checkOlahraga.addEventListener('change', (e) => {
            if (!appData.dailyTracker[todayDate].olahraga) {
                appData.dailyTracker[todayDate].olahraga = { status: false, jenis: "", waktu: "" };
            }
            appData.dailyTracker[todayDate].olahraga.status = e.target.checked;
            saveData(appData);
            renderDailyTracker(); // Refresh untuk memunculkan/menyembunyikan detail
        });
    }

    if (document.getElementById('input-jenis-olahraga')) {
        document.getElementById('input-jenis-olahraga').addEventListener('input', (e) => {
            appData.dailyTracker[todayDate].olahraga.jenis = e.target.value;
            saveData(appData);
        });
    }

    if (document.getElementById('select-waktu-olahraga')) {
        document.getElementById('select-waktu-olahraga').addEventListener('change', (e) => {
            appData.dailyTracker[todayDate].olahraga.waktu = e.target.value;
            saveData(appData);
        });
    }

    // Listener untuk Puasa
    if (document.getElementById('check-puasa')) {
        document.getElementById('check-puasa').addEventListener('change', (e) => {
            appData.dailyTracker[todayDate].puasa = e.target.checked;
            saveData(appData);
            if (typeof renderQuranAndStreak === "function") renderQuranAndStreak(); // Update streak otomatis
        });
    }

    // Listener untuk Shalat
    const shalatList = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    shalatList.forEach(waktu => {
        if (document.getElementById(`check-${waktu}`)) {
            document.getElementById(`check-${waktu}`).addEventListener('change', (e) => {
                appData.dailyTracker[todayDate].shalat[waktu] = e.target.checked;
                saveData(appData);
            });
        }
    });

    // Listener untuk Input Teks (Sahur & Buka)
    if (document.getElementById('input-sahur')) {
        document.getElementById('input-sahur').addEventListener('input', (e) => {
            appData.moodJournal[todayDate].sahur = e.target.value;
            saveData(appData);
        });
    }
    if (document.getElementById('input-buka')) {
        document.getElementById('input-buka').addEventListener('input', (e) => {
            appData.moodJournal[todayDate].buka = e.target.value;
            saveData(appData);
        });
    }

    // Listener untuk Tombol Mood
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedMood = e.target.dataset.mood;
            appData.moodJournal[todayDate].mood = selectedMood;
            saveData(appData);
            renderDailyTracker(); // Refresh UI
        });
    });
}

// Jalankan fungsi
renderDailyTracker();
setupEventListeners();

// --- LOGIKA TAHAP 4: QURAN & STREAK ---

// Fungsi menghitung hari puasa berturut-turut (Streak)
function calculateStreak() {
    let streak = 0;
    let checkDate = new Date(); // Mulai cek dari hari ini
    
    // Cek puasa hari ini dulu
    const todayStr = checkDate.toISOString().split('T')[0];
    if (appData.dailyTracker[todayStr] && appData.dailyTracker[todayStr].puasa) {
        streak++;
    }

    // Mundur ke hari-hari sebelumnya secara berurutan
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
        const dateString = checkDate.toISOString().split('T')[0];
        // Jika di tanggal tersebut data puasa = true, tambah streak dan mundur 1 hari lagi
        if (appData.dailyTracker[dateString] && appData.dailyTracker[dateString].puasa) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // Kalau false atau tidak ada data, hitungan beruntun terputus
            break; 
        }
    }
    
    // Simpan streak tertinggi jika memecahkan rekor
    appData.gamification.currentStreak = streak;
    if (streak > appData.gamification.longestStreak) {
        appData.gamification.longestStreak = streak;
    }
    saveData(appData);
    
    return streak;
}

// Fungsi merender data Quran & Streak ke UI
function renderQuranAndStreak() {
    const qData = appData.quranProgress;
    
    // Tampilkan nilai input
    document.getElementById('input-juz').value = qData.currentJuz || "";
    document.getElementById('input-surah').value = qData.currentSurah || "";
    document.getElementById('input-ayah').value = qData.currentAyah || "";

    // Kalkulasi persentase Progress Bar (maksimal 100%)
    const target = qData.targetJuz || 30;
    let percent = (qData.currentJuz / target) * 100;
    if (percent > 100) percent = 100;

    // Update UI
    document.getElementById('quran-progress-bar').style.width = percent + '%';
    document.getElementById('juz-progress-text').innerText = qData.currentJuz;
    document.getElementById('streak-number').innerText = calculateStreak();
}

// Event Listener khusus fitur Tahap 4
function setupQuranListeners() {
    // Input Juz (Otomatis update progress bar saat diketik)
    document.getElementById('input-juz').addEventListener('input', (e) => {
        appData.quranProgress.currentJuz = parseInt(e.target.value) || 0;
        saveData(appData);
        renderQuranAndStreak(); 
    });

    // Input Surah
    document.getElementById('input-surah').addEventListener('input', (e) => {
        appData.quranProgress.currentSurah = e.target.value;
        saveData(appData);
    });

    // Input Ayat
    document.getElementById('input-ayah').addEventListener('input', (e) => {
        appData.quranProgress.currentAyah = parseInt(e.target.value) || 0;
        saveData(appData);
    });
    
    // Trik tambahan: Update angka streak secara real-time kalau checkbox Puasa diklik!
    document.getElementById('check-puasa').addEventListener('change', () => {
        renderQuranAndStreak(); 
    });
}

// Jalankan fungsi
renderQuranAndStreak();
setupQuranListeners();

// --- LOGIKA TAHAP 5: FINANCE TRACKER ---

// Fungsi bantuan untuk memformat angka jadi Rupiah (titik ribuan)
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID').format(angka);
}

// Fungsi utama untuk merender tampilan keuangan
function renderFinance() {
    const fData = appData.financeTracker;
    
    // Tampilkan nilai input budget & sedekah dari storage
    document.getElementById('input-budget').value = fData.budgetBukber || "";
    document.getElementById('input-sedekah').value = fData.totalSedekah || "";

    let totalExpense = 0;
    const expenseListEl = document.getElementById('expense-list');
    expenseListEl.innerHTML = ""; // Bersihkan isi list sebelum me-render ulang

    // Loop array pengeluaran dan buat elemen HTML-nya
    fData.expenses.forEach((item, index) => {
        totalExpense += parseInt(item.amount);

        const li = document.createElement('li');
        li.className = 'expense-item';
        li.innerHTML = `
            <div>
                <strong>${item.description}</strong><br>
                <small>${item.date}</small>
            </div>
            <div>
                Rp ${formatRupiah(item.amount)}
                <button class="delete-btn" onclick="deleteExpense(${index})">X</button>
            </div>
        `;
        expenseListEl.appendChild(li);
    });

    // Hitung sisa budget
    const remaining = (fData.budgetBukber || 0) - totalExpense;

    // Tampilkan teks ringkasan ke HTML
    document.getElementById('display-budget').innerText = formatRupiah(fData.budgetBukber || 0);
    document.getElementById('display-expense').innerText = formatRupiah(totalExpense);
    document.getElementById('display-remaining').innerText = formatRupiah(remaining);
}

// Fungsi untuk menambah pengeluaran baru ke dalam array
function addExpense() {
    const descInput = document.getElementById('expense-desc');
    const amountInput = document.getElementById('expense-amount');
    
    const desc = descInput.value.trim();
    const amount = parseInt(amountInput.value);

    // Validasi: Pastikan form tidak kosong dan nominalnya angka
    if (desc !== "" && !isNaN(amount) && amount > 0) {
        appData.financeTracker.expenses.push({
            date: getTodayDate(),
            description: desc,
            amount: amount
        });
        
        saveData(appData); // Simpan ke LocalStorage
        renderFinance();   // Update UI

        // Kosongkan form input setelah berhasil ditambah
        descInput.value = "";
        amountInput.value = "";
    } else {
        alert("Waduh, isi nama acara dan nominal yang benar ya!");
    }
}

// Fungsi untuk menghapus item (harus pakai window. agar bisa dipanggil dari atribut onclick di HTML)
window.deleteExpense = function(index) {
    appData.financeTracker.expenses.splice(index, 1); // Hapus 1 data dari array berdasarkan index
    saveData(appData);
    renderFinance();
};

// Pasang Event Listeners untuk input & tombol
function setupFinanceListeners() {
    // Listener saat angka budget diketik
    document.getElementById('input-budget').addEventListener('input', (e) => {
        appData.financeTracker.budgetBukber = parseInt(e.target.value) || 0;
        saveData(appData);
        renderFinance(); // Langsung update tulisan sisa budget
    });

    // Listener saat angka sedekah diketik
    document.getElementById('input-sedekah').addEventListener('input', (e) => {
        appData.financeTracker.totalSedekah = parseInt(e.target.value) || 0;
        saveData(appData);
    });

    // Listener klik tombol tambah
    document.getElementById('btn-add-expense').addEventListener('click', addExpense);
}

// Jalankan
renderFinance();
setupFinanceListeners();

// --- LOGIKA TAHAP 6: API IMSAKIYAH ---

// Fungsi untuk mengambil data jadwal shalat dari API MyQuran
async function fetchImsakiyah() {
    const cityId = appData.imsakiyahSettings.cityId; // Mengambil ID dari LocalStorage (Default: 1628)
    
    // API MyQuran butuh format YYYY/MM/DD
    const dateObj = new Date();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    const apiUrl = `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${year}/${month}/${day}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Gagal mengambil data dari API');
        
        const data = await response.json();
        
        if (data.status) {
            const jadwal = data.data.jadwal;
            
            // Update UI dengan data dari API
            document.getElementById('city-name-display').innerText = data.data.lokasi;
            document.getElementById('hijri-date-display').innerText = jadwal.tanggal; // Menampilkan tanggal hijriah dari API
            
            document.getElementById('time-imsak').innerText = jadwal.imsak;
            document.getElementById('time-subuh').innerText = jadwal.subuh;
            document.getElementById('time-dzuhur').innerText = jadwal.dzuhur;
            document.getElementById('time-ashar').innerText = jadwal.ashar;
            document.getElementById('time-maghrib').innerText = jadwal.maghrib;
            document.getElementById('time-isya').innerText = jadwal.isya;
        }
    } catch (error) {
        console.error("Error fetching Imsakiyah:", error);
        document.getElementById('city-name-display').innerText = "Gagal memuat jadwal";
    }
}

// Jalankan fungsi saat aplikasi dimuat
fetchImsakiyah();

// --- LOGIKA FITUR TAMBAHAN (PENCARIAN, ZAKAT, BACKUP) ---

// 1. Fitur Pencarian Kota Imsakiyah
document.getElementById('btn-search-city').addEventListener('click', async () => {
    const keyword = document.getElementById('input-city').value.trim();
    if (!keyword) return;

    const resultsList = document.getElementById('city-search-results');
    resultsList.innerHTML = "<li>Mencari...</li>";
    resultsList.style.display = "block"; // Munculkan dropdown

    try {
        // Ambil data dari API MyQuran berdasarkan keyword
        const response = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${keyword}`);
        const data = await response.json();

        resultsList.innerHTML = ""; // Bersihkan teks "Mencari..."

        if (data.status && data.data.length > 0) {
            data.data.forEach(kota => {
                const li = document.createElement('li');
                li.textContent = kota.lokasi;
                
                // Jika hasil kota diklik
                li.addEventListener('click', () => {
                    appData.imsakiyahSettings.cityId = kota.id; // Simpan ID kota baru
                    appData.imsakiyahSettings.cityName = kota.lokasi;
                    saveData(appData);
                    
                    resultsList.style.display = "none"; // Tutup dropdown
                    document.getElementById('input-city').value = ""; // Kosongkan input
                    fetchImsakiyah(); // Tarik ulang jadwal shalat!
                });
                
                resultsList.appendChild(li);
            });
        } else {
            resultsList.innerHTML = "<li>Kota tidak ditemukan</li>";
        }
    } catch (error) {
        resultsList.innerHTML = "<li>Gagal mencari kota</li>";
    }
});

// 2. Fitur Kalkulator Zakat Fitrah
document.getElementById('btn-hitung-zakat').addEventListener('click', () => {
    const jumlahOrang = parseInt(document.getElementById('zakat-orang').value) || 0;
    const hargaBeras = parseInt(document.getElementById('zakat-harga').value) || 0;
    
    // Rumus: (Jumlah Orang * 2.5 kg) * Harga Beras per kg
    const totalZakat = (jumlahOrang * 2.5) * hargaBeras; 
    document.getElementById('zakat-total').innerText = formatRupiah(totalZakat);
});

// 3. Fitur Export (Download Data Backup)
document.getElementById('btn-export').addEventListener('click', () => {
    // Ubah data LocalStorage menjadi format teks JSON
    const dataStr = JSON.stringify(appData, null, 2);
    // Jadikan file
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Buat link download palsu lalu klik otomatis
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup-RamadhanTracker-${getTodayDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// 4. Fitur Import (Restore Data Backup)
document.getElementById('input-import').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validasi simpel untuk memastikan itu file dari aplikasi kita
            if (importedData && importedData.dailyTracker) {
                saveData(importedData); // Timpa LocalStorage dengan data baru
                alert("Data berhasil dipulihkan! Halaman akan dimuat ulang.");
                location.reload(); // Refresh halaman agar UI menyesuaikan dengan data baru
            } else {
                alert("Format file tidak valid atau rusak!");
            }
        } catch (error) {
            alert("Gagal membaca file JSON!");
        }
    };
    reader.readAsText(file); // Mulai baca file
});
// --- LOGIKA ACCORDION (BUKA-TUTUP BOX) ---

// --- LOGIKA ACCORDION (BUKA-TUTUP BOX) ---

function setupAccordions() {
    const headers = document.querySelectorAll('.collapsible-header');
    
    headers.forEach(header => {
        // Ambil elemen konten tepat di bawah header
        const content = header.nextElementSibling;
        
        // 1. KUNCI UTAMA: Paksa konten tertutup (hidden) saat web pertama kali dibuka
        content.style.display = "none";
        
        // 2. Pasang logika klik untuk buka-tutup
        header.addEventListener('click', () => {
            // Putar ikon panah
            header.classList.toggle('active');
            
            // Tampilkan atau sembunyikan konten
            if (content.style.display === "none") {
                content.style.display = "block";
            } else {
                content.style.display = "none";
            }
        });
    });
}

// Panggil fungsinya agar berjalan
setupAccordions();