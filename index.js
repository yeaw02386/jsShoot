
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.height = innerHeight
canvas.width = innerWidth

const powerDisplay = document.querySelector('#power')
const restart = document.querySelector('#restart')
const restartPage = document.getElementById('restart-page')
const nextWavePage = document.getElementById('next-wave-page')
const nextWave = document.getElementById('next-wave')
const waveDisplay = document.getElementById('wave')
const waveEnd = document.getElementById('wave-end')
const startPage = document.getElementById('start-game-page')
const start = document.getElementById('start-game')

nextWavePage.style.display = "none"
restartPage.style.display = "none"

class Player{
    constructor(x,y,r,co){
        this.x = x
        this.y = y
        this.r = r
        this.co = co
    }

    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.r,0,Math.PI*2,false)
        c.fillStyle = this.co
        c.fill()
    }
}

class Projectile{
    constructor(x,y,r,co,velo){
        this.x = x
        this.y = y
        this.r = r
        this.co = co
        this.velo = velo
    }

    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.r,0,Math.PI*2,false)
        c.fillStyle = this.co
        c.fill()
    }

    update(){
        this.draw()
        this.x += this.velo.x
        this.y += this.velo.y
        
    }
}

class Enemy{
    constructor(x,y,r,co,velo){
        this.x = x
        this.y = y
        this.r = r
        this.co = co
        this.velo = velo
        this.hp = r*(1+wave*0.1)
    }

    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.r,0,Math.PI*2,false)
        c.fillStyle = this.co
        c.fill()
    }

    update(){
        this.draw()
        this.x += this.velo.x
        this.y += this.velo.y
    }
}

const fix = 0.98
class Particle{
    constructor(x,y,r,co,velo){
        this.x = x
        this.y = y
        this.r = r
        this.co = co
        this.velo = velo
        this.alpha = 1
    }

    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x,this.y,this.r,0,Math.PI*2,false)
        c.fillStyle = this.co
        c.fill()
        c.restore()
    }

    update(){
        this.draw()
        this.velo.x *= fix
        this.velo.y *= fix
        this.x += this.velo.x
        this.y += this.velo.y
        this.alpha -= 0.01
    }
}

let spawnEnemy
function spawn(){
    spawnEnemy = setInterval(() => {
        const r = Math.random() * (30-15)+20
        let eX 
        let eY 
        if (Math.random() < 0.5){
            eX = Math.random() < 0.5 ? 0 - r:
        canvas.width + r
            eY = Math.random() * canvas.height
        }else{
            eX = Math.random() * canvas.width
            eY = Math.random() < 0.5 ? 0 - r:
            canvas.height + r
        }
        let speed = 1
        if (wave <= 30){speed += wave*0.1}
        
        const angle = Math.atan2(canvas.height/2 - eY ,
        canvas.width/2 - eX)

        enemies.push(new Enemy(eX,eY,r,`hsl(${Math.random()*360},
        50%,50%)`,
        {x:Math.cos(angle)*speed,y:Math.sin(angle)*speed}))
    },1000)
}

let waveTimeout
function waveSpawn(){
    let waveDiff = 15000

    waveTimeout =setInterval(()=>{
        const s =Math.floor((waveDiff % (1000 * 60)) / 1000)
        const m =Math.floor((waveDiff % (1000 * 60 * 60)) / (1000 * 60))
        waveDiff -= 1000

        if (waveDiff < 0){
            cancelAnimationFrame(animationId)
            clearInterval(spawnEnemy)
            clearInterval(spawnEnemy)
            clearInterval(shoot)
            clearInterval(waveTimeout)
            nextWavePage.style.display = "flex"
        }

        waveEnd.innerHTML = `${m} : ${s}`
    },1000)
}

function gameOver(){
    restartPage.style.display = "flex"
    powerDisplay.innerHTML = 0

    clearInterval(shoot)
    clearInterval(waveTimeout)
    cancelAnimationFrame(animationId)
    clearInterval(spawnEnemy)

}

