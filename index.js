
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.height = innerHeight-5
canvas.width = innerWidth

const scoreDis = document.querySelector('#score')
const restart = document.querySelector('#restart')
const restartPage = document.getElementById('restart-page')


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


function spawn(){
    setInterval(() => {
        const r = Math.random() * (30-15)+20
        let x 
        let y
        if (Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - r:
        canvas.width + r
            y = Math.random() * canvas.height
        }else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - r:
            canvas.height + r
        }

       
        const angle = Math.atan2(canvas.height/2 - y ,
        canvas.width/2 - x)

        enemies.push(new Enemy(x,y,r,`hsl(${Math.random()*360},
        50%,50%)`,
        {x:Math.cos(angle),y:Math.sin(angle)}))
    },1000)
}

let animationId
let score = 0
function animate(){
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0,0.1)'
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
        
        //game over    
        if (dis < 1){
            setTimeout(()=>{
                restartPage.style.display = "flex"
                restart.innerHTML = "Restart Game"
                document.querySelector("#t-over")
                .innerHTML = "Game Over"
                cancelAnimationFrame(animationId)
               
            })
        }

        //when bullet collision on enemy
        projectiles.forEach((bullet,bIndex) =>{
            const dis = Math.hypot(bullet.x - enemy.x,
                bullet.y - enemy.y) - enemy.r - bullet.r
            
            if (dis < 1 ){
                score += 10
                scoreDis.innerHTML = score

                for(let i = 1;i <=enemy.r;i++){
                    particles.push(new Particle(
                        bullet.x,bullet.y,Math.random()*3,enemy.co,
                        {x:(Math.random()-0.5)*(Math.random()*8),
                        y:(Math.random()-0.5)*(Math.random()*8)}
                    ))
                }
                if (enemy.r -15 > 15){
                    gsap.to(enemy,{
                        "r":enemy.r-15
                    })
                    setTimeout(()=>{
                        projectiles.splice(bIndex,1)
                    },0)
                }else{
                    score += 20
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
     animationId
     score = 0
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
let projectiles = []
let enemies = []
let particles = []
let x = canvas.width / 2
let y = canvas.height / 2
let player = new Player(x, y, 20, 'white')


canvas.addEventListener("mousedown",(Event) =>
{   
    shoot = setInterval(()=>{
            console.log(Event.movementX)
            const angle = Math.atan2(mouseY - canvas.height/2,
            mouseX - canvas.width/2)
            
            projectiles.push(new Projectile(canvas.width/2,canvas.height/2,
            5,'white',{x:Math.cos(angle)*4,y:Math.sin(angle)*5}))
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
    
    clearInterval(shoot)
    init()
    animate()
    spawn()
    restartPage.style.display = "none"
    scoreDis.innerHTML = 0
})
