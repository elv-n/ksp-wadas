/**
 * ============================================================
 * KSP Digital - Application Controller
 * ============================================================
 * Client-side UI logic: tab management, form handling,
 * drag-and-drop, dynamic rubric rendering, and dashboard.
 * All server calls go through the API layer (js/api.js).
 * ============================================================
 */

// ─── Application State ──────────────────────────────────────
let allSubmissions = [];
let teacherList = [];
let selectedFiles = { ATP: null, MA: null };
let selectedFileNames = { ATP: null, MA: null };
let isAsessorLoggedIn = false;
let activeSubTab = "MA";
let currentGradingPoints = {};

// Criteria configuration mappings
const criteriaTemplates = {
  MA: [
    { type: "header", label: "A. INFORMASI UMUM" },
    { key: "ma_1", label: "Memuat identitas penulis Modul Ajar" },
    { key: "ma_2", label: "Memuat kode Modul Ajar/RP" },
    { key: "ma_3", label: "Memuat identifikasi peserta didik" },
    { key: "ma_4", label: "Memuat materi pelajaran" },
    { key: "ma_5", label: "Memuat Dimensi Profil Lulusan" },
    { key: "ma_6", label: "Memauat Capaian Pembelajaran" },
    { key: "ma_7", label: "Topik pembelajaran" },
    { type: "header", label: "B. KOMPONEN INTI" },
    { type: "subheader", label: "Tujuan Pembelajaran" },
    { key: "ma_8", label: "Tujuan pembelajaran pada pengalaman pembelajaran Memahami" },
    { key: "ma_9", label: "Tujuan pembelajaran pada pengalaman pembelajaran Mengaplikasi" },
    { key: "ma_10", label: "Tujuan pembelajaran pada pengalaman pembelajaran Merefleksi" },
    { type: "subheader", label: "Praktik Pedagogis" },
    { key: "ma_11", label: "Memuat Model pembelajaran dan metode yang digunakan" },
    { type: "subheader", label: "Mitra Pembelajaran" },
    { key: "ma_12", label: "Mitra yang dilibatkan di dalam proses pembelajaran" },
    { type: "subheader", label: "Lingkungan Pembelajaran" },
    { key: "ma_13", label: "Ruang fisik yang digunakan dalam proses pembelajaran" },
    { key: "ma_14", label: "Ruang virtual yang digunakan dalam proses pembelajaran" },
    { key: "ma_15", label: "Budaya belajar yang digunakan dalam proses pembelajaran" },
    { type: "subheader", label: "Pemanfaatan Digital" },
    { key: "ma_16", label: "Pemanfaatan digital untuk Perencanaan Pembelajaran" },
    { key: "ma_17", label: "Pemanfaatan digital untuk Pelaksanaan Pembelajaran" },
    { key: "ma_18", label: "Pemanfaatan digital untuk Asesmen" },
    { type: "subheader", label: "Langkah-Langkah Pengalaman Pembelajaran: Pendahuluan" },
    { key: "ma_19", label: "Memuat Prinsip Pembelajaran (berkesadaran dan/atau bermakna dan/atau menggembirakan)" },
    { key: "ma_20", label: "Guru membuka pembelajaran" },
    { key: "ma_21", label: "Memuat komitmen bersama" },
    { key: "ma_22", label: "Memaparkan tujuan pembelajaran" },
    { key: "ma_23", label: "Pengenalan materi secara singkat melalui peragaan/vidio dll" },
    { key: "ma_24", label: "Memuat pertanyaan pemantik" },
    { key: "ma_25", label: "Peserta didik melakukan literasi melalui website atau yang lain" },
    { key: "ma_26", label: "Memuat tanya jawab untuk mengkontruksi pengetahuan awal murid" },
    { key: "ma_27", label: "Kegiatan Inti (memuat berkesadaran dan/atau bermakna dan/atau menggembirakan)" },
    { type: "subheader", label: "Memahami" },
    { key: "ma_28", label: "Murid melakukan eksplorasi sumber informasi dan berdiskusi" },
    { key: "ma_29", label: "Murid melakukan analisis materi" },
    { key: "ma_30", label: "Murid membuat peta konsep materi" },
    { type: "subheader", label: "Mengaplikasi" },
    { key: "ma_31", label: "Murid menyempurnakan peta konsep yang telah dibuat berdasarkan masukan dari guru/narasumber" },
    { key: "ma_32", label: "Memuat sintak-sintak model pembelajaran yang digunakan" },
    { type: "subheader", label: "Merefleksi" },
    { key: "ma_33", label: "Memuat umpan balik dari sesama teman, guru/narasumber" },
    { key: "ma_34", label: "Murid diberi kesempatan untuk membuat jurnal refleksi" },
    { key: "ma_35", label: "Murid diberi kesempatan untuk melakukan evaluasi diri terhadap capaian tujuan pembelajaran" },
    { key: "ma_36", label: "Murid bisa mengambil manfaat dari pembelajaran yang telah dilaksanakan" },
    { type: "subheader", label: "Penutup" },
    { key: "ma_37", label: "Guru dan murid menyimpulkan pembelajaran" },
    { key: "ma_38", label: "Guru mengajak murid merencanakan pembelajaran selanjutnya" },
    { key: "ma_39", label: "Memuat apresiasi terhadap pencapaian belajar murid" },
    { type: "subheader", label: "Asesmen & Pengesahan" },
    { key: "ma_40", label: "Memuat asesmen awal pembelajaran" },
    { key: "ma_41", label: "Memuat asesmen proses pembelajaran" },
    { key: "ma_42", label: "Memuat asesmen akhir pembelajaran" },
    { key: "ma_43", label: "Memuat pedoman dan kriteria penilaian" },
    { key: "ma_44", label: "Memuat nama dan tanda tangan penyusun modul" },
    { key: "ma_45", label: "Memuat nama dan tanda tangan kepala sekolah dilengkapi cap sekolah" },
  ],
  ATP: [
    { type: "header", label: "A. BAGIAN AWAL" },
    {
      key: "identitas",
      label: "IDENTITAS: Memuat identitas meliputi nama sekolah, nama guru, nama mata pelajaran, fase , kelas, program keahlian, konsentrasi keahlian, tahun ajaran",
    },
    {
      key: "infografis",
      label: "Alur tujuan pembelajaran dalam bentuk infografis",
    },
    { type: "header", label: "B. BAGIAN ISI / KOMPONEN" },
    {
      key: "elemen",
      label: "Elemen: Memuat elemen yang terdapat pada Capaian Pembelajaran",
    },
    {
      key: "cp_elemen",
      label: "CP elemen: Memuat Capaian pembelajaran per elemen sesuai pada elemen yang ada pada kolom sebelumnya",
    },
    {
      key: "tujuan_pembelajaran",
      label: "Tujuan Pembelajaran: Merupakan tujuan yang lebih umum bukan tujuan pembelajaran harian (goals, bukan objectives)",
    },
    {
      key: "alur_tujuan",
      label: "ALUR TUJUAN PEMBELAJARAN: Menggambarkan urutan pegembangan kompetensi yang harus dikuasai peserta didik, tersusun secara berkesinambungan dan urut secara berjenjang dengan arah yang jelas. (dilihat hasil diagram ATP)",
    },
  ],
};

// ─── Initialization ─────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  // Show mock badge if running locally
  if (isRunningLocally()) {
    document.getElementById("mockNotification").style.display = "block";
  }

  setupDragAndDrop();
  
  // Inisialisasi Select2
  if (window.jQuery) {
    $('#namaGuru').select2();
    $('#mapel').select2();
    $('#kelas').select2();
    
    // Bind event jquery select2 ke handler vanilla
    $('#namaGuru').on('change', function() {
      handleTeacherSelectChange();
    });
  }

  loadTeachersData();
  loadDashboardData();

  // Restore login session if active
  if (sessionStorage.getItem("isAsessorLoggedIn") === "true") {
    doLoginSuccess();
  }
});

