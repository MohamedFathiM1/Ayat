/**
 * master.js — Ayat project
 *
 * Features:
 *  1. Random verse on every page load (picked once from ayat.json).
 *  2. "Next" button cycles to the next verse sequentially.
 *  3. Share button opens a custom popup with four social platforms.
 *     Clicking outside the popup closes it.
 *  4. Each social icon shares the currently visible verse.
 */

/* ------------------------------------------------------------------ */
/*  DOM references                                                      */
/* ------------------------------------------------------------------ */
const contentEl  = document.querySelector(".content");
const nextBtn    = document.querySelector(".next");
const shareBtn   = document.getElementById("shareBtn");
const sharePopup = document.getElementById("sharePopup");

/* ------------------------------------------------------------------ */
/*  State                                                               */
/* ------------------------------------------------------------------ */
let ayatList   = [];   // full array loaded from JSON
let ayatCount  = 0;    // total verse count
let cIndex     = 0;    // index of the currently displayed verse

/* ------------------------------------------------------------------ */
/*  1. Load JSON and kick everything off                               */
/* ------------------------------------------------------------------ */
function getAyat() {
    const req = new XMLHttpRequest();

    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            ayatList  = JSON.parse(this.responseText);
            ayatCount = ayatList.length;

            /* Pick a random starting verse on every page load */
            cIndex = Math.floor(Math.random() * ayatCount);
            renderVerse(cIndex);

            /* ------------------------------------------------------ */
            /*  Next button: advance to the next verse sequentially    */
            /* ------------------------------------------------------ */
            nextBtn.addEventListener("click", () => {
                cIndex = (cIndex + 1) % ayatCount; // wrap around at the end
                renderVerse(cIndex);
            });
        }
    };

    req.open("GET", "ayat.json", true);
    req.send();
}

/* ------------------------------------------------------------------ */
/*  2. Render a verse into the content div                             */
/* ------------------------------------------------------------------ */
function renderVerse(index) {
    contentEl.innerHTML = ""; // clear previous verse

    const p    = document.createElement("p");
    p.textContent = ayatList[index]["Aya"];
    contentEl.appendChild(p);
}

/* ------------------------------------------------------------------ */
/*  Helper: get the text of the currently displayed verse              */
/* ------------------------------------------------------------------ */
function getCurrentVerseText() {
    return ayatList[cIndex] ? ayatList[cIndex]["Aya"].trim() : "";
}

/* ------------------------------------------------------------------ */
/*  3. Share popup — toggle on button click                            */
/* ------------------------------------------------------------------ */
shareBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent the document click listener below from firing
    const isOpen = sharePopup.classList.toggle("open");
    sharePopup.setAttribute("aria-hidden", String(!isOpen));
});

/* Close popup when clicking anywhere outside it */
document.addEventListener("click", (e) => {
    if (!sharePopup.contains(e.target) && e.target !== shareBtn) {
        sharePopup.classList.remove("open");
        sharePopup.setAttribute("aria-hidden", "true");
    }
});

/* ------------------------------------------------------------------ */
/*  4. Social sharing — build platform URLs on the fly                */
/* ------------------------------------------------------------------ */
document.querySelectorAll(".social-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const platform = btn.dataset.platform;
        const text     = getCurrentVerseText();
        const encoded  = encodeURIComponent(text);
        let   url      = "";

        switch (platform) {
            case "whatsapp":
                /* WhatsApp web share — works without login */
                url = `https://wa.me/?text=${encoded}`;
                break;

            case "twitter":
                /* X / Twitter intent URL */
                url = `https://twitter.com/intent/tweet?text=${encoded}`;
                break;

            case "facebook":
                /* Facebook sharer — shares the current page URL + quote */
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}&quote=${encoded}`;
                break;

            case "instagram":
                /**
                 * Instagram has no public share URL for text.
                 * Best UX: copy text to clipboard and open Instagram.
                 */
                navigator.clipboard.writeText(text).then(() => {
                    alert("تم نسخ الآية إلى الحافظة.\nافتح إنستغرام وألصق النص في قصتك أو منشورك.");
                }).catch(() => {
                    alert("انسخ الآية يدوياً:\n\n" + text);
                });
                /* Open Instagram in a new tab */
                window.open("https://www.instagram.com/", "_blank");
                return; // no generic window.open below
        }

        if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
        }

        /* Close popup after sharing */
        sharePopup.classList.remove("open");
        sharePopup.setAttribute("aria-hidden", "true");
    });
});

/* ------------------------------------------------------------------ */
/*  Bootstrap                                                           */
/* ------------------------------------------------------------------ */
getAyat();
