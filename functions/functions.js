// @ts-nocheck
const logger = require("harislogger");
const admin = require("firebase-admin");
const db = admin.firestore();
const functions = require("firebase-functions");

async function Create(collectionName, data, docName, index = true) {
    delete data.PreviousData;
    return new Promise(async (resolve, reject) => {
        try {
            if (data.index === undefined && index) {
                data.index = Date.now();
            }
            if (docName !== undefined) {
                await db
                    .collection(collectionName)
                    .doc(docName)
                    .set(data, { merge: true });
                resolve(true);
            } else {
                const done = await db.collection(collectionName).add(data);
                resolve(done.id);
            }
        } catch (error) {
            logger.log(error);
            logger.log(error);
            reject(false);
        }
    });
}

async function Update(collectionName, data, docName, LastUpdated = true) {
    delete data.PreviousData;
    return new Promise(async (resolve, reject) => {
        try {
            if (data.LastUpdated === undefined && LastUpdated) {
                data.LastUpdated = Date.now();
            }
            await db
                .collection(collectionName)
                .doc(docName)
                .set(data, { merge: true });
            resolve(true);
        } catch (error) {
            logger.log(error);
            logger.log(error);
            reject(false);
        }
    });
}

async function Delete(collectionName, docName) {
    return new Promise(async (resolve, reject) => {
        try {
            await db.collection(collectionName).doc(docName).delete();
            resolve(true);
        } catch (error) {
            logger.log(error);
            logger.log(error);
            reject(false);
        }
    });
}

async function Read(
    collectionName,
    docName = undefined,
    index,
    Keyword,
    limit = 1000,
    where,
    orderBy = [true, "index", "desc"]
) {
    let query;
    if (docName === undefined || docName === "") {
        query = db.collection(collectionName);
        if (Keyword !== "" && Keyword !== undefined) {
            query = query.where("Keywords", "array-contains", Keyword.toLowerCase());
        }
        if (where !== undefined) {
            for (
                let where_index = 0;
                where_index < where.length;
                where_index = where_index + 3
            ) {
                query = query.where(
                    where[where_index],
                    where[where_index + 1],
                    where[where_index + 2]
                );
            }
        }
        if (orderBy[0] === true) {
            for (
                let orderByIndex = 1;
                orderByIndex < orderBy.length;
                orderByIndex = orderByIndex + 2
            ) {
                query = query.orderBy(orderBy[orderByIndex], orderBy[orderByIndex + 1]);
            }
        }

        if (index !== undefined && index !== null && index !== 0 && index !== "") {
            const snapshot = await db.collection(collectionName).doc(index).get();
            query = query.startAfter(snapshot);
        }
    } else {
        query = db.collection(collectionName).doc(docName);
    }
    return new Promise(async (resolve, reject) => {
        try {
            if (docName === undefined || docName === "") {
                const temp = [];
                const data = await query.limit(limit).get();
                data.forEach((doc) => {
                    if (doc.exists) {
                        const r = doc.data();
                        delete r.Keywords;
                        temp.push({ ...r, DocId: doc.id });
                    }
                });
                resolve(temp);
            } else {
                const dat = await query.get();
                if (dat.exists) {
                    resolve({ ...dat.data(), DocId: dat.id });
                } else {
                    resolve(null);
                }
            }
        } catch (error) {
            logger.error(error);
            logger.warn(error);
            reject(false);
        }
    });
}

const createKeywords = (name, resultArr) => {
    function containsNonLatinCodepoints(s) {
        return /[^\u0000-\u00ff]/.test(s);
    }
    if (name === undefined || name === null) {
        name = "";
    }
    name = String(name);
    let curName = "";
    let temp = name;
    let len = name.split(" ").length;
    for (let i = 0; i < len; i++) {
        for (let k = 0; k < temp.split("").length; k++) {
            letter = temp[k];
            curName += letter.toLowerCase();
            if (
                !resultArr.includes(curName) &&
                !containsNonLatinCodepoints(curName)
            ) {
                resultArr.push(curName);
            }
        }
        temp = temp.split(" ");
        temp.splice(0, 1);
        temp = temp.join(" ");
        curName = "";
    }
};

const Check = (Field) => {
    if (Field === null || Field === undefined || Field === "") {
        return true;
    } else {
        return false;
    }
};
//const increment = admin.firestore.FieldValue.increment
//const arrayUnion = admin.firestore.FieldValue.arrayUnion;

const RandomId = (collectionName) =>
    admin.firestore().collection(collectionName).doc().id;



