function getSelection() {
    return window.getSelection().toString();
}
async function renderResults(jufoID) {
    var detailsResponse = await fetch('https://jufo-rest.csc.fi/v1.1/kanava/' + jufoID)
    if(detailsResponse.ok) {
        var detailJson = await detailsResponse.json()
        if(detailJson.length > 0) {            
            var level = detailJson[0]['Level']
            var name = detailJson[0]['Name']
            document.getElementById('name').innerText = name
            document.getElementById('level').innerText = 'Level ' + level
            document.getElementById('link').innerHTML = '<a target="_blank" href="https://jfp.csc.fi/#!PublicationInformationView/id/' + jufoID + '">Open in JUFO portal</a>'
        }
        else {
            document.getElementById('error').innerText = 'Could not retrived data for channel ' + jufoID  
        }
    }
    else {
        document.getElementById('error').innerText = 'An error occured.'
    }
    
}

async function handleSearchResponse(response) {
    var searchJson = await response.json()
    
    if(searchJson.length > 0) {                        
        renderResults(searchJson[0]['Jufo_ID'])
    }  
    else {
        document.getElementById('name').innerText = 'No results found'
    }              

}

function showResults() {
    document.getElementById('spinner').classList.add('hide')
    document.getElementById('results').classList.remove('hide')
}
async function doJufoSearch() {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: getSelection
        }, async (results) => {
            var selected = results[0].result.trim()               
            if(selected.length > 0) {
                document.getElementById('selected').innerText = selected
                var searchResponse = await fetch('https://jufo-rest.csc.fi/v1.1/etsi.php?issn=' + selected)
                if(searchResponse.ok) {
                    handleSearchResponse(searchResponse)                
                }
                else {
                    // try searching with a name 
                    var searchResponse = await fetch('https://jufo-rest.csc.fi/v1.1/etsi.php?nimi=' + selected)
                    handleSearchResponse(searchResponse)
                }    
                showResults()
            }
            else {
                document.getElementById('spinner').classList.add('hide')
                document.getElementById('error').innerText = 'No text selected'
            }
                
        });
}
document.addEventListener('DOMContentLoaded', (event) => {
    doJufoSearch()
})
