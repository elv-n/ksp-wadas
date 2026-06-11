/**
 * ============================================================
 * KSP Digital - Main Entry Point
 * ============================================================
 * Web application entry point and API router.
 * All server-side logic is organized across service modules:
 *   - SheetService.gs   → Spreadsheet CRUD operations
 *   - DriveService.gs   → File upload & Drive folder management
 *   - AuthService.gs    → Assessor authentication
 * ============================================================
 */

/**
 * Web App GET entry point.
 * When the frontend is hosted on Vercel, doGet is not used for serving HTML.
 * Instead, doGet can serve as a health-check endpoint.
 *
 * @param {Object} e - The event parameter from the HTTP GET request.
 * @return {TextOutput} JSON health-check response.
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'KSP Digital API is running.' })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Web App POST entry point.
 * Routes incoming API requests from the Vercel-hosted frontend
 * to the appropriate server-side function.
 *
 * Expected POST body (JSON string):
 *   { "action": "functionName", "data": { ... } }
 *
 * @param {Object} e - The event parameter containing postData.
 * @return {TextOutput} JSON response from the invoked function.
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var data = payload.data || {};
    var result;

    switch (action) {
      case 'getTeachers':
        result = getTeachers();
        break;

      case 'getSubmissions':
        result = getSubmissions();
        break;

      case 'uploadFile':
        result = uploadFile(data);
        break;

      case 'saveSubmissionRecords':
        result = saveSubmissionRecords(data);
        break;

      case 'gradeSubmission':
        result = gradeSubmission(
          data.fileId,
          data.score,
          data.feedback,
          data.status,
          data.points,
          data.pdfUrl
        );
        break;

      case 'uploadGradedRubric':
        result = uploadGradedRubric(data);
        break;

      case 'verifyAssessorLogin':
        result = verifyAssessorLogin(data.username, data.password);
        break;

      default:
        result = { success: false, message: 'Action tidak dikenali: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: 'Server error: ' + err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
