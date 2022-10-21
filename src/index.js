/**
 * OrozcoOscar
 * v1.0
 * 01/10/22
 */

const express = require('express');
const Browser = require("../modules/browser")
const path = require('path');
const morgan = require('morgan');
const app = express();
const cors = require('cors')

const TIME=2

app.set('port', process.env.PORT || 3100);
app.set("json spaces", 2)
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'));
app.use(express.json());
app.use('/', express.static(__dirname + '/public'));
app.use(cors()); // <---- use cors middleware


let URL=null
let page=null
app.get('/get', async (req, res) => {
    let b = new Browser()
    page= await b.newPage()
    URL=req.query.url
    if(URL.split("")[URL.length - 1]!="/")URL+="/"
    let TREE=null
    let ERROR="Primero inicia la api con /start"
    if(page!=null){
        ERROR=false
        TREE=[]
        async function generateTree(url){
            let arbol=[]
            let aux=await getTree(url)
            for (let e of aux) {
                if(e.search(/(\.(\w+))$/g)<0){
                    let a = await generateTree(e)
                    e=e.replace(URL,"")
                    arbol.push({dir:e,type:"folder",cont:a})
                }else{
                    e=e.replace(URL,"")
                    arbol.push({dir:e,type:"file",cont:null})
                }
            }
            return arbol
        }
        TREE=await generateTree(URL)     
    }
    await b.close()
    res.json({
        url:URL,
        tree:TREE,
        error:ERROR,
        status:ERROR?"error":"ok"
    })
})
app.get('/abort', async (req, res) => {
    try {
        await b.close()
    } catch (error) {}
    res.json({
        url:URL,
        tree:null,
        error:false,
        status:"aborted"
    })
})
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
})

async function getTree(url){
    console.log("visit->",url)
    function get(){
        return Array.from(document.querySelectorAll("a")).filter(e=>e.href.includes(e.innerText.split(" ")[0].replace("..>","")) && e.innerText!="").map(e=>{
            return e.href
        })
    }
    let tree=null
    await page.goto(url, { waitUntil: 'load' }).then(async () => {
        await page.waitForTimeout(TIME*1000);
        tree=await page.evaluate(get)
        
    })



    console.log("=>",tree)
    return tree
}
