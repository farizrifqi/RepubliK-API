import RepublikGG from "./republikgg/republikgg";

const run = async () => {
    const userId = "";
    const accessToken = "";

    const RepublikGGAPI = new RepublikGG(accessToken, userId);
    const posts = await RepublikGGAPI.getPosts(userId)
    console.log(posts)
}

(async () => {
    await run()
})()