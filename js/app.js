/* =========================================================
   RESIK HUB
   FIREBASE AUTHENTICATION + FIRESTORE
   APP.JS
   FINAL ADMIN + WARGA VERSION
   =========================================================

   KONSEP SISTEM

   WARGA
   - Register sendiri
   - Firebase UID
   - Profile: profiles/{uid}
   - Memiliki RT
   - Bisa setor sampah sendiri
   - Poin masuk ke akun warga sendiri

   ADMIN
   - Email khusus:
     admin@resikhub.id
   - Password dikelola Firebase Authentication
   - Melihat seluruh transaksi
   - Bisa mencatat setoran untuk warga
   - Tidak mendapatkan poin dari transaksi warga

   DATA WARGA MANUAL
   - citizens/{documentId}

   TRANSAKSI
   - transactions/{documentId}

   TRANSAKSI WARGA:
   uid              = UID warga
   citizenId        = ID warga
   citizenName      = nama warga
   rt               = RT warga
   recordedByUid    = null
   recordedByName   = "Warga"

   TRANSAKSI ADMIN:
   uid              = UID warga penerima poin
   citizenId        = ID warga
   citizenName      = nama warga
   rt               = RT warga
   recordedByUid    = UID admin
   recordedByName   = nama admin

   ========================================================= */


/* =========================================================
   ADMIN CONFIGURATION
   ========================================================= */

const ADMIN_EMAIL =
    "admin@resikhub.id";


/* =========================================================
   FIREBASE IMPORT
   ========================================================= */

import {
    initializeApp
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    addDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    increment
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyBie2Ry7LBY9zOCRIMbQv2BW3Ew5os77BM",

    authDomain:
        "resik-hub.firebaseapp.com",

    projectId:
        "resik-hub",

    storageBucket:
        "resik-hub.firebasestorage.app",

    messagingSenderId:
        "251920478363",

    appId:
        "1:251920478363:web:3f87fe82d651ef0153563e",

    measurementId:
        "G-CJCW03H7QQ"

};


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

const firebaseApp =
    initializeApp(
        firebaseConfig
    );


const auth =
    getAuth(
        firebaseApp
    );


const db =
    getFirestore(
        firebaseApp
    );


/* =========================================================
   GLOBAL FIREBASE
   ========================================================= */

window.resikFirebase =
    firebaseApp;


window.resikAuth =
    auth;


window.resikDB =
    db;


/* =========================================================
   GLOBAL STATE
   ========================================================= */

const state = {

    uid: null,

    role: "warga",

    name: "Warga",

    email: "",

    citizenId: "",

    rt: "",

    points: 0,

    greenScore: 0,

    waste: 0,

    co2: 0,

    transactions: [],

    redemptions: []

};


window.resikState =
    state;


/* =========================================================
   FIREBASE READY
   ========================================================= */

let resolveResikReady;

let resikReadyResolved =
    false;


window.resikReady =
    new Promise(
        resolve => {

            resolveResikReady =
                resolve;

        }
    );


function resolveReady() {

    if (
        resikReadyResolved
    ) {

        return;

    }


    resikReadyResolved =
        true;


    resolveResikReady(
        state
    );

}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "id-ID",
        {
            maximumFractionDigits: 2
        }
    );

}


window.resikFormatNumber =
    formatNumber;


/* =========================================================
   FORMAT RUPIAH
   ========================================================= */

function formatRupiah(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    );

}


window.resikFormatRupiah =
    formatRupiah;


/* =========================================================
   TOAST
   ========================================================= */

function toast(
    message
) {

    let element =
        document.querySelector(
            ".toast"
        );


    if (!element) {

        element =
            document.createElement(
                "div"
            );

        element.className =
            "toast";

        document.body.appendChild(
            element
        );

    }


    element.textContent =
        message;


    element.classList.add(
        "show"
    );


    setTimeout(
        () => {

            element.classList.remove(
                "show"
            );

        },
        2500
    );

}


window.resikToast =
    toast;


window.toast =
    toast;


/* =========================================================
   AUTH MESSAGE
   ========================================================= */

function showAuthMessage(
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            "authMessage"
        );


    if (!element) {

        console.log(
            message
        );

        return;

    }


    element.textContent =
        message;


    element.style.display =
        "block";


    element.style.textAlign =
        "center";


    element.style.marginTop =
        "15px";


    element.style.fontWeight =
        "600";


    element.style.color =
        type === "success"
            ? "#087a38"
            : "#d32f2f";

}


window.resikAuthMessage =
    showAuthMessage;


/* =========================================================
   NORMALIZE EMAIL
   ========================================================= */

function normalizeEmail(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(
            /\s+/g,
            ""
        )
        .toLowerCase();

}


/* =========================================================
   NORMALIZE TEXT
   ========================================================= */

function normalizeText(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


/* =========================================================
   NORMALIZE CITIZEN ID
   ========================================================= */

function normalizeCitizenId(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        )
        .toUpperCase();

}


/* =========================================================
   NORMALIZE RT
   ========================================================= */

function normalizeRT(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        )
        .toUpperCase();

}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
        .test(
            email
        );

}


/* =========================================================
   ADMIN EMAIL
   ========================================================= */

function isAdminEmail(
    email
) {

    return (
        normalizeEmail(email) ===
        normalizeEmail(ADMIN_EMAIL)
    );

}


window.resikIsAdminEmail =
    isAdminEmail;


/* =========================================================
   IS ADMIN
   ========================================================= */

function isAdmin() {

    const user =
        auth.currentUser;


    if (!user) {

        return false;

    }


    return isAdminEmail(
        user.email
    );

}


window.resikIsAdmin =
    isAdmin;


/* =========================================================
   FIREBASE ERROR
   ========================================================= */

function getFirebaseErrorMessage(
    error
) {

    console.error(
        "FIREBASE ERROR:",
        error
    );


    const code =
        error?.code ||
        "";


    switch (code) {

        case "auth/email-already-in-use":
            return "Email tersebut sudah terdaftar. Silakan login atau gunakan email lain.";

        case "auth/invalid-email":
            return "Format email tidak valid.";

        case "auth/weak-password":
            return "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.";

        case "auth/password-does-not-meet-requirements":
            return "Kata sandi belum memenuhi persyaratan Firebase.";

        case "auth/user-not-found":
            return "Akun dengan email tersebut tidak ditemukan.";

        case "auth/wrong-password":
            return "Email atau kata sandi salah.";

        case "auth/invalid-credential":
            return "Email atau kata sandi salah.";

        case "auth/user-disabled":
            return "Akun ini telah dinonaktifkan.";

        case "auth/too-many-requests":
            return "Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.";

        case "auth/network-request-failed":
            return "Tidak dapat terhubung ke Firebase. Periksa koneksi internet.";

        case "auth/operation-not-allowed":
            return "Login Email/Password belum diaktifkan di Firebase.";

        case "permission-denied":
        case "firestore/permission-denied":
            return "Firebase menolak akses Firestore. Periksa Firestore Rules.";

        case "failed-precondition":
        case "firestore/failed-precondition":
            return "Query Firestore membutuhkan index atau konfigurasi Firestore.";

        case "not-found":
        case "firestore/not-found":
            return "Data Firestore tidak ditemukan.";

        default:

            return (
                error?.message ||
                "Terjadi kesalahan. Silakan coba lagi."
            );

    }

}


window.resikFirebaseErrorMessage =
    getFirebaseErrorMessage;


/* =========================================================
   TIMESTAMP
   ========================================================= */

function getTimestampMillis(
    timestamp
) {

    if (!timestamp) {

        return 0;

    }


    try {

        if (
            typeof timestamp.toMillis ===
            "function"
        ) {

            return timestamp.toMillis();

        }


        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            return timestamp
                .toDate()
                .getTime();

        }


        if (
            timestamp.seconds !==
            undefined
        ) {

            return Number(
                timestamp.seconds
            ) * 1000;

        }


        const date =
            new Date(
                timestamp
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return 0;

        }


        return date.getTime();


    } catch (error) {

        console.error(
            "TIMESTAMP ERROR:",
            error
        );

        return 0;

    }

}


window.resikTimestampMillis =
    getTimestampMillis;


/* =========================================================
   GET PROFILE
   ========================================================= */

async function getProfile(
    uid
) {

    if (!uid) {

        return null;

    }


    try {

        const profileRef =
            doc(
                db,
                "profiles",
                uid
            );


        const snapshot =
            await getDoc(
                profileRef
            );


        if (
            !snapshot.exists()
        ) {

            return null;

        }


        return {

            id:
                snapshot.id,

            ...snapshot.data()

        };


    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );

        return null;

    }

}


window.resikGetProfile =
    getProfile;


/* =========================================================
   APPLY PROFILE TO STATE
   ========================================================= */

function applyProfileToState(
    profile
) {

    if (!profile) {

        return;

    }


    const user =
        auth.currentUser;


    state.uid =
        profile.uid ||
        user?.uid ||
        null;


    state.email =
        normalizeEmail(
            profile.email ||
            user?.email ||
            ""
        );


    /*
     * Admin selalu ditentukan oleh email.
     */

    state.role =
        isAdminEmail(
            state.email
        )
            ? "admin"
            : "warga";


    state.name =
        profile.name ||
        user?.displayName ||
        (
            state.role === "admin"
                ? "Admin RESIK Hub"
                : "Warga"
        );


    state.citizenId =
        profile.citizenId ||
        "";


    state.rt =
        normalizeRT(
            profile.rt ||
            ""
        );


    state.points =
        Number(
            profile.points ?? 0
        );


    state.greenScore =
        Number(
            profile.greenScore ?? 0
        );


    state.waste =
        Number(
            profile.totalWaste ?? 0
        );


    state.co2 =
        Number(
            profile.totalCo2 ?? 0
        );

}


