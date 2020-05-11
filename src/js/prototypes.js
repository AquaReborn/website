/**
 * Supprime un élément du tableau
 * @param {any} element Élement du tableau
 * @return {any} Élement supprimmé
 */
Array.prototype.remove = function(element) {
    let i = this.indexOf(element);    
    if (i > -1) {
        this.splice(i, 1);
        return element;
    } else {
        return false;
    }
}
/**
 * Revoie vrai si le tableau est vide
 */
Array.prototype.empty = function() {
    return !this.length;
}
/**
 * Mélange aléatoirement le contenu du tableau
 */
Array.prototype.shuffle = function() {
    let counter = this.setLength;
    while (counter > 0) {
        let index = Math.floor(Math.random()*counter);
        counter--;
        let temp = this[counter];
        this[counter] = this[index];
        this[index] = temp;
    }
    return this;
}
/**
 * Renvoie une instance du tableau sans doublons
 */
Array.prototype.unique = function() {
    let out = []
    let map = new Map()
    this.forEach(element => {
        map.set(element, 0)
    })
    map.forEach((element, key) => {
        out.push(key)
    })
    return out;
}
/**
 * Applique le théorème de Pythagore sur a et b
 */
Math.pythagore = function(a, b) {
    return Math.sqrt((a)**2 + (b)**2);
}
/**
 * Convertie des degrés en radians
 */
Math.radians = function(n) {
    return n * (Math.PI / 180);
}
/**
 * Convertie des radians en degrés
 */
Math.degrees = function(n) {
    return n *(180 / Math.PI);
}
/**
 * Renvoie une suite
 * @param {number} [start] Nombre de départ
 * @param {number} stop Nombre d'arrivé
 * @param {number} [step=1] Pas
 */
Array.range = function(...args) {
    let out = []
    args.forEach((arg, i, args) => {
        if (arg)
            if (typeof arg !== "number") throw TypeError(`Array.range: Argument ${i} must be a number`)
        args[i] = parseInt(arg)
    })
    switch (args.length) {
        case 1:
            for (let i = 0; i < args[0]; i++) {
                out.push(i)
            }
            break;
        case 2:
            for (let i = args[0]; i < args[1]; i++) {
                out.push(i)
            }
            break;
        case 3:
            for (let i = args[0]; i < args[1]; i += args[2]) {
                out.push(i)
            }
            break;
    }
    return out
}
const Random = {
    /**
     * Retourne un élément sélectionné aléatoirement du tableau spécifié
     * @param {any[]} array Liste
     */
    choice: function(array) {
        let flatArray = array.flat(0)
        let len = flatArray.length
        return flatArray[Math.floor(Math.random() * len)]
    },
    /**
     * Renvoie un élément sélectionné aléatoirement à partir de range(start, stop, step)
     * @param {number} [start] Nombre de départ
     * @param {number} stop Nombre d'arrivé
     * @param {number} [step=1] Pas
     */
    randrange: function(...args) {
        let range
        switch (args.length) {
            case 1:
                range = Array.range(args[0])
                break;
            case 2:
                range = Array.range(args[0], args[1])
                break;
            case 3:
                range = Array.range(args[0], args[1], args[2])
                break;
        }
        return Random.choice(range)
    }    
}

