const addition = require('./addition')

const additionarray = (array) => {
    if(!Array.isArray(array) && !isNaN(array)) return array
    else if(!Array.isArray(array)) return false
    else return array.reduce(addition, 0)
}

module.exports = additionarray