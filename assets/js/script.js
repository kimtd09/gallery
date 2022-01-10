const _width = 300;
const _height = 200;
const timeout = 10000; // after x ms, the image loading is aborted
const _url1 = `https://picsum.photos/${_width}/${_height}?random=`;
const _url2 = `https://picsum.photos/v2/list?page=${Math.round(Math.random() * 10)}&limit=100`;
let urlChoice = 1;
const loadingSvg = `<div class="svg-container"><svg class="svg-loading" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="26.349px" height="26.35px" viewBox="0 0 26.349 26.35" style="enable-background:new 0 0 26.349 26.35;"
xml:space="preserve">
<g>
<g>
<circle cx="13.792" cy="3.082" r="3.082"/>
<circle cx="13.792" cy="24.501" r="1.849"/>
<circle cx="6.219" cy="6.218" r="2.774"/>
<circle cx="21.365" cy="21.363" r="1.541"/>
<circle cx="3.082" cy="13.792" r="2.465"/>
<circle cx="24.501" cy="13.791" r="1.232"/>
<path d="M4.694,19.84c-0.843,0.843-0.843,2.207,0,3.05c0.842,0.843,2.208,0.843,3.05,0c0.843-0.843,0.843-2.207,0-3.05
    C6.902,18.996,5.537,18.988,4.694,19.84z"/>
<circle cx="21.364" cy="6.218" r="0.924"/>
</g>
</g></svg></div>`;
const errorSvg = `<div class="svg-container"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" style="animation: 'none'"><path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg></div>`

document.getElementById("link1").addEventListener("click", loadUrl1);
document.getElementById("link2").addEventListener("click", loadUrl2);

// url1 is an individual request for each image
function loadUrl1() {
    if (urlChoice == 1) { return; }

    urlChoice = 1;
    document.getElementById("link1").classList.toggle("link1-selected", true);
    document.getElementById("link2").classList.remove("link2-selected");

    document.querySelectorAll(".img-container").forEach((e, i) => {
        observer.unobserve(e);
        while (e.firstChild) {
            e.firstChild.remove();
        }
        e.setAttribute("lazySrc", _url1 + i);
        observer.observe(e);
    })
}

// url2 returns a json
async function loadUrl2() {
    if (urlChoice == 2) { return; }
    urlChoice = 2;
    document.getElementById("link1").classList.remove("link1-selected");
    document.getElementById("link2").classList.toggle("link2-selected", true);
    const r = await fetch(_url2);
    const d = await r.json();
    // console.log(d);

    document.querySelectorAll(".img-container").forEach((e, i) => {
        observer.unobserve(e);
        while (e.firstChild) {
            e.firstChild.remove();
        }

        e.setAttribute("lazySrc", d[i].download_url);
        e.setAttribute("data-author", d[i].author);
        e.setAttribute("data-link", d[i].url);
        observer.observe(e);
    })
}

let callback = (entries, observer) => {
    entries.forEach((element, index) => {
        if (element.isIntersecting) {
            if (element.target.childElementCount === 0) {
                element.target.innerHTML += loadingSvg;
                const img = new Image();
                img.src = element.target.attributes.lazySrc.nodeValue;
                img.alt = "photo";
                img.addEventListener("click", popup)
                setTimeout(() => {
                    console.log(img.complete);
                    element.target.firstChild.remove();
                    element.target.appendChild(img);
                }, urlChoice === 1 ? 50 : (1 + index * 250));
            }
        }
    });
}

let promises = [];
let callback2 = (entries, observer) => {
    entries.forEach((element, index) => {
        if (element.isIntersecting) {
            if (element.target.childElementCount === 0) {
                element.target.innerHTML += loadingSvg;
                var start = performance.now();
                const img = new Image();
                img.src = element.target.attributes.lazySrc.nodeValue;

                img.alt = "photo";
                img.addEventListener("click", popup);

                let timer = 0;


                // custom async different of promise method
                const interval = setInterval(() => {
                    if (timer > timeout) {
                        clearInterval(interval);
                        element.target.firstChild.remove();
                        element.target.innerHTML = errorSvg;
                        return;
                    } else
                        if (img.complete && img.naturalHeight != 0) {
                            clearInterval(interval);
                            const span = document.createElement("span");
                            span.classList.add("img-info");
                            element.target.appendChild(img);
                            element.target.firstChild.remove();


                            var end = performance.now();
                            var timeTaken = end - start;
                            span.innerHTML = `loaded in ${timeTaken > 1000 ? (timeTaken / 1000).toFixed(1) + 's' : timeTaken.toFixed(0) + 'ms'}`;

                            setTimeout(() => {
                                element.target.appendChild(span);
                            }, timeTaken / 2); // the longer the loading, the longer we delay

                            // console.log(timeTaken);

                            return;
                        }
                    timer += 1;
                }, 1);


            }
        }
    });
}

let options = {
    root: null,
    rootMargin: "0px",
    threshold: 1.0
}

let observer = new IntersectionObserver(callback2, options);

// Create 100 div inside section
function generateDivs() {
    const s = document.querySelector("section");

    for (let i = 1; i <= 100; i++) {
        const e = document.createElement("div");
        e.classList.add("img-container");
        e.setAttribute("lazySrc", _url1 + i);
        s.appendChild(e);
        observer.observe(e);
    }
}

generateDivs();

document.getElementById("popup-close").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("popup-bg").classList.toggle("hidden");
})

function popup(e) {
    document.getElementById("popup-bg").classList.toggle("hidden");

    // Adding metadata
    const top = document.querySelector(".popup-meta");
    while (top.firstChild) { top.firstChild.remove(); }
    if (e.target.parentNode.dataset.author) { top.innerHTML = `<span>by ${e.target.parentNode.dataset.author},&nbsp;</span>`; }
    if (e.target.parentNode.dataset.author) { top.innerHTML += `<span><a href="${e.target.parentNode.dataset.link}" target="_blank">source</a></span>`; top.style.display = "flex";}
    else {
        top.style.display = "none";
    }

    // Adding image
    const container = document.getElementById("popup-mid");
    while (container.firstChild) { container.firstChild.remove(); }
    container.innerHTML = loadingSvg;
    const img = new Image();
    img.classList.add("popup-img");
    img.src = e.target.src;
    setTimeout(() => {
        img.decode()
            .then(() => {
                container.firstChild.remove();
                container.appendChild(img);
            })
    }, 50);
}