// ─── Tab Navigation ─────────────────────────────────────────

function switchTab(viewName) {
  if (viewName === "login" && isAsessorLoggedIn) {
    handleLogout();
    return;
  }

  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.classList.remove("active");
    const attr = tab.getAttribute("onclick") || "";
    if (attr.includes(`'${viewName}'`)) {
      tab.classList.add("active");
    }
  });

  const panels = document.querySelectorAll(".view-panel");
  panels.forEach((panel) => panel.classList.remove("active"));

  const viewMap = {
    upload: "viewUpload",
    penilaian: "viewPenilaian",
    login: "viewLogin",
    grade: "viewGradeForm",
    laporan: "viewLaporan",
  };

  const targetId = viewMap[viewName];
  if (targetId) {
    document.getElementById(targetId).classList.add("active");
  }

  const container = document.querySelector(".container");
  if (container) {
    if (viewName === "grade") {
      container.classList.add("full-width-mode");
    } else {
      container.classList.remove("full-width-mode");
    }
  }

  if (viewName === "penilaian" || viewName === "laporan") {
    loadDashboardData();
  }
}

function switchSubTab(type) {
  activeSubTab = type;
  document.getElementById("subTabMA").classList.toggle("active", type === "MA");
  document.getElementById("subTabATP").classList.toggle("active", type === "ATP");
  applyFilters();
}

// ─── Teacher Data ───────────────────────────────────────────

async function loadTeachersData() {
  try {
    const data = await API.getTeachers();
    teacherList = data;
    populateTeachersDropdown(data);
  } catch (err) {
    showToast("Gagal memuat daftar guru: " + err.message, "error");
  }
}

function populateTeachersDropdown(list) {
  const select = document.getElementById("namaGuru");
  select.innerHTML = '<option value="" disabled selected>-- Pilih Nama Guru --</option>';
  list.forEach((t) => {
    const option = document.createElement("option");
    option.value = t.nama;
    option.innerText = t.nama;
    select.appendChild(option);
  });
  
  if (window.jQuery) {
    $('#namaGuru').trigger('change.select2');
  }
}

function handleTeacherSelectChange() {
  const selectedName = document.getElementById("namaGuru").value;
  const teacher = teacherList.find((t) => t.nama === selectedName);
  document.getElementById("statusKepegawaian").value = teacher ? teacher.status : "";
  document.getElementById("nip").value = teacher ? teacher.nip : "";
  
  const mapelSelect = document.getElementById("mapel");
  mapelSelect.innerHTML = '<option value="" disabled selected>-- Pilih Mata Pelajaran --</option>';
  
  const kelasSelect = document.getElementById("kelas");
  kelasSelect.innerHTML = '<option value="" disabled selected>-- Pilih Kelas --</option>';
  
  if (teacher) {
    if (teacher.mapel) {
      const mapels = teacher.mapel.split(",").map(m => m.trim()).filter(m => m);
      mapels.forEach(m => {
        const option = document.createElement("option");
        option.value = m;
        option.innerText = m;
        mapelSelect.appendChild(option);
      });
    }
    if (teacher.kelas) {
      const kelasList = teacher.kelas.split(",").map(k => k.trim()).filter(k => k);
      kelasList.forEach(k => {
        const option = document.createElement("option");
        option.value = k;
        option.innerText = k;
        kelasSelect.appendChild(option);
      });
    }
  }
  
  if (window.jQuery) {
    $('#mapel').trigger('change.select2');
    $('#kelas').trigger('change.select2');
  }
}

// ─── File Upload (Drag & Drop + Manual) ─────────────────────

function setupDragAndDrop() {
  ["ATP", "MA"].forEach(type => {
    const dropZone = document.getElementById(`dropZone${type}`);
    if (!dropZone) return;

    ["dragenter", "dragover"].forEach((evt) => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("dragover");
      }, false);
    });
    ["dragleave", "drop"].forEach((evt) => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("dragover");
      }, false);
    });
    dropZone.addEventListener("drop", (e) => {
      if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0], type);
    }, false);
  });
}

function handleFileSelect(e, type) {
  if (e.target.files.length > 0) processFile(e.target.files[0], type);
}

function processFile(file, type) {
  if (file.type !== "application/pdf") {
    showToast("Hanya dokumen dengan format PDF yang diperbolehkan!", "error");
    return removeSelectedFile(type);
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast("Ukuran file tidak boleh melebihi 10MB!", "error");
    return removeSelectedFile(type);
  }

  selectedFileNames[type] = file.name;
  document.getElementById(`previewName${type}`).innerText = file.name;
  document.getElementById(`previewSize${type}`).innerText = formatBytes(file.size);
  document.getElementById(`filePreview${type}`).classList.add("active");

  const reader = new FileReader();
  reader.onload = (event) => {
    selectedFiles[type] = event.target.result.split(",")[1];
  };
  reader.onerror = () => {
    showToast(`Gagal membaca data file PDF ${type}.`, "error");
    removeSelectedFile(type);
  };
  reader.readAsDataURL(file);
}

function removeSelectedFile(type) {
  selectedFiles[type] = null;
  selectedFileNames[type] = null;
  const input = document.getElementById(`fileInput${type}`);
  if (input) input.value = "";
  const preview = document.getElementById(`filePreview${type}`);
  if (preview) preview.classList.remove("active");
}

// ─── Form Submit (Upload) ───────────────────────────────────

