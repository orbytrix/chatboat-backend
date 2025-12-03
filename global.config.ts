/****************************
 SECURITY TOKEN HANDLING
 ****************************/
import jwt from 'jsonwebtoken';
import { configuration, applicationLogger } from '.';
import response from './response.json';
import { FieldHelperService } from '../services';

export class Global {

    static token(params, isToken) {
        return new Promise((resolve, reject) => {
            try {
                const tokenData = {
                    id: params.id,
                    role: params.role,
                    ipAddress: params.ipAddress,
                    exp: Math.floor(new Date().getTime() / 1000) + (isToken ? configuration.tokenExpiry : configuration.refreshTokenExpiry)
                };
                const token = jwt.sign(tokenData, configuration.securityToken);
                resolve(token);
            } catch (err) {
                applicationLogger.error(`Global.js token`, { error: err.toString() });
                reject({ status: 0, message: err.toString() });
            }
        });
    }

    // Count token no. of parameter
    countProperties(obj) {
        return Object.keys(obj).length;
    }

    keyExists(key, search) {
        if (!search || (search.constructor !== Array && search.constructor !== Object)) {
            return false;
        }
        for (let i = 0; i < search.length; i++) {
            if (search[i] === key) {
                return true;
            }
        }
        return key in search;
    }

    // Authorized a Admin token
    static async isAdminAuthorized(req, res, next) {
        try {
            let token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({ status: 0, message: response["103"] });
            }
            else if (token.startsWith("Bearer ")) {
                token = token.substring(7, token.length);
                const authenticate = new Global();

                const decodedForVerification: any = jwt.decode(token);
                if (FieldHelperService.undefinedAndNullCheck(decodedForVerification)) {
                    if (authenticate.countProperties(decodedForVerification) === 5) {
                        if (authenticate.keyExists("id", decodedForVerification) &&
                            authenticate.keyExists("role", decodedForVerification) &&
                            authenticate.keyExists("ipAddress", decodedForVerification) &&
                            authenticate.keyExists("exp", decodedForVerification) &&
                            decodedForVerification.role === "Admin") {
                            next();
                            return true;
                        }
                        else {
                            return res.status(401).json({ status: 0, message: response["109"] });
                        }
                    }
                    else {
                        return res.status(401).json({ status: 0, message: response["v"] });
                    }
                }
                else {
                    return res.status(401).json({ status: 0, message: response["109"] });
                }
            } else {
                return res.status(401).json({ status: 0, message: response["103"] });
            }
        } catch (err) {
            applicationLogger.error(`Global.js isAdminAuthorized`, { error: err.toString() });
            return res.status(401).send({ status: 0, message: err.toString() });
        }
    }

    // Authorized a token
    static async isAuthorized(req, res, next) {
        try {
            let token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({ status: 0, message: response["103"] });
            }
            else if (token.startsWith("Bearer ")) {
                token = token.substring(7, token.length);

                const authenticate = new Global();

                const decodedForVerification = jwt.decode(token);
                if (FieldHelperService.undefinedAndNullCheck(decodedForVerification)) {
                    if (authenticate.countProperties(decodedForVerification) === 5) {
                        if (authenticate.keyExists("id", decodedForVerification) &&
                            authenticate.keyExists("role", decodedForVerification) &&
                            authenticate.keyExists("ipAddress", decodedForVerification) &&
                            authenticate.keyExists("exp", decodedForVerification)) {
                            next();
                            return true;
                        }
                        else {
                            return res.status(401).json({ status: 0, message: response["109"] });
                        }
                    }
                    else {
                        return res.status(401).json({ status: 0, message: response["109"] });
                    }
                }
                else {
                    return res.status(401).json({ status: 0, message: response["109"] });
                }
            } else {
                return res.status(401).json({ status: 0, message: response["103"] });
            }
        } catch (err) {
            applicationLogger.error(`Global.js isAuthorized`, { error: err.toString() });
            return res.status(401).send({ status: 0, message: err.toString() });
        }
    }

    // Authorized a Admin token
    static async isOTPAuthorized(req, res, next) {
        try {
            let token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({ status: 0, message: response["103"] });
            }
            else if (token.startsWith("Bearer ")) {
                token = token.substring(7, token.length);
                const authenticate = new Global();

                const decodedForVerification: any = jwt.decode(token);
                if (FieldHelperService.undefinedAndNullCheck(decodedForVerification)) {
                    if (authenticate.countProperties(decodedForVerification) === 6) {
                        if (authenticate.keyExists("id", decodedForVerification) &&
                            authenticate.keyExists("role", decodedForVerification) &&
                            authenticate.keyExists("ipAddress", decodedForVerification) &&
                            authenticate.keyExists("exp", decodedForVerification) &&
                            authenticate.keyExists("emailVerification", decodedForVerification)) {
                            next();
                            return true;
                        }
                        else {
                            return res.status(401).json({ status: 0, message: response["109"] });
                        }
                    }
                    else {
                        return res.status(401).json({ status: 0, message: response["v"] });
                    }
                }
                else {
                    return res.status(401).json({ status: 0, message: response["109"] });
                }
            } else {
                return res.status(401).json({ status: 0, message: response["103"] });
            }
        } catch (err) {
            applicationLogger.error(`Global.js isAdminAuthorized`, { error: err.toString() });
            return res.status(401).send({ status: 0, message: err.toString() });
        }
    }

    // Check Token Expiration
    checkExpiration(decodedForVerification) {
        try {
            const tokenTime = decodedForVerification.exp;
            return new Promise((resolve, reject) => {
                let status = false;
                if (FieldHelperService.undefinedAndNullCheck(decodedForVerification.loginType) && decodedForVerification.loginType.toLowerCase() === 'mobile') {
                    status = true;
                    resolve(status);
                }
                else {
                    try {
                        const now = parseInt((new Date().getTime() / 1000).toString());
                        if (tokenTime > now) {
                            status = true;
                            resolve(status);
                        }
                        resolve(status);
                    } catch (err) {
                        applicationLogger.error(`Global.js checkExpiration Inner`, { error: err.toString() });
                        reject(status);
                    }
                }
            });
        } catch (err) {
            applicationLogger.error(`Global.js checkExpiration`, { error: err.toString() });
            return false;
        }
    }

    // Decoded Token
    static decodeToken(token) {
        return new Promise((resolve, reject) => {
            const decoded = jwt.decode(token);
            if (!decoded) {
                reject(response["106"]);
            }
            resolve(decoded);
        });
    }

    // get token value from a token
    static async getTokenValue(req, param) {
        try {
            let token = req.headers.authorization;
            token = token.substring(7, token.length);
            const decodedForVerification = jwt.decode(token);
            return decodedForVerification[param];
        } catch (err) {
            const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            applicationLogger.error(`Global.js getTokenValue`, { fullUrl: fullUrl, authorization: req.headers.authorization, param: param, error: err.toString() });
            return "";
        }
    }

    static async methodNotAllowed(req, res) {
        try {
            return res.status(405).send({ status: 0, message: response["109"] });
        } catch (err) {
            const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            applicationLogger.error(`Global.js methodNotAllowed`, { fullUrl: fullUrl, authorization: req.headers.authorization, error: err.toString() });
            return res.status(405).send({ status: 0, message: response["109"], error: err.toString() });
        }
    }

    static async notFound(req, res) {
        try {
            return res.status(404).send({ status: 0, message: response["110"] });
        } catch (err) {
            const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            applicationLogger.error(`Global.js notFound`, { fullUrl: fullUrl, authorization: req.headers.authorization, error: err.toString() });
            return res.status(404).send({ status: 0, message: response["110"], error: err.toString() });
        }
    }

    static async encrypt(value) {
        let encryptString = '';
        const stringLength = value.length;

        for (let i = 0; i < stringLength; i++) {
            switch (value[i]) {
                case 'a':
                    encryptString = encryptString + 'p';
                    break;
                case 'b':
                    encryptString = encryptString + 'h';
                    break;
                case 'c':
                    encryptString = encryptString + 'u';
                    break;
                case 'd':
                    encryptString = encryptString + 'A';
                    break;
                case 'e':
                    encryptString = encryptString + 'a';
                    break;
                case 'f':
                    encryptString = encryptString + 'o';
                    break;
                case 'g':
                    encryptString = encryptString + 'S';
                    break;
                case 'h':
                    encryptString = encryptString + 'T';
                    break;
                case 'i':
                    encryptString = encryptString + 'B';
                    break;
                case 'j':
                    encryptString = encryptString + '8';
                    break;
                case 'k':
                    encryptString = encryptString + 'U';
                    break;
                case 'l':
                    encryptString = encryptString + 'C';
                    break;
                case 'm':
                    encryptString = encryptString + 'i';
                    break;
                case 'n':
                    encryptString = encryptString + 'V';
                    break;
                case 'o':
                    encryptString = encryptString + 't';
                    break;
                case 'p':
                    encryptString = encryptString + 'W';
                    break;
                case 'q':
                    encryptString = encryptString + '7';
                    break;
                case 'r':
                    encryptString = encryptString + 'j';
                    break;
                case 's':
                    encryptString = encryptString + 'D';
                    break;
                case 't':
                    encryptString = encryptString + 'X';
                    break;
                case 'u':
                    encryptString = encryptString + 'b';
                    break;
                case 'v':
                    encryptString = encryptString + 'E';
                    break;
                case 'w':
                    encryptString = encryptString + 'F';
                    break;
                case 'x':
                    encryptString = encryptString + 's';
                    break;
                case 'y':
                    encryptString = encryptString + 'H';
                    break;
                case 'z':
                    encryptString = encryptString + '6';
                    break;
                case 'A':
                    encryptString = encryptString + 'G';
                    break;
                case 'B':
                    encryptString = encryptString + '9';
                    break;
                case 'C':
                    encryptString = encryptString + 'k';
                    break;
                case 'D':
                    encryptString = encryptString + 'I';
                    break;
                case 'E':
                    encryptString = encryptString + 'v';
                    break;
                case 'F':
                    encryptString = encryptString + '5';
                    break;
                case 'G':
                    encryptString = encryptString + 'c';
                    break;
                case 'H':
                    encryptString = encryptString + 'Y';
                    break;
                case 'I':
                    encryptString = encryptString + 'Z';
                    break;
                case 'J':
                    encryptString = encryptString + 'g';
                    break;
                case 'K':
                    encryptString = encryptString + 'J';
                    break;
                case 'L':
                    encryptString = encryptString + 'r';
                    break;
                case 'M':
                    encryptString = encryptString + '4';
                    break;
                case 'N':
                    encryptString = encryptString + 'w';
                    break;
                case 'O':
                    encryptString = encryptString + '3';
                    break;
                case 'P':
                    encryptString = encryptString + 'K';
                    break;
                case 'Q':
                    encryptString = encryptString + 'd';
                    break;
                case 'R':
                    encryptString = encryptString + 'l';
                    break;
                case 'S':
                    encryptString = encryptString + '2';
                    break;
                case 'T':
                    encryptString = encryptString + 'f';
                    break;
                case 'U':
                    encryptString = encryptString + 'L';
                    break;
                case 'V':
                    encryptString = encryptString + '1';
                    break;
                case 'W':
                    encryptString = encryptString + 'x';
                    break;
                case 'X':
                    encryptString = encryptString + '.';
                    break;
                case 'Y':
                    encryptString = encryptString + 'M';
                    break;
                case 'Z':
                    encryptString = encryptString + '0';
                    break;
                case '0':
                    encryptString = encryptString + 'm';
                    break;
                case '1':
                    encryptString = encryptString + 'R';
                    break;
                case '2':
                    encryptString = encryptString + '@';
                    break;
                case '3':
                    encryptString = encryptString + 'e';
                    break;
                case '4':
                    encryptString = encryptString + 'N';
                    break;
                case '5':
                    encryptString = encryptString + 'q';
                    break;
                case '6':
                    encryptString = encryptString + 'Q';
                    break;
                case '7':
                    encryptString = encryptString + 'n';
                    break;
                case '8':
                    encryptString = encryptString + 'O';
                    break;
                case '9':
                    encryptString = encryptString + 'P';
                    break;
                case '.':
                    encryptString = encryptString + 'y';
                    break;
                case '@':
                    encryptString = encryptString + 'z';
                    break;
                case '`':
                    encryptString = encryptString + '%';
                    break;
                case '!':
                    encryptString = encryptString + '^';
                    break;
                case '#':
                    encryptString = encryptString + '$';
                    break;
                case '$':
                    encryptString = encryptString + '(';
                    break;
                case '%':
                    encryptString = encryptString + '/';
                    break;
                case '^':
                    encryptString = encryptString + '!';
                    break;
                case '&':
                    encryptString = encryptString + '*';
                    break;
                case '*':
                    encryptString = encryptString + '-';
                    break;
                case '(':
                    encryptString = encryptString + '&';
                    break;
                case ')':
                    encryptString = encryptString + '`';
                    break;
                case '+':
                    encryptString = encryptString + '#';
                    break;
                case '-':
                    encryptString = encryptString + ')';
                    break;
                case '/':
                    encryptString = encryptString + '+';
                    break;
                case ':':
                    encryptString = encryptString + ',';
                    break;
                case ';':
                    encryptString = encryptString + '>';
                    break;
                case '?':
                    encryptString = encryptString + '<';
                    break;
                case '>':
                    encryptString = encryptString + '?';
                    break;
                case '<':
                    encryptString = encryptString + ':';
                    break;
                case ',':
                    encryptString = encryptString + ';';
                    break;
                default:
                    encryptString = "";
                    break;
            }
        }
        return encryptString;
    }

    static async decrypt(value) {
        let decryptString = '';
        const stringLength = value.length;

        for (let i = 0; i < stringLength; i++) {
            switch (value[i]) {
                case 'p':
                    decryptString = decryptString + 'a';
                    break;
                case 'h':
                    decryptString = decryptString + 'b';
                    break;
                case 'u':
                    decryptString = decryptString + 'c';
                    break;
                case 'A':
                    decryptString = decryptString + 'd';
                    break;
                case 'a':
                    decryptString = decryptString + 'e';
                    break;
                case 'o':
                    decryptString = decryptString + 'f';
                    break;
                case 'S':
                    decryptString = decryptString + 'g';
                    break;
                case 'T':
                    decryptString = decryptString + 'h';
                    break;
                case 'B':
                    decryptString = decryptString + 'i';
                    break;
                case '8':
                    decryptString = decryptString + 'j';
                    break;
                case 'U':
                    decryptString = decryptString + 'k';
                    break;
                case 'C':
                    decryptString = decryptString + 'l';
                    break;
                case 'i':
                    decryptString = decryptString + 'm';
                    break;
                case 'V':
                    decryptString = decryptString + 'n';
                    break;
                case 't':
                    decryptString = decryptString + 'o';
                    break;
                case 'W':
                    decryptString = decryptString + 'p';
                    break;
                case '7':
                    decryptString = decryptString + 'q';
                    break;
                case 'j':
                    decryptString = decryptString + 'r';
                    break;
                case 'D':
                    decryptString = decryptString + 's';
                    break;
                case 'X':
                    decryptString = decryptString + 't';
                    break;
                case 'b':
                    decryptString = decryptString + 'u';
                    break;
                case 'E':
                    decryptString = decryptString + 'v';
                    break;
                case 'F':
                    decryptString = decryptString + 'w';
                    break;
                case 's':
                    decryptString = decryptString + 'x';
                    break;
                case 'H':
                    decryptString = decryptString + 'y';
                    break;
                case '6':
                    decryptString = decryptString + 'z';
                    break;
                case 'G':
                    decryptString = decryptString + 'A';
                    break;
                case '9':
                    decryptString = decryptString + 'B';
                    break;
                case 'k':
                    decryptString = decryptString + 'C';
                    break;
                case 'I':
                    decryptString = decryptString + 'D';
                    break;
                case 'v':
                    decryptString = decryptString + 'E';
                    break;
                case '5':
                    decryptString = decryptString + 'F';
                    break;
                case 'c':
                    decryptString = decryptString + 'G';
                    break;
                case 'Y':
                    decryptString = decryptString + 'H';
                    break;
                case 'Z':
                    decryptString = decryptString + 'I';
                    break;
                case 'g':
                    decryptString = decryptString + 'J';
                    break;
                case 'J':
                    decryptString = decryptString + 'K';
                    break;
                case 'r':
                    decryptString = decryptString + 'L';
                    break;
                case '4':
                    decryptString = decryptString + 'M';
                    break;
                case 'w':
                    decryptString = decryptString + 'N';
                    break;
                case '3':
                    decryptString = decryptString + 'O';
                    break;
                case 'K':
                    decryptString = decryptString + 'P';
                    break;
                case 'd':
                    decryptString = decryptString + 'Q';
                    break;
                case 'l':
                    decryptString = decryptString + 'R';
                    break;
                case '2':
                    decryptString = decryptString + 'S';
                    break;
                case 'f':
                    decryptString = decryptString + 'T';
                    break;
                case 'L':
                    decryptString = decryptString + 'U';
                    break;
                case '1':
                    decryptString = decryptString + 'V';
                    break;
                case 'x':
                    decryptString = decryptString + 'W';
                    break;
                case '.':
                    decryptString = decryptString + 'X';
                    break;
                case 'M':
                    decryptString = decryptString + 'Y';
                    break;
                case '0':
                    decryptString = decryptString + 'Z';
                    break;
                case 'm':
                    decryptString = decryptString + '0';
                    break;
                case 'R':
                    decryptString = decryptString + '1';
                    break;
                case '@':
                    decryptString = decryptString + '2';
                    break;
                case 'e':
                    decryptString = decryptString + '3';
                    break;
                case 'N':
                    decryptString = decryptString + '4';
                    break;
                case 'q':
                    decryptString = decryptString + '5';
                    break;
                case 'Q':
                    decryptString = decryptString + '6';
                    break;
                case 'n':
                    decryptString = decryptString + '7';
                    break;
                case 'O':
                    decryptString = decryptString + '8';
                    break;
                case 'P':
                    decryptString = decryptString + '9';
                    break;
                case 'y':
                    decryptString = decryptString + '.';
                    break;
                case 'z':
                    decryptString = decryptString + '@';
                    break;
                case '%':
                    decryptString = decryptString + '`';
                    break;
                case '^':
                    decryptString = decryptString + '!';
                    break;
                case '$':
                    decryptString = decryptString + '#';
                    break;
                case '(':
                    decryptString = decryptString + '$';
                    break;
                case '/':
                    decryptString = decryptString + '%';
                    break;
                case '!':
                    decryptString = decryptString + '^';
                    break;
                case '*':
                    decryptString = decryptString + '&';
                    break;
                case '-':
                    decryptString = decryptString + '*';
                    break;
                case '&':
                    decryptString = decryptString + '(';
                    break;
                case '`':
                    decryptString = decryptString + ')';
                    break;
                case '#':
                    decryptString = decryptString + '+';
                    break;
                case ')':
                    decryptString = decryptString + '-';
                    break;
                case '+':
                    decryptString = decryptString + '/';
                    break;
                case ',':
                    decryptString = decryptString + ':';
                    break;
                case '>':
                    decryptString = decryptString + ';';
                    break;
                case '<':
                    decryptString = decryptString + '?';
                    break;
                case '?':
                    decryptString = decryptString + '>';
                    break;
                case ':':
                    decryptString = decryptString + '<';
                    break;
                case ';':
                    decryptString = decryptString + ',';
                    break;
                default:
                    decryptString = "";
                    break;
            }
        }
        return decryptString;
    }

}