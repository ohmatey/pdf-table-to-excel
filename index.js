const fs = require('fs')
const path = require('path')
const pdf_table_extractor = require("pdf-table-extractor")
const XLSX = require('xlsx')

const outputDir = path.join(__dirname, 'output')

const ensureDirectoryExistence = filePath => {
  const dirname = path.dirname(filePath)
  
  if (fs.existsSync(dirname)) {
    return filePath
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

const success = (result, fileName) => {
  try {
    const rows = []
    const data = result.pageTables.map(table => {
      table.tables.map(d => {
        if (!isNaN(d[0])) {
          rows.push(d)
        }
      })
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(
      rows
    )

    XLSX.utils.book_append_sheet(wb, ws, fileName)

    const docName = fileName.split('.')[0] + '.xlsx'

    const writePath = path.join(outputDir, docName)

    XLSX.writeFile(wb, ensureDirectoryExistence(writePath))
  } catch (e) {
    console.log(e)
  }
}

const directoryPath = path.join(__dirname, 'pdfs')

fs.readdir(directoryPath, async (err, files) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err)
  }

  files.map(async pdf => {
    const filePath = path.join(__dirname, 'pdfs', pdf)

    pdf_table_extractor(filePath, result => success(result, pdf), console.log)
  })
})
