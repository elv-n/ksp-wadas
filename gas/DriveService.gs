/**
 * ============================================================
 * KSP Digital - Drive Service
 * ============================================================
 * Handles Google Drive operations:
 *   - Upload folder management
 *   - Base64 PDF file decoding, saving, and sharing
 *   - File metadata recording to the Submissions sheet
 * ============================================================
 */

/**
 * Gets or creates the 'KSP_Digital_Uploads' folder in Google Drive.
 *
 * @return {Folder} The upload destination folder.
 */
function getOrCreateFolder() {
  var folderName = 'KSP_Digital_Uploads';
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    var folder = DriveApp.createFolder(folderName);
    return folder;
  }
}

/**
 * Saves a base64-encoded PDF file into Google Drive and records its
 * metadata in the Submissions sheet.
 *
 * File naming pattern: NAMA_MAPEL_KELAS_ROMBEL.pdf
 * File sharing: Set to "Anyone with link can view" for assessor access.
 *
 * @param {Object} data - Input object from the upload form containing:
 *   - {string} namaGuru          Teacher's full name.
 *   - {string} statusKepegawaian  Employment status (ASN / Non ASN).
 *   - {string} nip               National employee ID.
 *   - {string} jenisDokumen      Document type ('Modul Ajar' or 'ATP').
 *   - {string} mapel             Subject name.
 *   - {string} kelas             Class level (X / XI / XII).
 *   - {string} rombel            Study group name.
 *   - {string} topik             Topic / description.
 *   - {string} base64File        Base64-encoded PDF binary data.
 * @return {Object} Result object with success flag, message, fileUrl, and fileName.
 */
function uploadFile(data) {
  try {
    if (!data.base64File) {
      return { success: false, message: 'File tidak ditemukan' };
    }
    
    // Format filename pattern: JENIS_NAMA_MAPEL_KELAS_ROMBEL
    var cleanJenis = data.jenisDokumen.replace(/[\\\/:*?"<>| ]/g, '_');
    var cleanNama = data.namaGuru.replace(/[\\\/:*?"<>| ]/g, '_');
    var cleanMapel = data.mapel.replace(/[\\\/:*?"<>| ]/g, '_');
    var cleanKelasCombo = (data.kelas + '_' + data.rombel).replace(/[\\\/:*?"<>| ]/g, '_');
    var filename = cleanJenis + '_' + cleanNama + '_' + cleanMapel + '_' + cleanKelasCombo + '.pdf';
    
    // Create folder and save file
    var folder = getOrCreateFolder();
    var fileBytes = Utilities.base64Decode(data.base64File);
    var blob = Utilities.newBlob(fileBytes, 'application/pdf', filename);
    var file = folder.createFile(blob);
    
    // Configure file sharing so assessors can open the links
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var fileUrl = file.getUrl();
    var fileId = file.getId();
    
    return {
      success: true,
      message: 'File berhasil diunggah dengan nama ' + filename,
      fileUrl: fileUrl,
      fileName: filename,
      fileId: fileId
    };
  } catch (err) {
    return {
      success: false,
      message: 'Gagal mengunggah file: ' + err.toString()
    };
  }
}

/**
 * Saves a base64-encoded PDF graded rubric into Google Drive.
 * Does NOT create a new row in Submissions sheet. Returns the URL for updating existing row.
 *
 * @param {Object} data - Input object containing:
 *   - {string} filename          Desired file name.
 *   - {string} base64File        Base64-encoded PDF binary data.
 * @return {Object} Result object with success flag, message, fileUrl.
 */
function uploadGradedRubric(data) {
  try {
    if (!data.base64File) {
      return { success: false, message: 'File PDF kosong' };
    }
    
    var folder = getOrCreateFolder();
    var fileBytes = Utilities.base64Decode(data.base64File);
    var blob = Utilities.newBlob(fileBytes, 'application/pdf', data.filename);
    
    // Cari dan hapus file lama dengan nama yang sama (opsional agar tidak menumpuk)
    var existingFiles = folder.getFilesByName(data.filename);
    while (existingFiles.hasNext()) {
      var oldFile = existingFiles.next();
      oldFile.setTrashed(true);
    }
    
    var file = folder.createFile(blob);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      success: true,
      message: 'File rubrik berhasil diunggah',
      fileUrl: file.getUrl()
    };
  } catch (err) {
    return {
      success: false,
      message: 'Gagal mengunggah rubrik: ' + err.toString()
    };
  }
}
