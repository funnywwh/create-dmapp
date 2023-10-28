const Module = require('./zcrypto')
const zcrypto = Module;
const PrivKeySize = 32
const PubKeySize = 33
const NodeIdHexSize = 40

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
    }
}

module.exports = zdan;