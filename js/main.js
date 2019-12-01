
let onlyShow;

function checkDlQuery() {
    let args = location.search.slice(1).split("&").map((v) => {let splitted = v.split("=");return {"key":splitted[0],"value":splitted[1]}});
    let name = getElementWithKey(args,"name");
    if(getElementWithKey(args,"api") && name) {
        let api = getElementWithKey(args,"api").value;
        name = name.value;
        console.log(api,name)
        for(let i = 0; i < modules.length; i++) {
            let module = modules[i];
            if(module.name.replace(" ","").toLowerCase() === name) {
                for(let j = 0; j < module.downloads.length; j++) {
                    let download = module.downloads[j];
                    console.log(download.api)
                    if(download.api == api) {
                        console.log(download)
                        document.location.replace(download.download);
                        return;
                    }
                }
            }
        }
    } else if(name) {
        name = name.value.toLowerCase();
        for(let i = 0; i < modules.length; i++) {
            let module = modules[i];
            if(module.name.replace(" ","").toLowerCase() === name) {
                onlyShow = module;
                break;
            }
        }
    }
}
function getElementWithKey(array, key) {
    for(let i = 0; i < array.length; i++) {
        if(array[i].key) {
            if(array[i].key == key) {
                return array[i];
            }
        }
    }
    return null;
}
checkDlQuery();

function get_browser() {
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'IE',version:(tem[1]||'')};
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR|Edge\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
 }

let browser = get_browser();
if(browser.name == "Firefox" && browser.version < 68) {
	alert("Please update firefox to view this page")
	window.onload = null;
}

window.onload = () => {

    modules.sort((a,b) => {
        var nameA = a.name.toUpperCase(); 
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    })

    let scroller = document.createElement("div");
    scroller.setAttribute("id","scroller");
    scroller.onload = scroll;
    document.body.appendChild(scroller);
    if(onlyShow) {
        scroller.appendChild(buildModule(onlyShow, true));
    } else {
        for(let i = 0; i < modules.length; i++) {
            scroller.appendChild(buildModule(modules[i],document.location.hash != "" && document.location.hash === "#" + modules[i].name.replace(" ","")));
        }
    }
    addListeners();
    setTimeout(scroll, 400)
}

function buildModule(module, expand) {
    let element = document.createElement("div");
    element.className = "element";
    if(expand) {
        element.className += " expanded";
    }
    element.innerHTML = buildHTMLString(module);
    return element;
} 

function scroll() {
    if(document.location.hash != "") {
        let e = document.getElementsByClassName("expanded2")[0];
        if(e) {
            e.scrollIntoView({"behavior": "smooth", "block":"start"})
        }
    }
}

function addListeners() {
    let elements = document.getElementsByClassName("header");
    for(let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click',listener);
    }
}

function listener(e) {
    let path;
    if(e.path) {
        path = e.path;
    } else if(e.composedPath) {
        path = e.composedPath();
    } else {
        alert("Your browser does not support required functionality. Please use Chrome or Firefox");
        return;
    }
    for(let i = 0; i < path.length; i++) {
        let element = path[i];
        if(!element) {
            continue;
        }
        if(element.hasAttribute("copy")) {
            textToClipboard(element.getAttribute("value"));
            element.className = "spin";
            setTimeout(() => {element.className = ""},400);
            break;
        }
        if(element.classList.contains("element")) {
            if(element.classList.contains("expanded")) {
                element.classList.remove("expanded")
            } else {
                element.classList.add("expanded")
            }
            break;
        }
    }
}

