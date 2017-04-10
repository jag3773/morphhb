/**
 * @fileOverview Structure is the JavaScript controller for OSHB structure.
 * @version 1.2
 * Updated for popup display.
 * @author David
 */
(function() {
    // Retains references to frequently used elements.
    var elements = {
        "book": document.getElementById('book'),
        "chapter": document.getElementById('chapter'),
        "verse": document.getElementById('verse'),
        "display": document.getElementById('display'),
        "verseLayout": document.getElementById('verseLayout')
    };
// Utility functions.
    // Utility function to clear child nodes from an element.
    var clearNodes = function(elem) {
        while (elem.childNodes.length > 0) {
            elem.removeChild(elem.firstChild);
        }
    };
// XML handling.
    var chapterXml;
    // Parses the XML string into a DOM document.
    var parseXmlString = function(xml) {
        if (window.DOMParser)
        {
            parser=new DOMParser();
            xmlDoc=parser.parseFromString(xml, "text/xml");
        }
        else // Internet Explorer
        {
            xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async=false;
            xmlDoc.loadXML(xml);
        }
        return xmlDoc;
    };
    // From https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests
    function xhrSuccess() {
        this.callback.apply(this, this.arguments);
    }
    function xhrError() {
        console.error(this.statusText);
    }
    function loadFile(sURL, fCallback /*, argumentToPass1, argumentToPass2, etc. */) {
      var oReq = new XMLHttpRequest();
      oReq.callback = fCallback;
      oReq.arguments = Array.prototype.slice.call(arguments, 2);
      oReq.onload = xhrSuccess;
      oReq.onerror = xhrError;
      oReq.open("get", sURL, true);
      oReq.send(null);
    }
// Navigation elements.
    var bookIndex;
    // Sets the options for the chapter dropdown.
    var setChapters = function() {
        bookIndex = books[elements.book.value].split(' ');
        var i = 1, num = parseInt(bookIndex[0]);
        clearNodes(elements.chapter);
        for (; i <= num; i++) {
            elements.chapter.options[elements.chapter.options.length] = new Option(i);
        }
        elements.chapter[initialChapter].selected = "selected";
        initialChapter = 0;
        setChapterFile();
    };
    // Sets the options for the verse dropdown.
    var setVerses = function() {
        chapterXml = parseXmlString(this.responseText);
        var i = 1, num = bookIndex[elements.chapter.value];
        clearNodes(elements.verse);
        for (; i <= num; i++) {
            elements.verse.options[elements.verse.options.length] = new Option(i);
        }
        getVerse();
    };
    // Sets the XML chapter file to read
    var setChapterFile = function() {
        var book = elements.book.value;
        var chapter = elements.chapter.value;
        return loadFile("./chapters/"+book+"/"+book+"."+chapter+".xml", setVerses);
    };
// Interface elements.
    // Marks up the verse.
    // Interprets the accents.
    var accentInterpretation = window.accentInterpretation;
    // Gets the selected verse.
    function getVerse() {
        var index = elements.verse.value - 1;
        var verse = chapterXml.getElementsByTagName('verse')[index];
        // Set the scope based on the verse ID.
        accentInterpretation.setAccents(verse.getAttribute('osisID'));
        clearNodes(elements.display);
        if (elements.verseLayout.value.endsWith("-bt")) {
            elements.display.appendChild(markupVerse(verse, true));
        } else {
            elements.display.appendChild(markupVerse(verse, false));
        }
    }
    // Gets the selected verse layout stylesheet.
    function getVerseLayout() {
        var layoutDir, i, link_tag;
        if (elements.verseLayout.value.startsWith("horizontal")) {
            layoutDir = "horizontal";
            markupVerse = window.verseMarkupHorizontal;
        } else {
            layoutDir = "vertical";
            markupVerse = window.verseMarkupVertical;
        }
        // Adapted from https://www.thesitewizard.com/javascripts/change-style-sheets.shtml
        var i, link_tag ;
        for (i = 0, link_tag = document.getElementsByTagName('link') ;
            i < link_tag.length ; i++ ) {
            if ((link_tag[i].rel.indexOf('stylesheet') != -1) && link_tag[i].title) {
                link_tag[i].disabled = true ;
                if (link_tag[i].title == layoutDir) {
                    link_tag[i].disabled = false ;
                }
            }
        }
        getVerse();
    }
    // Initialize.
    var initialChapter = elements.chapter.value - 1;
    var markupVerse = window.verseMarkupHorizontal;
    setChapterFile();
    elements.book.onchange = setChapters;
    elements.chapter.onchange = setChapterFile;
    elements.verse.onchange = getVerse;
    elements.verseLayout.onchange = getVerseLayout;
    setChapters();
})();
