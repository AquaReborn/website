/**
 * Canvas
 * @author Tom Le Blais
 * @version 1.0.0
 */
/*** Liste de tous les événements */
const EVENTS = ["click", "contextmenu", "dblclick", "wheel", "grab", "drop", "mousemove", "mousedown", "mouseup", "mouseleave", "mouseenter"]
/*** Liste de toutes les figures */
const FIGURES = ["line", "curve", "rectangle", "square", "ellipse", "circle", "image", "text"]
/*** Liste des curseurs displonibles */
const CURSORS = ["auto", "default", "none", "context-menu", "help", "pointer", "progress", "wait", "cell", "crosshair", "text", "vertical-text", "alias", "copy", "move", "no-drop", "not-allowed", "e-resize", "n-resize", "ne-resize", "nw-resize", "s-resize", "se-resize", "sw-resize", "w-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "col-resize", "row-resize", "all-scroll", "zoom-in", "zoom-out", "grab", "grabbing "]
/*** Pattern par defaut */
const DEFAULT_PATTERN = {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "black",
    borderEndsStyle: "square",
    color: "black",
    fontSize: 12,
    fontFamily: "Arial",
    textAlign: "left",
    textStrokeWidth: 0,
    textStrokeColor: "black",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: "black",
    backgroundGradient: []
}
/** Classe permettant de créé des événement */
class EventsTrigger {
    /**
     * @constructor
     */
    constructor() {
        this.events = []
    }
    /**
     * @public Émet l'événement
     * @param {string} eventName Nom de l'événement
     * @param {Object] e Données à envoyer lorsque l'événement est emit
     */
    emit(eventName, e) {
        if (typeof eventName !== "string") throw TypeError("EventsTrigger.emit: Argument 1 (eventName) is not a string")

        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                callback(e)
            })
        } else {
            this.events[eventName] = []
        }
    }
    /**
     * @public Reçoit l'événement
     * @param {string} eventName Nom de l'événement
     * @param {function} callback Fonction qui sera executée lorsque que l'événement [eventName] sera emit
     */
    on(eventName, callback) {
        if (typeof eventName !== "string") throw TypeError("EventsTrigger.on: Argument 1 (eventName) is not a string")
        if (typeof callback !== "function") throw TypeError("EventsTrigger.on: Argument 2 (callback) is not a function")

        if (!this.events[eventName]) {
            this.events[eventName] = []
        }
        if (typeof callback === "function") {
            this.events[eventName].push(callback)
        }
        return
    }
    /**
     * @public Detruit une fonction lié à l'événement [eventName]
     * @param {string} eventName Nom de l'événement
     * @param {function} func Fonction attribuée par [eventName] qui sera supprimer
     */
    off(eventName, func) {
        if (typeof eventName !== "string") throw TypeError("EventsTrigger.off: Argument 1 (eventName) is not a string")
        if (typeof func !== "function") throw TypeError("EventsTrigger.off: Argument 2 (func) is not a function")

        if (this.events[eventName]) {
            this.events[eventName].remove(func)
        }
        return
    }
}
/**
 * Classe qui représante l'air de jeu
 * @extends EventsTrigger
*/
class Canvas extends EventsTrigger {
    /**
     * @constructor
     * @param {HTMLCanvasElement} element Élément HTML
     * @param {Object} [pattern] Pattern type
     */
    constructor(element, options={}) {
        super()
        if (!element.tagName || element.tagName != "CANVAS") throw TypeError("Canvas instance: Argument 1 (element) is not a HTMLCanvasElement")
        if (typeof options !== "object") throw TypeError("Canvas instance: Argument 2 (options) is not an object")
        
        this.element = element
        this.ctx = element.getContext("2d")
        this.items = []
        
        this.initEvents()

        this.scrollRegion = {}
        let directions = ["w", "n", "e", "s"]
        if (typeof options.scrollRegion === "undefined") {
            directions.forEach(dir => {
                this.scrollRegion[dir] = 0
            })
        } else {
            directions.forEach((dir, i) => {
                this.scrollRegion[dir] = options.scrollRegion[i] > 0 ? options.scrollRegion[i] : 0
            })
        }
        this.width = element.width
        this.height = element.height
        this.coordsView(0, 0) // -> draw
    }
    /**
     * @private Initialise les événements
     */
    initEvents() {
        this.events = []
        this.element.addEventListener("click", (e) => { // click
            e.preventDefault()
            let x = -this.x1 + e.x - this.element.offsetTop
            let y = -this.y1 + e.y - this.element.offsetLeft
            this.emit("click", {
                type: "click",
                x: x,
                y: y,
                canvasX: x + this.x1,
                canvasY: y + this.y1,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                target: this.findTargeted(x, y)
            })
        })
        this.element.addEventListener("contextmenu", (e) => { // contextmenu
            e.preventDefault()
            let x = -this.x1 + e.x - this.element.offsetTop
            let y = -this.y1 + e.y - this.element.offsetLeft
            this.emit("contextmenu", {
                type: "contextmenu",
                x: x,
                y: y,
                canvasX: x + this.x1,
                canvasY: y + this.y1,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                target: this.findTargeted(x, y)
            })
        })
        this.element.addEventListener("dblclick", (e) => { // dblclick
            let x = -this.x1 + e.x - this.element.offsetTop
            let y = -this.y1 + e.y - this.element.offsetLeft
            this.emit("dblclick", {
                type: "dblclick",
                x: x,
                y: y,
                canvasX: x + this.x1,
                canvasY: y + this.y1,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                target: this.findTargeted(x, y)
            })
        })
        this.element.addEventListener("wheel", (e) => { // wheel
            e.preventDefault()
            let x = -this.x1 + e.x - this.element.offsetTop
            let y = -this.y1 + e.y - this.element.offsetLeft
            this.emit("wheel", {
                type: "wheel",
                x: x,
                y: y,
                canvasX: x + this.x1,
                canvasY: y + this.y1,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                delta: e.deltaY > 0 ? "up" : "down",
                target: this.findTargeted(x, y)
            })
        })
        this.element.addEventListener("mousemove", (e) => { // mousemove
            let x = -this.x1 + e.x - this.element.offsetTop
            let y = -this.y1 + e.y - this.element.offsetLeft
            this.emit("mousemove", {
                type: "mousemove",
                x: x,
                y: y,
                canvasX: x + this.x1,
                canvasY: y + this.y1,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                target: this.findTargeted(x, y)
            })
        })
        this.element.addEventListener("mousedown", (e) => { // mousedown
            let x = -this.x1 + e.x - this.element.offsetTop
            let y = -this.y1 + e.y - this.element.offsetLeft
            this.emit("mousedown", {
                type: "mousedown",
                x: x,
                y: y,
                canvasX: x + this.x1,
                canvasY: y + this.y1,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                target: this.findTargeted(x, y)
            })
        })
        this.element.addEventListener("mouseup", (e) => { // mouseup
            let x = -this.x1 + e.x - this.element.offsetTop
            let y = -this.y1 + e.y - this.element.offsetLeft
            this.emit("mouseup", {
                type: "mouseup",
                x: x,
                y: y,
                canvasX: x + this.x1,
                canvasY: y + this.y1,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                target: this.findTargeted(x, y)
            })
        })
        this.element.addEventListener("mouseleave", (e) => { // mouseleave
            this.emit("mouseleave", {
                type: "mouseleave",
                x: null,
                y: null,
                altKey: null,
                ctrlKey: null,
                shiftKey: null,
                target: null
            })
        })
        this.element.addEventListener("mouseenter", (e) => { // mouseenter
            this.emit("mouseenter", {
                type: "mouseenter",
                x: null,
                y: null,
                altKey: null,
                ctrlKey: null,
                shiftKey: null,
                target: null
            })
        })
        this.element.addEventListener("mousedown", (e) => { // grab & drop
            let element = e.target
            let emitGrab = e => {
                let x = -this.x1 + e.x - this.element.offsetTop
                let y = -this.y1 + e.y - this.element.offsetLeft
                this.emit("grab", {
                    type: "grab",
                    x: x,
                    y: y,
                    canvasX: x + this.x1,
                    canvasY: y + this.y1,
                    altKey: e.altKey,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    target: this.findTargeted(x, y)
                })
                element.addEventListener("mouseup", emitDrop)
                element.addEventListener("mouseleave", emitDrop)
            }
            let emitDrop = e => {
                let x = -this.x1 + e.x - this.element.offsetTop
                let y = -this.y1 + e.y - this.element.offsetLeft
                this.emit("drop", {
                    type: "drop",
                    x: x,
                    y: y,
                    canvasX: x + this.x1,
                    canvasY: y + this.y1,
                    altKey: e.altKey,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    target: this.findTargeted(x, y) || null
                })
                element.removeEventListener("mouseup", emitDrop)
                element.removeEventListener("mousemove", emitGrab)
                element.removeEventListener("mouseleave", emitDrop)
            }
            element.addEventListener("mousemove", emitGrab)
        })
    }
    /**
     * Initialise les patternes
     * @param {Object} pattern Patterne type
     */
    setPattern(selector, pattern) {
        this.getItemsWith(selector).forEach(item => {
            item.setPattern(pattern)
        })
        return
    }
    /**
     * Change le curseur dans le canvas
     * @param {string} cursor Nom ou URL de curseur
     */
    setCursor(cursor) {
        if (typeof cursor !== "string") throw TypeError("Canvas.setCursor: Argument 1 (cursor) is not a string")
        this.element.style.cursor = CURSORS.includes(cursor) ? cursor : "url(" + cursor + ")"
    }
    /**
     * Change le curseur  au passage de la souris sur l'item
     * @param {(string|string[]|Item|Item[])} selector Items
     * @param {string} cursor Nom ou URL de curseur
     */
    setItemCursor(selector, cursor) {
        if (typeof cursor !== "string") throw TypeError("Canvas.setItemCursor: Argument 2 (cursor) is not a string")
        this.getItemsWith(selector).forEach(item => {
            if (item instanceof RectangleItem) throw TypeError("Canvas.setItemCursor: Argument selector, an element specified is not an item")
            item.setCursor(cursor)
        })
    }
    /**
     * @public Créé une ligne
     * @param {number} x1 Abscisse du point de départ
     * @param {number} y1 Ordonnée du point de départ
     * @param {number} x2 Abscisse du point d'arrivée
     * @param {number} y2 Ordonnée du point d'arrivée
     * @param {Object} [pattern] Pattern type
     */
    createLine(x1, y1, x2, y2, pattern={}) {
        if (typeof x1 !== "number") throw TypeError("Canvas.createLine: Argument 1 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("Canvas.createLine: Argument 2 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("Canvas.createLine: Argument 3 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("Canvas.createLine: Argument 4 (y2) is not a number")
        if (typeof pattern !== "object") throw TypeError("Canvas.createLine: Argument 5 (pattern) is not an object")

        let item = new LineItem(this, x1, y1, x2, y2, pattern)
        item.index = this.items.push(item) - 1
        item.draw()
        return item
    }
    /**
     * @public Créé une courbe de Bézier
     * @param {number} x1 Abscisse du point de départ
     * @param {number} y1 Ordonnée du point de départ
     * @param {number} x2 Abscisse du point d'arrivée
     * @param {number} y2 Ordonnée du point d'arrivée
     * @param {number} cp1x Abscisse du premier point de contrôle
     * @param {number} cp1y Ordonnée du premier point de contrôle
     * @param {number} cp2x Abscisse du deuxième point de contrôle
     * @param {number} cp2y Ordonnée du deuxième point de contrôle
     * @param {Object} [pattern] Pattern type
     * @return {Item} Item en question
     */
    createCurve(x1, y1, x2, y2, cp1x, cp1y, cp2x, cp2y, pattern={}) {
        if (typeof x1 !== "number") throw TypeError("Canvas.createCurve: Argument 1 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("Canvas.createCurve: Argument 2 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("Canvas.createCurve: Argument 3 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("Canvas.createCurve: Argument 4 (y2) is not a number")
        if (typeof cp1x !== "number") throw TypeError("Canvas.createCurve: Argument 5 (cp1x) is not a number")
        if (typeof cp1y !== "number") throw TypeError("Canvas.createCurve: Argument 6 (cp1y) is not a number")
        if (typeof cp2x !== "number") throw TypeError("Canvas.createCurve: Argument 7 (cp2x) is not a number")
        if (typeof cp2y !== "number") throw TypeError("Canvas.createCurve: Argument 8 (cp2y) is not a number")
        if (typeof pattern !== "object") throw TypeError("Canvas.createCurve: Argument 9 (pattern) is not an object")
        
        let item = new CurveItem(this, x1, y1, x2, y2, cp1x, cp1y, cp2x, cp2y, pattern)
        item.index = this.items.push(item) - 1
        item.draw()
        return item
    }
    /**
     * @public Créé un rectangle
     * @param {number} x1 Abscisse du coin supérieur gauche 
     * @param {number} y1 Ordonnée du coin supérieur gauche 
     * @param {number} x2 Abscisse du coin inférieur droit 
     * @param {number} y2 Ordonnée du coin inférieur droit 
     * @param {Object} [pattern] Pattern type
     * @return {Item} Item en question
     */
    createRectangle(x1, y1, x2, y2, pattern={}) {
        if (typeof x1 !== "number") throw TypeError("Canvas.createRectangle: Argument 1 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("Canvas.createRectangle: Argument 2 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("Canvas.createRectangle: Argument 3 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("Canvas.createRectangle: Argument 4 (y2) is not a number")
        if (typeof pattern !== "object") throw TypeError("Canvas.createRectangle: Argument 5 (pattern) is not an object")

        let item = new RectangleItem(this, x1, y1, x2, y2, pattern)
        item.index = this.items.push(item) - 1
        item.draw()
        return item
    }
    /**
     * @public Créé une ellipse
     * @param {number} x1 Abscisse du coin supérieur gauche de la bbox
     * @param {number} y1 Ordonnée du coin supérieur gauche de la bbox
     * @param {number} x2 Abscisse du coin inférieur droit de la bbox
     * @param {number} y2 Ordonnée du coin inférieur droit de la bbox
     * @param {Object} [pattern] Pattern type
     * @return {Item} Item en question
     */
    createEllipse(x1, y1, x2, y2, pattern={}) {
        if (typeof x1 !== "number") throw TypeError("Canvas.createEllipse: Argument 1 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("Canvas.createEllipse: Argument 2 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("Canvas.createEllipse: Argument 3 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("Canvas.createEllipse: Argument 4 (y2) is not a number")
        if (typeof pattern !== "object") throw TypeError("Canvas.createEllipse: Argument 5 (pattern) is not an object")

        let item = new EllipseItem(this, x1, y1, x2, y2, pattern)
        item.index = this.items.push(item) - 1
        item.draw()
        return item
    }
    /**
     * @public Créé un arc
     * @param {number} x1 Abscisse du coin supérieur gauche de la bbox
     * @param {number} y1 Ordonnée du coin supérieur gauche de la bbox
     * @param {number} x2 Abscisse du coin inférieur droit de la bbox
     * @param {number} y2 Ordonnée du coin inférieur droit de la bbox
     * @param {number} start Valeur de l'angle avec laquelle démarre l'arc de cercle
     * @param {number} extent Valeur de l'angle avec laquelle se finit l'arc de cercle
     * @param {number} [anticlockwise=true] Indique que l'arc sera dessiné dans le sens inverse des aiguilles d'une montre entre les deux angles (Par défaut, la valeur est le sens des aiguilles d'une montre)
     * @param {Object} [pattern={}] Pattern type
     * @return {Item} Item en question
     */
    createArc(x1, y1, x2, y2, start, extent, anticlockwise=true, pattern={}) {
        if (typeof x1 !== "number") throw TypeError("Canvas.createArc: Argument 1 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("Canvas.createArc: Argument 2 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("Canvas.createArc: Argument 3 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("Canvas.createArc: Argument 4 (y2) is not a number")
        if (typeof start !== "number") throw TypeError("Canvas.createArc: Argument 5 (start) is not a number")
        if (typeof extent !== "number") throw TypeError("Canvas.createArc: Argument 6 (extent) is not a number")
        if (typeof pattern !== "object") throw TypeError("Canvas.createArc: Argument 7 (pattern) is not an object")

        let item = new ArcItem(this, x1, y1, x2, y2, start, extent, anticlockwise, pattern)
        item.index = this.items.push(item) - 1
        item.draw()
        return item
    }
    /**
     * @public Créé une image
     * @param {number} x1 Abscisse du coin supérieur gauche
     * @param {number} y1 Ordonnée du coin supérieur gauche
     * @param {number} x2 Abscisse du coin inférieur droit
     * @param {number} y2 Ordonnée du coin inférieur droit
     * @param {string} url Url de l'image
     * @param {Object} [pattern] Pattern type
     * @return {Item} Item en question
     */
    createImage(x, y, width, height, url, pattern={}) {
        if (typeof x !== "number") throw TypeError("Canvas.createImage: Argument 1 (x) is not a number")
        if (typeof y !== "number") throw TypeError("Canvas.createImage: Argument 2 (y) is not a number")
        if (typeof width !== "number") throw TypeError("Canvas.createImage: Argument 3 (width) is not a number")
        if (typeof height !== "number") throw TypeError("Canvas.createImage: Argument 4 (height) is not a number")
        if (typeof pattern !== "object") throw TypeError("Canvas.createImage: Argument 5 (pattern) is not an object")
        
        let item = new ImageItem(this, x, y, width, height, url, pattern)
        item.index = this.items.push(item) - 1
        item.img.onload = e => {
            item.draw()
        }
        return item
    }
    /**
     * @public Créé un texte
     * @param {string} text Texte
     * @param {number} x Abscisse du coin supérieur gauche
     * @param {number} y Ordonnée du coin supérieur gauche
     * @param {Object} [pattern] Pattern type
     * @return {Item} Item en question
     */
    createText(text, x, y, pattern={}) {
        if (typeof text !== "string") throw TypeError("Canvas.createText: Argument 1 (text) is not a string")
        if (typeof x !== "number") throw TypeError("Canvas.createText: Argument 2 (x) is not a number")
        if (typeof y !== "number") throw TypeError("Canvas.createText: Argument 3 (y) is not a number")
        if (typeof pattern !== "object") throw TypeError("Canvas.createText: Argument 4 (pattern) is not an object")

        let item = new TextItem(this, typeof text === "string" ? text : text.toString, x, y, pattern)
        item.index = this.items.push(item) - 1
        item.draw()
        return item
    }
    /**
     * @public Reçoit l'événement
     * @param {(string|string[]|Item|Item[])} selector Items
     * @param {string} eventName Nom de l'événement
     * @param {function} callback Fonction qui sera executée lorsque que l'événement [eventName] sera émit
     */
    addItemEvent(selector, eventName, callback) {
        if (typeof eventName !== "string") TypeError("Canvas.addItemEvent: Argument 2 (eventName) is not a string")
        if (typeof callback !== "function") TypeError("Canvas.addItemEvent: Argument 3 (callback) is not a function")

        this.getItemsWith(selector).forEach(item => {
            item.on(eventName, callback)
        })
        return
    }
    /**
     * @public Detruit une fonction lié à l'événement [eventName]
     * @param {(string|string[]|Item|Item[])} selector Items
     * @param {string} eventName Nom de l'événement
     * @param {function} func Fonction attribuée par [eventName] qui sera supprimé
     */
    removeItemEvent(selector, eventName, func) {
        if (typeof eventName !== "string") TypeError("Canvas.removeItemEvent: Argument 2 (eventName) is not a string")
        if (typeof func !== "function") TypeError("Canvas.removeItemEvent: Argument 3 (func) is not a function")

        this.getItemsWith(selector).forEach(item => {
            item.off(eventName, func)
        })
        return
    }
    /**
     * Change les coordonnées de [item] dans le canvas
     * @param {(string|string[]|Item|Item[])} selector Items à déplacer
     * @param {number} x Nouvelle abscisse
     * @param {number} y Nouvelle ordonnée
     */
    coords(selector, x, y) {
        if (typeof x !== "number") throw TypeError("Canvas.coords: Argument 2 (x) is not a number")
        if (typeof y !== "number") throw TypeError("Canvas.coords: Argument 3 (y) is not a number")

        this.getItemsWith(selector).forEach(item => {
            item.coords(x, y, false)
        })
        this.reload()
        return
    }
    /**
     * Déplace [item] dans le canvas
     * @param {(string|string[]|Item|Item[])} selector Items à déplacer
     * @param {number} x Abscisse à incrémenter
     * @param {number} y Ordonnée à incrémenter
     */
    move(selector, x, y) {
        if (typeof x !== "number") throw TypeError("Canvas.move: Argument 2 (x) is not a number")
        if (typeof y !== "number") throw TypeError("Canvas.move: Argument 3 (y) is not a number")
        
        this.getItemsWith(selector).forEach(item => {
            item.move(x, y, false)
        })
        this.reload()
        return
    }
    /**
     * @public Supprime les [items]
     * @param {(string|string[]|Item|Item[])} selector Items à supprimer
     */
    delete(selector) {
        this.getItemsWith(selector).forEach(item => {
            item.delete(false)
        })
        this.reload()
        return
    }
    /**
     * Superpose l'item dans le canvas
     * @param {(string|string[]|Item|Item[])} selector Items à superposer
     */
    overlap(selector) {
        this.getItemsWith(selector).forEach(item => {
            item.overlap(false)
        })
        this.reload()
        return
    }
    /**
     * @public Dessine tout les items dans le canvas
     */
    draw() {
        this.findAll().forEach(item => {
            item.draw()
        })
        return
    }
    /**
     * @protected Efface tout les items dans la canvas
     */
    clear() {
        this.ctx.clearRect(
            -this.scrollRegion.w,
            -this.scrollRegion.n,
            this.element.width + this.scrollRegion.e,
            this.element.height + this.scrollRegion.s
        )
        return
    }
    /**
     * @public Efface puis redessine tous les items dans le canvas
     */
    reload() {
        this.clear()
        this.draw()
        return
    }
    /**
     * Renvoie les items associé au sélécteurs spécifiés
     * @param {(string|string[]|Item|Item[])} selector Sélécteur
     * @return {Item[]} Items associés aux sélécteurs spécifiés
     */
    getItemsWith(selector) {
        let out = []
        if (selector instanceof Array) {
            selector.forEach(item => {
                out = out.concat(this.getItemsWith(item))
            })
        } else if (selector instanceof Item) {
                let item = selector
                out.push(item)
        } else if (selector === "*") {
            out = this.findAll()
        } else if (typeof selector === "string") {
            if (this.tagExists(selector)) {
                out = out.concat(this.findWithTag(selector))
            }
        }
        return out.unique()
    }
    /**
     * Ajoute la marque spécifiée à/aux item spécifiés
     * @param {(string|string[]|Item|Item[])} selector Sélécteur
     * @param {string} tagName Nom de la marque
     */
    addTag(selector, tagName) {
        if (typeof tagName !== "string" && tagName != "") throw TypeError("Canvas.addTag: Argument 2 (tagName) is not a string")
        if (tagName != "*") {
            this.getItemsWith(selector).forEach(item => {
                if (!item.hasTag(tagName)) {
                    item.tags.push(tagName)
                }
            })
        }
        return
    }
    /**
     * Ajoute une marque à tous les item dans la canvas
     * @param {string} tagName Nom de la marque
     */
    addTagAll(tagName) {
        if (typeof tagName !== "string" && tagName != "") throw TypeError("Canvas.addTagAll: Argument 1 (tagName) is not a string")

        this.addTag(tagName, this.findAll())
        return
    }
    /**
     * Rerourne vrai si la marque spécifié existe
     * @param {string} tagName Nom de la marque
     * @return {boolean}
     */
    tagExists(tagName) {
        if (typeof tagName !== "string" && tagName != "") throw TypeError("Canvas.tagExists: Argument 1 (tagName) is not a string")

        return new Boolean(this.findWithTag(tagName).length)
    }
    /**
     * Vérifie si les items spécifiés contiennent la marque spécifiée
     * @param {(string|string[]|Item|Item[])} selector Sélécteur
     * @param {string} tagName Nom de la marque
     * @return {boolean}
     */
    hasTag(selector, tagName) {
        if (typeof tagName !== "string" && tagName != "") throw TypeError("Canvas.hasTag: Argument 2 (tagName) is not a string")

        return this.getItemsWith(selector).every(item => {
            return item.hasTag(tagName)
        })
    }
    /**
     * Supprime un tag via un selecteur
     * @param {(string|string[]|Item|Item[])} selector Sélécteur
     * @param {(string[]|string)} tagName Tag à supprimer
     */
    deleteTag(selector, tagName) {
        if (typeof tagName !== "string" && tagName != "") throw TypeError("Canvas.deleteTag: Argument 2 (tagName) is not a string")

        let out = this.getItemsWith(selector)
        out.forEach(item => {
            if (item.hasTag(tagName)) {
                item.deleteTag(tagName)
            }
        })
        return out
    }
    /**
     * Retourne tous les items dans le canvas
     * @return {array} Totalité des item dans la canvas
     */
    findAll() {
        return this.items
    }
    /**
     * Retourne les item ayant la marque spécifié
     * @param {string} tagName Nom de la marque
     * @return {array<object>} item ayant la marque spécifié
     */
    findWithTag(tagName) {
        if (typeof tagName !== "string" && tagName != "") throw TypeError("Canvas.findWithTag: Argument 1 (tagName) is not a string")

        let out = []
        this.items.forEach(item => {
            if (item.tags.includes(tagName)) {
                out.push(item)
            }
        })
        return out
    }
    /**
     * Retourne la liste des items situés entièrement à l'interieur du rectangle spécifié
     * @param {number} x1 Abscisse du point supérieur gauche
     * @param {number} y1 Ordonnée du point supérieur gauche
     * @param {number} x2 Abscisse du point inférieur droit
     * @param {number} y2 Ordonnée du point inférieur droit
     * @return {array<object>} items situés entièrement à l'interieur du rectangle spécifié
     */
    findEnclosed(x1, y1, x2, y2) {
        if (typeof x1 !== "number") throw TypeError("Canvas.findEnclosed: Argument 1 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("Canvas.findEnclosed: Argument 2 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("Canvas.findEnclosed: Argument 3 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("Canvas.findEnclosed: Argument 4 (y2) is not a number")

        let items = []
        let referrerItem = new RectangleItem(this, x1, y1, x2, y2)
        this.items.forEach(item => {
            if (item instanceof RectangleItem) {
                if (referrerItem.isEnclosedBy(item)) {
                    items.push(item)
                }
            }
        })
        return items
    }
    /**
     * Retourne la liste des items compris à l'interieur du rectangle spécifié
     * @param {number} x1 Abscisse du point supérieur gauche
     * @param {number} y1 Ordonnée du point supérieur gauche
     * @param {number} x2 Abscisse du point inférieur droit
     * @param {number} y2 Ordonnée du point inférieur droit
     * @return {array<object>} items compris à l'interieur du rectangle spécifié
     */
    findOverlapping(x1, y1, x2, y2) {
        if (typeof x1 !== "number") throw TypeError("Canvas.findOverlapping: Argument 1 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("Canvas.findOverlapping: Argument 2 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("Canvas.findOverlapping: Argument 3 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("Canvas.findOverlapping: Argument 4 (y2) is not a number")

        let items = []
        let referrerItem = new RectangleItem(this, x1, y1, x2, y2)
        this.items.forEach(item => {
            if (item instanceof RectangleItem) {
                if (referrerItem.isIncludedBy(item)) {
                    items.push(item)
                }
            }
        })
        return items
    }
    /**
     * Retourne les items touchés par les coordonnées spécifiés
     * @param {number} x Abscisse de recherche
     * @param {number} y Ordonnée de recherche
     */
    findTargeted(x, y) {
        if (typeof x !== "number") throw TypeError("Canvas.findTargeted: Argument 1 (x) is not a number")
        if (typeof y !== "number") throw TypeError("Canvas.findTargeted: Argument 2 (y) is not a number")
        let items = []
        this.items.forEach(item => {
            if (item instanceof RectangleItem) {
                if (item.isTargetedBy(x, y)) {
                    items.push(item)
                }
            }
        })
        return items
    }
    /**
     * Retourne le type de l'item spécifié
     * @param {Item} item Item
     */
    type(item) {
        if (item instanceof Item) throw TypeError("Canvas.type: Argument 1 (item) is not an item")
        return item.type
    }
    /**
     * Retourne l'index de l'item spécifié
     * @param {Item} item Item
     * @return {number} index de l'item spécifié
     */
    index(item) {
        if (item instanceof Item) throw TypeError("Canvas.index: Argument 1 (item) is not an item")
        return item.index
    }
    /**
     * Change la vue du canvas
     * @param {number} x Abscisse de la nouvelle origine
     * @param {number} y Ordonnée de la nouvelle origine
     */
    coordsView(x, y) {
        if (typeof x !== "number") throw TypeError("Canvas.coordsView: Argument 1 (x) is not a number")
        if (typeof y !== "number") throw TypeError("Canvas.coordsView: Argument 2 (y) is not a number")
        if (x < 0)
            this.x1 = -x < this.scrollRegion.n ? x : -this.scrollRegion.n
        else if (x > 0)
            this.x1 = x < this.scrollRegion.s ? x : this.scrollRegion.s
        else
            this.x1 = 0
        if (y < 0)
            this.y1 = -y < this.scrollRegion.w ? y : -this.scrollRegion.w
        else if (y > 0)
            this.y1 = y < this.scrollRegion.e ? y : this.scrollRegion.e
        else
            this.y1 = 0

        this.x2 = this.x1 + this.width
        this.y2 = this.y1 + this.height
        this.reload()
        return
    }
    /**
     * Déplace le vue du canvas
     * @param {number} dx Abscisse à incrémenter
     * @param {number} dy Ordonnée à incrémenter
     */
    moveView(x, y) {
        if (typeof x !== "number") throw TypeError("Canvas.moveView: Argument 1 (x) is not a number")
        if (typeof y !== "number") throw TypeError("Canvas.moveView: Argument 2 (y) is not a number")
        return this.coordsView(this.x1 + dx, this.y1 + dy)
    }
    /**
     * Sauvegarde le canvas dans un fichier
     * @param {string} fileName Nom du fichier qui sera sauvegardé
     */
    save(fileName) {
        if (typeof fileName !== "string") throw TypeError("Canvas.save: Argument 1 (fileName) is not a string")
        // IE/Edge Support (seulement en PNG)
        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(this.element.msToBlob(), (fileName || "canvas") + ".png")
        } else {
            let link = document.createElement("a")
            link.href = this.element.toDataURL()
            link.download = (fileName || "canvas") + ".png"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
        return
    }
}
/**
 * Classe qui représente un item
 * @extends EventsTrigger
 */
class Item extends EventsTrigger {
    /**
     * @constructor
     * @param {Canvas} canvas Air de jeu
     * @param {Object} pattern Pattern type
     */
    constructor(canvas, pattern) {
        if (!(canvas instanceof Canvas)) throw TypeError("Item instance: Argument 1 (canvas) is not a Canvas object")
        if (typeof pattern !== "object") throw TypeError("Item instance: Argument 2 (pattern) is not an object")

        super() // events
        this.canvas = canvas
        this.index = null
        this.tags = []
        this.pattern = {}
        this.setPattern(pattern, false, false)
    }
    /**
     * @public Superpose l'item spécifié
     * @param {boolean} [reload=true] 
     */
    overlap(reload=true) {
        this.delete()
        this.index = this.canvas.items.push(this) - 1
        if (reload || typeof reload === "undefined")
            this.canvas.reload()
        return
    }
    /**
     * @public Supprime l'item spécifié
     * @param {boolean} [reload=true] 
     */
    delete(reload=true) {
        delete this.canvas.items[this.canvas.items.indexOf(this)]
        this.emit("delete", this)
        if (reload || typeof reload === "undefined")
            this.canvas.reload()
        return
    }
    /**
     * Ajoute la marque spécifiée à l'item
     * @param {srting} tagName Nom de la marque
     */
    addTag(tagName) {
        if (typeof tagName !== "string" && tagName != "") throw TypeError("Canvas.addTag: Argument 1 (tagName) is not a string")

        this.tags.push(tagName)
        return
    }
    /**
     * Vérifie si l'item contient la marque spécifiée
     * @param {string} tagName Marque
     */        
    hasTag(tagName) {
        if (typeof tagName !== "string" && tagName != "") throw TypeError("Canvas.hasTag: Argument 1 (tagName) is not a string")

        return this.tags.includes(tagName)
    }
    /**
     * Supprime la marque spécifiée
     * @param {string} tagName Nom de la marque
     */
    deleteTag(...tagsName) {
        tagsName.forEach((tagName, i) => {
            if (typeof tagName !== "string" && tagName != "") throw TypeError("Canvas.addTag: Argument " + i + " is not a string")

            this.tags.remove(tagName)
        })
    }
    /**
     * Met en place le pattern spécifié
     * @param {Object} pattern Pattern type 
     */
    setPattern(pattern, reload=true, draw=true) {
        if (typeof pattern !== "object") throw TypeError("Item.setPattern: Argument 1 (pattern) is not an object")

        for (const property in DEFAULT_PATTERN) {
            if (DEFAULT_PATTERN.hasOwnProperty(property)) {
                if (pattern[property] || pattern[property] == 0) {
                    this.pattern[property] = pattern[property]
                } else if (this.pattern[property] || this.pattern[property] == 0) {
                    continue
                } else {
                    this.pattern[property] = DEFAULT_PATTERN[property]
                }
            }
        }
        if (draw || typeof draw === "undefined") {
            this.resetPattern()
            if (this.pattern.backgroundColor !== "tranparent") {
                // couleur de fond
                this.canvas.ctx.fillStyle = this.pattern.backgroundColor
                this.canvas.ctx.fill()
            }
            if (this.pattern.borderWidth) {
                // couleur de bordure
                this.canvas.ctx.strokeStyle = this.pattern.borderColor
                // largeur de bordure
                this.canvas.ctx.lineWidth = this.pattern.borderWidth
                // style des extrimités et des points de liason
                switch (this.pattern.borderEndsStyle) {
                    case "round":
                        // rond
                        this.canvas.ctx.lineJoin =  "round"
                        this.canvas.ctx.lineCap = "round"
                        break
                    case "bevel":
                        // biseau
                        this.canvas.ctx.lineJoin = "bevel"
                        this.canvas.ctx.lineCap = "butt"
                        break
                    default:
                        // onglet (par défaut)
                        this.canvas.ctx.lineJoin = "miter"
                        this.canvas.ctx.lineCap = "square"
                        break
                }
                if (this.pattern.borderStyle === "dashed") 
                    // bordure en pointillé
                    this.canvas.ctx.setLineDash([this.pattern.borderWidth])
                else
                    // bordure solide
                    this.canvas.ctx.setLineDash([0, 0])
                this.canvas.ctx.stroke()
            }
            // ombres
            this.canvas.ctx.shadowOffsetX = this.pattern.shadowOffsetX
            this.canvas.ctx.shadowOffsetY = this.pattern.shadowOffsetY
            this.canvas.ctx.shadowColor   = this.pattern.shadowColor
            this.canvas.ctx.shadowBlur    = this.pattern.shadowBlur
        }
        if (reload || typeof reload === "undefined")
            this.canvas.reload()
        return
    }
    /**
     * Réinitialise les couleurs, les polices de catactère, bordure, etc... dans la canvas
     */
    resetPattern() {
        // couleur de fond
        this.canvas.ctx.fillStyle = DEFAULT_PATTERN.backgroundColor
        // couleur de bordure
        this.canvas.ctx.strokeStyle = DEFAULT_PATTERN.borderColor
        // largeur de bordure
        this.canvas.ctx.lineWidth = DEFAULT_PATTERN.borderWidth
        this.canvas.ctx.lineJoin = "miter"
        this.canvas.ctx.lineCap = DEFAULT_PATTERN.borderEndsStyle
        this.canvas.ctx.setLineDash([0, 0])
        // ombres
        this.canvas.ctx.shadowOffsetX = DEFAULT_PATTERN.shadowOffsetX // décalage X
        this.canvas.ctx.shadowOffsetY = DEFAULT_PATTERN.shadowOffsetY // décalage Y
        this.canvas.ctx.shadowColor   = DEFAULT_PATTERN.shadowColor     // couleur
        this.canvas.ctx.shadowBlur    = DEFAULT_PATTERN.shadowBlur       // portée
    }
    /**
     * Dessine l'item dans le canvas
     */
    draw() {
        return
    }
}
/**
 * Classe qui représente un ligne
 * @extends Item
 */
class LineItem extends Item {
    /**
     * @constructor
     * @param {Canvas} canvas Air de jeu
     * @param {number} x1 Abscisse du point de départ
     * @param {number} y1 Ordonnée du point de départ
     * @param {number} x2 Abscisse du point d'arrivée
     * @param {number} y2 Ordonnée du point d'arrivée
     * @param {Object} pattern Pattern type
     */
    constructor(canvas, x1, y1, x2, y2, pattern) {
        if (!(canvas instanceof Canvas)) throw TypeError("LineItem.constructor: Argument 1 (canvas) is not a Canvas object")
        if (typeof x1 !== "number") throw TypeError("LineItem.constructor: Argument 2 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("LineItem.constructor: Argument 3 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("LineItem.constructor: Argument 4 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("LineItem.constructor: Argument 5 (y2) is not a number")
        if (typeof pattern !== "object") throw TypeError("LineItem.constructor: Argument 6 (pattern) is not an object")
        super(canvas, pattern)
        this.type = "line"
        this.coords(x1, y1, x2, y2, false)
    }
    /**
     * @public Définie les coordonnées de la ligne
     * @param  {...number} args Nouvelle coordonnées
     */
    coords(...args) {
        let reload
        if (args.length >= 4) {
            [this.x1, this.y1, this.x2, this.y2] = args

            reload = args[4] || typeof args[4] === "undefined" ? true : false
        } else if (args.length >= 2) {
            let dx = this.x2 - this.x1
            let dy = this.y2 - this.y1
            
            this.x1 = args[0]
            this.y1 = args[1]
            
            this.x2 = this.x1 + dx
            this.y2 = this.y1 + dy

            reload = args[2] || typeof args[2] === "undefined" ? true : false
        }
        this.emit("coords", this)
        if (reload || typeof reload === "undefined")
            this.canvas.reload()
        return
    }
    /**
     * @public Déplace la ligne avec les distances  spécifiées
     * @param {number} dx Différence d'abscisse
     * @param {number} dy Différence d'ordonnée
     * @param {boolean} [reload=true] 
     */
    move(dx, dy, reload=true) {
        if (typeof dx !== "number") TypeError("LineItem.move: Argument 1 (dx) is not a number")
        if (typeof dy !== "number") TypeError("LineItem.move: Argument 2 (dy) is not a number")

        this.coords(this.x1 + dx, this.y1 + dy, reload)
        this.emit("move", this)
        return
    }
    /**
     * @protected Dessine la ligne dans le canvas
     */
    draw() {
        this.canvas.ctx.beginPath()
        this.canvas.ctx.moveTo(
            this.canvas.x1 + this.x1,
            this.canvas.y1 + this.y1
        )
        this.canvas.ctx.lineTo(
            this.canvas.x1 + this.x2,
            this.canvas.y1 + this.y2
        )
        this.setPattern(this.pattern, false)
        this.canvas.ctx.closePath()
        return
    }
}
/**
 * Classe qui représente une courbe de Bézier
 * @extends Item
 */
class CurveItem extends Item {
    /**
     * @constructor
     * @param {Canvas} canvas Air de jeu
     * @param {number} x1 Abscisse du point de départ
     * @param {number} x2 Abscisse du point d'arrivée
     * @param {number} y2 Ordonnée du point d'arrivée
     * @param {number} y1 Ordonnée du point de départ
     * @param {number} cp1x Abscisse du premier point de contrôle
     * @param {number} cp1y Ordonnée du premier point de contrôle
     * @param {number} cp2x Abscisse du deuxième point de contrôle
     * @param {number} cp2y Ordonnée du deuxième point de contrôle
     * @param {Object} pattern Pattern type
     */
    constructor(canvas, x1, y1, x2, y2,cp1x, cp1y, cp2x, cp2y, pattern) {
        if (!(canvas instanceof Canvas)) throw TypeError("CurveItem.constructor: Argument 1 (canvas) is not a Canvas object")
        if (typeof x1 !== "number") throw TypeError("CurveItem.constructor: Argument 2 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("CurveItem.constructor: Argument 3 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("CurveItem.constructor: Argument 4 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("CurveItem.constructor: Argument 5 (y2) is not a number")
        if (typeof cp1x !== "number") throw TypeError("CurveItem.constructor: Argument 6 (cp1x) is not a number")
        if (typeof cp1y !== "number") throw TypeError("CurveItem.constructor: Argument 7 (cp1y) is not a number")
        if (typeof cp2x !== "number") throw TypeError("CurveItem.constructor: Argument 8 (cp2x) is not a number")
        if (typeof cp2y !== "number") throw TypeError("CurveItem.constructor: Argument 9 (cp2y) is not a number")
        if (typeof  pattern !== "object") throw TypeError("CurveItem.constructor: Argument 10 (pattern) is not an object")
        
        super(canvas, pattern)
        this.type = "curve"
        this.coords(x1, y1, x2, y2, cp1x, cp1y, cp2x, cp2y, false)    
    }
    /**
     * @public Définie les coordonnées de la courbe de Bézier avec les coordonnées spécifiées
     * @param  {...number} args Nouvelles coordonnées
     */
    coords(...args) {
        let reload
        if (args.length >= 8) {
            [this.x1, this.y1, this.x2, this.y2, this.cp1x, this.cp1y, this.cp2x, this.cp2y] = args

            reload = args[8] || typeof args[8] === "undefined" ? true : false
        } else if (args.length >= 2) {
            let dx = this.x2 - this.x1
            let dy = this.y2 - this.y1

            let dcp1x = this.cp1x - this.x1
            let dcp1y = this.cp1y - this.y1

            let dControl2X = this.cp2x - this.x1
            let dcp2y = this.cp2y - this.y1

            this.x1 = args[0]
            this.y1 = args[1]

            this.cp1x = this.x1 + dcp1x
            this.cp1y = this.y1 + dcp1y

            this.cp2x = this.x1 + dControl2X
            this.cp2y = this.y1 + dcp2y

            this.x2 = this.x1 + dx
            this.y2 = this.y1 + dy

            reload = args[2] || typeof args[2] === "undefined" ? true : false
        }
        this.emit("coords", this)
        if (reload || typeof reload === "undefined")
            this.canvas.reload()
        return
    }
    /**
     * @protected Dessine la courbe dans le canvas
     */
    draw() {
        this.canvas.ctx.beginPath()
        this.canvas.ctx.moveTo(
            this.canvas.x1 + this.x1,
            this.canvas.y1 + this.y1
        )
        this.canvas.ctx.bezierCurveTo(
            this.canvas.x1 + this.cp1x,
            this.canvas.y1 + this.cp1y,
            this.canvas.x1 + this.cp2x,
            this.canvas.y1 + this.cp2y,
            this.canvas.x1 + this.x2,
            this.canvas.y1 + this.y2
        )
        this.setPattern(this.pattern, false)
        this.canvas.ctx.closePath()
        return
    }
}
/**
 * Classe qui représente un rectangle
 * @extends Item
 */
class RectangleItem extends Item {  
    /**
     * @constructor
     * @param {Canvas} canvas Air de jeu
     * @param {number} x1 Abscisse coin supérieur gauche
     * @param {number} y1 Ordonnée coin supérieur gauche
     * @param {number} x2 Abscisse coin inférieur droit
     * @param {number} y2 Ordonnée coin inférieur droit
     * @param {Object} pattern Pattern type
     */
    constructor(canvas, x1, y1, x2, y2, pattern) {
        if (!(canvas instanceof Canvas)) throw TypeError("RectangleItem.constructor: Argument 1 (canvas) is not a Canvas object")
        if (typeof x1 !== "number") throw TypeError("RectangleItem.constructor: Argument 2 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("RectangleItem.constructor: Argument 3 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("RectangleItem.constructor: Argument 4 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("RectangleItem.constructor: Argument 5 (y2) is not a number")
        if (typeof pattern !== "object") throw TypeError("RectangleItem.constructor: Argument 6 (pattern) is not an object")

        super(canvas, pattern)
        this.coords(x1, y1, x2, y2, false)
        this.type = "rectangle"
        this.initEvents()
    }
    /**
     * @private Initialise les événement du rectangle
     */
    initEvents() {
        EVENTS.slice(0, 9).forEach(eventName => {
            this.canvas.on(eventName, e => {
                if (e.target.includes(this)) {
                    this.emit(eventName, e)
                }
            })
        })
        let mouseenter = e => {
            if (e.target && e.target.includes(this)) {
                this.emit("mouseenter", e)
                this.canvas.off("mousemove", mouseenter)
                this.canvas.on("mousemove", mouseleave)
                this.canvas.on("mouseleave", mouseleave)
            }
        }
        let mouseleave = e => {
            if (e.type == "mouseleave" || !e.target.includes(this)) {
                this.emit("mouseleave", e)
                this.canvas.off("mousemove", mouseleave)
                this.canvas.off("mouseleave", mouseleave)
                this.canvas.on("mousemove", mouseenter)
            }
        }
        this.canvas.on("mousemove", mouseenter)
        return
    }
    /**
     * @public Définie les coordonnées du rectangle
     * @param {number} x1 Abscisse du coin supérieur gauche
     * @param {number} y1 Ordonnée du coin supérieur gauche
     * @param {number} x2 Abscisse du coin inférieur droit
     * @param {number} y2 Ordonnée du coin inférieur droit
     */
    coords(x1, y1, x2, y2, reload=true) {
        if (typeof x1 !== "number") throw TypeError("RectangleItem.coords: Argument 1 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("RectangleItem.coords: Argument 2 (y1) is not a number")

        if (x2 && y2) {
            if (typeof x2 !== "number") throw TypeError("RectangleItem.coords: Argument 3 (x2) is not a number")
            if (typeof y2 !== "number") throw TypeError("RectangleItem.coords: Argument 4 (y2) is not a number")
            this.x2 = x2
            this.y2 = y2
        } else {
            let dx = this.x2 - this.x1
            let dy = this.y2 - this.y1
            this.x2 = x1 + dx
            this.y2 = y1 + dy
        }
        this.x1 = x1
        this.y1 = y1
        this.x = this.x1 + (this.x2 - this.x1) / 2
        this.y = this.y1 + (this.y2 - this.y1) / 2

        if (reload || typeof reload === "undefined")
            this.canvas.reload()
        return
    }
    /**
     * @public Déplace le rectangle avec les distances spécifiées
     * @param {number} dx Différance d'abscisse
     * @param {number} dy Différance d'ordonnée
     * @param {boolean} [reload=true] 
     */
    move(dx, dy, reload=true) {
        if (typeof dx !== "number") throw TypeError("RectangleItem.move: Argument 1 (dx) is not a number")
        if (typeof dy !== "number") throw TypeError("RectangleItem.move: Argument 2 (dy) is not a number")

        this.coords(this.x1 + dx, this.y1 + dy, reload)
        return
    }
    /**
     * Change le curseur au passage de la sours sur l'item
     * @param {string} cursorName Nom ou URL du curseur
     */
    setCursor(cursorName) {
        if (typeof cursorName !== "string" || cursorName != "") TypeError("RectangleItem.setCursor: Argument 1 (cursorName) is not a string")
        this.on("mouseenter", e => {
            this.canvas.element.style.cursorName = CURSORS.includes(cursorName) ? cursorName : "url(" + cursorName + ")"
        })
        this.on("mouseleave", e => {
            this.canvas.element.style.cursorName = "auto"
        })
        return
    }
    /**
     * Vérifie si l'item spécifié est inclu par le rectangle
     * @param {Item} item Item de référence
     * @return {boolean}
     */
    isIncludedBy(item) {
        if (!(item instanceof RectangleItem)) throw TypeError("RectangleItem.isIncludedBy: Argument 1 (item) is not a rectangle, ellipse, image or text")
        return (item.x2 >= this.x1 && item.x1 <= this.x2) && (item.y2 >= this.y1 && item.y1 <= this.y2)
    }
    /**
     * Vérifie si l'item spécifié est enfermé par le rectangle
     * @param {objet} item Item de référence
     * @return {boolean}
     */
    isEnclosedBy(item) {
        if (!(item instanceof RectangleItem)) throw TypeError("RectangleItem.isEnclosedBy: Argument 1 (item) is not a rectangle, ellipse, image or text")
        return (this.x1 <= item.x1 && this.x2 >= item.x2) && (this.y1 <= item.y1 && this.y2 >= item.y2)
    }
    /**
     * Vérifie si l'item spécifié est contenant du rectangle
     * @param {objet} item Item de référence
     * @return {boolean}
     */
    isContaningOf(item) {
        if (!(item instanceof RectangleItem)) throw TypeError("RectangleItem.isContainingOf: Argument 1 (item) is not a rectangle, ellipse, image or text")
        return item.isEnclosedBy(this)
    }
    /**
     * Vérifie si le point spécifié appartient au rectangle 
     * @param {number} x Abscisse
     * @param {number} y Orodnnée
     * @return {boolean} 
     */
    isTargetedBy(x, y) {
        if (typeof x !== "number") throw TypeError("Canvas.isTargetedBy: Argument 1 (x) is not a number")
        if (typeof y !== "number") throw TypeError("Canvas.isTargetedBy: Argument 2 (y) is not a number")
        return (x >= this.x1 && x <= this.x2) && (y >= this.y1 && y <= this.y2)
    }
    /**
     * @protected Dessine le rectangle dans le canvas
     */
    draw() {
        this.canvas.ctx.beginPath()
        this.canvas.ctx.moveTo(
            this.canvas.x1 + this.x1,
            this.canvas.y1 + this.y1
        )
        this.canvas.ctx.rect(
            this.canvas.x1 + this.x1,
            this.canvas.y1 + this.y1,
            this.x2 - this.x1,
            this.y2 - this.y1
        )
        this.setPattern(this.pattern, false)
        this.canvas.ctx.closePath()
        return
    }
}
/**
 *  Classe qui représente une ellipse 
 *  @extends RectangleItem
 */
class EllipseItem extends RectangleItem {
    /**
     * @constructor
     * @param {Canvas} canvas Air de jeu
     * @param {number} x1 Abscisse du coin supérieur gauche
     * @param {number} y1 Ordonnée du coin supérieur gauche
     * @param {number} x2 Abscisse du coin inférieur droit
     * @param {number} y2 Ordonnée du coin inférieur droit
     * @param {Object} pattern Pattern type
     */
    constructor(canvas, x1, y1, x2, y2, pattern) {
        if (!(canvas instanceof Canvas)) throw TypeError("EllipseItem.constructor: Argument 1 (canvas) is not a Canvas object")
        if (typeof x1 !== "number") throw TypeError("EllipseItem.constructor: Argument 2 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("EllipseItem.constructor: Argument 3 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("EllipseItem.constructor: Argument 4 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("EllipseItem.constructor: Argument 5 (y2) is not a number")
        if (typeof pattern !== "object") throw TypeError("EllipseItem.constructor: Argument 6 (pattern) is not an object")

        super(canvas, x1, y1, x2, y2, pattern)
        this.type = "ellipse"
    }
    /**
     * @protected Dessine l'ellipse dans le canvas
     */
    draw() {
        let rx = (this.x2 - this.x1) / 2
        let ry = (this.y2 - this.y1) / 2
        this.canvas.ctx.beginPath()
        this.canvas.ctx.moveTo(
            this.canvas.x1 + this.x1 + rx * 2,
            this.canvas.y1 + this.y1 + ry
        )
        this.canvas.ctx.ellipse(
            this.canvas.x1 + this.x1 + rx,
            this.canvas.y1 + this.y1 + ry,
            rx,
            ry,
            0,
            0,
            2 * Math.PI
        )
        this.setPattern(this.pattern, false)
        this.canvas.ctx.closePath()
        return
    }
}
/**
 * Classe qui représente un arc
 * @extends EllipseItem
 */
class ArcItem extends EllipseItem {
    /**
     * @constructor
     * @param {Canvas} canvas Air de jeu
     * @param {number} x1 Abscisse du coin supérieur gauche
     * @param {number} y1 Ordonnée du coin supérieur gauche
     * @param {number} x2 Abscisse du coin inférieur droit
     * @param {number} y2 Ordonnée du coin inférieur droit
     * @param {number} start Angle de départ
     * @param {number} extent Angle de fin
     * @param {boolean} anticlockwise Sens du remplissage de l'arc (sens des aiguilles d'une montre par défaut)
     * @param {Object} pattern Pattern type
     */
    constructor(canvas, x1, y1, x2, y2, start, extent, anticlockwise=true, pattern) {
        if (!(canvas instanceof Canvas)) throw TypeError("ArcItem.constructor: Argument 1 (canvas) is not a Canvas object")
        if (typeof x1 !== "number") throw TypeError("ArcItem.constructor: Argument 2 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("ArcItem.constructor: Argument 3 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("ArcItem.constructor: Argument 4 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("ArcItem.constructor: Argument 5 (y2) is not a number")
        if (typeof start !== "number") throw TypeError("ArcItem.constructor: Argument 6 (start) is not a number")
        if (typeof extent !== "number") throw TypeError("ArcItem.constructor: Argument 7 (extent) is not a number")    
        if (typeof pattern !== "object") throw TypeError("ArcItem.constructor: Argument 8 (pattern) is not an object")

        super(canvas, x1, y1, x2, y2, pattern)
        this.type = "arc"
        this.start = start
        this.extent = extent
        this.anticlockwise = typeof anticlockwise !== "undefined" ? anticlockwise : true
    }
    /**
     * @protected Dessine l'arc dans le canvas
     */
    draw() {
        let rx = (this.x2 - this.x1) / 2
        let ry = (this.y2 - this.y1) / 2
        this.canvas.ctx.beginPath()
        this.canvas.ctx.moveTo(
            this.canvas.x1 + this.x1 + rx * 2,
            this.canvas.y1 + this.y1 + ry
        )   
        this.canvas.ctx.ellipse(
            this.x1 + rx,
            this.y1 + ry,
            rx,
            ry,
            0,
            this.start,
            this.extent,
            this.anticlockwise,
        )
        this.setPattern(this.pattern, false)
        this.canvas.ctx.closePath()
    }
}
/**
 * Classe qui représente une image
 * @extends RectangleItem
 */
class ImageItem extends RectangleItem {
    /**
     * @constructor
     * @param {Canvas} canvas Air de jeu
     * @param {number} x1 Abscisse du coin supérieur gauche
     * @param {number} y1 Ordonnée du coin supérieur gauche
     * @param {number} x2 Abscisse du coin inférieur droit
     * @param {number} y2 Ordonnée du coin inférieur droit
     * @param {string} url Url de l'image
     * @param {Object] pattern Pattern type
     */
    constructor(canvas, x1, y1, x2, y2, url, pattern) {
        if (!(canvas instanceof Canvas)) throw TypeError("ImageItem.constructor: Argument 1 (canvas) is not a Canvas object")
        if (typeof x1 !== "number") throw TypeError("ImageItem.constructor: Argument 2 (x1) is not a number")
        if (typeof y1 !== "number") throw TypeError("ImageItem.constructor: Argument 3 (y1) is not a number")
        if (typeof x2 !== "number") throw TypeError("ImageItem.constructor: Argument 4 (x2) is not a number")
        if (typeof y2 !== "number") throw TypeError("ImageItem.constructor: Argument 5 (y2) is not a number")
        if (typeof pattern !== "object") throw TypeError("ImageItem.constructor: Argument 6 (pattern) is not an object")

        super(canvas, x1, y1, x2, y2, pattern)
        this.img = new Image()
        this.img.src = url
        this.img.width = x2 - x1
        this.img.height = y2 - y1
        this.type = "image"
    }
    setURL(url) {
        this.img.src = url
        this.canvas.reload()
        return
    }
    /**
     * @protected Dessine l'image dans le canvas
     */
    draw() {
        this.canvas.ctx.beginPath()
        this.canvas.ctx.moveTo(
            this.canvas.x1 + this.x1,
            this.canvas.y1 + this.y1
        )
        this.canvas.ctx.rect(
            this.canvas.x1 + this.x1,
            this.canvas.y1 + this.y1,
            this.img.width,
            this.img.height
        )
        this.canvas.ctx.drawImage(
            this.img, 
            this.canvas.x1 + this.x1,
            this.canvas.y1 + this.y1,
            this.img.width,
            this.img.height
        )
        this.setPattern(this.pattern, false)
        this.canvas.ctx.closePath()
        return
    }
}
/**
 * Classe qui représente du texte
 * @extends RectangleItem
 * */
class TextItem extends RectangleItem {
    /**
     * @constructor
     * @param {Canvas} canvas Air de jeu
     * @param {string} text Texte
     * @param {number} x Abscisse du centre
     * @param {number} y Ordonnée du centre
     * @param {Object} pattern Pattern type
     */
    constructor(canvas, text, x, y, pattern) {
        if (!(canvas instanceof Canvas)) throw TypeError("Canvas.createText: Argument 1 (canvas) is not a Canvas object")
        if (typeof text !== "string") throw TypeError("Canvas.createText: Argument 2 (text) is not a string")
        if (typeof x !== "number") throw TypeError("Canvas.createText: Argument 3 (x) is not a number")
        if (typeof y !== "number") throw TypeError("Canvas.createText: Argument 4 (y) is not a number")
        if (typeof pattern !== "object") throw TypeError("Canvas.createText: Argument 5 (pattern) is not an object")

        canvas.ctx.font = (pattern.fontSize || DEFAULT_PATTERN.fontSize) + "px " + (pattern.fontFamily || DEFAULT_PATTERN.fontFamily)
        super(canvas, 
            x,
            y,
            x + canvas.ctx.measureText(text).width,
            y + (pattern.fontSize || DEFAULT_PATTERN.fontSize),
            pattern
        )
        this.text = text
        this.type = "text"
    }
    /**
     * Met en place le pattern spécifié
     * @param {Object} pattern Pattern type
     */
    setTextPattern(pattern, reload=true) {
        if (typeof pattern !== "object") TypeError("TextItem.setTextPattern: Argument 1 (pattern) is not an object")

        this.resetPattern()
        this.resetTextPattern()
        this.setPattern(pattern, false)
        if (this.pattern.textStrokeWidth) {
            this.canvas.ctx.lineWidth = this.pattern.textStrokeWidth
            this.canvas.ctx.strokeStyle = this.pattern.textStrokeColor
            this.canvas.ctx.strokeText(this.text, this.x, this.y)
        }
        this.canvas.ctx.font = this.pattern.fontSize + "px " + (this.pattern.fontFamily)
        this.canvas.ctx.fillStyle = this.pattern.color
        this.canvas.ctx.textAlign = this.pattern.textAlign
        this.canvas.ctx.textBaseline = 'top'

        if (reload)
            this.canvas.reload()
    }
    /**
     * Réinitialise les couleurs, bordures, la police de caractère
     */
    resetTextPattern() {
        this.canvas.ctx.lineWidth = DEFAULT_PATTERN.textStrokeWidth
        this.canvas.ctx.strokeStyle = DEFAULT_PATTERN.textStrokeColor
        this.canvas.ctx.fillStyle = DEFAULT_PATTERN.color
        this.canvas.ctx.font = DEFAULT_PATTERN.fontSize + "px " + (DEFAULT_PATTERN.fontFamily)
        this.canvas.ctx.textAlign = DEFAULT_PATTERN.textAlign
    }
    /**
     * @protected Dessine le texte dans le canvas
     */
    draw() {
        this.canvas.ctx.beginPath()
        this.canvas.ctx.moveTo(
            this.canvas.x1 + this.x1,
            this.canvas.y1 + this.y1
        )
        this.setPattern(this.pattern, false)
        this.canvas.ctx.rect(
            this.canvas.x1 + this.x1,
            this.canvas.y1 + this.y1,
            this.canvas.x1 + this.x2 - this.x1,
            this.canvas.y1 + this.y2 - this.y1
        )
        this.setTextPattern(this.pattern, false)
        this.canvas.ctx.fillText(
            this.text,
            this.canvas.x1 + this.x1,
            this.canvas.y1 + this.y1
        )
        this.canvas.ctx.closePath()
        return this
    }
}