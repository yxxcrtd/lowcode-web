import CryptoJS from 'crypto-js';
//加密
export const aesEncrypt = (word : string, keyStr : string) => {
    keyStr = keyStr ? keyStr : encodeSecret; //判断是否存在ksy，不存在就用定义好的key
    const key = CryptoJS.enc.Utf8.parse(keyStr);
    const srcs = CryptoJS.enc.Utf8.parse(word);
    const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
}
//解密
export const aesDecrypt = (word : string, keyStr : string) => {
    keyStr = keyStr ? keyStr : 'abcdsxyzhkj12345';
    const key = CryptoJS.enc.Utf8.parse(keyStr);
    const decrypt = CryptoJS.AES.decrypt(word, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}
//密钥（长度必须为16位，或者16位的倍数）
export const encodeSecret = "1148+=--jkl;P,fj"