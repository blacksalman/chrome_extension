const btn = document.querySelector('.scrapUserInformationBtn');
const container = document.querySelector('#container');

btn.addEventListener('click', async() => {

    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: pickColor,
    }, async (injectionResults) => {

        const [data] = injectionResults;
        if (data.result) {
            const userName = data.result.name.replace(/ /g,"_");
            var rawData = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.result));
            container.innerHTML = `<a href="data:${rawData}" download="${userName}.json">Download JSON File</a>`;
        } 
    });
});

async function pickColor() {
    const userProfile = {};
    const getUserSectionsInformations = (sectionsData) => {
        const rawUserInfo = []
        sectionsData.forEach(data => {
            rawUserInfo.push(data?.innerText)
        });
        return rawUserInfo.map(userData => {
            return [...new Set(userData.split('\n'))]
        });
    }
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    const getUserContactInformations = () => {
        userContact = {};
        try{
            const userLinkedinProfileLink = document.querySelector("section.ci-vanity-url a");
            userContact['link'] = userLinkedinProfileLink?.attributes?.href?.value;
            const userPhone = document.querySelector("section.ci-phone span");
            userContact['phone'] = userPhone?.innerText.trim();
            const userEmail = document.querySelector("section.ci-email a");
            userContact['email'] = userEmail?.attributes?.href?.value?.replace('mailto:','');
            return userContact;
        }catch(error){
            console.error(error)
        }

    }
    try {
        const userName = document.querySelector("[class*='ph'] .pv-text-details__left-panel h1");
        userProfile['name'] = userName?.innerText;
        const userProfileImageLink = document.querySelector("[class*='photo-wrapper'] img[class*='profile']");
        userProfile['profile_pic'] = userProfileImageLink?.attributes?.src?.value;
        const contactSelctorElement = document.querySelector('#top-card-text-details-contact-info');
        contactSelctorElement?.click();
        return sleep(1000).then(() => { 
        const {link, email, phone} = getUserContactInformations();
        userProfile['linkedin_profile_link'] = link;
        userProfile['email'] = email;
        userProfile['phone'] = phone;
        const userCompany = document.querySelector("section #experience ~ div.pvs-list__outer-container li span.t-normal span");
        userProfile['company'] = userCompany?.innerText;
        const userDesignation = document.querySelector("[class*='ph'] .pv-text-details__left-panel .text-body-medium");
        userProfile['designation'] = userDesignation?.innerText;
        const userLocation = document.querySelector("[class*='ph'] .pv-text-details__left-panel .text-body-small.inline");
        userProfile['location'] = userLocation?.innerText.trim();
        const userAbout = document.querySelector("#about ~ .display-flex .pv-shared-text-with-see-more span");
        userProfile['about'] = userAbout?.innerText;
        const userActivity = document.querySelectorAll("section #recent_activity ~ .pvs-list__outer-container li.artdeco-list__item");
        userProfile['activity'] = getUserSectionsInformations(userActivity);
        const userActivements = document.querySelectorAll("section #licenses_and_certifications ~ .pvs-list__outer-container li.artdeco-list__item");
        userProfile['achivements'] = getUserSectionsInformations(userActivements);
        const userSkills = document.querySelectorAll("section #skills ~ .pvs-list__outer-container li.artdeco-list__item");
        userProfile['skills'] = getUserSectionsInformations(userSkills);
        const userLanguages = document.querySelectorAll("section #languages ~ div.pvs-list__outer-container .pvs-list li.artdeco-list__item");
        userProfile['languages'] = getUserSectionsInformations(userLanguages);
        const userEducations = document.querySelectorAll("section #education ~ div.pvs-list__outer-container .pvs-list li.artdeco-list__item");
        userProfile['educations'] = getUserSectionsInformations(userEducations);
        const userExperiences = document.querySelectorAll("section #experience ~ div.pvs-list__outer-container li.artdeco-list__item .pvs-entity");
        userProfile['experiences'] = getUserSectionsInformations(userExperiences);
        return userProfile;
        }).then((data)=>{
            const dismissContactDialog = document.querySelector('button[aria-label="Dismiss"]');
            dismissContactDialog?.click();
            return data;
        });
    } catch (error) {
        console.error(error);
    }
}