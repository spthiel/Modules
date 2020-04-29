
var elementHTML = `
<div class="header">
    <div class="main"><span copy value="[%JUMPLINK]">&#128279;</span><span class="name white large bold">[%NAME]</span></div>
    <div class="icon"><div class="expand arrow down"></div></div>
</div>
<div class="description gray">[%DESC]</div>
<div class="author white bold">by [%AUTHOR]</div>
<div class="content">
    <div class="left">
        <div class="usage">
            <div class="actions" [%AEMPTY]>
                <div class="entry white bold borderbelow">Actions</div>
                [%ACTION]
            </div>
            <div class="iterators" [%IEMPTY]>
                <div class="entry white bold borderbelow">Iterators</div>
                [%ITERATOR]
            </div>
            <div class="events" [%EEMPTY]>
                <div class="entry white bold borderbelow">Events</div>
                [%EVENT]
            </div>
            <div class="variables" [%VEMPTY]>
                <div class="entry white bold borderbelow">Variables</div>
                [%VARIABLE]
            </div>
        </div>
    </div>
    <div class="right">
        <div class="downloads">
            <span class="bold gray">Downloads</span>
            [%LINK]
        </div>
    </div>
</div>
<div class="changelog">
    <span class="white bold borderbelow">Changelog</span>
    [%CHANGELOG]
</div>
`

var entryHTML = `<div class="entry">
<span class="cmdusage white">[%USAGE]</span>
<span class="cmddescription gray">[%DESCRIPTION]</span>
</div>
[%NEXT]
`

var downloadHTML =  `<a href="[%URL]">API [%VERSION] [%MVERSION]</a>
[%LINK]`

var changelogHTML = `<span class="gray">API [%VERSION] [%DATE] [%MVERSION]<br>
[%LINE]
</span>
[%CHANGELOG]`

var lineHTML = `&nbsp;&nbsp;- [%CONTENT]<br>
[%LINE]`

var modules = [];

class Module {

    name = "";
    author = "";
    description = "";
    actions = [];
    iterators = [];
    events = [];
    variables = [];
    downloads = [];
    changelog = [];

    constructor (name) {
        this.name = name;
        modules.push(this);
    }

    setAuthor = (author) => {
        this.author = author;
        return this;
    }

    setDescription = (description) => {
        this.description = description;
        return this;
    }

    addAction = (action, description) => {
        this.actions.push({"action":action,"desc":description});
        return this;
    } 

    addIterator = (iterator, description) => {
        this.iterators.push({"iterator":iterator,"desc":description});
        return this;
    }
    
    addEvent = (event, description) => {
        this.events.push({"event":event,"desc":description});
        return this;
    }
    
    addVariable = (variable, description) => {
        this.variables.push({"variable":variable,"desc":description});
        return this;
    }

    addDownload = (api,download,version) => {
        this.downloads.push({"download":download,"api":api, "version":version});
        this.downloads.sort((a,b) => {return b.api - a.api});
        return this;
    }
    
    addChangelog = (api, date, version) => {
        return new Changelog(api, date, version, this);
    }

    putChangelog = (json) => {
        this.changelog.push(json);
        this.changelog.sort((a,b) => {return b.api - a.api});
    }

}

class Changelog {

    api;
    date;
    lines = [];
    version;

    module;

    constructor(api, date, version, module) {
        this.api = api;
        this.date = date;
        this.version = version;
        this.module = module;
    }

    addLine = (line) => {
        this.lines.push(line);
        return this;
    }

    build = () => {
        let out = {"api": this.api, "date": this.date, "lines": this.lines, "version": this.version};
        this.module.putChangelog(out);
        return this.module;
    }

}