/* =========================================================
   GET USER TRANSACTIONS
   ========================================================= */

async function getUserTransactions(
    uid,
    maxResults = 50
) {

    if (!uid) {

        state.transactions =
            [];

        return [];

    }


    try {

        const q =
            query(

                collection(
                    db,
                    "transactions"
                ),

                where(
                    "uid",
                    "==",
                    uid
                ),

                orderBy(
                    "createdAt",
                    "desc"
                ),

                limit(
                    maxResults
                )

            );


        const snapshot =
            await getDocs(
                q
            );


        const transactions =
            [];


        snapshot.forEach(
            transactionDoc => {

                transactions.push({

                    firestoreId:
                        transactionDoc.id,

                    ...transactionDoc.data()

                });

            }
        );


        state.transactions =
            transactions;


        return transactions;


    } catch (error) {

        console.warn(
            "TRANSACTION QUERY FALLBACK:",
            error
        );


        try {

            const fallbackQuery =
                query(

                    collection(
                        db,
                        "transactions"
                    ),

                    where(
                        "uid",
                        "==",
                        uid
                    ),

                    limit(
                        maxResults
                    )

                );


            const snapshot =
                await getDocs(
                    fallbackQuery
                );


            const transactions =
                [];


            snapshot.forEach(
                transactionDoc => {

                    transactions.push({

                        firestoreId:
                            transactionDoc.id,

                        ...transactionDoc.data()

                    });

                }
            );


            transactions.sort(
                (a, b) => {

                    return (
                        getTimestampMillis(
                            b.createdAt
                        ) -
                        getTimestampMillis(
                            a.createdAt
                        )
                    );

                }
            );


            state.transactions =
                transactions;


            return transactions;


        } catch (fallbackError) {

            console.error(
                "TRANSACTION FALLBACK ERROR:",
                fallbackError
            );


            state.transactions =
                [];


            return [];

        }

    }

}


window.resikGetTransactions =
    getUserTransactions;


/* =========================================================
   GET USER REDEMPTIONS
   ========================================================= */

async function getUserRedemptions(
    uid,
    maxResults = 50
) {

    if (!uid) {

        state.redemptions =
            [];

        return [];

    }


    try {

        const q =
            query(

                collection(
                    db,
                    "redemptions"
                ),

                where(
                    "uid",
                    "==",
                    uid
                ),

                orderBy(
                    "createdAt",
                    "desc"
                ),

                limit(
                    maxResults
                )

            );


        const snapshot =
            await getDocs(
                q
            );


        const redemptions =
            [];


        snapshot.forEach(
            redemptionDoc => {

                redemptions.push({

                    firestoreId:
                        redemptionDoc.id,

                    ...redemptionDoc.data()

                });

            }
        );


        state.redemptions =
            redemptions;


        return redemptions;


    } catch (error) {

        console.warn(
            "REDEMPTION QUERY FALLBACK:",
            error
        );


        try {

            const fallbackQuery =
                query(

                    collection(
                        db,
                        "redemptions"
                    ),

                    where(
                        "uid",
                        "==",
                        uid
                    ),

                    limit(
                        maxResults
                    )

                );


            const snapshot =
                await getDocs(
                    fallbackQuery
                );


            const redemptions =
                [];


            snapshot.forEach(
                redemptionDoc => {

                    redemptions.push({

                        firestoreId:
                            redemptionDoc.id,

                        ...redemptionDoc.data()

                    });

                }
            );


            redemptions.sort(
                (a, b) => {

                    return (
                        getTimestampMillis(
                            b.createdAt
                        ) -
                        getTimestampMillis(
                            a.createdAt
                        )
                    );

                }
            );


            state.redemptions =
                redemptions;


            return redemptions;


        } catch (fallbackError) {

            console.error(
                "GET REDEMPTIONS ERROR:",
                fallbackError
            );


            state.redemptions =
                [];


            return [];

        }

    }

}


window.resikGetRedemptions =
    getUserRedemptions;


/* =========================================================
   GET ALL CITIZENS
   ========================================================= */

async function getAllCitizens() {

    const map =
        new Map();


    /*
     * CITIZENS
     */

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "citizens"
                )
            );


        snapshot.forEach(
            citizenDoc => {

                const data =
                    citizenDoc.data();


                const citizen = {

                    firestoreId:
                        citizenDoc.id,

                    ...data

                };


                const key =
                    normalizeCitizenId(
                        citizen.citizenId ||
                        citizenDoc.id
                    );


                if (key) {

                    map.set(
                        key,
                        citizen
                    );

                }

            }
        );


    } catch (error) {

        console.warn(
            "GET CITIZENS ERROR:",
            error
        );

    }


    /*
     * PROFILES
     */

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "profiles"
                )
            );


        snapshot.forEach(
            profileDoc => {

                const data =
                    profileDoc.data();


                const email =
                    normalizeEmail(
                        data.email ||
                        ""
                    );


                /*
                 * Jangan masukkan admin
                 */

                if (
                    isAdminEmail(
                        email
                    )
                ) {

                    return;

                }


                const citizenId =
                    normalizeCitizenId(
                        data.citizenId ||
                        ""
                    );


                const key =
                    citizenId ||
                    `UID:${profileDoc.id}`;


                const existing =
                    map.get(
                        key
                    );


                map.set(
                    key,
                    {

                        ...(existing || {}),

                        firestoreId:
                            existing?.firestoreId ||
                            profileDoc.id,

                        uid:
                            data.uid ||
                            profileDoc.id,

                        citizenId:
                            citizenId ||
                            existing?.citizenId ||
                            "",

                        rt:
                            normalizeRT(
                                data.rt ||
                                existing?.rt ||
                                ""
                            ),

                        name:
                            data.name ||
                            existing?.name ||
                            "Warga",

                        email:
                            data.email ||
                            existing?.email ||
                            "",

                        points:
                            Number(
                                data.points ??
                                existing?.points ??
                                0
                            ),

                        greenScore:
                            Number(
                                data.greenScore ??
                                existing?.greenScore ??
                                0
                            ),

                        totalWaste:
                            Number(
                                data.totalWaste ??
                                existing?.totalWaste ??
                                0
                            ),

                        totalCo2:
                            Number(
                                data.totalCo2 ??
                                existing?.totalCo2 ??
                                0
                            )

                    }

                );

            }
        );


    } catch (error) {

        console.warn(
            "GET PROFILES ERROR:",
            error
        );

    }


    const result =
        Array.from(
            map.values()
        );


    result.sort(
        (a, b) => {

            return String(
                a.name || ""
            ).localeCompare(
                String(
                    b.name || ""
                ),
                "id"
            );

        }
    );


    return result;

}


window.resikGetAllCitizens =
    getAllCitizens;


/* =========================================================
   FIND CITIZENS
   ========================================================= */

async function findCitizens(
    keyword = "",
    rt = ""
) {

    const citizens =
        await getAllCitizens();


    const search =
        normalizeText(
            keyword
        ).toLowerCase();


    const selectedRT =
        normalizeRT(
            rt
        );


    return citizens.filter(
        citizen => {

            const citizenId =
                normalizeCitizenId(
                    citizen.citizenId
                ).toLowerCase();


            const name =
                normalizeText(
                    citizen.name
                ).toLowerCase();


            const citizenRT =
                normalizeRT(
                    citizen.rt
                );


            const matchesKeyword =
                !search ||
                citizenId.includes(
                    search
                ) ||
                name.includes(
                    search
                );


            const matchesRT =
                !selectedRT ||
                citizenRT ===
                selectedRT;


            return (
                matchesKeyword &&
                matchesRT
            );

        }
    );

}


window.resikFindCitizens =
    findCitizens;


/* =========================================================
   GET CITIZEN BY ID
   ========================================================= */

async function getCitizenById(
    citizenId
) {

    const normalized =
        normalizeCitizenId(
            citizenId
        );


    if (!normalized) {

        return null;

    }


    /*
     * citizens
     */

    try {

        const q =
            query(

                collection(
                    db,
                    "citizens"
                ),

                where(
                    "citizenId",
                    "==",
                    normalized
                ),

                limit(1)

            );


        const snapshot =
            await getDocs(
                q
            );


        if (
            !snapshot.empty
        ) {

            const citizenDoc =
                snapshot.docs[0];


            return {

                firestoreId:
                    citizenDoc.id,

                ...citizenDoc.data()

            };

        }

    } catch (error) {

        console.warn(
            "GET CITIZEN BY ID ERROR:",
            error
        );

    }


    /*
     * profiles
     */

    try {

        const q =
            query(

                collection(
                    db,
                    "profiles"
                ),

                where(
                    "citizenId",
                    "==",
                    normalized
                ),

                limit(1)

            );


        const snapshot =
            await getDocs(
                q
            );


        if (
            !snapshot.empty
        ) {

            const profileDoc =
                snapshot.docs[0];


            return {

                firestoreId:
                    profileDoc.id,

                ...profileDoc.data()

            };

        }

    } catch (error) {

        console.warn(
            "GET PROFILE BY CITIZEN ID ERROR:",
            error
        );

    }


    return null;

}


