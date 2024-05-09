const _width = 300;
const _height = 200;
const maxImg = 99;
const timeout = 5000; // after x ms, the image loading is aborted
const _url1 = `https://picsum.photos/${_width}/${_height}?random=`;
const _url2 = `https://picsum.photos/v2/list?page=${Math.round(Math.random() * 10)}&limit=${maxImg}`;
let urlChoice = 1; // low quality by default
const loadingSvg='<div class="svg-container"><svg class="svg-loading" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\nwidth="26.349px" height="26.35px" viewBox="0 0 26.349 26.35" style="enable-background:new 0 0 26.349 26.35;" xml:space="preserve"><g>\n<g>\n<circle cx="13.792" cy="3.082" r="3.082"/>\n<circle cx="13.792" cy="24.501" r="1.849"/>\n<circle cx="6.219" cy="6.218" r="2.774"/>\n<circle cx="21.365" cy="21.363" r="1.541"/>\n<circle cx="3.082" cy="13.792" r="2.465"/>\n<circle cx="24.501" cy="13.791" r="1.232"/>\n<path d="M4.694,19.84c-0.843,0.843-0.843,2.207,0,3.05c0.842,0.843,2.208,0.843,3.05,0c0.843-0.843,0.843-2.207,0-3.05\n    C6.902,18.996,5.537,18.988,4.694,19.84z"/>\n<circle cx="21.364" cy="6.218" r="0.924"/>\n</g>\n</g></svg></div>';
const errorSvg = `<div class="svg-container"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" style="animation: 'none'"><path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg></div>`

document.getElementById("link1").addEventListener("click", loadUrl1);
document.getElementById("link2").addEventListener("click", loadUrl2);
document.querySelector(".gotop").addEventListener('click', gotop);
window.addEventListener("scroll", e => {
    const gotop = document.querySelector(".gotop")
    const apibar = document.querySelector(".api")

    if(window.scrollY > 300) {
        gotop.classList.remove("hidden")
        apibar.classList.add("sticky")
    }
    else {
        gotop.classList.add("hidden")
        apibar.classList.remove("sticky")
    }
})

// url1 is an individual request for each image
function loadUrl1() {
    if (urlChoice == 1) { return; }

    urlChoice = 1;
    document.getElementById("link1").classList.toggle("selected", true);
    document.getElementById("link2").classList.remove("selected");

    document.querySelectorAll(".container").forEach((e, i) => {
        observer.unobserve(e);
        while (e.firstChild) {
            e.firstChild.remove();
        }
        e.removeAttribute("data-author")
        e.removeAttribute("data-link")
        e.setAttribute("lazySrc", _url1 + i);
        observer.observe(e);
    })
}

// url2 returns a json
async function loadUrl2() {
    if (urlChoice == 2) { return; }
    urlChoice = 2;
    document.getElementById("link1").classList.remove("selected");
    document.getElementById("link2").classList.toggle("selected", true);
    const r = await fetch(_url2);
    const d = await r.json();

    document.querySelectorAll(".container").forEach((e, i) => {
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

                // custom async
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
                            span.classList.add("info");
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

// Create x div inside section
function generateDivs() {
    const s = document.querySelector("section");

    for (let i = 1; i <= maxImg; i++) {
        const e = document.createElement("div");
        e.classList.add("container");
        e.setAttribute("lazySrc", _url1 + i);
        s.appendChild(e);
        observer.observe(e);
    }
}

generateDivs();

function close (e) {
    e.stopPropagation();
    document.getElementById("popup").classList.toggle("hidden");
    const popUpContainer = document.querySelector(".subcontainer")

    if(popUpContainer.classList.contains("w300p")) {
        popUpContainer.classList.remove("w300p")
    }
    else {
        popUpContainer.classList.remove("w90")
    }
}

function popup(e) {
    const popupContainer = document.getElementById("popup")
    const popupElement = document.querySelector(".subcontainer")

    // Adding metadata
    const top = document.querySelector(".meta");
    while (top.firstChild) { top.firstChild.remove(); }
    if (e.target.parentNode.dataset.author) { top.innerHTML += `<span><a href="${e.target.parentNode.dataset.link}" target="_blank">${e.target.parentNode.dataset.author}</a></span>`; top.style.display = "flex";}
    else {
        top.style.display = "none";
    }

    // Adding image
    const container = document.getElementById("img");
    container.lastElementChild.remove();

    container.innerHTML += loadingSvg;
    // must be readded because we changed the DOM of the parent
    document.getElementById("close").addEventListener("click", close)
    // show popup now
    popupContainer.classList.toggle("hidden");

    const img = new Image();
    img.classList.add("img");
    img.src = e.target.src;

    setTimeout(() => {
        img.decode() // image should be cached by the browser
            .then(() => {
                container.lastElementChild.remove();
                container.appendChild(img);
                img.addEventListener("click", () => {
                    img.classList.toggle("zoom")
                })

                // console.log(img)

                // dynamic loading transition
                if(img.naturalWidth < 350) {
                    popupElement.classList.add("w300p") 
                }
                else {
                    popupElement.classList.add("w90")
                }
            })
    }, 10);
}

function gotop(e) {
    e.stopPropagation()
    window.scrollTo({ top: 0, behavior: 'smooth' }) // smooth or fast
}