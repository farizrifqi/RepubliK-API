import RepublikGGAPI from "../republikgg/republikgg";

const run = async () => {

    const userId = "";
    const authToken = "";

    const republikgg = new RepublikGGAPI({ authToken, userId });
    const posts = await republikgg.Self.updateProfile.name("my name")
    console.log(posts)

}

(async () => {
    await run()
})()