import { argv } from "process";

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
    console.log(`Welcome ${trim}`);
}
main();