window.resikGetCitizenById =
    getCitizenById;


/* =========================================================
   CREATE MANUAL CITIZEN
   ========================================================= */

async function createManualCitizen(
    citizenData
) {

    if (
        !isAdmin()
    ) {

        throw new Error(
            "Hanya admin yang dapat menambahkan data warga."
        );

    }


    const adminUser =
        auth.currentUser;


    if (!adminUser) {

        throw new Error(
            "Admin harus login terlebih dahulu."
        );

    }


    const adminProfile =
        await getProfile(
            adminUser.uid
        );


    const citizenId =
        normalizeCitizenId(
            citizenData?.citizenId
        );


    const name =
        normalizeText(
            citizenData?.name
        );


    const rt =
        normalizeRT(
            citizenData?.rt
        );


    if (!citizenId) {

        throw new Error(
            "ID Warga wajib diisi."
        );

    }


    if (!name) {

        throw new Error(
            "Nama Warga wajib diisi."
        );

    }


    if (!rt) {

        throw new Error(
            "RT Warga wajib dipilih."
        );

    }


    const existing =
        await getCitizenById(
            citizenId
        );


    if (existing) {

        throw new Error(
            `ID Warga ${citizenId} sudah terdaftar.`
        );

    }


    const citizenRef =
        await addDoc(

            collection(
                db,
                "citizens"
            ),

            {

                citizenId:
                    citizenId,

                rt:
                    rt,

                name:
                    name,

                email:
                    normalizeEmail(
                        citizenData?.email
                    ),

                uid:
                    citizenData?.uid ||
                    null,

                points:
                    0,

                greenScore:
                    0,

                totalWaste:
                    0,

                totalCo2:
                    0,

                status:
                    "aktif",

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp(),

                createdByUid:
                    adminUser.uid,

                createdByName:
                    adminProfile?.name ||
                    adminUser.displayName ||
                    "Admin"

            }

        );


    return {

        firestoreId:
            citizenRef.id,

        citizenId:
            citizenId,

        rt:
            rt,

        name:
            name,

        points:
            0,

        greenScore:
            0,

        totalWaste:
            0,

        totalCo2:
            0,

        uid:
            citizenData?.uid ||
            null

    };

}


window.resikCreateCitizen =
    createManualCitizen;


/* =========================================================
   UPDATE CITIZEN DATA
   ========================================================= */

async function updateCitizenStats(
    citizen,
    points,
    weight,
    co2,
    citizenUid,
    citizenId,
    citizenName,
    rt
) {

    if (
        citizen?.firestoreId
    ) {

        try {

            const citizenRef =
                doc(
                    db,
                    "citizens",
                    citizen.firestoreId
                );


            await updateDoc(
                citizenRef,
                {

                    points:
                        increment(
                            points
                        ),

                    totalWaste:
                        increment(
                            weight
                        ),

                    totalCo2:
                        increment(
                            co2
                        ),

                    greenScore:
                        increment(
                            points
                        ),

                    uid:
                        citizenUid ||
                        citizen.uid ||
                        null,

                    citizenId:
                        citizenId,

                    name:
                        citizenName,

                    rt:
                        rt,

                    updatedAt:
                        serverTimestamp()

                }
            );

        } catch (error) {

            console.warn(
                "CITIZEN UPDATE ERROR:",
                error
            );

        }

    }

}


/* =========================================================
   SAVE PROFILE STATS
   ========================================================= */

async function updateCitizenProfile(
    citizenUid,
    points,
    weight,
    co2,
    citizenId,
    rt
) {

    if (!citizenUid) {

        return;

    }


    const profileRef =
        doc(
            db,
            "profiles",
            citizenUid
        );


    try {

        await updateDoc(
            profileRef,
            {

                points:
                    increment(
                        points
                    ),

                totalWaste:
                    increment(
                        weight
                    ),

                totalCo2:
                    increment(
                        co2
                    ),

                greenScore:
                    increment(
                        points
                    ),

                citizenId:
                    citizenId,

                rt:
                    rt,

                updatedAt:
                    serverTimestamp()

            }
        );

    } catch (error) {

        /*
         * Profile bisa saja belum
         * mempunyai dokumen.
         */

        console.warn(
            "PROFILE STATS UPDATE ERROR:",
            error
        );

        throw error;

    }

}


/* =========================================================
   ADD TRANSACTION — WARGA
   =========================================================

   Fungsi ini KHUSUS warga.

   Warga melakukan setor sendiri:
       user login
          ↓
       uid = UID warga
          ↓
       poin = warga
          ↓
       tidak ada admin pencatat
   ========================================================= */

async function addCitizenTransaction(
    transaction
) {

    const user =
        auth.currentUser;


    if (!user) {

        throw new Error(
            "Anda harus login terlebih dahulu."
        );

    }


    if (
        isAdminEmail(
            user.email
        )
    ) {

        throw new Error(
            "Akun admin gunakan fitur pencatatan admin."
        );

    }


    if (!transaction) {

        throw new Error(
            "Data transaksi tidak ditemukan."
        );

    }


    const weight =
        Number(
            transaction.weight
        ) || 0;


    const value =
        Number(
            transaction.value
        ) || 0;


    const points =
        Number(
            transaction.points
        ) || 0;


    const co2 =
        Number(
            transaction.co2
        ) || (
            weight * 0.5
        );


    const profile =
        await getProfile(
            user.uid
        );


    const citizenId =
        normalizeCitizenId(
            transaction.citizenId ||
            profile?.citizenId ||
            ""
        );


    const citizenName =
        normalizeText(
            transaction.citizenName ||
            profile?.name ||
            user.displayName ||
            "Warga"
        );


    const rt =
        normalizeRT(
            transaction.rt ||
            profile?.rt ||
            ""
        );


    if (
        weight <= 0
    ) {

        throw new Error(
            "Berat sampah harus lebih dari 0 kg."
        );

    }


    if (
        !citizenName
    ) {

        throw new Error(
            "Nama warga tidak ditemukan."
        );

    }


    if (
        !rt
    ) {

        throw new Error(
            "RT Anda belum diatur. Silakan lengkapi RT pada profil atau daftar ulang dengan RT."
        );

    }


    if (
        points < 0
    ) {

        throw new Error(
            "Poin tidak boleh negatif."
        );

    }


    const transactionData = {

        id:
            transaction.id ||
            "TRX-" +
            Date.now()
                .toString()
                .slice(-8),

        uid:
            user.uid,

        citizenId:
            citizenId,

        citizenName:
            citizenName,

        name:
            citizenName,

        rt:
            rt,

        type:
            transaction.type ||
            "Plastik",

        weight:
            weight,

        value:
            value,

        points:
            points,

        co2:
            co2,

        condition:
            transaction.condition ||
            "",

        status:
            transaction.status ||
            "Selesai",

        recordedByUid:
            null,

        recordedByName:
            "Warga",

        recordedMode:
            "warga",

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };


    /*
     * SIMPAN TRANSAKSI
     */

    const transactionRef =
        await addDoc(

            collection(
                db,
                "transactions"
            ),

            transactionData

        );


    /*
     * UPDATE PROFILE WARGA
     */

    await updateCitizenProfile(
        user.uid,
        points,
        weight,
        co2,
        citizenId,
        rt
    );


    /*
     * UPDATE DATA CITIZENS
     * jika warga memang punya
     * dokumen citizen.
     */

    if (
        citizenId
    ) {

        try {

            const citizen =
                await getCitizenById(
                    citizenId
                );


            if (citizen) {

                await updateCitizenStats(
                    citizen,
                    points,
                    weight,
                    co2,
                    user.uid,
                    citizenId,
                    citizenName,
                    rt
                );

            }

        } catch (error) {

            console.warn(
                "UPDATE CITIZEN FROM WARGA ERROR:",
                error
            );

        }

    }


    /*
     * LOCAL STATE
     */

    const localTransaction = {

        firestoreId:
            transactionRef.id,

        ...transactionData,

        createdAt:
            new Date(),

        updatedAt:
            new Date()

    };


    state.transactions.unshift(
        localTransaction
    );


    state.points +=
        points;


    state.waste +=
        weight;


    state.co2 +=
        co2;


    state.greenScore +=
        points;


    state.citizenId =
        citizenId;


    state.rt =
        rt;


    updateDashboardElements();


    return {

        id:
            transactionRef.id,

        transaction:
            localTransaction

    };

}


window.resikAddCitizenTransaction =
    addCitizenTransaction;


/* =========================================================
   ADD TRANSACTION — ADMIN
   =========================================================

   Admin:
   - memilih warga
   - poin masuk ke warga
   - admin hanya dicatat sebagai pencatat

   ========================================================= */

