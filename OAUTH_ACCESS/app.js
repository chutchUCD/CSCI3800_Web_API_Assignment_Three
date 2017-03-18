var express = require('express')
var avault = require('avault') 
var gitapi = require("github")


var app = express()

app.get('/', function (req, res){
    console.log(req.headers )
    if (req.query) {
        getCredentials(func=function( cred, rq=req, rs=res){
            q = rq.query
            if (q['user']){
                console.log(q)
                githubFunction(cred, query=q, rs)
            }else{
                res.status=400
                res.send("Bad query. Use ?user=target_user")
            }
        });
    } else{
        /*
        if (req.status !== 200){
            console.log("here")
            res.headers = req.headers
            res.send()
        }*/
        if (!req.query){
            res.status=400
            res.send("Malformed request. No Query.")
        }
    }
        

});
        
        
/*
getCredentials:
    Takes as a value a function and an error function.
    Calls the function on a single stored credential.
*/
function getCredentials(func=undefined, err=undefined){
    var v=avault.createVault(__dirname + "/node_modules/avault")
    v.get('amberjack', function(cred_str, f=func, e=err){
        if(!cred_str){
            console.log("Vault not found.")
            if (e){
                return e()                
            } else{
                console.log("No vault and nod error function.")
            }
        }else{
            while (cred_str.includes("\'")){
                cred_str = cred_str.replace("\'", "\"")
            }
            /*The above is because I screwed up the json
            in a subtle way that avault doesn't catch.
            I used " '' " instead of '""' and JSON doesn't like that.
            */
            var cred = JSON.parse(cred_str)//get credentials
            if (f){
                return f(cred)
            }
        }
    })
}

function githubFunction(credentials, query, res){
    
    var github=new gitapi({
        debug: false,
        protocol: "https",
        host: "api.github.com",
        version: "3.0.0",    
    });
    
    github.authenticate({
        type:"oauth",
        token:credentials["ukey"]
    })
    
    console.log(query)
    /*Get the first five followers of the user on one page*/
    github.users.getFollowersForUser({username:query['user'], page:1, per_page:5}).then( function(resp, rs=res){
            rs.status=200
            rs.send(resp['data'])
        })
        .catch(function(e, rs=res){
        console.log(e)
        /*I coded this because my apartment had an unexpected
        blackout and I had no power/wifi for 10 minutes, giving me
        time to code a reasonable solution to unexpectedly losing
        power*/
        
        rs.code = e.code
        rs.send(e.status)
    })
}

/*
//Make sure the vault is working
console.log(getCredentials(function(v, p=5, x=10){
    console.log(v)
    console.log(p+x)
    return v
}))
*/

app.listen(3000, function(){console.log("Running Oauth test server.")})