const puppeteer = require('puppeteer')

const autoScroll = async page => {
    let previousHeight
    while(true){
        previousHeight = await page.evaluate('document.body.scrollHeight')
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
        await new Promise(resolve => setTimeout(resolve,2000))
        let newHeight = await page.evaluate('document.body.scrollHeight')
        console.log("Comparing : ", newHeight, " And : ",previousHeight)
        if(newHeight === previousHeight) break
    }
}

const scrapEntreprise = async (url) => {
    try{
        const browser = await puppeteer.launch({
            headless: 'false',
        })
        const page = await browser.newPage()
        
        const userAgent = "Mozilla/5.0 (Linux; Android 14; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36"
        // UserAgent S21 : https://whatmyuseragent.com/device/sa/samsung-galaxy-s21-5g
        await page.setUserAgent(userAgent)
        await page.setViewport({width: 360, height:800})
        // Taille S21 - ViewPort : https://blisk.io/devices/details/galaxy-s21
        
        /*
        const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        await page.setUserAgent(userAgent);
        await page.setViewport({ width: 1280, height: 800 });
        */
        console.log("Page Set")
        const acceptCookies = async (page) => {
            const acceptButtonSelector = '#didomi-notice-agree-button'

            await new Promise(resolve => setTimeout(resolve,3000))

            try {
                await page.waitForSelector(acceptButtonSelector, { visible: true, timeout: 5000 })

                await page.click(acceptButtonSelector)

                await new Promise(resolve => setTimeout(resolve,3000))
                const stillExists = await page.evaluate(selector => document.querySelector(selector) !== null, acceptButtonSelector)
                return !stillExists
            }
            catch(e){
                console.error(e)
                return true
            }
        }
        console.log("Chargement de l'url")
        await page.goto(url, { waitUntil : 'domcontentloaded'})
        console.log("Url chargée")
        const cookieStatut = await acceptCookies(page)
        if(!cookieStatut) throw new Error('Cookie Error')
        console.log("Cookie Statut is : ", cookieStatut)
        await autoScroll(page)
        console.log("Scroll finished")
        await page.evaluate(() => {
            document.querySelectorAll('button.btn_tel').forEach(btn => btn.click())
        })

        await new Promise(resolve => setTimeout(resolve,2000))
        console.log("Telephone phase finished")

        await page.waitForSelector('.bi-generic', { timeout : 10000 })
        const foundItems = await page.$$('.bi-generic')
        console.log("Recherche item achevée")
        if(foundItems.length === 0) throw new Error('0 Items found')
        console.log("Nombre items trouvés : ", foundItems.length)
        
        const items = await page.evaluate(() => {
            const data = [];
            const errors = [];
            
                document.querySelectorAll('.bi-generic').forEach(item => {
                    const name = item.querySelector('.bi-denomination h3')?.innerText.trim() || "Nom inconnu";
                    const linkElement = item.querySelector('a.bi-denomination');
                    let link = linkElement ? linkElement.getAttribute('href') : null;
            
                    if (link && (link.startsWith("https://www.pagesjaunes.fr/annuaire/") || link == "#")) {
                        errors.push(`--- ${name} non valide à cause du lien : ${link} ---`);
                        return
                    } else if (link) {
                        link = link.startsWith("https://www.pagesjaunes.fr/pros") ? link : `https://www.pagesjaunes.fr${link}`;
                        link = link === 'https://www.pagesjaunes.fr#' ? null : link;
                    }
            
                    const opposition = item.querySelector('div.number-contact span.screenreader')?.innerText.trim() || null
                    if(opposition && opposition.startsWith('Opposé')){
                        errors.push(`--- ${name} Opposé au démarchage téléphonique ---`);
                        return
                    }
                    // Récupération des numéros de téléphone
                    const phoneNumbers = Array.from(item.querySelectorAll('.number-contact span'))
                        .map(span => span.innerText.trim())
                        .filter(text => /^[0-9\s\+\-\.]+$/.test(text)) // Ne garde que les vrais numéros
                        .join(', ') || null;
                    if (!phoneNumbers) {
                        errors.push(`--- ${name} non valide à cause du numéro de téléphone : ${phoneNumbers} ---`);
                    }
            
                    if (phoneNumbers && link) {
                        data.push({ name, phoneNumbers, link });
                    }
                });
            
                return { data, errors };
        })
        console.log("fin de la récupération des noms")
        if(items.data.length === 0) throw new Error('0 Name found')
        if(items.errors.length !== 0){
            items.errors.forEach(e => console.error(e))
        }
        console.log("Nombre Noms trouvés : ", items.data.length)
        
        console.log(items.data)
    }
    catch(e){
        console.error(e)
        return
    }
}

scrapEntreprise("https://www.pagesjaunes.fr/annuaire/chercherlespros?quoiqui=domiciliation%20entreprise&ou=Ile-de-France&idOu=R11&page=3")