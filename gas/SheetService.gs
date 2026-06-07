/**
 * ============================================================
 * KSP Digital - Sheet Service
 * ============================================================
 * Handles all Google Spreadsheet operations:
 *   - Database initialization (Spreadsheet, Guru sheet, Submissions sheet)
 *   - Teacher data retrieval for dropdown population
 *   - Submission records read/write
 *   - Grading score updates
 * ============================================================
 */

// ---------------------------------------------------------------------------
// Database Initialization
// ---------------------------------------------------------------------------

/**
 * Gets or creates the default Google Spreadsheet named 'KSP_Digital_Database'.
 * Stores Spreadsheet ID in Script Properties for efficient subsequent lookups.
 *
 * @return {Spreadsheet} The active or newly created spreadsheet.
 */
function getOrCreateSpreadsheet() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    // Fail-safe for standalone scripts
  }
  
  if (!ss) {
    var properties = PropertiesService.getScriptProperties();
    var ssId = properties.getProperty('SPREADSHEET_ID');
    if (ssId) {
      try {
        ss = SpreadsheetApp.openById(ssId);
      } catch (e) {
        // Handle case if spreadsheet was deleted
        ss = null;
      }
    }
    
    if (!ss) {
      // Look for a spreadsheet with the name 'KSP_Digital_Database' in Drive
      var files = DriveApp.getFilesByName('KSP_Digital_Database');
      if (files.hasNext()) {
        ss = SpreadsheetApp.open(files.next());
      } else {
        ss = SpreadsheetApp.create('KSP_Digital_Database');
      }
      properties.setProperty('SPREADSHEET_ID', ss.getId());
    }
  }
  return ss;
}

/**
 * Gets or creates the 'Guru' sheet and populates it with sample teachers if empty.
 *
 * Schema: | Nama | Status | NIP |
 *
 * @return {Sheet} The Guru sheet instance.
 */
function getOrCreateGuruSheet() {
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName('Guru');
  
  if (!sheet) {
    sheet = ss.insertSheet('Guru');
    sheet.appendRow(['Nama', 'Status', 'NIP', 'Mata Pelajaran', 'Kelas']);
    
    // Format headers
    var headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#ED724C');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    
    // Populate sample data
    sheet.appendRow(['Drs. Eko Prasetyo, M.T.', 'ASN', '197410222003121002', 'Matematika, Fisika', 'X, XI']);
    sheet.appendRow(['Siti Rahmawati, S.Pd.', 'Non ASN', '-', 'Bahasa Indonesia', 'XII']);
    sheet.appendRow(['Budi Santoso, S.Kom.', 'ASN', '198506152011011003', 'Informatika', 'X']);
  }
  return sheet;
}

/**
 * Gets or creates the 'Submissions' sheet and sets up the 16-column header row.
 *
 * Schema:
 *   1. Timestamp  2. Nama Guru  3. Status Kepegawaian  4. NIP
 *   5. Jenis Dokumen  6. Mata Pelajaran  7. Kelas  8. Rombel
 *   9. Topik / Keterangan  10. File Name  11. File URL  12. File ID
 *   13. Nilai  14. Poin Penilaian (JSON)  15. Catatan Penilai  16. Status Penilaian
 *
 * @return {Sheet} The Submissions sheet instance.
 */
