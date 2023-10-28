import * as packageJson from "../package.json"

import {
  zmcserver,zbase,
  OnGroupServiceClose,
  OnGroupServiceReceive,
  OnGroupServiceMemberJoin,
  OnGroupServiceMemberLeave,
  OnGroupMemberStatusChange,
} from 'zdan_msservice_types'
declare var zmcserver: zmcserver;
declare var zbase:zbase;

declare var global: any;
const groupName =  global.zolpar ;

interface Service {
  OnGroupServiceClose?: OnGroupServiceClose,
  OnGroupServiceReceive: OnGroupServiceReceive,
  OnGroupServiceMemberJoin?: OnGroupServiceMemberJoin,
  OnGroupServiceMemberLeave?: OnGroupServiceMemberLeave,
  OnGroupMemberStatusChange?: OnGroupMemberStatusChange,
}

interface ApiFunction {
  (req: any): Promise<any>
}
interface ApiArgs {
  callbackId: string,
  name: string,
  args?: any,
}
interface ApiResult {
  callbackId: string,
  code: number,
  errMsg?: string,
  result?: any
}


const apiMap: {
  [key: string]: ApiFunction,
} = {}

zmcserver.registerMSInterface(
  packageJson.dmappId, 'main', groupName,
  //OnGroupServiceClose
  (groupsid: string) => {

  },
  //OnGroupServiceReceive
  (groupsid: string, strMemberId: number, strdata: string) => {
    (async () => {
      try {
        let apiArgs: ApiArgs = JSON.parse(strdata)
        let result: ApiResult = {
          callbackId: apiArgs.callbackId,
          code: 0,
        };
        try{
          if (apiArgs.name in apiMap) {
            let api: ApiFunction = apiMap[apiArgs.name];
            let resData = await api(apiArgs.args)
            result.result = resData;
          } else {
            throw `dmappId:${packageJson.dmappId} serviceName:main groupName:${groupName} api not found name:${apiArgs.name}`
          }
          zmcserver.sendMsgToMember(groupsid, strMemberId, JSON.stringify(result));  
        }catch(e){
          result.code = -1
          result.errMsg = `${e}`          
          zmcserver.sendMsgToMember(groupsid, strMemberId, JSON.stringify(result));
        }
      } catch (e) {
        zbase.log(`dmappId:${packageJson.dmappId} serviceName:main groupName:${groupName} parse:${strdata}`)
      }

    })()
  },
  //OnGroupServiceMemberJoin
  (groupsid: string, memberId: number, userinfo: string) => {

  },
  //OnGroupServiceMemberLeave
  (groupsid: string, memberId: number) => {

  },
  //OnGroupMemberStatusChange
  (groupsid: string, memberId: number, status: number) => {

  }
);
export function registerApi(name: string, api: ApiFunction) {
  apiMap[name] = api;
}