/**
 * ============================================================
 * KSP Digital - API Service Layer
 * ============================================================
 * Abstracts communication with the Google Apps Script backend.
 *
 * In PRODUCTION mode: sends fetch() requests to the deployed
 * GAS Web App URL (doPost endpoint).
 *
 * In MOCK mode (localhost/file://): uses browser localStorage
 * for offline development and testing.
 *
 * CONFIGURATION: Set GAS_WEB_APP_URL below after deploying
 * your Google Apps Script backend.
 * ============================================================
 */

// ─── Configuration ──────────────────────────────────────────
// Replace this with your deployed Google Apps Script Web App URL
// Example: "https://script.google.com/macros/s/AKfycb.../exec"
const GAS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxDrGToTP2WNUYyfg0km6n9w1ixdJoiiDXI7IQND9Qmr0n0642cge6uqaAAMGFc9fu5/exec";

// ─── Environment Detection ──────────────────────────────────
function isRunningLocally() {
  // Mock mode if no GAS URL is configured, or opened via file://
  return !GAS_WEB_APP_URL || window.location.protocol === "file:";
}

// ─── API Communication ──────────────────────────────────────

/**
 * Sends a POST request to the GAS Web App doPost endpoint.
 * Uses text/plain content-type to avoid CORS preflight issues.
 *
 * @param {string} action   - The server-side function name to invoke.
 * @param {Object} data     - The payload to send.
 * @returns {Promise<Object>} The parsed JSON response.
 */
async function callGasAPI(action, data = {}) {
  const response = await fetch(GAS_WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, data }),
    redirect: "follow",
  });

  // GAS may redirect; follow it and parse the final response
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("API response parse error:", text);
    throw new Error("Respons server tidak valid.");
  }
}

// ─── Public API Methods ─────────────────────────────────────

const API = {
  /**
   * Fetches list of teachers from the Guru sheet.
   * @returns {Promise<Array>}
   */
  async getTeachers() {
    if (isRunningLocally()) {
      return MockService.getTeachers();
    }
    return await callGasAPI("getTeachers");
  },

  /**
   * Fetches all submission records.
   * @returns {Promise<Array>}
   */
  async getSubmissions() {
    if (isRunningLocally()) {
      return MockService.getSubmissions();
    }
    return await callGasAPI("getSubmissions");
  },

  /**
   * Uploads a document (base64 PDF) to Google Drive.
   * @param {Object} payload - Form data including base64File.
   * @returns {Promise<Object>}
   */
  async uploadFile(payload) {
    if (isRunningLocally()) {
      return MockService.uploadFile(payload);
    }
    return await callGasAPI("uploadFile", payload);
  },

  /**
   * Saves submission records to Google Sheets.
   * @param {Object} payload - Data containing records array.
   * @returns {Promise<Object>}
   */
  async saveSubmissionRecords(payload) {
    if (isRunningLocally()) {
      return MockService.saveSubmissionRecords(payload);
    }
    return await callGasAPI("saveSubmissionRecords", payload);
  },

  /**
   * Saves grading scores for a submission.
   * @param {string} fileId
   * @param {number} score
   * @param {string} feedback
   * @param {string} status
   * @param {string} pointsJson - Stringified criteria breakdown.
   * @param {string} pdfUrl - URL of generated PDF.
   * @returns {Promise<Object>}
   */
  async gradeSubmission(fileId, score, feedback, status, pointsJson, pdfUrl) {
    if (isRunningLocally()) {
      return MockService.gradeSubmission(fileId, score, feedback, status, pointsJson, pdfUrl);
    }
    return await callGasAPI("gradeSubmission", { fileId, score, feedback, status, points: pointsJson, pdfUrl });
  },

  /**
   * Uploads generated rubric PDF.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async uploadGradedRubric(data) {
    if (isRunningLocally()) {
      return MockService.uploadGradedRubric(data);
    }
    return await callGasAPI("uploadGradedRubric", data);
  },

  /**
   * Verifies assessor login credentials.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>}
   */
  async verifyLogin(username, password) {
    if (isRunningLocally()) {
      return MockService.verifyLogin(username, password);
    }
    return await callGasAPI("verifyAssessorLogin", { username, password });
  },
};

// ─── Mock Service (localStorage-based offline simulator) ────