async function WhereGet(collectionName, Field, data, DocId) {
    return new Promise(async (resolve, reject) => {
        return db
            .collection(collectionName)
            .where(Field, "==", data)
            .limit(1)
            .get()
            .then((snap) => {
                if (snap.size === 0) {
                    resolve(true);
                } else {
                    if (DocId !== undefined) {
                        if (snap.docs[0].id === DocId) {
                            resolve(true);
                        }
                    }
                    resolve(false);
                }
            })
            .catch((err) => {
                functions.logger.error(err);
                reject(false);
            });
    });
}

const ParamsToFirestoreFields = (
    QueryParams = {},
    FieldTypes = { index: "number" }
) => {
    console.log(QueryParams);

    let Limit,
        OrderBy = [],
        Index,
        Keyword,
        Where = [];

    if (!Check(QueryParams["limit"])) {
        if (QueryParams["limit"] === "FALSE") {
            Limit = false;
        } else {
            Limit = Number(QueryParams["limit"]);
        }
    } else {
        Limit = 10;
    }
    if (!Check(QueryParams["sort_by"])) {
        OrderBy = [true, QueryParams["sort_by"], "asc"];
        if (!Check(QueryParams["order_by"])) {
            OrderBy[2] = QueryParams["order_by"];
        }
    }
    if (!Check(QueryParams["after_id"])) {
        Index = QueryParams["after_id"];
    }
    if (!Check(QueryParams["keyword"])) {
        Keyword = QueryParams["keyword"];
    }

    const FixedKeys = ["limit", "sort_by", "after_id", "order_by", "keyword"];
    const keys = Object.keys(QueryParams);
    const types = ["==", ">=", "<=", ">", "<", ">>"];

    for (let index = 0; index < keys.length; index++) {
        const element = keys[index];
        const Flag = !FixedKeys.includes(element);

        if (!Flag) {
            continue;
        }
        if (Check(QueryParams[element])) {
            continue;
        }
        if (
            typeof QueryParams[element] !== "object" &&
            typeof QueryParams[element] === "string"
        ) {
            Where.push(element, "==", QueryParams[element]);
            continue;
        }
        const type = Object.keys(QueryParams[element]);
        for (let i = 0; i < type.length && Flag; i++) {
            const elem = type[i];
            QueryParams[element][elem] = TypeSetting(
                element,
                QueryParams[element][elem],
                FieldTypes
            );
            if (types.includes(elem)) {
                if (elem === ">>") {
                    Where.push(element, "in", QueryParams[element][elem]);
                } else {
                    Where.push(element, elem, QueryParams[element][elem]);
                }
            } else {
                Where.push(element, "==", QueryParams[element][elem]);
            }
        }
    }
    const orderBy = OrderBy;

    return {
        Limit,
        orderBy,
        Index,
        Where,
        Keyword,
    };
};

const TypeSetting = (FieldName, FieldData, FieldTypeObj) => {
    if (Check(FieldTypeObj[FieldName])) {
        return FieldData;
    }
    switch (FieldTypeObj[FieldName]) {
        case "string":
            return String(FieldData);
        case "number":
            return Number(FieldData);
        case "array":
            return FieldData.split(",");
        default:
            return String(FieldData);
    }
};
const createCustomToken = async (UID) => {
    return admin.auth().createCustomToken(UID);
};
const verifyIdToken = async (idToken) => {
    console.log("verifyIdToken");
    return admin.auth().verifyIdToken(idToken);
};

const revokeUserToken = async (uid) => {
    await admin.auth().revokeRefreshTokens(uid);
    return 0;
};

const createUser = async (displayName) => {
    function CreateRandomEmail(length) {
        var result = "";
        var characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    const mail = CreateRandomEmail(10) + "@gmail.com";
    const user = await admin.auth().createUser({
        email: mail,
        displayName: displayName,
    });
    return user.uid;
};

const CheckEntityExists = (res, Entity, EntityString) => {
    if (Check(Entity)) {
        res.status(403).json({
            message: `${EntityString} doesn't exists`,
            success: false,
        });
        return true;
    } else {
        return false;
    }
};

module.exports = {
    Create,
    Update,
    Delete,
    Read,

    WhereGet,

    Check,
    CheckEntityExists,

    //  increment,
    //arrayUnion,
    RandomId,

    ParamsToFirestoreFields,
    createKeywords,

    createCustomToken,
    verifyIdToken,
    revokeUserToken,
    createUser,
    // toBase64
};
