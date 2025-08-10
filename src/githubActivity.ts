import { argv } from "process";
import https from 'https';

function main(){
    const userName = argv[2];

    if (!userName){
        console.log('Error: No username provided')
        process.exit(1)
    }

    const trim =userName.trim()
    if (trim === ""){
        console.log('Error: Username cannot be empty')
        process.exit(1);
    }

    const options = {
        headers: {
            'User-Agent': 'GitHub-User-Activity-Fetcher()' 
        }
    };

    const url = `https://api.github.com/users/${trim}/events`;
    console.log(url)

    https.get(url, options, (res)=>{

        let rawData = "";
        res.on('data', (chunk)=> {
            rawData += chunk
        });

        res.on('end', ()=>{
            try {
                const parseData = JSON.parse(rawData);
                
                console.log(parseData);
            }catch(err){
                console.log("Failed to parse JSON", err)
            }
        });

        res.on("error", (err)=>{
            console.error("Failed to load", err)
        })
    })
    
}
main();
