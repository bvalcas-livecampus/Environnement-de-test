const moyenne = (total, length) => {
   return isNaN(total) || isNaN(length)
   ? 0
   : total/length
}

module.exports = moyenne