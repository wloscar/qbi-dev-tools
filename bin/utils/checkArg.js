module.exports = (condition, msg) => {
  if (!condition) {
    console.error(msg);
    process.exit();
  }
};