function getOrCreateSubmissionsSheet() {
  var ss = getOrCreateSpreadsheet();
  var sheet = ss.getSheetByName('Submissions');
  
  if (!sheet) {
    sheet = ss.insertSheet('Submissions');
    
    sheet.appendRow([
      'Timestamp',
      'Nama Guru',
      'Status Kepegawaian',
      'NIP',
      'Jenis Dokumen',
      'Mata Pelajaran',
      'Kelas',
      'Rombel',
      'Topik / Keterangan',
      'File Name',
      'File URL',
      'File ID',
      'Nilai',
      'Poin Penilaian',
      'Catatan Penilai',
      'Status Penilaian',
      'Link Validasi'
    ]);
    
    // Format headers with primary color style
    var headerRange = sheet.getRange(1, 1, 1, 17);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#ED724C');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// Data Retrieval
// ---------------------------------------------------------------------------

/**
 * Retrieves the list of teachers from the Guru sheet for the dropdown selection.
 * Returns an array of teacher objects sorted alphabetically by name.
 *
 * @return {Array<{nama: string, status: string, nip: string}>} List of teacher records.
 */
function getTeachers() {
  try {
    var sheet = getOrCreateGuruSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    var teachers = [];
    for (var i = 0; i < data.length; i++) {
      teachers.push({
        nama: data[i][0] || '',
        status: data[i][1] || '',
        nip: data[i][2] || '',
        mapel: data[i][3] || '',
        kelas: data[i][4] || ''
      });
    }
    
    teachers.sort(function(a, b) {
      return a.nama.localeCompare(b.nama);
    });
    
    return teachers;
  } catch (err) {
    Logger.log('Error in getTeachers: ' + err.toString());
    return [];
  }
}

/**
 * Retrieves list of all submitted files and grading records from the Submissions sheet.
 * Results are sorted descending by timestamp (newest first).
 *
 * @return {Array<Object>} List of submission record objects.
 */
function getSubmissions() {
  try {
    var sheet = getOrCreateSubmissionsSheet();
    var lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return [];
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 17).getValues();
    var submissions = [];
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      
      submissions.push({
        timestamp: row[0] ? Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : '',
        namaGuru: row[1],
        statusKepegawaian: row[2],
        nip: row[3],
        jenisDokumen: row[4],
        mapel: row[5],
        kelas: row[6],
        rombel: row[7],
        topik: row[8],
        filename: row[9],
        fileUrl: row[10],
        fileId: row[11],
        nilai: row[12] !== '' ? Number(row[12]) : '',
        poinPenilaian: row[13] || '',
        catatan: row[14],
        status: row[15],
        linkValidasi: row[16] || ''
      });
    }
    
    submissions.sort(function(a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    return submissions;
  } catch (err) {
    Logger.log('Error in getSubmissions: ' + err.toString());
    return [];
  }
}

// ---------------------------------------------------------------------------
// Data Mutation
// ---------------------------------------------------------------------------

/**
 * Updates score, feedback, and status of a specific document submission.
 * Locates the row by matching the unique File ID (Column 12).
 *
 * @param {string} fileId   The unique Google Drive File ID of the submission.
 * @param {number} score    The grade value (0-100), computed as average of rubric criteria.
 * @param {string} feedback The assessor's written feedback.
 * @param {string} status   The status of the assessment (e.g. 'Sudah Dinilai').
 * @param {string} points   Stringified JSON containing breakdown scores per rubric criterion.
 * @param {string} pdfUrl   The URL of the graded rubric PDF stored in Google Drive.
 * @return {Object} Result object with success flag and message.
 */
function gradeSubmission(fileId, score, feedback, status, points, pdfUrl) {
  try {
    var sheet = getOrCreateSubmissionsSheet();
    var lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, message: 'Tidak ada data di database' };
    }
    
    // Read File IDs (Column L / Column 12) to locate the exact row index
    var range = sheet.getRange(2, 12, lastRow - 1, 1);
    var fileIds = range.getValues();
    var rowIndex = -1;
    
    for (var i = 0; i < fileIds.length; i++) {
      if (fileIds[i][0] === fileId) {
        rowIndex = i + 2;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: 'Dokumen tidak ditemukan di database' };
    }
    
    status = status || 'Sudah Dinilai';
    points = points || '';
    pdfUrl = pdfUrl || '';
    
    // Update columns 13-17: Nilai, Poin Penilaian, Catatan Penilai, Status Penilaian, Link Validasi
    sheet.getRange(rowIndex, 13).setValue(score);
    sheet.getRange(rowIndex, 14).setValue(points);
    sheet.getRange(rowIndex, 15).setValue(feedback);
    sheet.getRange(rowIndex, 16).setValue(status);
    sheet.getRange(rowIndex, 17).setValue(pdfUrl);
    
    return {
      success: true,
      message: 'Penilaian berhasil disimpan!'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Gagal menyimpan penilaian: ' + err.toString()
    };
  }
}
