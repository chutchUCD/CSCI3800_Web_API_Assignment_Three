var express = require('express');
var avault = require('avault');
var gitapi = require('github');
//Requirements

var app = express();
//Baseapp
        
/*
getCredentials:
    Takes as a value a function and an error function.
    Calls the function on a single stored credential.
*/
function getCredentials(func, err){
    var v=avault.createVault(__dirname + "/node_modules/avault")
    v.get('amberjack', function(cred_str){
        if(!cred_str){
            console.log("Vault not found.")
            if (err){
                return err()                
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
            if (func){
                return func(cred)
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
    
    /*Get the first five followers of the user on one page*/
    /*When apigee supports promises this code will work...*/
//    github.users.getFollowersForUser({username:query['user'], page:1, per_page:5}).then(function(resp){
//            res.status=200
//            res.send(resp['data'])
//        }).catch(function(e){
//        console.log(e)
//        /*I coded this because my apartment had an unexpected
//        blackout and I had no power/wifi for 10 minutes, giving me
//        time to code a reasonable solution to unexpectedly losing
//        power*/
//        res.code = e.code
//        res.send(e.status)
//    })
    github.users.getFollowersForUser({username:query['user'],page:1,per_page:5}, function(err, resp){
        if(err){
            res.code = err.code
            res.send(e.status)
        }else{
            res.status(200).send(resp['data'])
        }
    });
}

app.get('/', function (req, res) {
    if (req.query) {
        getCredentials( function(cred){
            q = req.query
            if (q['user']){
                githubFunction(cred, q, res)
            }else{
                
                res.status(400).send("Bad query. Use ?user=target_user")
            }
        });
    } else{
        if (!req.query){
            res.status(400).send("Bad query. Use ?user=target_user")
        }
    }
        

});
        



/*
//Make sure the vault is working
console.log(getCredentials(function(v, p=5, x=10){
    console.log(v)
    console.log(p+x)
    return v
}))
*/

app.listen(3000, function(){console.log("Running Oauth test server.")})