const MockService = {
  _STORAGE_KEY: "ksp_mock_submissions",

  _initSampleData() {
    if (!localStorage.getItem(this._STORAGE_KEY)) {
      const sampleData = [
        {
          timestamp: "2026-06-07 09:30:15",
          namaGuru: "Drs. Eko Prasetyo, M.T.",
          statusKepegawaian: "ASN",
          nip: "197410222003121002",
          jenisDokumen: "MA",
          mapel: "Teknik Jaringan",
          kelas: "XII",
          rombel: "TKJ B",
          topik: "Keamanan Jaringan Komputer dan Firewall",
          filename: "Eko_Prasetyo_Teknik_Jaringan_XII_TKJ_B.pdf",
          fileUrl: "https://drive.google.com/open?id=1exampleID101",
          fileId: "mock-id-1",
          nilai: 85,
          poinPenilaian: JSON.stringify({
            tujuan_pembelajaran: 90,
            langkah_pembelajaran: 85,
            rencana_asesmen: 80,
            media_sumber: 85,
          }),
          catatan: "Rencana modul terperinci, aspek asesmen sumatif sudah sangat baik.",
          status: "Sudah Dinilai",
        },
        {
          timestamp: "2026-06-07 08:14:02",
          namaGuru: "Siti Rahmawati, S.Pd.",
          statusKepegawaian: "Non ASN",
          nip: "-",
          jenisDokumen: "MA",
          mapel: "Bahasa Inggris",
          kelas: "X",
          rombel: "2",
          topik: "Narrative Text and Speaking Comprehension",
          filename: "Siti_Rahmawati_Bahasa_Inggris_X_2.pdf",
          fileUrl: "https://drive.google.com/open?id=1exampleID102",
          fileId: "mock-id-2",
          nilai: "",
          poinPenilaian: "",
          catatan: "",
          status: "Belum Dinilai",
        },
        {
          timestamp: "2026-06-06 14:22:10",
          namaGuru: "Budi Santoso, S.Kom.",
          statusKepegawaian: "ASN",
          nip: "198506152011011003",
          jenisDokumen: "ATP",
          mapel: "Informatika",
          kelas: "X",
          rombel: "RPL A",
          topik: "Alur Algoritma Pemrograman dan Pseudocode",
          filename: "Budi_Santoso_Informatika_X_RPL_A.pdf",
          fileUrl: "https://drive.google.com/open?id=1exampleID103",
          fileId: "mock-id-3",
          nilai: 80,
          poinPenilaian: JSON.stringify({
            analisis_cp: 85,
            alur_logis: 80,
            keterkaitan_kompetensi: 75,
            alokasi_waktu: 80,
          }),
          catatan: "Pembagian alokasi waktu per bab logis dan terstruktur.",
          status: "Sudah Dinilai",
        },
      ];
      localStorage.setItem(this._STORAGE_KEY, JSON.stringify(sampleData));
    }
  },

  getTeachers() {
    return [
      { nama: "Drs. Eko Prasetyo, M.T.", status: "ASN", nip: "197410222003121002" },
      { nama: "Siti Rahmawati, S.Pd.", status: "Non ASN", nip: "-" },
      { nama: "Budi Santoso, S.Kom.", status: "ASN", nip: "198506152011011003" },
      { nama: "Dra. Herlina, M.Pd.", status: "ASN", nip: "196911051994032001" },
      { nama: "Ahmad Fauzi, S.Si.", status: "Non ASN", nip: "-" },
    ];
  },

  getSubmissions() {
    this._initSampleData();
    return JSON.parse(localStorage.getItem(this._STORAGE_KEY) || "[]");
  },

  uploadFile(payload) {
    this._initSampleData();
    const localData = JSON.parse(localStorage.getItem(this._STORAGE_KEY) || "[]");

    const cleanJenis = payload.jenisDokumen.replace(/[\\\/:*?"<>| ]/g, "_");
    const cleanNama = payload.namaGuru.replace(/[\\\/:*?"<>| ]/g, "_");
    const cleanMapel = payload.mapel.replace(/[\\\/:*?"<>| ]/g, "_");
    const cleanKelasCombo = (payload.kelas + "_" + payload.rombel).replace(/[\\\/:*?"<>| ]/g, "_");
    const filename = `${cleanJenis}_${cleanNama}_${cleanMapel}_${cleanKelasCombo}.pdf`;
    const fileId = "mock-id-" + Math.random().toString(36).substring(2, 9);

    return {
      success: true,
      message: "Dokumen berhasil diunggah ke Drive (Mock Mode)!",
      fileUrl: "https://example.com/mock-drive-viewer/" + fileId,
      fileName: filename,
      fileId: fileId,
    };
  },

  saveSubmissionRecords(payload) {
    this._initSampleData();
    const localData = JSON.parse(localStorage.getItem(this._STORAGE_KEY) || "[]");

    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    payload.records.forEach((r) => {
      localData.unshift({
        timestamp: timestamp,
        namaGuru: r.namaGuru,
        statusKepegawaian: r.statusKepegawaian,
        nip: r.nip,
        jenisDokumen: r.jenisDokumen,
        mapel: r.mapel,
        kelas: r.kelas,
        rombel: r.rombel,
        topik: r.topik,
        filename: r.fileName,
        fileUrl: r.fileUrl,
        fileId: r.fileId,
        nilai: "",
        poinPenilaian: "",
        catatan: "",
        status: "Belum Dinilai",
      });
    });

    localStorage.setItem(this._STORAGE_KEY, JSON.stringify(localData));

    return {
      success: true,
      message: "Data berhasil disimpan (Mock Mode)!",
    };
  },

  gradeSubmission(fileId, score, feedback, status, pointsJson, pdfUrl) {
    const localData = JSON.parse(localStorage.getItem(this._STORAGE_KEY) || "[]");
    const idx = localData.findIndex((item) => item.fileId === fileId);

    if (idx !== -1) {
      localData[idx].nilai = score;
      localData[idx].poinPenilaian = pointsJson;
      localData[idx].catatan = feedback;
      localData[idx].status = status;
      if (pdfUrl) {
        localData[idx].linkValidasi = pdfUrl;
      }
      localStorage.setItem(this._STORAGE_KEY, JSON.stringify(localData));
      return { success: true, message: "Penilaian berhasil disimpan (Mock Mode)!" };
    }
    return { success: false, message: "Dokumen tidak ditemukan." };
  },

  uploadGradedRubric(data) {
    return {
      success: true,
      message: "Rubrik berhasil diunggah (Mock)",
      fileUrl: "https://example.com/mock-rubric-validasi/" + Math.random().toString(36).substring(2, 9),
    };
  },

  verifyLogin(username, password) {
    if ((username === "admin" && password === "admin") || (username === "asesor" && password === "kspwadaslintang")) {
      return { success: true, message: "Login berhasil!" };
    }
    return { success: false, message: "Username atau Password salah!" };
  },
};