async function recordAdminDeposit(
    transaction
) {

    const adminUser =
        auth.currentUser;


    if (!adminUser) {

        throw new Error(
            "Admin harus login terlebih dahulu."
        );

    }


    if (
        !isAdmin()
    ) {

        throw new Error(
            "Hanya akun admin yang dapat mencatat setoran warga."
        );

    }


    if (!transaction) {

        throw new Error(
            "Data transaksi tidak ditemukan."
        );

    }


    const weight =
        Number(
            transaction.weight
        ) || 0;


    const value =
        Number(
            transaction.value
        ) || 0;


    const points =
        Number(
            transaction.points
        ) || 0;


    const co2 =
        Number(
            transaction.co2
        ) || (
            weight * 0.5
        );


    const citizenId =
        normalizeCitizenId(
            transaction.citizenId
        );


    const citizenName =
        normalizeText(
            transaction.citizenName ||
            transaction.name
        );


    const rt =
        normalizeRT(
            transaction.rt
        );


    if (
        weight <= 0
    ) {

        throw new Error(
            "Berat sampah harus lebih dari 0 kg."
        );

    }


    if (!citizenId) {

        throw new Error(
            "ID Warga belum dipilih."
        );

    }


    if (!citizenName) {

        throw new Error(
            "Nama Warga belum dipilih."
        );

    }


    if (!rt) {

        throw new Error(
            "RT Warga belum dipilih."
        );

    }


    if (
        points < 0
    ) {

        throw new Error(
            "Poin tidak boleh negatif."
        );

    }


    /*
     * CARI WARGA
     */

    let citizen =
        await getCitizenById(
            citizenId
        );


    /*
     * UID WARGA
     */

    let citizenUid =
        citizen?.uid ||
        transaction.targetUid ||
        null;


    /*
     * Jika belum ada data warga,
     * buat manual.
     */

    if (!citizen) {

        citizen =
            await createManualCitizen({

                citizenId:
                    citizenId,

                name:
                    citizenName,

                rt:
                    rt

            });


        citizenUid =
            citizen.uid ||
            null;

    }


    /*
     * Jika warga punya akun,
     * pastikan profile bisa diperbarui.
     */

    if (
        citizenUid
    ) {

        const profile =
            await getProfile(
                citizenUid
            );


        /*
         * Bila UID ada tapi profile
         * belum ada, buat profile.
         */

        if (!profile) {

            await setDoc(

                doc(
                    db,
                    "profiles",
                    citizenUid
                ),

                {

                    uid:
                        citizenUid,

                    name:
                        citizenName,

                    email:
                        citizen?.email ||
                        "",

                    role:
                        "warga",

                    citizenId:
                        citizenId,

                    rt:
                        rt,

                    points:
                        0,

                    greenScore:
                        0,

                    totalWaste:
                        0,

                    totalCo2:
                        0,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }

            );

        }

    }


    const finalCitizenId =
        citizen.citizenId ||
        citizenId;


    const finalCitizenName =
        citizen.name ||
        citizenName;


    const finalRT =
        citizen.rt ||
        rt;


    /*
     * TRANSACTION
     */

    const transactionData = {

        id:
            transaction.id ||
            "TRX-" +
            Date.now()
                .toString()
                .slice(-8),

        uid:
            citizenUid,

        citizenId:
            finalCitizenId,

        citizenName:
            finalCitizenName,

        name:
            finalCitizenName,

        rt:
            finalRT,

        type:
            transaction.type ||
            "Plastik",

        weight:
            weight,

        value:
            value,

        points:
            points,

        co2:
            co2,

        condition:
            transaction.condition ||
            "",

        status:
            transaction.status ||
            "Selesai",

        recordedByUid:
            adminUser.uid,

        recordedByName:
            state.name ||
            adminUser.displayName ||
            "Admin RESIK Hub",

        recordedMode:
            "admin",

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };


    /*
     * SIMPAN TRANSAKSI
     */

    const transactionRef =
        await addDoc(

            collection(
                db,
                "transactions"
            ),

            transactionData

        );


    /*
     * UPDATE PROFILE WARGA
     */

    if (
        citizenUid
    ) {

        await updateCitizenProfile(
            citizenUid,
            points,
            weight,
            co2,
            finalCitizenId,
            finalRT
        );

    }


    /*
     * UPDATE CITIZENS
     */

    await updateCitizenStats(
        citizen,
        points,
        weight,
        co2,
        citizenUid,
        finalCitizenId,
        finalCitizenName,
        finalRT
    );


    /*
     * ADMIN TIDAK BOLEH
     * MENDAPAT POIN.
     */

    /*
     * Jangan update:
     * state.points
     * state.waste
     * state.co2
     * state.greenScore
     *
     * karena state admin.
     */


    const localTransaction = {

        firestoreId:
            transactionRef.id,

        ...transactionData,

        createdAt:
            new Date(),

        updatedAt:
            new Date()

    };


    return {

        id:
            transactionRef.id,

        transaction:
            localTransaction,

        citizen: {

            uid:
                citizenUid,

            citizenId:
                finalCitizenId,

            name:
                finalCitizenName,

            rt:
                finalRT

        },

        recorder: {

            uid:
                adminUser.uid,

            name:
                state.name ||
                adminUser.displayName ||
                "Admin RESIK Hub"

        }

    };

}


window.resikRecordDeposit =
    recordAdminDeposit;


/*
 * Alias:
 * dipakai oleh kode lama.
 */

window.resikAddTransaction =
    addCitizenTransaction;


/* =========================================================
   REDEEM REWARD
   ========================================================= */

