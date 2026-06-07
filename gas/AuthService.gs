/**
 * ============================================================
 * KSP Digital - Auth Service
 * ============================================================
 * Handles assessor authentication.
 * Default credentials can be overridden via Script Properties:
 *   - ASESOR_USERNAME (default: 'asesor')
 *   - ASESOR_PASSWORD (default: 'kspwadaslintang')
 * ============================================================
 */

/**
 * Verifies assessor username and password against stored or default credentials.
 *
 * @param {string} username - The username submitted from the login form.
 * @param {string} password - The password submitted from the login form.
 * @return {Object} Result object with success flag and message.
 */
function verifyAssessorLogin(username, password) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var expectedUser = properties.getProperty('ASESOR_USERNAME') || 'asesor';
    var expectedPass = properties.getProperty('ASESOR_PASSWORD') || 'kspwadaslintang';
    
    if (username === expectedUser && password === expectedPass) {
      return { success: true, message: 'Login berhasil!' };
    } else {
      return { success: false, message: 'Username atau password salah.' };
    }
  } catch (err) {
    return { success: false, message: 'Gagal melakukan login: ' + err.toString() };
  }
}
