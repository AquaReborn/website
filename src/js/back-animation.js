const backAnim = document.querySelector("canvas.back-anim")

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
window.addEventListener("load", e => {

    backAnim.width = WIDTH
    backAnim.height = HEIGHT

    const can = new Canvas(backAnim)

    const sand = new Sand(can, 100)     // sable
    const starfishes = []               // tableau comportant toutes les étoiles de mer
    const bubbles = []                  // tableau comportant toutes les bulles
    const seaweeds = []                 // tableau comportant toutes les algues

    var seaweedId = 1

    let maxStarfish = Random.randrange(2, 5)
    for (let i = maxStarfish; i > 0; i--) {
        // c'est une boucle dont la succession de la valeur de l'index
        // décroissante afin que les étoiles de mer
        // les plus petites se retrouvent au dessus des plus grandes
        let size = Random.randrange(40, 80, 10)
        starfishes.push(new Starfish(
            can,
            Random.randrange(WIDTH / maxStarfish * (i - 2) + 10, WIDTH / maxStarfish * (i - 1) + 30),
            Random.randrange(HEIGHT - 80, HEIGHT - 40, 5),
            size
        ))
    }
    // add Seaweed
    let maxSeaweed = Random.randrange(5, 10)
    for (let i = maxSeaweed; i > 0; i--) {
        let height = Random.randrange(60, 150, 10)
        seaweeds.push(new Seaweed(
            can,
            Random.randrange(10, WIDTH - 10, 10),
            Random.randrange(HEIGHT - 120, HEIGHT - 20, 10),
            height
        ))
    }
    var seaweedsInterval
    /** met en pause les animations des algues */
    unfreezeSeaweeds = () => {
        seaweedsInterval = setInterval(() => {
            seaweedId = seaweedId == 1 ? 2 : 1
            seaweeds.forEach(seaweed => {
                if (seaweed.item.hasTag("seaweed.move"))
                    seaweed.item.setURL(`src/img/seaweed-${seaweedId}/181x1024.png`)
            })
        }, 300);
    }
    freezeSeaweeds = () => {
        clearInterval(seaweedsInterval)
    }
    /** ajoute une bulle */
    addBubble = () => {
        x = Random.randrange(10, WIDTH, 30)                 // abscisse de départ possible de la bulle
        y = Random.randrange(HEIGHT - 100 , HEIGHT - 20, 5) // ordonnée de départ possible de la bulle
        speed = Random.choice([40, 60, 80])                 // vitesses possible de la monté de la bull
        size = Random.choice([10, 13, 16])                  // tailles possible de la bulle
        
        let bubble = new Bubble(can, x, y, size, speed)
        bubbles.push(bubble)
        bubble.rise()
    }
    /** met en pause les bulles */
    freezeBubbles = () => {
        if (typeof createdBubbleInterval !== "undefined") clearInterval(createdBubbleInterval)
        if (typeof bubbleInterval1 !== "undefined") clearInterval(bubbleInterval1)
        if (typeof bubbleInterval2 !== "undefined") clearInterval(bubbleInterval2)
        if (typeof bubbleInterval3 !== "undefined") clearInterval(bubbleInterval3)
        return
    }
    /** fait en sorte que les bulles se mettent à monter  */
    riseBubbles = () => {
        freezeBubbles()
        createdBubbleInterval = setInterval(addBubble, 3000);
        bubbleInterval1 = setInterval(isToofar, 40, 40)
        bubbleInterval2 = setInterval(isToofar, 60, 60)
        bubbleInterval3 = setInterval(isToofar, 80, 80)
        return
    }
    /** pop les bulle à la surface */
    isToofar = (speed) => {
        can.move(`bubble.speed.${speed}`, 0, -1)
        bubbles.forEach(bubble => {
            if (bubble.item.y1 < 0)
                bubble.pop()
        })
        return
    }
    /** supprime toutes les bulles */
    killBubbles = () => {
        clearInterval(createdBubbleInterval)
        bubbles.forEach((bubble, i, array) => {
            bubble.pop()
            array.remove(bubble)
        })
        return
    }
    
    freeze = () => {
        freezeBubbles()
        freezeSeaweeds()
    }
    unfreeze = () => {
        riseBubbles()
        unfreezeSeaweeds()
    }
    unfreeze()
    window.addEventListener("blur", freeze)
    window.addEventListener("focus", unfreeze)
})


class Thing {
    constructor(canvas) {
        this.canvas = canvas
    }
}
class Sand extends Thing {
    constructor(canvas, height, color) {
        super(canvas)
        this.height = height
        this.color = typeof color !== "undefined" ? color : "#e0cda9"

        this.item = this.canvas.createRectangle(
            0,
            HEIGHT - this.height,
            WIDTH,
            HEIGHT, {
                backgroundColor: "#e0cda9",
                borderWidth: 0
            }
        )
    }
}
class Bubble extends Thing {
    constructor(canvas, x, y, size, speed) {
        super(canvas)
        this.x = x
        this.y = y
        this.size = size
        this.item = this.canvas.createImage(
            x - size / 2,
            y - size / 2,
            x + size / 2,
            y + size / 2,
            "src/img/bubble/1024x1024.png",
            {borderWidth: 0}
        )
        this.item.addTag("bubble")
        this.item.addTag("bubble.speed."+speed)
    }
    rise() {
        this.item.addTag("bubble.rise")
        return
    }
    freeze() {
        this.item.deleteTag("bubble.rise")
        return
    }
    pop() {
        this.freeze()
        this.item.deleteTag("bubble")
        this.item.delete()
        delete this
        return
    }
}
class Seaweed extends Thing {
    constructor(canvas, x, y, height) {
        super(canvas)
        this.x = x
        this.y = y
        this.height = height
        this.width = 16

        this.item = this.canvas.createImage(
            parseInt(x - this.width / 2),
            parseInt(y - this.height / 2),
            parseInt(x + this.width / 2),
            parseInt(y + this.height / 2),
            `src/img/seaweed-1/181x1024.png`,
            {
                borderWidth: 0
            }
        )
        this.item.addTag("seaweed")
        this.item.addTag("seaweed.move")
    }
}
class Starfish extends Thing {
    constructor(canvas, x, y, size) {
        super(canvas)
        this.x = x
        this.y = y
        this.size = size

        this.item = this.canvas.createImage(
            x - size / 2,
            y - size / 2,
            x + size / 2,
            y + size / 2,
            "src/img/starfish/1024x1024.png",
            {
                borderWidth: 0
            }
        )
    }
}