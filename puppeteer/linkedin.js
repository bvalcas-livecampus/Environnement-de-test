const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Helper function for logging with timestamp
function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// Helper function to wait for a specified time
const wait = (ms) => {
    log(`Waiting for ${ms}ms...`);
    return new Promise(resolve => setTimeout(() => {
        log(`Wait of ${ms}ms completed`);
        resolve();
    }, ms));
};

async function loadCookies() {
    try {
        log('Loading cookies from file...');
        const cookiesString = await fs.readFile(path.join(__dirname, 'www.linkedin.com.cookies.json'), 'utf8');
        log('Cookies loaded successfully');
        return JSON.parse(cookiesString);
    } catch (error) {
        log('❌ Error loading cookies: ' + error.message);
        return [];
    }
}

// Function to analyze posts content
async function analyzePosts(posts, limit = 5) {
    log(`Starting analysis of first ${limit} posts...`);
    const results = [];

    for (const post of posts.slice(0, limit)) {
        log('\n-----------------------------------');
        log('Analyzing new post...');
        const postAnalysis = {
            hasUser: false,
            hasHiringTag: false,
            hasAge: false,
            details: {}
        };

        // Test 1: Check user presence
        log('Testing user presence...');
        try {
            const userNameElement = await post.$('.update-components-actor__title > span > span > span:last-child');
            if (userNameElement) {
                const userName = await userNameElement.evaluate(el => el.textContent.trim());
                postAnalysis.hasUser = true;
                postAnalysis.details.userName = userName;
                log(`✅ User found: "${userName}"`);
            } else {
                log('❌ No user found for this post');
            }
        } catch (error) {
            log('❌ Error checking user presence: ' + error.message);
        }

        // Test 2: Check for #hiring mention
        log('Testing for #hiring hashtag...');
        try {
            const contentElement = await post.$('.update-components-text');
            if (contentElement) {
                const postContent = await contentElement.evaluate(el => el.textContent.trim());
                const hasHiringTag = postContent.toLowerCase().includes('#hiring');
                postAnalysis.hasHiringTag = hasHiringTag;
                postAnalysis.details.content = postContent;
                log(hasHiringTag ? '✅ #hiring hashtag found' : '❌ No #hiring hashtag found');
            } else {
                log('❌ No content found');
            }
        } catch (error) {
            log('❌ Error checking #hiring tag: ' + error.message);
        }

        // Test 3: Check post age
        log('Testing post age...');
        try {
            const ageElement = await post.$('.update-components-actor__sub-description');
            if (ageElement) {
                const postAge = await ageElement.evaluate(el => {
                    const text = el.textContent.trim();
                    const timePatterns = {
                        hours: /Il y a (\d+) heures?/,
                        days: /Il y a (\d+) jours?/,
                        weeks: /Il y a (\d+) semaines?/,
                        months: /Il y a (\d+) mois/,
                        years: /Il y a (\d+) ans?/
                    };
                    
                    for (const [unit, pattern] of Object.entries(timePatterns)) {
                        const match = text.match(pattern);
                        if (match) return match[0];
                    }
                    return text;
                });
                postAnalysis.hasAge = true;
                postAnalysis.details.age = postAge;
                log(`✅ Post age found: "${postAge}"`);
            } else {
                log('❌ No post age information found');
            }
        } catch (error) {
            log('❌ Error checking post age: ' + error.message);
        }

        // Summary of test results
        log('\nTest Results Summary:');
        log(`User Presence: ${postAnalysis.hasUser ? '✅ ' + postAnalysis.details.userName : '❌'}`);
        log(`#hiring Tag: ${postAnalysis.hasHiringTag ? '✅' : '❌'}`);
        log(`Age Info: ${postAnalysis.hasAge ? '✅ ' + postAnalysis.details.age : '❌'}`);
        log('-----------------------------------');

        results.push(postAnalysis);
    }

    // Overall summary
    const totalPosts = results.length;
    const summary = {
        totalPosts,
        postsWithUser: results.filter(p => p.hasUser).length,
        postsWithHiring: results.filter(p => p.hasHiringTag).length,
        postsWithAge: results.filter(p => p.hasAge).length
    };

    log('\nOverall Analysis Summary:');
    log(`Total Posts Analyzed: ${summary.totalPosts}`);
    log(`Posts with User: ${summary.postsWithUser}/${totalPosts}`);
    log(`Posts with #hiring: ${summary.postsWithHiring}/${totalPosts}`);
    log(`Posts with Age: ${summary.postsWithAge}/${totalPosts}`);

    return {
        posts: results,
        summary
    };
}

