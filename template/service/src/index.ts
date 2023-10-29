import {init,registerApi } from "zdan_msservice_types";
import packageJson from '../package.json';
init(packageJson.dmappId);

registerApi('hello',async(req: any)=>{
    return "world"
})