async function resikRedeem(
    rewardName,
    cost
) {

    const user =
        auth.currentUser;


    if (!user) {

        toast(
            "Silakan login terlebih dahulu."
        );

        return null;

    }


    /*
     * ADMIN TIDAK BOLEH REDEEM
     */

    if (
        isAdmin()
    ) {

        toast(
            "Akun admin tidak memiliki Poin Hijau warga."
        );

        return null;

    }


    const redeemCost =
        Number(
            cost
        ) || 0;


    if (!rewardName) {

        toast(
            "Nama hadiah tidak ditemukan."
        );

        return null;

    }


    if (
        redeemCost <= 0
    ) {

        toast(
            "Nilai penukaran tidak valid."
        );

        return null;

    }


    try {

        const profileRef =
            doc(
                db,
                "profiles",
                user.uid
            );


        const profileSnapshot =
            await getDoc(
                profileRef
            );


        if (
            !profileSnapshot.exists()
        ) {

            toast(
                "Profil pengguna tidak ditemukan."
            );

            return null;

        }


        const profile =
            profileSnapshot.data();


        const currentPoints =
            Number(
                profile.points ?? 0
            );


        if (
            currentPoints <
            redeemCost
        ) {

            toast(
                "Poin Hijau Anda tidak cukup."
            );

            return null;

        }


        const redemptionData = {

            uid:
                user.uid,

            name:
                String(
                    rewardName
                ),

            cost:
                redeemCost,

            status:
                "Selesai",

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        const redemptionRef =
            await addDoc(

                collection(
                    db,
                    "redemptions"
                ),

                redemptionData

            );


        await updateDoc(
            profileRef,
            {

                points:
                    increment(
                        -redeemCost
                    ),

                updatedAt:
                    serverTimestamp()

            }
        );


        state.points =
            currentPoints -
            redeemCost;


        const localRedemption = {

            firestoreId:
                redemptionRef.id,

            uid:
                user.uid,

            name:
                String(
                    rewardName
                ),

            cost:
                redeemCost,

            status:
                "Selesai",

            createdAt:
                new Date(),

            updatedAt:
                new Date()

        };


        if (
            !Array.isArray(
                state.redemptions
            )
        ) {

            state.redemptions =
                [];

        }


        state.redemptions.unshift(
            localRedemption
        );


        updateDashboardElements();


        toast(
            `Berhasil menukar ${rewardName}.`
        );


        setTimeout(
            () => {

                window.location.href =
                    "riwayat-penukaran.html";

            },
            700
        );


        return localRedemption;


    } catch (error) {

        console.error(
            "REDEEM ERROR:",
            error
        );


        toast(
            getFirebaseErrorMessage(
                error
            )
        );


        return null;

    }

}


window.resikRedeem =
    resikRedeem;


/* =========================================================
   GLOBAL STORE
   ========================================================= */

window.resikStore = {

    /*
     * WARGA
     */
    addTransaction:
        addCitizenTransaction,

    addCitizenTransaction:
        addCitizenTransaction,

    /*
     * ADMIN
     */
    recordDeposit:
        recordAdminDeposit,

    /*
     * DATA
     */
    getTransactions:
        getUserTransactions,

    getAllTransactions:
        null,

    getProfile:
        getProfile,

    getRedemptions:
        getUserRedemptions,

    getCitizens:
        getAllCitizens,

    findCitizens:
        findCitizens,

    getCitizenById:
        getCitizenById,

    createCitizen:
        createManualCitizen,

    redeem:
        resikRedeem

};


/* =========================================================
   REGISTER
   ========================================================= */

function initializeRegister() {

    const registerForm =
        document.getElementById(
            "registerForm"
        );


    if (!registerForm) {

        return;

    }


    if (
        registerForm.dataset.ready ===
        "true"
    ) {

        return;

    }


    registerForm.dataset.ready =
        "true";


    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            event.stopPropagation();


            const nameInput =
                document.getElementById(
                    "name"
                );


            const rtInput =
                document.getElementById(
                    "rt"
                );


            const emailInput =
                document.getElementById(
                    "email"
                );


            const passwordInput =
                document.getElementById(
                    "password"
                );


            const confirmPasswordInput =
                document.getElementById(
                    "confirmPassword"
                );


            const registerButton =
                document.getElementById(
                    "registerButton"
                );


            const name =
                normalizeText(
                    nameInput?.value
                );


            const rt =
                normalizeRT(
                    rtInput?.value
                );


            const email =
                normalizeEmail(
                    emailInput?.value
                );


            const password =
                passwordInput?.value ||
                "";


            const confirmPassword =
                confirmPasswordInput?.value ||
                "";


            /*
             * ADMIN TIDAK BOLEH
             * register sebagai warga.
             */

            if (
                isAdminEmail(
                    email
                )
            ) {

                showAuthMessage(
                    "Email admin hanya dapat digunakan melalui akun admin yang telah disiapkan."
                );

                emailInput?.focus();

                return;

            }


            if (!name) {

                showAuthMessage(
                    "Nama lengkap wajib diisi."
                );

                nameInput?.focus();

                return;

            }


            if (!rt) {

                showAuthMessage(
                    "RT wajib dipilih."
                );

                rtInput?.focus();

                return;

            }


            if (
                !isValidEmail(
                    email
                )
            ) {

                showAuthMessage(
                    "Format email tidak valid."
                );

                emailInput?.focus();

                return;

            }


            if (
                password.length <
                6
            ) {

                showAuthMessage(
                    "Kata sandi minimal 6 karakter."
                );

                passwordInput?.focus();

                return;

            }


            if (
                password !==
                confirmPassword
            ) {

                showAuthMessage(
                    "Konfirmasi kata sandi tidak sama."
                );

                confirmPasswordInput?.focus();

                return;

            }


            if (
                registerButton
            ) {

                registerButton.disabled =
                    true;

                registerButton.textContent =
                    "Membuat akun...";

            }


            showAuthMessage(
                "Sedang membuat akun...",
                "success"
            );


            try {

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                await updateProfile(
                    user,
                    {

                        displayName:
                            name

                    }
                );


                /*
                 * PROFILE WARGA
                 *
                 * RT DISIMPAN LANGSUNG
                 */

                await setDoc(

                    doc(
                        db,
                        "profiles",
                        user.uid
                    ),

                    {

                        uid:
                            user.uid,

                        name:
                            name,

                        email:
                            email,

                        role:
                            "warga",

                        citizenId:
                            "",

                        rt:
                            rt,

                        points:
                            0,

                        greenScore:
                            0,

                        totalWaste:
                            0,

                        totalCo2:
                            0,

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }

                );


                showAuthMessage(
                    "Akun berhasil dibuat! Mengarahkan ke halaman login...",
                    "success"
                );


                await signOut(
                    auth
                );


                setTimeout(
                    () => {

                        window.location.replace(
                            "login.html"
                        );

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "REGISTER ERROR:",
                    error
                );


                showAuthMessage(
                    getFirebaseErrorMessage(
                        error
                    )
                );


            } finally {

                if (
                    registerButton
                ) {

                    registerButton.disabled =
                        false;

                    registerButton.textContent =
                        "Daftar →";

                }

            }

        }
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

function initializeLogin() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (!loginForm) {

        return;

    }


    if (
        loginForm.dataset.ready ===
        "true"
    ) {

        return;

    }


    loginForm.dataset.ready =
        "true";


    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            event.stopPropagation();


            const emailInput =
                document.getElementById(
                    "email"
                );


            const passwordInput =
                document.getElementById(
                    "password"
                );


            const loginButton =
                document.getElementById(
                    "loginButton"
                );


            const email =
                normalizeEmail(
                    emailInput?.value
                );


            const password =
                passwordInput?.value ||
                "";


            if (
                !isValidEmail(
                    email
                )
            ) {

                showAuthMessage(
                    "Format email tidak valid."
                );

                emailInput?.focus();

                return;

            }


            if (!password) {

                showAuthMessage(
                    "Kata sandi wajib diisi."
                );

                passwordInput?.focus();

                return;

            }


            if (
                loginButton
            ) {

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Masuk...";

            }


            showAuthMessage(
                "Sedang masuk...",
                "success"
            );


            try {

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                const adminLogin =
                    isAdminEmail(
                        user.email
                    );


                let profile =
                    await getProfile(
                        user.uid
                    );


                /*
                 * PROFILE BELUM ADA
                 */

                if (!profile) {

                    await setDoc(

                        doc(
                            db,
                            "profiles",
                            user.uid
                        ),

                        {

                            uid:
                                user.uid,

                            name:
                                user.displayName ||
                                (
                                    adminLogin
                                        ? "Admin RESIK Hub"
                                        : "Warga"
                                ),

                            email:
                                user.email ||
                                email,

                            role:
                                adminLogin
                                    ? "admin"
                                    : "warga",

                            citizenId:
                                "",

                            rt:
                                "",

                            points:
                                0,

                            greenScore:
                                0,

                            totalWaste:
                                0,

                            totalCo2:
                                0,

                            createdAt:
                                serverTimestamp(),

                            updatedAt:
                                serverTimestamp()

                        }

                    );


                    profile =
                        await getProfile(
                            user.uid
                        );

                }


                applyProfileToState(
                    profile
                );


                /*
                 * Email admin selalu menang.
                 */

                state.role =
                    adminLogin
                        ? "admin"
                        : "warga";


                /*
                 * WARGA
                 */

                if (
                    state.role ===
                    "warga"
                ) {

                    await Promise.all([

                        getUserTransactions(
                            user.uid,
                            50
                        ),

                        getUserRedemptions(
                            user.uid,
                            50
                        )

                    ]);

                } else {

                    /*
                     * ADMIN
                     *
                     * Jangan masukkan transaksi
                     * ke state pribadi admin.
                     */

                    state.transactions =
                        [];


                    state.redemptions =
                        [];

                }


                updateDashboardElements();


                showAuthMessage(
                    "Login berhasil! Mengarahkan...",
                    "success"
                );


                setTimeout(
                    () => {

                        if (
                            adminLogin
                        ) {

                            window.location.replace(
                                "dashboard-admin.html"
                            );

                        } else {

                            window.location.replace(
                                "dashboard-warga.html"
                            );

                        }

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                showAuthMessage(
                    getFirebaseErrorMessage(
                        error
                    )
                );


            } finally {

                if (
                    loginButton
                ) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Masuk →";

                }

            }

        }
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

    try {

        await signOut(
            auth
        );


        state.uid =
            null;

        state.role =
            "warga";

        state.name =
            "Warga";

        state.email =
            "";

        state.citizenId =
            "";

        state.rt =
            "";

        state.points =
            0;

        state.greenScore =
            0;

        state.waste =
            0;

        state.co2 =
            0;

        state.transactions =
            [];

        state.redemptions =
            [];


        window.location.replace(
            "login.html"
        );


    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );


        toast(
            "Gagal keluar dari akun."
        );

    }

}


window.resikLogout =
    logout;


/* =========================================================
   LOGOUT BUTTON
   ========================================================= */

function initializeLogoutButtons() {

    document
        .querySelectorAll(
            "[data-logout]"
        )
        .forEach(
            button => {

                if (
                    button.dataset.logoutReady ===
                    "true"
                ) {

                    return;

                }


                button.dataset.logoutReady =
                    "true";


                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        logout();

                    }
                );

            }
        );

}


/* =========================================================
   AUTH STATE
   ========================================================= */

onAuthStateChanged(
    auth,
    async function(user) {

        console.log(
            "AUTH STATE:",
            user
                ? user.email
                : "Tidak login"
        );


        /*
         * BELUM LOGIN
         */

        if (!user) {

            state.uid =
                null;

            state.role =
                "warga";

            state.transactions =
                [];

            state.redemptions =
                [];

            resolveReady();

            return;

        }


        try {

            const adminLogin =
                isAdminEmail(
                    user.email
                );


            let profile =
                await getProfile(
                    user.uid
                );


            /*
             * PROFILE BELUM ADA
             */

            if (!profile) {

                await setDoc(

                    doc(
                        db,
                        "profiles",
                        user.uid
                    ),

                    {

                        uid:
                            user.uid,

                        name:
                            user.displayName ||
                            (
                                adminLogin
                                    ? "Admin RESIK Hub"
                                    : "Warga"
                            ),

                        email:
                            user.email ||
                            "",

                        role:
                            adminLogin
                                ? "admin"
                                : "warga",

                        citizenId:
                            "",

                        rt:
                            "",

                        points:
                            0,

                        greenScore:
                            0,

                        totalWaste:
                            0,

                        totalCo2:
                            0,

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }

                );


                profile =
                    await getProfile(
                        user.uid
                    );

            }


            applyProfileToState(
                profile
            );


            /*
             * Email adalah sumber penentu
             * role admin.
             */

            state.role =
                adminLogin
                    ? "admin"
                    : "warga";


            /*
             * WARGA
             */

            if (
                state.role ===
                "warga"
            ) {

                await Promise.all([

                    getUserTransactions(
                        user.uid,
                        50
                    ),

                    getUserRedemptions(
                        user.uid,
                        50
                    )

                ]);

            } else {

                /*
                 * ADMIN
                 */

                state.transactions =
                    [];

                state.redemptions =
                    [];

            }


            updateDashboardElements();


            const userNameElement =
                document.getElementById(
                    "userName"
                );


            if (
                userNameElement
            ) {

                userNameElement.textContent =
                    state.name ||
                    "Warga";

            }


            console.log(
                "RESIK STATE SIAP:",
                {
                    ...state
                }
            );


            resolveReady();


        } catch (error) {

            console.error(
                "AUTH INITIALIZATION ERROR:",
                error
            );


            resolveReady();

        }

    }
);


/* =========================================================
   UPDATE DASHBOARD ELEMENTS
   ========================================================= */

