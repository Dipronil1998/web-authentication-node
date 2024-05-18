const express = require('express');
const crypto = require("node:crypto");
const { 
    generateRegistrationOptions, 
    verifyRegistrationResponse, 
    generateAuthenticationOptions, 
    verifyAuthenticationResponse 
} = require('@simplewebauthn/server');

const app = express();
app.use(express.static('./public'));
app.use(express.json());

if (!globalThis.crypto) {
    globalThis.crypto = crypto;
}

PORT=3000

const userStore = {}
const challengeStore = {}

app.post('/register', (req, res) => {
    const { username, password } = req.body
    const id = `user_${Date.now()}`
    const user = {
        id,
        username,
        password
    }
    userStore[id] = user
    console.log(`Register successfull`, userStore[id])
    return res.json({ id })
});

app.post('/register-challenge', async (req, res) => {
    const { userId } = req.body

    if (!userStore[userId]) return res.status(404).json({ error: 'user not found!' })

    const user = userStore[userId]

    const challengePayload = await generateRegistrationOptions({
        rpID: 'localhost',
        rpName: 'My Localhost Machine',
        attestationType: 'none',
        userName: user.username,
        timeout: 30_000,
    })

    challengeStore[userId] = challengePayload.challenge

    return res.json({ options: challengePayload })

})


app.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`);
})