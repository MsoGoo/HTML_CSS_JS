const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const finalScore = document.querySelector('#finalScore')

// player class
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.r = this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

// projectile class
class Projectile{
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.r = this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

// enemy class
class Enemy{
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        if (radius < 5) {
            radius *= 3
        } else {
            this.radius = radius
        }
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.r = this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

//Particle class
const friction = 0.98
class Particle{
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1;
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.r = this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
    }
}

//create player
let x = canvas.width / 2
let y = canvas.height / 2

let player = new Player(x, y, 15, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
    score = 0;
    scoreEl.innerHTML = score;
    player = new Player(x, y, 15, 'white');
    projectiles = [];
    enemies = [];
    particles = []
}

// enemy spawn function
function spawnEnemies() {
    //initialize enemy's position
    setInterval(() => {
        const radius = Math.random() * 50
        let x
        let y
        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? canvas.width + radius : 0 - radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width 
            y = Math.random() < 0.5 ? canvas.height + radius : 0 - radius
            
        }
        
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height / 2 - y,
    canvas.width / 2 - x )
    
    //initialize enemy's velocity
    const velocity = {
        x : Math.cos(angle),
        y : Math.sin(angle)
    }
    
    //push enemy into the array
    enemies.push(new Enemy(
            x, y, radius, color, velocity))
     },3000)
}

// create animate id
let animationID
let score = 0

//animate fuction
function animate() {
    animationID = requestAnimationFrame(animate)
    //setup backgrond color & size
    c.fillStyle = 'rgba(0, 0, 0, 0.2)'
    c.fillRect(0,0,canvas.width, canvas.height)

    //draw player
    player.draw()

    //draw particle
    particles.forEach((particle, index) => {
        // if particle's alpha value < 0, remove it from the array
        if (particle.alpha <= 0) {
            particles.splice(particle, index)
        } else {
            particle.update()
        }
    })

    // draw projectiles 
    projectiles.forEach((projectile, projectileIndex) => {
        //updating the projetile's position, if the position is out of canvas's boundary, remove it from the array
        projectile.update()
        if (projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height ) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            },0)
        }
    })

    //draw enemies
    enemies.forEach((enemy) => {
        enemy.update()
        
        //if one of the enemy is collision with the player(central circle) end the game
        //end game
        const dis_PE = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dis_PE - player.radius - enemy.radius < 0) {
            cancelAnimationFrame(animationID)
            modalEl.style.display = 'flex'
            finalScore.innerHTML = score;
        }

        //chech collision of projectile and enemy.
        projectiles.forEach((projectile, projectileIndex) => {
            const dis = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            
            if (dis - enemy.radius - projectile.radius < 1) {
                // if projectile collide the enemy, push partiles in to the particles array. 
                // create explosions
                for (let i = 0; i < enemy.radius * 2; ++i) {
                    particles.push(
                        //particles's pos just use the projectile's pos
                        new Particle( projectile.x, projectile. y, Math.random() * 5 , enemy.color, 
                        {
                            x : Math.random() - 0.5 * (Math.random() * 6),
                            y : Math.random() - 0.5 * (Math.random() * 6)
                        }
                    ))
                }
                
                // if enenmy's radius is greater than 15, after collide shrink the enemy's size, otherwise, directly remove the enemy from the enemies array
                if (enemy.radius - 15 > 15) {
                    //add 100 to score
                    score += 100
                    scoreEl.innerHTML = score
                
                    gsap.to(enemy, {
                        radius: enemy.radius - 15
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    },0)
                } else {
                    score += 250
                    scoreEl.innerHTML = score

                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                        enemies.splice(enemy, 1)
                    },0)
                }            
            }
        })

    })

}

// use eventlistener to get the uer's input. here, we only get the user mouse click event
window.addEventListener('click', (event) => {
    // define the projectile velocity
    const angle = Math.atan2(event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2, )
    
    const velocity = {
        x : Math.cos(angle) * 3,
        y : Math.sin(angle) * 3
    }

    //push the projectile in to the projectiles array
    projectiles.push(new Projectile(
        canvas.width/2, canvas.height/2, 5, 'white', velocity
    ))
})

startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    modalEl.style.display = 'none'
})