// Function to explore and save DOM structure
async function explorePostStructure(post) {
    const structure = {};
    
    async function getElementInfo(element) {
        const info = {};
        
        try {
            info.tagName = await element.evaluate(el => el.tagName.toLowerCase());
            info.className = await element.evaluate(el => el.className);
            info.id = await element.evaluate(el => el.id);
            info.textContent = await element.evaluate(el => el.textContent.trim().substring(0, 100) + (el.textContent.length > 100 ? '...' : ''));
            
            const children = await element.$$(':scope > *');
            if (children.length > 0) {
                info.children = [];
                for (const child of children) {
                    info.children.push(await getElementInfo(child));
                }
            }
        } catch (error) {
            log('Error getting element info: ' + error.message);
        }
        
        return info;
    }

    try {
        structure.postStructure = await getElementInfo(post);
        return structure;
    } catch (error) {
        log('Error exploring post structure: ' + error.message);
        return null;
    }
}

// Function to scroll and load more content
async function scrollAndLoadMore(page, maxScrolls = 3) {
    log('Starting scroll operation...');
    let previousHeight;
    let scrollCount = 0;
    
    while (scrollCount < maxScrolls) {
        scrollCount++;
        log(`Scroll attempt ${scrollCount}/${maxScrolls}`);
        
        // Get the current height
        previousHeight = await page.evaluate('document.body.scrollHeight');
        
        // Scroll to bottom
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        log('Scrolled to bottom');
        
        try {
            // Wait for height to change (new content to load)
            await page.waitForFunction(
                `document.body.scrollHeight > ${previousHeight}`,
                { timeout: 5000 }
            );
            log('New content loaded');
            
            // Wait for content to stabilize using our new wait function
            await wait(3000);
        } catch (error) {
            log('Height did not change, checking for "Show more" button...');
            try {
                const showMoreButton = await page.$('#ember934');
                if (showMoreButton) {
                    log('Found "Show more" button, clicking it...');
                    await showMoreButton.click();
                    await wait(3000); // Wait for content to load after clicking
                    continue;
                }
            } catch (buttonError) {
                log('No "Show more" button found or error clicking it');
            }
            log('No more new content to load or timeout reached');
            break;
        }
    }
    
    log('Scroll operation completed');
}

async function linkedinTest() {
    log('Starting LinkedIn test...');
    log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true
    });

    try {
        log('Creating new page...');
        const page = await browser.newPage();
        
        // Load cookies
        log('Loading and setting cookies...');
        const cookies = await loadCookies();
        await page.setCookie(...cookies);
        log(`Set ${cookies.length} cookies`);

        // Navigate to the search results page
        log('Navigating to LinkedIn search results...');
        await page.goto('https://www.linkedin.com/search/results/content/?keywords=développeurs%20web%20%23hiring&origin=GLOBAL_SEARCH_HEADER&sid=N0O', {
            timeout: 10000
        });
        log('Page loaded successfully');

        // Wait for posts to load
        log('Waiting for search results container...');
        await page.waitForSelector('li.artdeco-card.mb2');
        log('Search results container found');

        // Scroll to load more content
        await scrollAndLoadMore(page, 10);

        log('Fetching posts...');
        const posts = await page.$$('li.artdeco-card.mb2');
        log(`Found ${posts.length} posts in total`);
        // Check if files exist
        let analysisResults = [];
        let domStructure = null;

        try {
            // Try to read existing files
            await fs.access('linkedin_analysis_results.json');
            await fs.access('linkedin_dom_structure.json');
            log('Analysis files found');
        } catch (error) {
            // If files don't exist, explore DOM structure first
            log('Analysis files not found, exploring DOM structure...');
            domStructure = await explorePostStructure(posts[0]);
            await fs.writeFile('linkedin_dom_structure.json', JSON.stringify(domStructure, null, 2));
            log('DOM structure saved');
        }

        // Now analyze posts in either case
        log('Analyzing posts...');
        analysisResults = await analyzePosts(posts, 25);
        await fs.writeFile('linkedin_analysis_results.json', JSON.stringify(analysisResults, null, 2));
        log('Analysis results saved');

        log('Analysis completed successfully');

    } catch (error) {
        log('❌ Test failed with error: ' + error.message);
        console.error(error);
    } finally {
        log('Closing browser...');
        await browser.close();
        log('Test finished');
    }
}

// Run the test
log('Initializing LinkedIn test script...');
linkedinTest().catch(error => {
    log('❌ Fatal error in test execution: ' + error.message);
    console.error(error);
});
