const generateSlug = (title) => {
  const timestamp = Date.now().toString().slice(-4);
  return title.toLowerCase().replace(/[\s\W-]+/g, '-') + '-' + timestamp;
};

module.exports = generateSlug;