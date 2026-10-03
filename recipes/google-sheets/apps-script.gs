// LearnFloo → Google Sheets. Paste in Extensions → Apps Script, deploy as a web app,
// then use the web app URL + ?token=TOKEN as the webhook address in LearnFloo.
const TOKEN = 'change-me-to-a-long-random-string'

function doPost(e) {
  if (!e || !e.parameter || e.parameter.token !== TOKEN) {
    return ContentService.createTextOutput('forbidden')
  }
  const msg = JSON.parse(e.postData.contents)
  const d = msg.data || {}
  const user = d.user || (d.registration && d.registration.user) || {}
  const about =
    (d.session && d.session.title) ||
    (d.event && d.event.title) ||
    (d.course && d.course.title) ||
    (d.membership && (d.membership.amountCents / 100) + ' ' + String(d.membership.currency || '').toUpperCase()) ||
    ''
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
  if (sheet.getLastRow() === 0) sheet.appendRow(['Date', 'Event', 'Space', 'Name', 'E-mail', 'About'])
  sheet.appendRow([msg.createdAt, msg.event, msg.space && msg.space.slug, user.name || '', user.email || '', about])
  return ContentService.createTextOutput('ok')
}
