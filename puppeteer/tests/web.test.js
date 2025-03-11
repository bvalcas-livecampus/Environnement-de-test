const puppeteer = require('puppeteer')
// Test sur le site Le monde
describe('Test d\'un site au format Desktop', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false })
        page = await browser.newPage()
        const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        await page.setUserAgent(userAgent);
        await page.setViewport({ width: 1280, height: 800 });
    })

    afterAll(async () => {
        await browser.close()
    })

    test('Visite d\'un site web : Le monde', async () => {
        await page.goto('https://www.lemonde.fr')
        const title = await page.title()
        expect(title).toBe('Le Monde.fr - Actualités et Infos en France et dans le monde')
    })

    test('Test connexion Le monde', async () => {
        await page.goto('https://secure.lemonde.fr/sfuser/connexion')
        expect(await page.title()).toBe('Le Monde - Se connecter')
        await page.type("#email", 'wamipi2868@makroyal.com')
        await page.type("#password", 'Azerty@78')
        await page.click("#submit-button")
        await page.waitForNavigation()

        expect(page.url()).toContain('?random')
    })
})

describe('Test d\'un site au format Mobile', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false })
        page = await browser.newPage()
        const userAgent = "Mozilla/5.0 (Linux; Android 14; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36"
        // UserAgent S21 : https://whatmyuseragent.com/device/sa/samsung-galaxy-s21-5g
        await page.setUserAgent(userAgent)
        await page.setViewport({width: 360, height:800})
        // Taille S21 - ViewPort : https://blisk.io/devices/details/galaxy-s21
    })

    afterAll(async () => {
        await browser.close()
    })

    test('Visite d\'un site web : Le monde', async () => {
        await page.goto('https://www.lemonde.fr')
        const title = await page.title()
        expect(title).toBe('Le Monde.fr - Actualités et Infos en France et dans le monde')
    })

    test('Test connexion Le monde', async () => {
        await page.goto('https://secure.lemonde.fr/sfuser/connexion')
        expect(await page.title()).toBe('Le Monde - Se connecter')
        await page.type("#email", 'wamipi2868@makroyal.com')
        await page.type("#password", 'Azerty@78')
        await page.click("#submit-button")
        await page.waitForNavigation()

        expect(page.url()).toContain('?random')
    })
})