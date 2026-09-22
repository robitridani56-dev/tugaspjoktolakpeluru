/**
 * BACKEND KUIS TOLAK PELURU
 * ---------------------------------------------------------
 * Fungsi: menerima data hasil kuis (nama, kelas, skor, dll)
 * dari index.html lalu menyimpannya sebagai baris baru
 * di Google Spreadsheet.
 *
 * CARA SETUP:
 * 1. Buka https://sheet.new untuk membuat Google Spreadsheet baru.
 *    (Boleh diberi nama misalnya "Database Kuis Tolak Peluru")
 * 2. Di spreadsheet, buka menu Extensions > Apps Script.
 * 3. Hapus semua kode default, lalu tempel (paste) seluruh isi
 *    file Code.gs ini ke sana.
 * 4. Klik ikon Save (disket).
 * 5. Klik tombol Deploy > New deployment.
 *    - Klik ikon gerigi di sebelah "Select type", pilih "Web app".
 *    - Description: bebas, contoh "API Kuis Tolak Peluru".
 *    - Execute as: "Me".
 *    - Who has access: "Anyone".
 *    - Klik "Deploy", lalu izinkan akses (Authorize access) jika diminta.
 * 6. Salin URL Web App yang muncul (diakhiri /exec).
 * 7. Tempel URL tersebut ke variabel API_URL di file
 *    kuis-tolak-peluru.html (cari baris:
 *    const API_URL = "GANTI_DENGAN_URL_WEB_APP_APPS_SCRIPT";)
 * ---------------------------------------------------------
 */

const SHEET_NAME = "Hasil Kuis";

/**
 * Dipanggil otomatis saat frontend melakukan fetch POST.
 * Menyimpan satu baris hasil kuis: waktu, nama, kelas, skor, total, persentase.
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet_();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.waktu ? new Date(data.waktu) : new Date(),
      data.nama || "",
      data.kelas || "",
      data.skor != null ? data.skor : "",
      data.total != null ? data.total : "",
      data.persentase != null ? data.persentase + "%" : ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint GET sederhana untuk mengecek apakah Web App aktif
 * dan (opsional) mengambil rekap hasil kuis dalam format JSON.
 * Akses: <URL_WEB_APP>?action=list
 */
function doGet(e) {
  const action = e.parameter.action;

  if (action === "list") {
    const sheet = getOrCreateSheet_();
    const rows = sheet.getDataRange().getValues();
    const header = rows.shift();
    const list = rows.map(function (row) {
      const obj = {};
      header.forEach(function (key, i) { obj[key] = row[i]; });
      return obj;
    });
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", data: list }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "API Kuis Tolak Peluru aktif." }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Mengambil sheet "Hasil Kuis"; membuatnya beserta header jika belum ada.
 */
function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Waktu", "Nama", "Kelas", "Skor", "Total Soal", "Persentase"]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}
