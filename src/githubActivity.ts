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

    https.get(url, options, (res)=>{

        let rawData = "";
        res.on('data', (chunk)=> {
            rawData += chunk
        });

        res.on('end', ()=>{
            if(res.statusCode !== 200){
                (`Error: User '${trim}' not found or API error`);
                return;
            }

            try {
                const parseData = JSON.parse(rawData);
                parseData.forEach((content: any) => {
                switch (content.type) {
                    case "PushEvent":
                        const repoName = content.repo.name;
                        const commitCount = content.payload.commits.length;
                        console.log(`- Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${repoName}`);
                        break;
                        
                    case "IssuesEvent":
                        const action = content.payload.action;
                        const issueRepo = content.repo.name;
                        console.log(`- ${action} an issue in ${issueRepo}`);
                        break;
                        
                    case "WatchEvent":
                        console.log(`- Starred ${content.repo.name}`);
                        break;
                        
                    case "PullRequestEvent":
                        const prAction = content.payload.action;
                        const prRepo = content.repo.name;
                        console.log(`- ${prAction} a pull request in ${prRepo}`);
                        break;
                        
                    case "CreateEvent":
                        if (content.payload.ref_type === "repository") {
                            console.log(`- Created repository ${content.repo.name}`);
                        }
                        break;
                        
                    case "ForkEvent":
                        console.log(`- Forked ${content.repo.name} to ${content.payload.forkee.full_name}`);
                        break;
                        
                    case "DeleteEvent":
                        console.log(`- Deleted ${content.payload.ref_type} ${content.payload.ref} from ${content.repo.name}`);
                        break;
                        
                    
                    default:
                        console.log(`- Unknown activity: ${content.type}`);
                        break;
                }
            });
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
