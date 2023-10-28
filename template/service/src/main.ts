import { registerApi } from ".";

registerApi('hello',async(req: any)=>{
    return "world"
})