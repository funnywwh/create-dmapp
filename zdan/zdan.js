const Module = require('./zcrypto')
const zcrypto = Module;
const SignSize = 288
const PrivKeySize = 32
const PubKeySize = 33
const NodeIdHexSize = 40
const StorageKeySize = 48
var zdan = {
    initPromise: new Promise((ok) => {
        Module.onRuntimeInitialized = () => {
            ok({});
        }
    }),
    // | 参数名 | 类型         | 是否必须 | 长度                 | 说明          |
    // | :-- | :--------- | :--- | :----------------- | :---------- |
    // | arr | Uint8Array | 是    | arrLen             | 二进制数组	      |
    // | 返回值 | string     | 是    | ceil(arrLen\**3)*4 | base64编码字符串 |
    Uint8Array2Base64: function (arr) {
        return btoa(String.fromCharCode(...arr))
    },
    CreateQRPrivateKey: async function () {
        let privPtr = zcrypto._ZMalloc(PrivKeySize)
        let buffer = new Uint8Array(zcrypto.HEAP8.buffer, privPtr, PrivKeySize)
        zcrypto._wasm_create_qr_private_key(privPtr)
        let ret = buffer.slice()
        zcrypto._ZFree(privPtr)

        return ret
    },
    // 获取十六进制的NodeId
    // | 参数名 | 类型         | 是否必须 | 长度 | 说明          |
    // | :-- | :--------- | :--- | :- | :---------- |
    // | 返回值 | string | 是    | 40 | 十六进制的NodeId |
    NodeIdHex: async function () {
        let hexNodeIdPtr = zcrypto._ZMalloc(NodeIdHexSize)
        let buffer = new Uint8Array(zcrypto.HEAP8.buffer, hexNodeIdPtr, NodeIdHexSize)

        let failed = zcrypto._wasm_get_nodeHexId(hexNodeIdPtr)
        // console.log('HexNodeId failed',failed);
        if (failed) {
            throw `NodeIdHex failed:${failed}`
        }
        let ret = new TextDecoder().decode(buffer)
        zcrypto._ZFree(hexNodeIdPtr)
        return ret
    },
    // 获取二进制公钥
    // | 参数名 | 类型         | 是否必须 | 长度         | 说明       |
    // | :-- | :--------- | :--- | :--------- | :------- |
    // | 返回值 | UInt8Array | 是    | PubKeySize | 二进制的节点公钥 |
    GetPubKey: async function () {
        let pubKeyPtr = zcrypto._ZMalloc(PubKeySize)
        let buffer = new Uint8Array(zcrypto.HEAP8.buffer, pubKeyPtr, PubKeySize)

        let failed = zcrypto._wasm_get_pubkey(pubKeyPtr)
        if (failed) {
            zcrypto._ZFree(pubKeyPtr)
            throw `_wasm_get_pubkey failed:${failed}`
        }
        // console.log('GetPubKey failed',failed);
        let ret = buffer.slice()
        zcrypto._ZFree(pubKeyPtr)
        return ret
    },
    // 将wasm内存里的私钥导出给js保持到缓存里
    // | 参数名 | 类型         | 是否必须 | 长度 | 说明     |
    // | :-- | :--------- | :--- | :- | :----- |
    // | 返回值 | Uint8Array | 是    | 48 | 加密后的私钥 |
    ExportStorageKey: async function () {
        let privPtr = zcrypto._ZMalloc(StorageKeySize)
        let buffer = new Uint8Array(zcrypto.HEAP8.buffer, privPtr, StorageKeySize)
        zcrypto._wasm_export_storage_private_key(privPtr)
        let ret = buffer.slice()
        zcrypto._ZFree(privPtr)
        return ret
    },
    async LoadQRPrivateKey(qrKey) {
        let privPtr = zcrypto._ZMalloc(PrivKeySize)
        let buffer = new Uint8Array(zcrypto.HEAP8.buffer, privPtr, PrivKeySize)
        buffer.set(qrKey)
        zcrypto._wasm_load_qr_private_key(privPtr)
        zcrypto._ZFree(privPtr)
    },
    // 导入页面缓存里的私钥和公钥
    // | 参数名        | 类型         | 是否必须 | 长度 | 说明                |
    // | :--------- | :--------- | :--- | :- | :---------------- |
    // | storageKey | UInt8Array | 是    | 48 | 加密后的私钥，长度不是对会抛出异常 |
    async ImportStorageKey(storageKey) {
        if (storageKey.length != StorageKeySize) {
            throw `storageKey len != ${StorageKeySize}`
        }
        let privPtr = zcrypto._ZMalloc(StorageKeySize)
        let buffer = new Uint8Array(zcrypto.HEAP8.buffer, privPtr, StorageKeySize)
        buffer.set(storageKey)
        let ret = zcrypto._wasm_import_storage_private_key(privPtr)
        if (ret != 0) {
            throw '_wasm_import_storage_private_key'
        }
        zcrypto._ZFree(privPtr)
    },
    // 使用私钥对数据签名
    // | 参数名 | 类型         | 是否必须 | 长度       | 说明        |
    // | :-- | :--------- | :--- | :------- | :-------- |
    // | msg | UInt8Array | 是    |          | 要签名的数据    |
    // | 返回值 | UInt8Array | 是    | SignSize | 私钥签名后的二进制 |
    async Sign(msg) {
        let msgLen = msg.length
        let msgPtr = zcrypto._ZMalloc(msgLen)
        // console.log('msgLen',msgLen);
        let buffer = new Uint8Array(zcrypto.HEAP8.buffer, msgPtr, msgLen)
        buffer.set(msg)
        // console.log('msg',buffer);
        let signPtr = zcrypto._ZMalloc(SignSize)
        let signBuffer = new Uint8Array(zcrypto.HEAP8.buffer, signPtr, SignSize)
        let signLenPtr = zcrypto._ZMalloc(4)
        let signLenBuffer = new Uint8Array(zcrypto.HEAP32.buffer, signLenPtr, 4)
        zcrypto._wasm_sign(msgPtr, msgLen, signPtr, signLenBuffer)
        let ret = signBuffer.slice()
        zcrypto._ZFree(signPtr)
        zcrypto._ZFree(signLenPtr)
        return ret
    },
    // 用公钥对数据验证签名
    // | 参数名  | 类型         | 是否必须 | 长度       | 说明         |
    // | :--- | :--------- | :--- | :------- | :--------- |
    // | msg  | UInt8Array | 是    |          | 使用私钥对msg签名 |
    // | sign | UInt8Array | 是    | SignSize | 二进制签名      |
    // | 返回值  | boolean    | 是    |          | 成功还是失败     |
    async Verify(
        msg,
        sign
    ) {
        let msgLen = msg.length
        let msgPtr = zcrypto._ZMalloc(msgLen)
        let buffer = new Uint8Array(zcrypto.HEAP8.buffer, msgPtr, msgLen)
        buffer.set(msg)
        let signPtr = zcrypto._ZMalloc(SignSize)
        let signBuffer = new Uint8Array(zcrypto.HEAP8.buffer, signPtr, SignSize)
        signBuffer.set(sign)
        let failed = zcrypto._wasm_verify(msgPtr, msgLen, signPtr)
        zcrypto._ZFree(msgPtr)
        zcrypto._ZFree(signPtr)

        // console.log('Verify failed',failed);
        return failed == 0 ? true : false
    }
}

module.exports = zdan;