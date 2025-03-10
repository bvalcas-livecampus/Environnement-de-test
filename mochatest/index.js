
const {additionarray, moyenne} = require('./function')

const getNotesData = () => fetch('http://localhost:3000/data')
        .then(res => {
            if(!res.ok){
                throw new Error('JSON ERROR !')
            }
            return res.json()
        })
        .then(data => {
            if(!data) throw new Error('DATA ERROR !')
            else return data.notes
        })
        .catch(err => {
            console.error(err)
            return false
        })


const getMoyenne = async () => {
    const notes = await getNotesData()
    const total = notes ?additionarray(notes) :false
    return total ?moyenne(total, notes.length) :false
}
module.exports = getMoyenne