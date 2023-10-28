#!/usr/bin/env node

// console.log("in create-rollup-pkg, args: ", process.argv.slice(2));
//1.dmapp目录名
//2.dmappId
//2.1 保存自动创建的dmapp的私钥
//创建目录
//修改package.json的dmappId字段

const fs = require("fs-extra");
const prompts = require("prompts");
const path = require("path");
const chalk = require("chalk");
const { install } = require("./utils");
const zdan = require('./zdan/zdan')
let pkgName = process.argv[2];

if(!pkgName){
    pkgName = 'mydmapp'
}

const dir = path.resolve(
    pkgName.startsWith("@") ? pkgName.split("/")[1] : pkgName
);
async function getOption() {
    let keys = await createDMappKey()
    const options = await prompts([
        {
            name: "name",
            type: "text",
            message: "项目名称",
            initial: pkgName,
        },
        {
            name: "desc",
            type: "text",
            message: "项目描述",
        },
        {
            name: "dmappId",
            type: "text",
            message: "DMAppId",
            min:40,
            max:40,
            initial:keys.dmappId,
        }
    ]);
    console.log('options',options)
    if(!options.dmappId || options.dmappId.length != 40){
        options.dmappId = keys.dmappId
    }
    options.keys = keys;
    return options;
}

(async function () {
    await zdan.initPromise
    if (fs.existsSync(dir)) {
        const { yes } = await prompts({
            name: "yes",
            type: "confirm",
            message: chalk.bold("Do you want to overwrite them?"),
            initial: true,
        });
        if (!yes) process.exit(1);

        console.log(`Removing ${chalk.cyan(dir)}...`);
        await fs.remove(dir);
    }

    fs.mkdirpSync(dir);

    const options = await getOption();

    await generate(options);

    install('yarn', dir);

    console.log();
    console.log(
        `${chalk.green("✔")} Success! Created ${chalk.cyan(
            pkgName
        )} at ${chalk.cyan(dir)}`
    );
    console.log();
})();


async function generate(options) {
    const { name, desc, useTS } = options;
    await fs.mkdir(`${dir}/dmapp`)
    await fs.mkdir(`${dir}/service`)
    await fs.mkdir(`${dir}/keys`)
    fs.copySync(path.resolve(__dirname, "./template/"), `${dir}`);

    // 写入 README
    fs.writeFileSync(path.resolve(`${dir}/dmapp`, "README.md"), `# ${name}\n\n${desc}\n`);
    const pkgPath = path.resolve(`${dir}/dmapp`, "package.json");
    // 修改 package.json
    const json = JSON.parse(fs.readFileSync(pkgPath));

    json.name = name;
    json.description = desc;
    json.dmappId = options.dmappId;
    json.dependencies['zdan_jsapi'] = 'http://gitlab.rightchaintech.com/wuwenhui/zdan_jsapi.git'
    await fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2) + "\n");


    await fs.writeFile(`${dir}/keys/qrkey`,options.keys.qrKey);
    await fs.writeFile(`${dir}/keys/pubkey`,options.keys.pubKey);
}

async function createDMappKey(){
    let keys = {
        dmappId:'',
        qrKey:'',
        pubKey:'',
    };
    let qrKeyBin = await zdan.CreateQRPrivateKey();
    
    keys.qrKey = zdan.Uint8Array2Base64(qrKeyBin);
    keys.pubKey = zdan.Uint8Array2Base64(await zdan.GetPubKey());
    keys.dmappId = await zdan.NodeIdHex();
    return keys;
}