async function handleFormSubmit(e) {
  e.preventDefault();

  if (!selectedFiles.ATP || !selectedFiles.MA) {
    return showToast("Silakan lampirkan kedua dokumen ATP dan MA terlebih dahulu!", "error");
  }

  const btn = document.getElementById("btnSubmit");
  btn.disabled = true;
  btn.classList.add("loading");

  const basePayload = {
    namaGuru: document.getElementById("namaGuru").value,
    statusKepegawaian: document.getElementById("statusKepegawaian").value,
    nip: document.getElementById("nip").value,
    mapel: document.getElementById("mapel").value,
    kelas: document.getElementById("kelas").value,
    rombel: document.getElementById("rombel").value,
    topik: document.getElementById("topik").value,
  };

  try {
    // 1. Upload ATP
    btn.innerHTML = `
      <div class="loader"></div>
      Mengunggah ATP...
    `;
    const payloadATP = { ...basePayload, jenisDokumen: "ATP", base64File: selectedFiles.ATP };
    const resATP = await API.uploadFile(payloadATP);
    if (!resATP.success) throw new Error("ATP: " + resATP.message);

    // 2. Upload MA
    btn.innerHTML = `
      <div class="loader"></div>
      Mengunggah MA...
    `;
    const payloadMA = { ...basePayload, jenisDokumen: "MA", base64File: selectedFiles.MA };
    const resMA = await API.uploadFile(payloadMA);
    if (!resMA.success) throw new Error("MA: " + resMA.message);

    // 3. Save Records to Database
    btn.innerHTML = `
      <div class="loader"></div>
      Menyimpan Data...
    `;
    const dbPayload = {
      records: [
        { ...basePayload, jenisDokumen: "ATP", fileName: resATP.fileName, fileUrl: resATP.fileUrl, fileId: resATP.fileId },
        { ...basePayload, jenisDokumen: "MA", fileName: resMA.fileName, fileUrl: resMA.fileUrl, fileId: resMA.fileId }
      ]
    };
    const resDB = await API.saveSubmissionRecords(dbPayload);
    if (!resDB.success) throw new Error("Database: " + resDB.message);

    showToast("Berhasil mengunggah dan menyimpan dokumen ATP & MA!", "success");
    resetForm();
    loadDashboardData();
  } catch (err) {
    showToast("Terjadi kegagalan: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
    btn.innerHTML = `
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      Unggah Dokumen
    `;
  }
}

function resetForm() {
  document.getElementById("uploadForm").reset();
  removeSelectedFile("ATP");
  removeSelectedFile("MA");
  document.getElementById("statusKepegawaian").value = "";
  document.getElementById("nip").value = "";
  document.getElementById("mapel").innerHTML = '<option value="" disabled selected>-- Pilih Guru Terlebih Dahulu --</option>';
  document.getElementById("kelas").innerHTML = '<option value="" disabled selected>-- Pilih Guru Terlebih Dahulu --</option>';
}

function resetFilters() {
  document.getElementById("filterKelas").value = "";
  document.getElementById("filterStatus").value = "";
  document.getElementById("searchBox").value = "";
  renderSubmissionsTable();
}

window.repairAllBrokenLinks = async function() {
  const gradedItems = allSubmissions.filter(s => s.status === "Sudah Dinilai" || s.status === "Revisi" || s.nilai !== "");
  if (gradedItems.length === 0) {
    showToast("Tidak ada data yang sudah dinilai.", "warning");
    return;
  }
  
  const confirmStart = confirm(`Ditemukan ${gradedItems.length} dokumen yang sudah dinilai. Sistem akan mengenerate ulang PDF untuk semuanya satu-per-satu dan memperbarui linknya. Proses ini mungkin memakan waktu beberapa menit. Lanjutkan?`);
  if (!confirmStart) return;
  
  const progressModal = document.getElementById("progressModal");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const progressStatus = document.getElementById("progressStatus");
  
  if (progressModal) {
    progressModal.style.display = "flex";
    setTimeout(() => progressModal.classList.add("active"), 10);
    progressBar.style.width = "0%";
    progressStatus.textContent = `0/${gradedItems.length}`;
    progressText.textContent = "Memulai proses...";
  } else {
    showToast("Memulai proses generate ulang... Mohon jangan tutup halaman ini.", "success");
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < gradedItems.length; i++) {
    const item = gradedItems[i];
    console.log(`[${i+1}/${gradedItems.length}] Memproses: ${item.namaGuru} - ${item.mapel} (${item.jenisDokumen})`);
    
    if (progressModal) {
      progressText.textContent = `Memproses: ${item.namaGuru} - ${item.mapel} (${item.jenisDokumen})`;
      const percentage = Math.round(((i) / gradedItems.length) * 100);
      progressBar.style.width = `${percentage}%`;
      progressStatus.textContent = `${i}/${gradedItems.length} (${percentage}%)`;
    } else {
      showToast(`Memproses ${i+1}/${gradedItems.length}: ${item.namaGuru}`, "info");
    }
    
    try {
      const pointsObj = item.poinPenilaian ? JSON.parse(item.poinPenilaian) : {};
      const { doc, filename } = await generateRubricPDFDocument(item, pointsObj);
      
      const dataUri = doc.output('datauristring');
      const base64Str = dataUri.split(',')[1];
      
      const uploadRes = await API.uploadGradedRubric({
        filename: filename,
        base64File: base64Str
      });
      
      if (!uploadRes.success) throw new Error(uploadRes.message);
      
      const pdfUrl = uploadRes.fileUrl;
      
      const response = await API.gradeSubmission(item.fileId, item.nilai, item.catatan || "", item.status, item.poinPenilaian || "{}", pdfUrl);
      
      if (!response.success) throw new Error(response.message);
      
      console.log(`✅ Berhasil: ${filename}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Gagal memproses ${item.namaGuru}:`, err.message);
      failCount++;
    }
  }
  
  if (progressModal) {
    progressBar.style.width = "100%";
    progressStatus.textContent = `${gradedItems.length}/${gradedItems.length} (100%)`;
    progressText.textContent = "Proses selesai!";
    
    // Give a small delay before hiding modal and showing alert
    await new Promise(resolve => setTimeout(resolve, 500));
    progressModal.classList.remove("active");
    setTimeout(() => {
      progressModal.style.display = "none";
      alert(`Proses selesai!\nBerhasil: ${successCount}\nGagal: ${failCount}\n\nSilakan refresh halaman untuk memuat link terbaru.`);
      location.reload();
    }, 200);
  } else {
    alert(`Proses selesai!\nBerhasil: ${successCount}\nGagal: ${failCount}\n\nSilakan refresh halaman untuk memuat link terbaru.`);
    location.reload();
  }
}

// ─── Dashboard Data & Rendering ─────────────────────────────

async function loadDashboardData() {
  try {
    const data = await API.getSubmissions();
    allSubmissions = data;
    renderTableAndStats(data);
    renderLaporanTable();
  } catch (err) {
    showToast("Gagal memuat data dari server: " + err.message, "error");
  }
}

let dashboardChart = null;

function renderChartAndMissingUploads(data) {
  const ctx = document.getElementById('uploadChart');
  if (!ctx) return;
  
  const atpTeachers = new Set();
  const maTeachers = new Set();
  
  data.forEach(item => {
    if (item.jenisDokumen === 'ATP') atpTeachers.add(item.namaGuru);
    if (item.jenisDokumen === 'MA') maTeachers.add(item.namaGuru);
  });

  const atpCount = atpTeachers.size;
  const maCount = maTeachers.size;
  
  const expectedTotal = teacherList.length;
  
  if (dashboardChart) {
    dashboardChart.destroy();
  }
  
  dashboardChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['ATP', 'Modul Ajar'],
      datasets: [
        {
          label: 'Sudah Upload',
          data: [atpCount, maCount],
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderRadius: 4
        },
        {
          label: 'Belum Upload',
          data: [Math.max(0, expectedTotal - atpCount), Math.max(0, expectedTotal - maCount)],
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });
  
  // Missing Uploads Logic
  const missingListContainer = document.getElementById('missingUploadsList');
  if (!missingListContainer) return;
  
  missingListContainer.innerHTML = '';
  
  const missingTeachers = teacherList.filter(t => {
    const hasATP = data.some(d => d.namaGuru === t.nama && d.jenisDokumen === 'ATP');
    const hasMA = data.some(d => d.namaGuru === t.nama && d.jenisDokumen === 'MA');
    return !hasATP && !hasMA;
  });
  
  if (missingTeachers.length === 0) {
    missingListContainer.innerHTML = '<li>🎉 Semua guru telah mengunggah dokumen.</li>';
  } else {
    missingTeachers.forEach(t => {
      const li = document.createElement('li');
      li.style.padding = "4px 0";
      li.style.borderBottom = "1px dashed var(--border-light)";
      li.innerText = t.nama;
      missingListContainer.appendChild(li);
    });
  }
}

function renderTableAndStats(data) {
  const tableBody = document.getElementById("submissionTableBody");
  const emptyState = document.getElementById("tableEmptyState");

  // Calculate Global Stats for both MA and ATP
  let statsMA = { total: 0, graded: 0, pending: 0, score: 0 };
  let statsATP = { total: 0, graded: 0, pending: 0, score: 0 };

  data.forEach((item) => {
    const targetStat = item.jenisDokumen === "MA" ? statsMA : item.jenisDokumen === "ATP" ? statsATP : null;
    if (targetStat) {
      targetStat.total++;
      if (item.status === "Sudah Dinilai") {
        targetStat.graded++;
        targetStat.score += Number(item.nilai || 0);
      } else {
        targetStat.pending++;
      }
    }
  });

  // Update UI Stats Cards (MA)
  document.getElementById("statTotalMA").innerText = statsMA.total;
  document.getElementById("statGradedMA").innerText = statsMA.graded;
  document.getElementById("statPendingMA").innerText = statsMA.pending;
  document.getElementById("statAverageMA").innerText =
    statsMA.graded > 0 ? (statsMA.score / statsMA.graded).toFixed(1) : "0.0";

  // Update UI Stats Cards (ATP)
  document.getElementById("statTotalATP").innerText = statsATP.total;
  document.getElementById("statGradedATP").innerText = statsATP.graded;
  document.getElementById("statPendingATP").innerText = statsATP.pending;
  document.getElementById("statAverageATP").innerText =
    statsATP.graded > 0 ? (statsATP.score / statsATP.graded).toFixed(1) : "0.0";
    
  renderChartAndMissingUploads(data);

  const docTypeData = data.filter((item) => item.jenisDokumen === activeSubTab);

  // Filter
  const query = document.getElementById("searchFilter").value.toLowerCase();
  const kelasFilter = document.getElementById("filterKelas").value;
  const statusFilter = document.getElementById("filterStatus").value;

  const filtered = docTypeData.filter((item) => {
    const matchSearch =
      item.namaGuru.toLowerCase().includes(query) ||
      item.mapel.toLowerCase().includes(query) ||
      item.topik.toLowerCase().includes(query);
    return (
      matchSearch && (!kelasFilter || item.kelas === kelasFilter) && (!statusFilter || item.status === statusFilter)
    );
  });

  tableBody.innerHTML = "";
  if (filtered.length === 0) {
    emptyState.style.display = "flex";
    return;
  }
  emptyState.style.display = "none";

  filtered.forEach((item) => {
    const currentTeacher = teacherList.find(t => t.nama === item.namaGuru);
    const displayNIP = currentTeacher && currentTeacher.nip ? currentTeacher.nip : item.nip || "-";

    const statusBadgeClass = item.status === "Sudah Dinilai" ? "sudah" : "belum";
    const gradeActionHtml = isAsessorLoggedIn
      ? `<button onclick="openGradingForm('${encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27")}')" class="btn-action ${item.nilai !== "" ? "btn-action-edit" : "btn-action-grade"}">${item.nilai !== "" ? "Ubah Nilai" : "Beri Nilai"}</button>`
      : "";

    const downloadPdfHtml =
      item.status === "Sudah Dinilai" && (item.jenisDokumen === "ATP" || item.jenisDokumen === "MA")
        ? `<button onclick="downloadPenilaianPDF('${encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27")}')" class="btn-action" style="color: var(--success)"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Unduh Penilaian</button>`
        : "";

    const badgeHtml =
      item.nilai !== ""
        ? `<button type="button" class="badge-status ${statusBadgeClass}" onclick="showBreakdown('${encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27")}')" style="cursor: pointer; border: none; font-family: inherit;" title="Lihat Detail Rubrik">${item.status}</button>`
        : `<span class="badge-status ${statusBadgeClass}">${item.status}</span>`;

    const scoreHtml =
      item.nilai !== ""
        ? `<div class="score-display" style="justify-content: center;"><span class="score-val" style="font-size: 20px;">${item.nilai}</span></div>`
        : `<span class="score-empty">-</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="vertical-align: top; padding-top: 16px; width: 25%;">
        <div style="font-weight: 600; font-size: 14px; color: var(--text-primary); line-height: 1.2;">${item.namaGuru}</div>
        <div style="font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); margin-top: 4px;">NIP: ${displayNIP}</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">${item.timestamp.split(" ")[0]}</div>
      </td>
      <td class="wrap-text" style="vertical-align: top; padding-top: 16px; width: 35%;">
        <div style="font-weight: 600; font-size: 14px; color: var(--text-primary); line-height: 1.2;">${item.mapel}</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Kelas ${item.kelas} &bull; Rombel ${item.rombel}</div>
        <div style="font-size: 12px; color: var(--text-primary); margin-top: 8px; line-height: 1.4;"><span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Topik:</span> ${item.topik}</div>
      </td>
      <td style="text-align: center; vertical-align: top; padding-top: 16px; width: 15%;">
        <div style="margin-bottom: 8px;">${badgeHtml}</div>
        ${scoreHtml}
      </td>
      <td style="text-align: right; vertical-align: top; padding-top: 16px; width: 25%;">
        <div class="action-links" style="justify-content: flex-end; flex-wrap: wrap; gap: 8px;">
          <a href="${item.fileUrl}" target="_blank" class="btn-action"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Unduh Dokumen</a>
          ${downloadPdfHtml}
          ${gradeActionHtml}
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function applyFilters() {
  renderTableAndStats(allSubmissions);
}

// ─── Breakdown Modal ────────────────────────────────────────

function showBreakdown(encodedItem) {
  const item = JSON.parse(decodeURIComponent(encodedItem));
  document.getElementById("breakdownGuru").innerText = item.namaGuru;
  document.getElementById("breakdownJenis").innerText = item.jenisDokumen;

  const listContainer = document.getElementById("breakdownList");
  listContainer.innerHTML = "";

  let points = {};
  try {
    if (item.poinPenilaian) points = JSON.parse(item.poinPenilaian);
  } catch (e) {
    /* ignore */
  }

  let itemIndex = 0;
  (criteriaTemplates[item.jenisDokumen] || []).forEach((c) => {
    if (c.type === "header" || c.type === "subheader") {
        const div = document.createElement("div");
        div.style.marginTop = c.type === "header" ? "16px" : "8px";
        div.style.marginBottom = "4px";
        div.style.fontWeight = "700";
        div.style.fontSize = c.type === "header" ? "13px" : "12px";
        div.style.color = c.type === "header" ? "var(--primary)" : "var(--text-primary)";
        div.innerText = c.label;
        listContainer.appendChild(div);
        return;
    }

    itemIndex++;
    const val = points[c.key] !== undefined ? points[c.key] : "-";
    const div = document.createElement("div");
    div.className = "breakdown-item";

    // Process label to bold the prefix if it contains a colon (e.g. "IDENTITAS: Memuat...")
    let displayLabel = c.label;
    if (displayLabel.includes(":")) {
      const parts = displayLabel.split(":");
      displayLabel = `<b>${parts[0]}</b><br>${parts.slice(1).join(":")}`;
    }

    div.innerHTML = `<span class="breakdown-key">${itemIndex}. ${displayLabel}</span><span class="breakdown-val">${val}</span>`;
    listContainer.appendChild(div);
  });

  const avgDiv = document.createElement("div");
  avgDiv.className = "breakdown-item";
  avgDiv.style.cssText = "border-top: 2px dashed var(--border-light); margin-top: 8px; padding-top: 12px;";
  avgDiv.innerHTML = `<span class="breakdown-key" style="font-weight: 700; color: var(--text-primary);">Rata-rata Akhir</span><span class="breakdown-val" style="font-size: 16px;">${item.nilai}</span>`;
  listContainer.appendChild(avgDiv);

  const modal = document.getElementById("breakdownModal");
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("active"), 10);
}

function closeBreakdownModal() {
  const modal = document.getElementById("breakdownModal");
  modal.classList.remove("active");
  setTimeout(() => (modal.style.display = "none"), 200);
}

// ─── Assessor Authentication ────────────────────────────────

async function handleLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  const btn = document.getElementById("btnLogin");

  btn.disabled = true;
  btn.classList.add("loading");

  try {
    const response = await API.verifyLogin(username, password);
    if (response.success) {
      doLoginSuccess();
    } else {
      showToast(response.message, "error");
    }
  } catch (err) {
    showToast("Error koneksi: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
  }
}

function doLoginSuccess() {
  isAsessorLoggedIn = true;
  sessionStorage.setItem("isAsessorLoggedIn", "true");
  document.body.classList.add("logged-in");

  const loginBtn = document.getElementById("loginTabBtn");
  loginBtn.innerHTML = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/><path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/></svg><span>Keluar (Asesor)</span>`;

  if (!document.getElementById("assessorBadge")) {
    const badge = document.createElement("span");
    badge.id = "assessorBadge";
    badge.className = "assessor-badge";
    badge.style.marginTop = "6px";
    badge.innerText = "SESI ASESOR AKTIF";
    document.querySelector(".logo-area").appendChild(badge);
  }

  const laporanBtn = document.getElementById("laporanTabBtn");
  if (laporanBtn) laporanBtn.classList.remove("hidden");

  showToast("Login Asesor berhasil!", "success");
  document.getElementById("loginForm").reset();
  switchTab("penilaian");
}

function handleLogout() {
  isAsessorLoggedIn = false;
  sessionStorage.removeItem("isAsessorLoggedIn");
  document.body.classList.remove("logged-in");

  document.getElementById("loginTabBtn").innerHTML =
    `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H3a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a2 2 0 0 0-2-2z"/><path d="M8 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg><span>Login Asesor</span>`;

  const badge = document.getElementById("assessorBadge");
  if (badge) badge.remove();

  const laporanBtn = document.getElementById("laporanTabBtn");
  if (laporanBtn) laporanBtn.classList.add("hidden");

  showToast("Anda telah keluar.", "success");
  switchTab("upload");
}

// ─── Grading Form & Rubric ──────────────────────────────────

function renderRubric(jenisDokumen, existingPoints = {}) {
  const container = document.getElementById("rubricContainer");
  container.innerHTML = "";
  currentGradingPoints = {};

  if (jenisDokumen === "ATP" || jenisDokumen === "MA") {
    container.style.gridTemplateColumns = "1fr";
    let indexOffset = 0;

    (criteriaTemplates[jenisDokumen] || []).forEach((c) => {
      if (c.type === "header" || c.type === "subheader") {
        const headerDiv = document.createElement("div");
        headerDiv.style.gridColumn = "1 / -1";
        headerDiv.style.marginTop = c.type === "header" ? "24px" : "12px";
        headerDiv.style.marginBottom = "8px";
        headerDiv.style.fontWeight = "700";
        headerDiv.style.fontSize = c.type === "header" ? "16px" : "14px";
        headerDiv.style.color = c.type === "header" ? "var(--primary)" : "var(--text-primary)";
        headerDiv.style.borderBottom = c.type === "header" ? "2px solid var(--primary-light)" : "none";
        headerDiv.style.paddingBottom = c.type === "header" ? "4px" : "0";
        headerDiv.innerText = c.label;
        container.appendChild(headerDiv);
        return; // skip slider
      }

      indexOffset++;
      const val = existingPoints[c.key] !== undefined ? existingPoints[c.key] : 0;
      currentGradingPoints[c.key] = Number(val);

      const group = document.createElement("div");
      group.className = "form-group";
      group.style.marginBottom = "20px";
      group.style.paddingBottom = "15px";
      group.style.borderBottom = "1px solid var(--border-light)";

      // For MA we already hardcoded numbers in the string, but we can prepend the indexOffset if it's ATP or MA if needed.
      // Wait, in my MA list, I already put numbers inside c.label (e.g. "Memuat identitas penulis...").
      // I'll prepend the number dynamically here so it's consistent.
      let displayLabel = c.label;
      if (jenisDokumen === "MA" || jenisDokumen === "ATP") {
         displayLabel = `${indexOffset}. ${c.label}`;
      }

      group.innerHTML = `
        <label style="margin-bottom: 8px;">${displayLabel}</label>
        <div class="slider-container" style="flex-direction: column; align-items: stretch; gap: 8px;">
          <input type="range" id="slider_${c.key}" min="0" max="2" step="1" value="${val}" class="score-slider" oninput="syncCriteriaATP('${c.key}', this.value)" style="margin: 0; width: 100%;" />
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); padding: 0 4px;">
            <span id="atp_label_${c.key}_0" style="font-weight: ${val == 0 ? "700" : "normal"}; color: ${val == 0 ? "var(--primary)" : "inherit"}">Tidak Ada (0)</span>
            <span id="atp_label_${c.key}_1" style="font-weight: ${val == 1 ? "700" : "normal"}; color: ${val == 1 ? "var(--primary)" : "inherit"}; text-align: center;">Kurang Lengkap/Sesuai (1)</span>
            <span id="atp_label_${c.key}_2" style="font-weight: ${val == 2 ? "700" : "normal"}; color: ${val == 2 ? "var(--primary)" : "inherit"}; text-align: right;">Sudah Lengkap/Sesuai (2)</span>
          </div>
        </div>`;
      container.appendChild(group);
    });
  } else {
    // Other documents logic fallback
    container.style.gridTemplateColumns = "repeat(2, 1fr)";
    (criteriaTemplates[jenisDokumen] || []).forEach((c) => {
      const val = existingPoints[c.key] !== undefined ? existingPoints[c.key] : 80;
      currentGradingPoints[c.key] = Number(val);

      const group = document.createElement("div");
      group.className = "form-group";
      group.style.marginBottom = "20px";
      group.innerHTML = `
        <label for="slider_${c.key}">${c.label}<span class="help-text" id="val_label_${c.key}">${val}/100</span></label>
        <div class="slider-container">
          <input type="range" id="slider_${c.key}" min="0" max="100" value="${val}" class="score-slider" oninput="syncCriteria('${c.key}', this.value, 'input')" />
          <input type="number" id="input_${c.key}" min="0" max="100" value="${val}" class="score-number-input" required oninput="syncCriteria('${c.key}', this.value, 'slider')" />
        </div>`;
      container.appendChild(group);
    });
  }

  const bulkActions = document.getElementById("bulkGradeActions");
  if (bulkActions) {
    if (jenisDokumen === "ATP" || jenisDokumen === "MA") {
      bulkActions.style.display = "flex";
    } else {
      bulkActions.style.display = "none";
    }
  }

  container.dataset.jenis = jenisDokumen;
  calculateRubricAverage();
}

function bulkSetScore(val) {
  const container = document.getElementById("rubricContainer");
  const jenisDokumen = container.dataset.jenis;

  if (jenisDokumen === "ATP" || jenisDokumen === "MA") {
    (criteriaTemplates[jenisDokumen] || []).forEach((c) => {
      if (c.type === "header" || c.type === "subheader") return;
      const slider = document.getElementById(`slider_${c.key}`);
      if (slider) slider.value = val;
      syncCriteriaATP(c.key, val);
    });
  }
}

function syncCriteriaATP(key, val) {
  currentGradingPoints[key] = Number(val);
  const numVal = Number(val);

  for (let i = 0; i <= 2; i++) {
    const el = document.getElementById(`atp_label_${key}_${i}`);
    if (el) {
      if (i === numVal) {
        el.style.fontWeight = "700";
        el.style.color = "var(--primary)";
      } else {
        el.style.fontWeight = "normal";
        el.style.color = "inherit";
      }
    }
  }

  calculateRubricAverage();
}

function syncCriteria(key, val, target) {
  const num = Math.min(100, Math.max(0, parseInt(val) || 0));
  currentGradingPoints[key] = num;
  if (target === "slider") document.getElementById(`slider_${key}`).value = num;
  else document.getElementById(`input_${key}`).value = num;
  document.getElementById(`val_label_${key}`).innerText = `${num}/100`;
  calculateRubricAverage();
}

function calculateRubricAverage() {
  const keys = Object.keys(currentGradingPoints);
  if (keys.length === 0) return;
  const container = document.getElementById("rubricContainer");
  const jenisDokumen = container.dataset.jenis;

  const sum = keys.reduce((acc, k) => acc + currentGradingPoints[k], 0);

  if (jenisDokumen === "ATP" || jenisDokumen === "MA") {
    const maxScore = jenisDokumen === "ATP" ? 12 : 90;
    const finalScore = ((sum / maxScore) * 100).toFixed(1);

    let predikat = "Kurang";
    if (finalScore >= 91) predikat = "Amat Baik";
    else if (finalScore >= 81) predikat = "Baik";
    else if (finalScore >= 71) predikat = "Cukup";

    document.getElementById("gradeFormAverageDisplay").innerHTML =
      `${finalScore} <div style="font-size: 16px; margin-top: 4px; font-weight: normal; color: var(--text-secondary)">Predikat: ${predikat}</div>`;
  } else {
    document.getElementById("gradeFormAverageDisplay").innerText = (sum / keys.length).toFixed(1);
  }
}

function openGradingForm(encodedData) {
  const item = JSON.parse(decodeURIComponent(encodedData));

  document.getElementById("gradeFormFileId").value = item.fileId;
  document.getElementById("gradeFormGuru").innerText = item.namaGuru;
  document.getElementById("gradeFormMapelKelas").innerText = `${item.mapel} / Kelas ${item.kelas}`;
  document.getElementById("gradeFormRombel").innerText = item.rombel;
  document.getElementById("gradeFormFilename").innerText = item.filename;
  document.getElementById("gradeFormTopik").innerText = item.topik;
  document.getElementById("gradeFormNotes").value = item.catatan || "";
  document.getElementById("gradeFormStatus").value = item.status || "Sudah Dinilai";

  // Set the iframe src (convert Google Drive view link to preview link)
  let embedUrl = item.fileUrl || "";
  if (embedUrl.includes("/view")) {
    embedUrl = embedUrl.replace("/view", "/preview");
  }
  document.getElementById("gradeFormPdfPreview").src = embedUrl;

  let existingPoints = {};
  try {
    if (item.poinPenilaian) existingPoints = JSON.parse(item.poinPenilaian);
  } catch (e) {
    /* ignore */
  }

  renderRubric(item.jenisDokumen, existingPoints);
  switchTab("grade");
}

function cancelGrading() {
  switchTab("penilaian");
  document.getElementById("dedicatedGradeForm").reset();
  document.getElementById("rubricContainer").innerHTML = "";
  document.getElementById("gradeFormPdfPreview").src = "";
}

async function handleDedicatedGradeSubmit(e) {
  e.preventDefault();

  const fileId = document.getElementById("gradeFormFileId").value;
  const scoreText = document.getElementById("gradeFormAverageDisplay").innerText;
  const score = Number(parseFloat(scoreText).toFixed(1));
  const status = document.getElementById("gradeFormStatus").value;
  const notes = document.getElementById("gradeFormNotes").value;
  const pointsStr = JSON.stringify(currentGradingPoints);

  const btn = document.getElementById("btnSaveGradeForm");
  btn.disabled = true;
  btn.classList.add("loading");

  try {
    showToast("Mengamankan hasil penilaian & memproses PDF...", "success");
    
    // 1. Generate PDF locally
    const item = allSubmissions.find(s => s.fileId === fileId);
    if (!item) throw new Error("Data tidak valid.");
    
    // update temporary item prop for accurate generation
    item.catatan = notes;
    item.nilai = score;
    const { doc, filename } = await generateRubricPDFDocument(item, currentGradingPoints);
    
    // 2. Convert to Base64 (remove dataURI prefix)
    const dataUri = doc.output('datauristring');
    const base64Str = dataUri.split(',')[1];
    
    // 3. Upload to Google Drive (Backend)
    const uploadRes = await API.uploadGradedRubric({
      filename: filename,
      base64File: base64Str
    });
    
    if (!uploadRes.success) {
      throw new Error("Gagal mengunggah PDF Rubrik: " + uploadRes.message);
    }
    
    const pdfUrl = uploadRes.fileUrl;

    // 4. Save Grade with PDF Url
    const response = await API.gradeSubmission(fileId, score, notes, status, pointsStr, pdfUrl);
    if (response.success) {
      showToast("Penilaian dan Dokumen berhasil disimpan!", "success");
      cancelGrading();
      loadDashboardData();
    } else {
      showToast(response.message, "error");
    }
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
  }
}

// ─── Utilities ──────────────────────────────────────────────

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.className = "toast " + type;
  document.getElementById("toastMessage").innerText = message;
  toast.classList.add("active");
  setTimeout(() => toast.classList.remove("active"), 4000);
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

// ─── PDF Generation ─────────────────────────────────────────

let currentPdfBlobUrl = "";
let currentPdfFilename = "";

// Helper dihapus karena sudah menggunakan base64 dari assets.js

async function generateRubricPDFDocument(item, overridePoints = null) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format: "a4", unit: "mm" });
    
    // Configs
    const isMA = item.jenisDokumen === "MA";
    const title = isMA ? "INSTRUMEN VERIFIKASI MODUL AJAR (MA) SMK" : "INSTRUMEN VERIFIKASI ALUR TUJUAN PEMBELAJARAN (ATP) SMK";
    
    // Create unique filename using fileId or timestamp to prevent overwrite and trashing bug
    const cleanNama = item.namaGuru ? item.namaGuru.replace(/[\\\/:*?"<>| ]/g, '_') : 'Unknown';
    const uniqueId = item.fileId || new Date().getTime();
    currentPdfFilename = `Instrumen_${isMA ? 'MA' : 'ATP'}_${cleanNama}_${uniqueId}.pdf`;
    
    let fase = item.kelas === "X" ? "Fase E" : "Fase F";
    
    // Header Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const startY = 25;
    const lineHeight = 6;
    
    doc.text("Nama Sekolah", 15, startY);
    doc.text(":", 50, startY);
    doc.text("SMK Negeri 1 Wadaslintang", 55, startY);
    
    doc.text("Nama Guru", 15, startY + lineHeight);
    doc.text(":", 50, startY + lineHeight);
    doc.text(item.namaGuru, 55, startY + lineHeight);
    
    doc.text("Mata Pelajaran", 15, startY + lineHeight * 2);
    doc.text(":", 50, startY + lineHeight * 2);
    doc.text(item.mapel, 55, startY + lineHeight * 2);
    
    doc.text(isMA ? "Fase/Program Keahlian" : "Fase", 15, startY + lineHeight * 3);
    doc.text(":", 50, startY + lineHeight * 3);
    doc.text(isMA ? `${fase} / ${item.rombel}` : `${fase} / Kelas ${item.kelas}`, 55, startY + lineHeight * 3, { maxWidth: 140 });
    
    if (!isMA) {
      doc.text("PK/KK", 15, startY + lineHeight * 4);
      doc.text(":", 50, startY + lineHeight * 4);
      doc.text(item.rombel, 55, startY + lineHeight * 4, { maxWidth: 140 });
    }
    
    doc.text("Tahun Ajaran", 15, startY + lineHeight * (isMA ? 4 : 5));
    doc.text(":", 50, startY + lineHeight * (isMA ? 4 : 5));
    doc.text("2026/2027", 55, startY + lineHeight * (isMA ? 4 : 5));

    // Prepare Table Data
    let points = {};
    if (overridePoints) {
      points = overridePoints;
    } else {
      try { if (item.poinPenilaian) points = JSON.parse(item.poinPenilaian); } catch(e){}
    }
    
    let sum0 = 0, sum1 = 0, sum2 = 0;
    let indexOffset = 0;
    
    const templates = isMA ? criteriaTemplates.MA : criteriaTemplates.ATP;
    const bodyData = [];
    
    (templates || []).forEach(c => {
      if (c.type === "header") {
        bodyData.push([{ content: c.label, colSpan: 5, styles: { fillColor: [217, 217, 217], fontStyle: 'bold', halign: 'left' } }]);
      } else if (c.type === "subheader") {
        bodyData.push([{ content: "", styles: { cellWidth: 10 } }, { content: c.label, colSpan: 4, styles: { fontStyle: 'bold', halign: 'left' } }]);
      } else {
        indexOffset++;
        const val = Number(points[c.key] || 0);
        if (val === 0) sum0++;
        else if (val === 1) sum1++;
        else if (val === 2) sum2++;
        
        let labelPrint = c.label;
        if (labelPrint.includes(":")) {
          const parts = labelPrint.split(":");
          labelPrint = `${parts[0]}\n${parts.slice(1).join(":")}`;
        }
        
        bodyData.push([
          indexOffset.toString(),
          labelPrint,
          val === 0 ? "V" : "",
          val === 1 ? "V" : "",
          val === 2 ? "V" : ""
        ]);
      }
    });

    const totalScore = sum1 * 1 + sum2 * 2;
    const maxScore = isMA ? 90 : 24; // 12 kriteria = 24 maks (for ATP). Wait, ATP has 12 items? Yes, 12 * 2 = 24. Wait previously it was (totalScore / 12 * 100)
    // Wait, let's just count criteria dynamically.
    const numCriteria = templates.filter(c => c.type !== "header" && c.type !== "subheader").length;
    const calculatedMax = numCriteria * 2;
    const finalNilai = ((totalScore / calculatedMax) * 100).toFixed(1);
    
    let predikat = "Kurang";
    if (finalNilai >= 91) predikat = "Amat Baik";
    else if (finalNilai >= 81) predikat = "Baik";
    else if (finalNilai >= 71) predikat = "Cukup";

    // Add totals
    bodyData.push([
      { content: "JUMLAH SKOR", colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } },
      { content: (sum0 * 0).toString(), styles: { halign: 'center', fontStyle: 'bold' } },
      { content: (sum1 * 1).toString(), styles: { halign: 'center', fontStyle: 'bold' } },
      { content: (sum2 * 2).toString(), styles: { halign: 'center', fontStyle: 'bold' } }
    ]);
    
    bodyData.push([
      { content: "NILAI", colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } },
      { content: finalNilai, colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', fontSize: 11 } },
      { content: `Predikat:\n${predikat}`, styles: { halign: 'center', fontStyle: 'bold' } }
    ]);

    doc.autoTable({
      startY: startY + lineHeight * (isMA ? 6 : 7),
      head: [[
        { content: 'No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
        { content: 'Komponen/Indikator', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
        { content: 'Skor', colSpan: 3, styles: { halign: 'center' } }
      ], [
        { content: 'Tdk Ada\n(0)', styles: { halign: 'center' } },
        { content: 'Kurang Lengkap\n(1)', styles: { halign: 'center' } },
        { content: 'Sudah Lengkap\n(2)', styles: { halign: 'center' } }
      ]],
      body: bodyData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2, textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.2 },
      headStyles: { fillColor: [243, 244, 246], textColor: [0,0,0] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 26, halign: 'center' },
        4: { cellWidth: 26, halign: 'center' }
      }
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    
    // Check page break for footer
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }

    finalY += 10; // Spasi kecil sebelum bagian kesimpulan

    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.text("KESIMPULAN/CATATAN/SARAN:", 15, finalY);
    doc.setFont("helvetica", "normal");
    
    const catatanLines = doc.splitTextToSize(item.catatan || "-", 120);
    doc.text(catatanLines, 15, finalY + 6);
    
    // Signature
    const dateFormatted = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const rightMargin = 135;
    
    // Load and add images from assets.js
    if (typeof CAP_B64 !== "undefined") {
      doc.addImage(CAP_B64, 'PNG', rightMargin - 20, finalY + 2, 28, 28);
    }
    if (typeof TTD_B64 !== "undefined") {
      doc.addImage(TTD_B64, 'PNG', rightMargin - 2, finalY + 5, 30, 20);
    }
    
    doc.text(`Wadaslintang, ${dateFormatted}`, rightMargin, finalY);
    doc.text("Kepala Sekolah,", rightMargin, finalY + 5);
    doc.setFont("helvetica", "bold");
    doc.text("Agus Surono, S.Pd.,M.M.,Gr", rightMargin, finalY + 25);
    doc.setFont("helvetica", "normal");
    doc.text("NIP.188411032011011007", rightMargin, finalY + 30);

    // Return doc and filename instead of downloading directly
    return { doc, filename: currentPdfFilename };
    
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function downloadPenilaianPDF(encodedData) {
  const item = JSON.parse(decodeURIComponent(encodedData));

  if (item.jenisDokumen !== "ATP" && item.jenisDokumen !== "MA") {
    showToast("Format PDF saat ini hanya mendukung dokumen ATP dan MA.", "warning");
    return;
  }

  showToast("Menyiapkan file PDF untuk diunduh...", "success");

  try {
    const result = await generateRubricPDFDocument(item);
    result.doc.save(result.filename);
    showToast("PDF berhasil diunduh!", "success");
  } catch (err) {
    showToast("Gagal membuat PDF: " + err.message, "error");
  }
}

// ─── Laporan Rekapitulasi & Export ──────────────────────────

function getPredikat(nilaiStr) {
  if (nilaiStr === "" || nilaiStr === null || nilaiStr === undefined) return "-";
  const nilai = Number(nilaiStr);
  if (nilai >= 91) return "Sangat Baik";
  if (nilai >= 81) return "Baik";
  if (nilai >= 71) return "Cukup";
  return "Kurang";
}

let currentLaporanData = [];

function renderLaporanTable() {
  const tbody = document.getElementById("laporanTableBody");
  const emptyState = document.getElementById("laporanEmptyState");
  if (!tbody) return;

  tbody.innerHTML = "";
  currentLaporanData = [];

  if (!allSubmissions || allSubmissions.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  // Group by: Nama Guru + Mapel + Kelas
  const groups = {};
  
  allSubmissions.forEach(sub => {
    const key = `${sub.namaGuru}_${sub.mapel}_${sub.kelas}`;
    if (!groups[key]) {
      groups[key] = {
        namaGuru: sub.namaGuru,
        mapel: sub.mapel,
        kelas: sub.kelas,
        topik: sub.topik,
        ATP: null,
        MA: null
      };
    }
    
    if (sub.jenisDokumen === "ATP") {
      groups[key].ATP = sub;
    } else if (sub.jenisDokumen === "MA") {
      groups[key].MA = sub;
    }
  });

  const groupArray = Object.values(groups).sort((a, b) => a.namaGuru.localeCompare(b.namaGuru));
  currentLaporanData = groupArray;

  if (groupArray.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  
  emptyState.style.display = "none";

  groupArray.forEach(grp => {
    const tr = document.createElement("tr");
    
    // Helper for rendering link URL or placeholder
    const renderLink = (url) => {
      if (!url) return "-";
      return `<a href="${url}" target="_blank" class="table-link" style="word-break: break-all; font-size: 11px;">${url}</a>`;
    };

    // ATP cells
    const atpDocLink = renderLink(grp.ATP ? grp.ATP.fileUrl : null);
    const atpKosongLink = `<a href="https://docs.google.com/spreadsheets/d/1zS7KRYNccQCK4fYcSq2CMpvrSzU3pBNQ/edit?usp=sharing&ouid=117533810449034814395&rtpof=true&sd=true" target="_blank" class="table-link" style="word-break: break-all; font-size: 11px; color:var(--text-secondary)">https://docs.google.com/spreadsheets/d/1zS7KRYNccQCK4fYcSq2CMpvrSzU3pBNQ/edit?usp=sharing&ouid=117533810449034814395&rtpof=true&sd=true</a>`;
    const atpValidasiLink = grp.ATP && grp.ATP.linkValidasi ? `<a href="${grp.ATP.linkValidasi}" target="_blank" class="table-link" style="word-break: break-all; font-size: 11px; color:var(--success)">${grp.ATP.linkValidasi}</a>` : "-";
    const atpNilai = grp.ATP && grp.ATP.nilai !== "" ? `<span class="badge ${grp.ATP.nilai >= 81 ? 'badge-success' : (grp.ATP.nilai >= 71 ? 'badge-warning' : 'badge-danger')}">${grp.ATP.nilai}</span>` : "-";
    const atpPredikat = grp.ATP ? getPredikat(grp.ATP.nilai) : "-";

    // MA cells
    const maDocLink = renderLink(grp.MA ? grp.MA.fileUrl : null);
    const maKosongLink = `<a href="https://docs.google.com/spreadsheets/d/1Xug8Eao3IWNQAHFm09g8XZ_fBPObAJun/edit?usp=sharing&ouid=117533810449034814395&rtpof=true&sd=true" target="_blank" class="table-link" style="word-break: break-all; font-size: 11px; color:var(--text-secondary)">https://docs.google.com/spreadsheets/d/1Xug8Eao3IWNQAHFm09g8XZ_fBPObAJun/edit?usp=sharing&ouid=117533810449034814395&rtpof=true&sd=true</a>`;
    const maValidasiLink = grp.MA && grp.MA.linkValidasi ? `<a href="${grp.MA.linkValidasi}" target="_blank" class="table-link" style="word-break: break-all; font-size: 11px; color:var(--success)">${grp.MA.linkValidasi}</a>` : "-";
    const maNilai = grp.MA && grp.MA.nilai !== "" ? `<span class="badge ${grp.MA.nilai >= 81 ? 'badge-success' : (grp.MA.nilai >= 71 ? 'badge-warning' : 'badge-danger')}">${grp.MA.nilai}</span>` : "-";
    const maPredikat = grp.MA ? getPredikat(grp.MA.nilai) : "-";

    tr.innerHTML = `
      <td style="font-weight:600;">${grp.namaGuru}</td>
      <td>${grp.mapel}</td>
      <td>${grp.kelas}</td>
      <td>${grp.topik}</td>
      <td style="border-left: 2px solid var(--border-light);">${atpDocLink}</td>
      <td>${atpKosongLink}</td>
      <td>${atpValidasiLink}</td>
      <td style="text-align: center;">${atpNilai}</td>
      <td>${atpPredikat}</td>
      <td style="border-left: 2px solid var(--border-light);">${maDocLink}</td>
      <td>${maKosongLink}</td>
      <td>${maValidasiLink}</td>
      <td style="text-align: center;">${maNilai}</td>
      <td>${maPredikat}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportLaporanExcel() {
  if (currentLaporanData.length === 0) {
    showToast("Tidak ada data laporan untuk dieksport.", "warning");
    return;
  }
  
  const excelData = [];
  
  currentLaporanData.forEach(grp => {
    excelData.push({
      "Nama Guru": grp.namaGuru,
      "Mata Pelajaran": grp.mapel,
      "Kelas": grp.kelas,
      "Topik": grp.topik,
      
      "ATP - Link Dokumen": grp.ATP ? grp.ATP.fileUrl : "",
      "ATP - Link Instrumen (Kosong)": "https://docs.google.com/spreadsheets/d/1zS7KRYNccQCK4fYcSq2CMpvrSzU3pBNQ/edit?usp=sharing&ouid=117533810449034814395&rtpof=true&sd=true",
      "ATP - Link Hasil Validasi KS": grp.ATP ? (grp.ATP.linkValidasi || "") : "",
      "ATP - Nilai Akhir": grp.ATP ? grp.ATP.nilai : "",
      "ATP - Predikat": grp.ATP ? getPredikat(grp.ATP.nilai) : "",
      
      "MA - Link Dokumen": grp.MA ? grp.MA.fileUrl : "",
      "MA - Link Instrumen (Kosong)": "https://docs.google.com/spreadsheets/d/1Xug8Eao3IWNQAHFm09g8XZ_fBPObAJun/edit?usp=sharing&ouid=117533810449034814395&rtpof=true&sd=true",
      "MA - Link Hasil Validasi KS": grp.MA ? (grp.MA.linkValidasi || "") : "",
      "MA - Nilai Akhir": grp.MA ? grp.MA.nilai : "",
      "MA - Predikat": grp.MA ? getPredikat(grp.MA.nilai) : ""
    });
  });

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rekap Penilaian KSP");
  
  const dateFormatted = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }).replace(/ /g, "_");
  XLSX.writeFile(wb, `Laporan_Rekapitulasi_KSP_${dateFormatted}.xlsx`);
  showToast("File Excel berhasil diunduh!", "success");
}

function exportLaporanPDF() {
  if (currentLaporanData.length === 0) {
    showToast("Tidak ada data laporan untuk dieksport.", "warning");
    return;
  }
  
  showToast("Menyiapkan file Laporan PDF...", "success");
  
  try {
    const { jsPDF } = window.jspdf;
    // Gunakan landscape agar muat banyak kolom
    const doc = new jsPDF({ format: "a4", orientation: "landscape", unit: "mm" });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Laporan Rekapitulasi Penilaian KSP (ATP & MA)", 148, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateFormatted = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    doc.text(`SMK Negeri 1 Wadaslintang - Diunduh pada: ${dateFormatted}`, 148, 22, { align: "center" });

    const bodyData = currentLaporanData.map(grp => {
      return [
        grp.namaGuru,
        grp.mapel,
        grp.kelas,
        grp.topik,
        // ATP
        grp.ATP && grp.ATP.fileUrl ? grp.ATP.fileUrl : "-",
        "https://docs.google.com/spreadsheets/d/1zS7KRYNccQCK4fYcSq2CMpvrSzU3pBNQ/edit?usp=sharing&ouid=117533810449034814395&rtpof=true&sd=true",
        grp.ATP && grp.ATP.linkValidasi ? grp.ATP.linkValidasi : "-",
        grp.ATP ? grp.ATP.nilai : "-",
        grp.ATP ? getPredikat(grp.ATP.nilai) : "-",
        // MA
        grp.MA && grp.MA.fileUrl ? grp.MA.fileUrl : "-",
        "https://docs.google.com/spreadsheets/d/1Xug8Eao3IWNQAHFm09g8XZ_fBPObAJun/edit?usp=sharing&ouid=117533810449034814395&rtpof=true&sd=true",
        grp.MA && grp.MA.linkValidasi ? grp.MA.linkValidasi : "-",
        grp.MA ? grp.MA.nilai : "-",
        grp.MA ? getPredikat(grp.MA.nilai) : "-"
      ];
    });

    doc.autoTable({
      startY: 30,
      head: [[
        { content: 'Nama Guru', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
        { content: 'Mapel', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
        { content: 'Kelas', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
        { content: 'Topik', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'ATP', colSpan: 5, styles: { halign: 'center', fillColor: [237, 114, 76] } },
        { content: 'Modul Ajar', colSpan: 5, styles: { halign: 'center', fillColor: [59, 130, 246] } }
      ], [
        { content: 'Dokumen', styles: { halign: 'center' } },
        { content: 'Instrumen', styles: { halign: 'center' } },
        { content: 'Validasi', styles: { halign: 'center' } },
        { content: 'Nilai', styles: { halign: 'center' } },
        { content: 'Predikat', styles: { halign: 'center' } },
        { content: 'Dokumen', styles: { halign: 'center' } },
        { content: 'Instrumen', styles: { halign: 'center' } },
        { content: 'Validasi', styles: { halign: 'center' } },
        { content: 'Nilai', styles: { halign: 'center' } },
        { content: 'Predikat', styles: { halign: 'center' } }
      ]],
      body: bodyData,
      theme: 'grid',
      styles: { fontSize: 5, cellPadding: 1, textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.1, overflow: 'linebreak' },
      columnStyles: {
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
        9: { cellWidth: 25 },
        10: { cellWidth: 25 },
        11: { cellWidth: 25 },
      },
      headStyles: { textColor: [255,255,255], fontSize: 6 }
    });

    doc.save(`Laporan_Rekapitulasi_KSP_${dateFormatted.replace(/ /g, "_")}.pdf`);
    showToast("Laporan PDF berhasil diunduh!", "success");
  } catch (e) {
    showToast("Gagal membuat Laporan PDF: " + e.message, "error");
    console.error(e);
  }
}
