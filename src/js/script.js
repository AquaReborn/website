window.addEventListener("load", e => {
    const header = document.querySelector("header")
    const nav = document.querySelector("nav")
    const section = document.querySelector("section")

    window.addEventListener("scroll", e => {
        if (window.scrollY > header.clientHeight) {
            nav.classList.add("fixed")
            section.style.marginTop = "41px"
        } else {
            nav.classList.remove("fixed")
            section.style.marginTop = "10px"
        }
    })
})