function textToClipboard (text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

const linkformat = "%ORIGIN%PATHNAME#%HASH".replace("%ORIGIN",document.location.origin).replace("%PATHNAME",document.location.pathname);

function buildHTMLString(module) {
    let string = elementHTML;
    string = string.replace(/\[%NAME]/g, module.name);
    string = string.replace(/\[%AUTHOR]/g, module.author ? module.author : "");
    string = string.replace(/\[%DESC]/g, module.description ? module.description : "");
    string = string.replace(/\[%JUMPLINK]/g, linkformat.replace("%HASH",module.name.replace(" ","")))
    string = populateList(string, module.actions, "ACTION", "action", "AEMPTY");
    string = populateList(string, module.iterators, "ITERATOR", "iterator", "IEMPTY");
    string = populateList(string, module.events, "EVENT", "event", "EEMPTY");
    string = populateList(string, module.variables, "VARIABLE", "variable", "VEMPTY");
    string = populateDownloads(string, module.downloads);
    string = populateChangelog(string, module.changelog);
    return string;
}

function populateChangelog(string, changelogs) {
    if(changelogs && changelogs.length > 0) {
        for(let i = 0; i < changelogs.length; i++) {
            string = string.replace(/\[%CHANGELOG]/g,changelogHTML);
            let changelog = changelogs[i];
            let api = "";
            let date = "";
            if(changelog.api) {
                api = changelog.api;
            }
            if(changelog.date) {
                date = "(" + changelog.date + ")";
            }
            string = string.replace(/\[%DATE]/g,date);
            string = string.replace(/\[%VERSION]/g,api);
            string = populateLines(string, changelog.lines)
        }
        string = string.replace(/\[%CHANGELOG]/g,"");
    } else {
        string = string.replace(/\[%CHANGELOG]/g,"");
    }
    return string;
}

function populateLines(string, lines) {
    if(lines && lines.length > 0) {
        for(let i = 0; i < lines.length; i++) {
            string = string.replace(/\[%LINE]/g,lineHTML);
            string = string.replace(/\[%CONTENT]/g,lines[i]);
        }
        string = string.replace(/\[%LINE]/g,"");
    } else {
        string = string.replace(/\[%LINE]/g,"");
    }
    return string;
}

function populateDownloads(string, downloads) {
    if(downloads && downloads.length > 0) {
        for(let i = 0; i < downloads.length; i++) {
            string = string.replace(/\[%LINK]/g,downloadHTML);
            let download = downloads[i];
            let url = "";
            let api = "";
            let version = "";
            if(download.download) {
                url = download.download;
            }
            if(download.api) {
                api = download.api;
            }
            if(download.version) {
                version = "v" + download.version;
            }
            string = string.replace(/\[%URL]/g,url);
            string = string.replace(/\[%VERSION]/g, api);
            string = string.replace(/\[%MVERSION]/g, version);
        }
        string = string.replace(/\[%LINK]/g,"");
    } else {
        string = string.replace(/\[%LINK]/g,"");
    }
    return string;
}

function populateList(string, list, initial, attributeName, empty) {
    if(list && list.length > 0) {
        string = string.replace(new RegExp("\\[%" + initial + "]","g"),entryHTML);
        for(let i = 0; i < list.length; i++) {
            if(i != 0) {
                string = string.replace(/\[%NEXT]/g,entryHTML);
            }
            let action = list[i];
            let attribute = "";
            let desc = "";
            if(action[attributeName]) {
                usage = action[attributeName];
            }
            if(action.desc) {
                desc = action.desc;
            }
            string = string.replace(/\[%USAGE]/g, escape(usage));
            string = string.replace(/\[%DESCRIPTION]/g, expandCodes(escape(desc)));
        }
        string = string.replace(/\[%NEXT]/g,"");
        string = string.replace(new RegExp("\\[%" + empty + "]","g"),"")
    } else {
        string = string.replace(new RegExp("\\[%" + empty + "]","g"),"empty")
    }
    return string;
}

function expandCodes(string) {
    string = string.replace(/\[a=(.+)](.+)\[\/a]/g,"<a href=\"$2\">$1</a>");
    string = string.replace(/\[a](.+)\[\/a]/g,"<a href=\"$1\">$1</a>");
    return string;
}

function escape(string) {
    return string.replace("&","&amp;").replace("<","&lt").replace(">","&gt").replace("\"","&quot;").replace("'","&apos;");
}