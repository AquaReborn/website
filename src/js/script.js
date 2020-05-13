window.on("load", e => {
    const header = document.find("header")
    const nav = document.find("nav")
    const section = document.find("section")

    window.on("scroll", e => {
        if (window.scrollY > header.clientHeight) {
            nav.classList.add("fixed")
            section.style.marginTop = "41px"
        } else {
            nav.classList.remove("fixed")
            section.style.marginTop = "10px"
        }
    })
})
