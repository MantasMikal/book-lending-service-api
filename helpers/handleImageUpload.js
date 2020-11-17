const mime = require('mime-types')
const fs = require('fs-extra')
const { checkFileExists } = require('./checkFileExists')

/**
 * Uploads images to the server and returns paths to images
 * Checks if the image already exists and returns the same path if so
 * @param {Object} files object of files
 * @returns {Array} array of filenames uploaded to 'uploads/' directory
 */
const handleImageUpload = async (files) => {
  if(!files) return
  const links = []
  const images = Object.values(files)

  for(let i = 0; i < images.length; i++) {
    const {type, path, name} = images[i]
    if(await checkFileExists(`uploads/${name}`)) {
      links.push(name) // return the same file
    } else {
      const formattedFileName = `${Date.now()}.${mime.extension(type)}`
      await fs.copy(path, `uploads/${formattedFileName}`)
      links.push(formattedFileName)
    }
  }

  return links
}

exports.handleImageUpload = handleImageUpload