function updateDashboardElements() {

    const totalWaste =
        document.getElementById(
            "totalWaste"
        );


    if (
        totalWaste
    ) {

        totalWaste.textContent =
            formatNumber(
                state.waste
            );

    }


    const totalCo2 =
        document.getElementById(
            "totalCo2"
        );


    if (
        totalCo2
    ) {

        totalCo2.textContent =
            formatNumber(
                state.co2
            );

    }


    const totalPoints =
        document.getElementById(
            "totalPoints"
        );


    if (
        totalPoints
    ) {

        totalPoints.textContent =
            formatNumber(
                state.points
            );

    }


    const greenScore =
        document.getElementById(
            "greenScore"
        );


    if (
        greenScore
    ) {

        greenScore.textContent =
            formatNumber(
                state.greenScore
            );

    }


    const rewardPoints =
        document.getElementById(
            "rewardPoints"
        );


    if (
        rewardPoints
    ) {

        rewardPoints.innerHTML =
            formatNumber(
                state.points
            ) +
            " <small>pts</small>";

    }


    const historyPoints =
        document.getElementById(
            "points"
        );


    if (
        historyPoints
    ) {

        historyPoints.innerHTML =
            formatNumber(
                state.points
            ) +
            " <small>pts</small>";

    }


    const userName =
        document.getElementById(
            "userName"
        );


    if (
        userName
    ) {

        userName.textContent =
            state.name ||
            "Warga";

    }


    const profileName =
        document.getElementById(
            "profileName"
        );


    if (
        profileName
    ) {

        profileName.textContent =
            state.name ||
            "Warga";

    }


    const profileEmail =
        document.getElementById(
            "profileEmail"
        );


    if (
        profileEmail
    ) {

        profileEmail.textContent =
            state.email ||
            "";

    }


    const profileRole =
        document.getElementById(
            "profileRole"
        );


    if (
        profileRole
    ) {

        profileRole.textContent =
            state.role ===
            "admin"
                ? "Admin"
                : "Warga";

    }


    const profileCitizenId =
        document.getElementById(
            "profileCitizenId"
        );


    if (
        profileCitizenId
    ) {

        profileCitizenId.textContent =
            state.citizenId ||
            "-";

    }


    const profileRT =
        document.getElementById(
            "profileRT"
        );


    if (
        profileRT
    ) {

        profileRT.textContent =
            state.rt ||
            "-";

    }


    const userId =
        document.getElementById(
            "userId"
        );


    if (
        userId
    ) {

        userId.textContent =
            state.uid ||
            "-";

    }


    updateWeeklyChart();

    updateAIInsight();

    updateRankingCard();

}


/* =========================================================
   WEEKLY CHART
   ========================================================= */

function updateWeeklyChart() {

    const chart =
        document.getElementById(
            "weeklyChart"
        );


    if (!chart) {

        return;

    }


    const bars =
        chart.querySelectorAll(
            "[data-day]"
        );


    if (!bars.length) {

        return;

    }


    const weekly = [
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ];


    state.transactions.forEach(
        transaction => {

            const millis =
                getTimestampMillis(
                    transaction.createdAt
                );


            if (!millis) {

                return;

            }


            const date =
                new Date(
                    millis
                );


            const jsDay =
                date.getDay();


            const index =
                jsDay === 0
                    ? 6
                    : jsDay - 1;


            const weight =
                Number(
                    transaction.weight
                ) || 0;


            weekly[index] +=
                weight;

        }
    );


    const max =
        Math.max(
            ...weekly,
            1
        );


    bars.forEach(
        bar => {

            const day =
                Number(
                    bar.dataset.day
                );


            if (
                !Number.isInteger(
                    day
                )
            ) {

                return;

            }


            const value =
                weekly[day] ||
                0;


            const height =
                value > 0
                    ? Math.max(
                        5,
                        (
                            value /
                            max
                        ) * 100
                    )
                    : 5;


            bar.style.height =
                `${height}%`;


            bar.title =
                `${formatNumber(value)} kg`;

        }
    );

}


/* =========================================================
   AI INSIGHT
   ========================================================= */

function updateAIInsight() {

    const summary =
        document.getElementById(
            "aiInsightSummary"
        );


    const recommendation =
        document.getElementById(
            "aiInsightRecommendation"
        );


    if (
        !summary &&
        !recommendation
    ) {

        return;

    }


    const totalWaste =
        Number(
            state.waste
        ) || 0;


    const totalPoints =
        Number(
            state.points
        ) || 0;


    if (
        totalWaste <= 0
    ) {

        if (
            summary
        ) {

            summary.textContent =
                "Belum ada aktivitas yang dapat dianalisis minggu ini.";

        }


        if (
            recommendation
        ) {

            recommendation.textContent =
                "Mulai mencatat setoran sampah untuk mendapatkan rekomendasi berdasarkan aktivitas Anda.";

        }


        return;

    }


    if (
        summary
    ) {

        summary.textContent =
            `Anda telah mencatat ${formatNumber(totalWaste)} kg sampah dengan ${formatNumber(totalPoints)} poin hijau.`;

    }


    if (
        recommendation
    ) {

        if (
            totalWaste >= 10
        ) {

            recommendation.textContent =
                "Aktivitas daur ulang Anda sangat baik. Pertahankan konsistensi dan terus tingkatkan setoran sampah terpilah.";

        } else {

            recommendation.textContent =
                "Cobalah meningkatkan setoran sampah terpilah secara rutin untuk mendapatkan lebih banyak poin hijau.";

        }

    }

}


/* =========================================================
   UPDATE RANKING CARD
   =========================================================

   Menghitung peringkat warga berdasarkan urutan
   Green Score seluruh warga (Firestore), sama seperti
   yang dipakai di peringkat-desa.html — bukan lagi
   berdasarkan batas (threshold) poin manual.
   ========================================================= */

async function updateRankingCard() {

    const rankingElement =
        document.getElementById(
            "ranking"
        );


    if (!rankingElement) {

        return;

    }


    /*
     * Admin tidak punya peringkat warga.
     */

    if (
        isAdmin()
    ) {

        rankingElement.textContent =
            "-";

        return;

    }


    if (
        !state.uid
    ) {

        rankingElement.textContent =
            "-";

        return;

    }


    try {

        const citizens =
            await getAllCitizens();


        const sorted =
            citizens
                .slice()
                .sort(
                    (a, b) => {

                        return (
                            (Number(b.greenScore) || 0) -
                            (Number(a.greenScore) || 0)
                        );

                    }
                );


        const currentCitizenId =
            normalizeCitizenId(
                state.citizenId
            );


        const position =
            sorted.findIndex(
                citizen => {

                    if (
                        state.uid &&
                        citizen.uid === state.uid
                    ) {

                        return true;

                    }


                    if (
                        currentCitizenId &&
                        normalizeCitizenId(
                            citizen.citizenId
                        ) === currentCitizenId
                    ) {

                        return true;

                    }


                    return false;

                }
            );


        rankingElement.textContent =
            position === -1
                ? "-"
                : `#${position + 1}`;


    } catch (error) {

        console.error(
            "RANKING UPDATE ERROR:",
            error
        );


        rankingElement.textContent =
            "-";

    }

}


window.resikUpdateRanking =
    updateRankingCard;


/* =========================================================
   RANKING CARD → PERINGKAT DESA
   =========================================================

   Membuat kartu "Peringkat Desa" di dashboard bisa
   diklik untuk menuju halaman peringkat-desa.html,
   tanpa mengubah struktur HTML.
   ========================================================= */

function initializeRankingCardLink() {

    const rankingElement =
        document.getElementById(
            "ranking"
        );


    if (!rankingElement) {

        return;

    }


    const card =
        rankingElement.closest(
            ".metric-card"
        );


    if (!card) {

        return;

    }


    if (
        card.dataset.rankingLinkReady ===
        "true"
    ) {

        return;

    }


    card.dataset.rankingLinkReady =
        "true";


    card.style.cursor =
        "pointer";


    card.addEventListener(
        "click",
        function() {

            window.location.href =
                "peringkat-desa.html";

        }
    );

}


/* =========================================================
   DATA NAVIGATION
   ========================================================= */

function initializeDataNavigation() {

    document
        .querySelectorAll(
            "[data-nav]"
        )
        .forEach(
            element => {

                if (
                    element.dataset.navReady ===
                    "true"
                ) {

                    return;

                }


                element.dataset.navReady =
                    "true";


                element.addEventListener(
                    "click",
                    function(event) {

                        if (
                            element.tagName ===
                            "BUTTON"
                        ) {

                            event.preventDefault();

                        }


                        const target =
                            element.dataset.nav;


                        if (
                            target
                        ) {

                            window.location.href =
                                target;

                        }

                    }
                );

            }
        );

}


/* =========================================================
   PROFILE PAGE
   ========================================================= */