function createParticle(px,py,r,c){
    for(let i = 1;i <=r;i++){
        particles.push(new Particle(
            px,py,Math.random()*3,c,
            {x:(Math.random()-0.5)*(Math.random()*8),
            y:(Math.random()-0.5)*(Math.random()*8)}
        ))
    }
}

let animationId
let power = 100
function animate(){
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0,0.1)'
    powerDisplay.innerHTML = power
    if (power <= 0){gameOver()}
    c.fillRect(0,0,canvas.width,canvas.height)
    player.draw()

    particles.forEach((particle,index)=>{
        if (particle.alpha <= 0){
            particles.splice(index,1)
        }else{
            particle.update()
        }
        
    })

    projectiles.forEach((ext,index) => {
        ext.update()
        if (ext.x + ext.r < 0 ||
            ext.x - ext.r > canvas.width ||
            ext.y + ext.r < 0 ||
            ext.y - ext.r > canvas.height){
            setTimeout(()=>{
                projectiles.splice(index,1)
            },0)
        }
        
    })

    enemies.forEach((enemy,eIndex) =>{
        enemy.update()
        const dis = Math.hypot(enemy.x - player.x,
            enemy.y - player.y) - enemy.r - player.r
    
        //when enemy collision on player
        if (dis < 1){
            power -= parseInt(enemy.r) 
            setTimeout(()=>{
                enemies.splice(eIndex,1)
            })
            createParticle(enemy.x,enemy.y,enemy.r,enemy.co)
        }

        //when bullet collision on enemy
        projectiles.forEach((bullet,bIndex) =>{
            const dis = Math.hypot(bullet.x - enemy.x,
                bullet.y - enemy.y) - enemy.r - bullet.r
            
            if (dis < 1 ){
                setTimeout(()=>{power += 5},200)
                
                createParticle(bullet.x,bullet.y,enemy.r,enemy.co)

                if (enemy.hp > 12){
                    enemy.hp -= 12
                    setTimeout(()=>{
                        projectiles.splice(bIndex,1)
                    },0)
                }else{
                    power += 10
                    setTimeout(()=>{
                        enemies.splice(eIndex,1)
                        projectiles.splice(bIndex,1)
                    },0)
                } 
            }
        })
    })
}

function init(){
    power = 100
    powerDisplay.innerHTML = power
    wave = 1
    projectiles = []
    enemies = []
    particles = []
    x = canvas.width / 2
    y = canvas.height / 2
    player = new Player(x, y, 20, 'white')
}

//create init game
let shoot
let mouseX,mouseY
let wave = 1
let projectiles = []
let enemies = []
let particles = []
let x = canvas.width / 2
let y = canvas.height / 2
let player = new Player(x, y, 20, 'white')


canvas.addEventListener("mousedown",(Event) =>
{   
    shoot = setInterval(()=>{
            const angle = Math.atan2(mouseY - canvas.height/2,
            mouseX - canvas.width/2)
            
            const err = Math.random()*0.2
            projectiles.push(new Projectile(canvas.width/2,canvas.height/2,
            5,'white',{x:(Math.cos(angle)+err) *5,y:(Math.sin(angle)+err) *5}))
            power -= 2
    },100)
    
})

canvas.addEventListener("mouseup",()=>{
    clearInterval(shoot)
})

canvas.addEventListener("mousemove",(Event)=>{
    mouseX = Event.clientX
    mouseY = Event.clientY 
})

restart.addEventListener("click",()=>{
    init()
    animate()
    spawn()
    waveSpawn()
    restartPage.style.display = "none"
})

start.addEventListener("click",()=>{
    init()
    animate()
    spawn()
    waveSpawn()
    startPage.style.display = "none"
})

nextWave.addEventListener("click",()=>{

    wave += 1
    waveDisplay.innerHTML = wave
    projectiles = []
    enemies = []
    particles = []
    animate()
    waveSpawn()
    spawn()
    nextWavePage.style.display = "none"
})