function extractPublicId(imageUrl, folder = 'products') {
    const parts = imageUrl.split('/');
    const fileNameWithExtension = parts[parts.length - 1];
    const fileNameWithoutExtension = fileNameWithExtension.split('.')[0];
    return `${folder}/${fileNameWithoutExtension}`;
}

module.exports = {extractPublicId};