async function initializeProfilePage() {

    await window.resikReady;


    const profileName =
        document.getElementById(
            "profileName"
        );


    if (
        profileName
    ) {

        profileName.textContent =
            state.name ||
            "Warga";

    }


    const profileEmail =
        document.getElementById(
            "profileEmail"
        );


    if (
        profileEmail
    ) {

        profileEmail.textContent =
            state.email ||
            "-";

    }


    const profileRole =
        document.getElementById(
            "profileRole"
        );


    if (
        profileRole
    ) {

        profileRole.textContent =
            state.role ===
            "admin"
                ? "Admin"
                : "Warga";

    }


    const profileInitials =
        document.getElementById(
            "profileInitials"
        );


    if (
        profileInitials
    ) {

        const name =
            String(
                state.name ||
                "Warga"
            ).trim();


        const initials =
            name
                .split(
                    /\s+/
                )
                .slice(
                    0,
                    2
                )
                .map(
                    word =>
                        word
                            .charAt(0)
                            .toUpperCase()
                )
                .join("");


        profileInitials.textContent =
            initials ||
            "W";

    }


    const userId =
        document.getElementById(
            "userId"
        );


    if (
        userId
    ) {

        userId.textContent =
            state.uid ||
            "-";

    }


    const qrUserText =
        document.getElementById(
            "qrUserText"
        );


    if (
        qrUserText
    ) {

        qrUserText.textContent =
            state.citizenId ||
            state.uid ||
            state.email ||
            "ID Pengguna";

    }


    const profileLocation =
        document.getElementById(
            "profileLocation"
        );


    if (
        profileLocation &&
        !profileLocation.textContent.trim()
    ) {

        profileLocation.textContent =
            state.rt
                ? `⌖ ${state.rt}`
                : "⌖ Belum ada lokasi";

    }


    const achievementCount =
        document.getElementById(
            "achievementCount"
        );


    if (
        achievementCount
    ) {

        achievementCount.textContent =
            state.redemptions.length;

    }


    const achievementText =
        document.getElementById(
            "achievementText"
        );


    if (
        achievementText
    ) {

        if (
            state.redemptions.length > 0
        ) {

            achievementText.textContent =
                `☆ ${state.redemptions.length} penukaran reward`;

        } else {

            achievementText.textContent =
                "☆ Belum ada pencapaian";

        }

    }


    updateDashboardElements();

}


/* =========================================================
   REWARD PAGE
   ========================================================= */

async function initializeRewardPage() {

    await window.resikReady;


    /*
     * Admin tidak menggunakan halaman reward warga.
     */

    if (
        isAdmin()
    ) {

        const rewardPoints =
            document.getElementById(
                "rewardPoints"
            );


        if (
            rewardPoints
        ) {

            rewardPoints.innerHTML =
                "Admin";

        }


        return;

    }


    const rewardPoints =
        document.getElementById(
            "rewardPoints"
        );


    if (
        rewardPoints
    ) {

        rewardPoints.innerHTML =
            formatNumber(
                state.points
            ) +
            " <small>pts</small>";

    }


    let totalWaste =
        Number(
            state.waste
        ) || 0;


    if (
        totalWaste <= 0 &&
        state.transactions.length > 0
    ) {

        totalWaste =
            state.transactions.reduce(
                (
                    total,
                    transaction
                ) => {

                    return total +
                        (
                            Number(
                                transaction.weight
                            ) || 0
                        );

                },
                0
            );

    }


    const totalWasteElement =
        document.getElementById(
            "totalWasteReward"
        );


    if (
        totalWasteElement
    ) {

        totalWasteElement.textContent =
            formatNumber(
                totalWaste
            );

    }


    const target =
        150;


    const progress =
        Math.min(
            (
                totalWaste /
                target
            ) * 100,
            100
        );


    const progressBar =
        document.getElementById(
            "rewardProgress"
        );


    if (
        progressBar
    ) {

        progressBar.style.width =
            `${progress}%`;

    }


    const rewardStatus =
        document.getElementById(
            "rewardStatus"
        );


    const rewardButtons =
        document.querySelectorAll(
            ".reward-redeem"
        );


    if (
        totalWaste >=
        target
    ) {

        if (
            rewardStatus
        ) {

            rewardStatus.classList.remove(
                "locked"
            );


            rewardStatus.classList.add(
                "unlocked"
            );


            rewardStatus.innerHTML =
                "🎉 Selamat! Anda telah mencapai <strong>150 kg</strong>. Hadiah sudah dapat ditukar.";

        }


        rewardButtons.forEach(
            button => {

                button.disabled =
                    false;


                button.classList.add(
                    "unlocked"
                );


                button.textContent =
                    "🎁 Tukar Sekarang";

            }
        );

    } else {

        const remaining =
            Math.max(
                0,
                target -
                totalWaste
            );


        if (
            rewardStatus
        ) {

            rewardStatus.classList.remove(
                "unlocked"
            );


            rewardStatus.classList.add(
                "locked"
            );


            rewardStatus.innerHTML =
                "🔒 Kumpulkan lagi <strong>" +
                formatNumber(
                    remaining
                ) +
                " kg</strong> sampah untuk membuka hadiah.";

        }


        rewardButtons.forEach(
            button => {

                button.disabled =
                    true;


                button.classList.remove(
                    "unlocked"
                );


                button.textContent =
                    "🔒 Belum Terbuka";

            }
        );

    }


    /*
     * FILTER
     */

    const filterButtons =
        document.querySelectorAll(
            "[data-filter]"
        );


    const rewardCards =
        document.querySelectorAll(
            ".reward-card"
        );


    filterButtons.forEach(
        filterButton => {

            if (
                filterButton.dataset.filterReady ===
                "true"
            ) {

                return;

            }


            filterButton.dataset.filterReady =
                "true";


            filterButton.addEventListener(
                "click",
                function() {

                    filterButtons.forEach(
                        button => {

                            button.classList.remove(
                                "active-filter"
                            );

                        }
                    );


                    this.classList.add(
                        "active-filter"
                    );


                    const filter =
                        this.dataset.filter;


                    rewardCards.forEach(
                        card => {

                            const category =
                                card.dataset.category;


                            card.style.display =
                                (
                                    filter ===
                                    "all" ||
                                    category ===
                                    filter
                                )
                                    ? ""
                                    : "none";

                        }
                    );


                    checkRewardEmpty();

                }
            );

        }
    );


    /*
     * SEARCH
     */

    const search =
        document.getElementById(
            "rewardSearch"
        );


    if (
        search &&
        search.dataset.searchReady !==
        "true"
    ) {

        search.dataset.searchReady =
            "true";


        search.addEventListener(
            "input",
            function() {

                const keyword =
                    this.value
                        .toLowerCase()
                        .trim();


                rewardCards.forEach(
                    card => {

                        const name =
                            (
                                card.dataset.name ||
                                ""
                            ).toLowerCase();


                        card.style.display =
                            name.includes(
                                keyword
                            )
                                ? ""
                                : "none";

                    }
                );


                checkRewardEmpty();

            }
        );

    }


    /*
     * REDEEM
     */

    rewardButtons.forEach(
        button => {

            if (
                button.dataset.redeemReady ===
                "true"
            ) {

                return;

            }


            button.dataset.redeemReady =
                "true";


            button.addEventListener(
                "click",
                async function() {

                    if (
                        this.disabled
                    ) {

                        return;

                    }


                    const currentWaste =
                        Number(
                            state.waste
                        ) || 0;


                    if (
                        currentWaste <
                        target
                    ) {

                        toast(
                            "Anda membutuhkan minimal 150 kg sampah."
                        );

                        return;

                    }


                    const cost =
                        Number(
                            this.dataset.redeem ||
                            0
                        );


                    if (
                        state.points <
                        cost
                    ) {

                        toast(
                            "Poin Hijau Anda tidak cukup."
                        );

                        return;

                    }


                    this.disabled =
                        true;


                    this.textContent =
                        "Memproses...";


                    await resikRedeem(
                        this.dataset.name,
                        cost
                    );

                }
            );

        }
    );


    checkRewardEmpty();

}


/* =========================================================
   REWARD EMPTY
   ========================================================= */

function checkRewardEmpty() {

    const rewardCards =
        document.querySelectorAll(
            ".reward-card"
        );


    const visible =
        Array.from(
            rewardCards
        ).some(
            card =>
                card.style.display !==
                "none"
        );


    const empty =
        document.getElementById(
            "rewardEmpty"
        );


    if (
        empty
    ) {

        empty.style.display =
            visible
                ? "none"
                : "block";

    }

}


/* =========================================================
   HISTORY PAGE
   ========================================================= */

