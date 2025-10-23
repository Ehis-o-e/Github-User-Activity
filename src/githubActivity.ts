#!/usr/bin/env node
import express from 'express'
import dotenv from 'dotenv'


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

async function main(){
    const username = process.argv[2];
    if(!username){
        console.log("Please provide a GitHub username as a command line argument.");
        process.exit(1);
    } 
    const url = `https://api.github.com/users/${username}/events`

    try {
        const response = await fetch(url)
        if(!response.ok){
            console.log(`Error: User '${username}' not found or API error`);
            process.exit(1);
        }
        const data = await response.json();

        let lastEvent: { type: string, repo: string } | null = null;
        let commitCount = 0;

        function CheckForPush() {
            if(lastEvent && lastEvent.type === "PushEvent"){
                console.log(`- Pushed ${commitCount} commit(s) to ${lastEvent.repo}`);
                lastEvent = null;
                commitCount = 0;
            }
        }

        for(let i=0; i<data.length; i++){
            switch(data[i].type){
                case "PushEvent":
                    const name = data[i].repo.name;
                     const commits = data[i].payload.commits ? data[i].payload.commits.length : 1; 
                     if(lastEvent && lastEvent.type === "PushEvent" && lastEvent.repo === name){
                        commitCount += commits;
                    } else {
                        CheckForPush();
                        lastEvent = { type: "PushEvent", repo: name };
                        commitCount = commits;
                    }
                break;
                
                case "IssuesEvent":
                    CheckForPush();
                    const action = data[i].payload.action;
                    const issueRepo = data[i].repo.name;
                    console.log(`- ${action} an issue in ${issueRepo}`);
                break;
                        
                case "WatchEvent":
                    CheckForPush();
                    console.log(`- Starred ${data[i].repo.name}`);
                break;
                        
                case "PullRequestEvent":
                    CheckForPush();
                    const prAction = data[i].payload.action;
                    const prRepo = data[i].repo.name;
                    console.log(`- ${prAction} a pull request in ${prRepo}`);
                break;
                        
                case "CreateEvent":
                    CheckForPush();
                    if (data[i].payload.ref_type === "repository") {
                        console.log(`- Created repository ${data[i].repo.name}`);
                    }
                break;
                        
                case "ForkEvent":
                    CheckForPush();
                    console.log(`- Forked ${data[i].repo.name} to ${data[i].payload.forkee.full_name}`);
                break;
                        
                case "DeleteEvent":
                    CheckForPush();
                    console.log(`- Deleted ${data[i].payload.ref_type} ${data[i].payload.ref} from ${data[i].repo.name}`);
                break;
                        
                    
                default:
                    CheckForPush();
                    console.log(`- Unknown activity: ${data[i].type}`);
                break;
            }
        }
    } catch (error) {
        console.error("Error fetching data from GitHub API:", error);
        process.exit(1);
    }

}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

main()