async function initializeHistoryPage() {

    await window.resikReady;


    /*
     * Admin tidak mempunyai history redeem warga.
     */

    if (
        isAdmin()
    ) {

        const pointsElement =
            document.getElementById(
                "points"
            );


        if (
            pointsElement
        ) {

            pointsElement.innerHTML =
                "Admin";

        }


        return;

    }


    const pointsElement =
        document.getElementById(
            "points"
        );


    if (
        pointsElement
    ) {

        pointsElement.innerHTML =
            formatNumber(
                state.points
            ) +
            " <small>pts</small>";

    }


    const history =
        document.getElementById(
            "history"
        );


    if (!history) {

        return;

    }


    const redemptions =
        Array.isArray(
            state.redemptions
        )
            ? state.redemptions
            : [];


    if (
        redemptions.length ===
        0
    ) {

        history.innerHTML = `

            <div class="history-empty">

                <div class="empty-icon">
                    🎁
                </div>

                <h3>
                    Belum ada penukaran
                </h3>

                <p>
                    Anda belum menukarkan
                    Poin Hijau dengan hadiah apa pun.
                </p>

                <button
                    class="btn"
                    type="button"
                    data-nav="reward.html">

                    Lihat Reward

                </button>

            </div>

        `;


        initializeDataNavigation();


        return;

    }


    history.innerHTML =
        "";


    redemptions.forEach(
        item => {

            const name =
                item.name ||
                "Hadiah RESIK";


            const cost =
                Number(
                    item.cost ||
                    0
                );


            const status =
                item.status ||
                "Selesai";


            const millis =
                getTimestampMillis(
                    item.createdAt
                );


            let dateText =
                "-";


            if (
                millis > 0
            ) {

                const date =
                    new Date(
                        millis
                    );


                dateText =
                    date.toLocaleString(
                        "id-ID",
                        {

                            day:
                                "2-digit",

                            month:
                                "short",

                            year:
                                "numeric",

                            hour:
                                "2-digit",

                            minute:
                                "2-digit"

                        }
                    );

            }


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "history-item";


            itemElement.innerHTML = `

                <div class="thumb">
                    🎁
                </div>

                <div>

                    <h3>

                        ${escapeHTML(
                            name
                        )}

                        <span class="negative">

                            -${cost.toLocaleString(
                                "id-ID"
                            )}
                            pts

                        </span>

                    </h3>

                    <div class="meta">

                        ▣ ${escapeHTML(
                            dateText
                        )}

                    </div>

                    <span class="status">

                        ● ${escapeHTML(
                            status
                        )}

                    </span>

                </div>

            `;


            history.appendChild(
                itemElement
            );

        }
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


window.resikEscapeHTML =
    escapeHTML;


/* =========================================================
   ADMIN GUARD
   ========================================================= */

async function initializeAdminGuard() {

    const isAdminPage =
        document.body?.hasAttribute(
            "data-admin-page"
        ) ||
        document.getElementById(
            "adminDashboard"
        );


    if (!isAdminPage) {

        return true;

    }


    await window.resikReady;


    if (
        !auth.currentUser
    ) {

        window.location.replace(
            "login.html"
        );


        return false;

    }


    if (
        !isAdmin()
    ) {

        toast(
            "Halaman ini hanya dapat diakses admin."
        );


        setTimeout(
            () => {

                window.location.replace(
                    "dashboard-warga.html"
                );

            },
            500
        );


        return false;

    }


    return true;

}


window.resikInitializeAdminGuard =
    initializeAdminGuard;


/* =========================================================
   GET ALL TRANSACTIONS
   ========================================================= */

async function getAllTransactions(
    maxResults = 200
) {

    if (
        !auth.currentUser ||
        !isAdmin()
    ) {

        return [];

    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "transactions"
                )
            );


        const transactions =
            [];


        snapshot.forEach(
            transactionDoc => {

                transactions.push({

                    firestoreId:
                        transactionDoc.id,

                    ...transactionDoc.data()

                });

            }
        );


        transactions.sort(
            (a, b) => {

                return (
                    getTimestampMillis(
                        b.createdAt
                    ) -
                    getTimestampMillis(
                        a.createdAt
                    )
                );

            }
        );


        return transactions.slice(
            0,
            maxResults
        );


    } catch (error) {

        console.error(
            "GET ALL TRANSACTIONS ERROR:",
            error
        );


        return [];

    }

}


window.resikGetAllTransactions =
    getAllTransactions;


/* =========================================================
   UPDATE GLOBAL STORE
   ========================================================= */

window.resikStore.getAllTransactions =
    getAllTransactions;


/* =========================================================
   ADMIN DASHBOARD INITIALIZATION
   ========================================================= */

async function initializeAdminDashboard() {

    const dashboard =
        document.getElementById(
            "adminDashboard"
        );


    const adminPage =
        document.body?.hasAttribute(
            "data-admin-page"
        );


    if (
        !dashboard &&
        !adminPage
    ) {

        return;

    }


    const allowed =
        await initializeAdminGuard();


    if (!allowed) {

        return;

    }


    console.log(
        "ADMIN DASHBOARD SIAP"
    );


    await updateAdminDashboard();

}


/* =========================================================
   UPDATE ADMIN DASHBOARD
   ========================================================= */

async function updateAdminDashboard() {

    if (
        !isAdmin()
    ) {

        return;

    }


    const transactions =
        await getAllTransactions(
            200
        );


    const citizens =
        await getAllCitizens();


    const totalWaste =
        transactions.reduce(
            (
                total,
                transaction
            ) => {

                return total +
                    Number(
                        transaction.weight ||
                        0
                    );

            },
            0
        );


    const economicValue =
        transactions.reduce(
            (
                total,
                transaction
            ) => {

                return total +
                    Number(
                        transaction.value ||
                        0
                    );

            },
            0
        );


    const co2Reduction =
        transactions.reduce(
            (
                total,
                transaction
            ) => {

                const weight =
                    Number(
                        transaction.weight ||
                        0
                    );


                const co2 =
                    Number(
                        transaction.co2 ||
                        0
                    );


                return total +
                    (
                        co2 > 0
                            ? co2
                            : weight * 0.5
                    );

            },
            0
        );


    const activeUsers =
        citizens.length;


    const totalWasteElement =
        document.getElementById(
            "totalWaste"
        );


    if (
        totalWasteElement
    ) {

        totalWasteElement.textContent =
            formatNumber(
                totalWaste
            ) +
            " kg";

    }


    const activeUsersElement =
        document.getElementById(
            "activeUsers"
        );


    if (
        activeUsersElement
    ) {

        activeUsersElement.textContent =
            activeUsers;

    }


    const economicValueElement =
        document.getElementById(
            "economicValue"
        );


    if (
        economicValueElement
    ) {

        economicValueElement.textContent =
            formatRupiah(
                economicValue
            );

    }


    const co2Element =
        document.getElementById(
            "co2Reduction"
        );


    if (
        co2Element
    ) {

        co2Element.textContent =
            formatNumber(
                co2Reduction
            ) +
            " kg";

    }


    const countElement =
        document.getElementById(
            "transactionCount"
        );


    if (
        countElement
    ) {

        countElement.textContent =
            transactions.length +
            " transaksi";

    }


    const table =
        document.getElementById(
            "transactionTable"
        );


    if (
        table
    ) {

        if (
            transactions.length ===
            0
        ) {

            table.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        style="text-align:center">

                        Belum ada transaksi

                    </td>

                </tr>

            `;

        } else {

            table.innerHTML =
                transactions
                    .slice(
                        0,
                        10
                    )
                    .map(
                        (
                            transaction,
                            index
                        ) => {

                            const id =
                                transaction.id ||
                                "TRX-" +
                                String(
                                    transactions.length -
                                    index
                                ).padStart(
                                    4,
                                    "0"
                                );


                            const name =
                                transaction.citizenName ||
                                transaction.name ||
                                "Warga";


                            const type =
                                transaction.type ||
                                "Sampah";


                            const weight =
                                Number(
                                    transaction.weight ||
                                    0
                                );


                            const status =
                                transaction.status ||
                                "Selesai";


                            return `

                                <tr>

                                    <td>
                                        ${escapeHTML(
                                            id
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            name
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            type
                                        )}
                                    </td>

                                    <td>
                                        ${formatNumber(
                                            weight
                                        )} kg
                                    </td>

                                    <td>
                                        ${escapeHTML(
                                            status
                                        )}
                                    </td>

                                </tr>

                            `;

                        }
                    )
                    .join("");

        }

    }


    updateAdminChart(
        transactions
    );


    return {

        transactions,

        citizens,

        totalWaste,

        economicValue,

        co2Reduction,

        activeUsers

    };

}


window.resikUpdateAdminDashboard =
    updateAdminDashboard;


/* =========================================================
   ADMIN CHART
   ========================================================= */

function updateAdminChart(
    transactions
) {

    const chart =
        document.getElementById(
            "collectionChart"
        );


    if (!chart) {

        return;

    }


    const values =
        transactions
            .slice(
                0,
                5
            )
            .map(
                transaction =>
                    Number(
                        transaction.weight ||
                        0
                    )
            )
            .reverse();


    if (
        values.length ===
        0
    ) {

        chart.innerHTML = `

            <i style="height:10%"></i>
            <i style="height:10%"></i>
            <i style="height:10%"></i>
            <i style="height:10%"></i>
            <i style="height:10%"></i>

        `;


        return;

    }


    const max =
        Math.max(
            ...values,
            1
        );


    chart.innerHTML =
        values
            .map(
                value => {

                    const height =
                        Math.max(
                            10,
                            (
                                value /
                                max
                            ) * 100
                        );


                    return `

                        <i
                            style="
                                height:${height}%
                            "
                        ></i>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "RESIK DOM READY"
        );


        initializeDataNavigation();

        initializeRankingCardLink();

        initializeRegister();

        initializeLogin();

        initializeLogoutButtons();


        /*
         * PROFILE
         */

        if (
            document.getElementById(
                "profileName"
            )
        ) {

            await initializeProfilePage();

        }


        /*
         * REWARD
         */

        if (
            document.getElementById(
                "rewardPoints"
            )
        ) {

            await initializeRewardPage();

        }


        /*
         * HISTORY
         */

        if (
            document.getElementById(
                "history"
            )
        ) {

            await initializeHistoryPage();

        }


        /*
         * ADMIN
         */

        if (
            document.getElementById(
                "adminDashboard"
            ) ||
            document.body?.hasAttribute(
                "data-admin-page"
            )
        ) {

            await initializeAdminDashboard();

        }

    }
);


/* =========================================================
   FIREBASE READY LOG
   ========================================================= */

console.log(
    "RESIK Hub Firebase berhasil dimuat."
);
