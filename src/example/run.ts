import RepubliKAPI from "../republik-api/republik-api"

const run = async () => {
  const userId = ""
  const authToken = ""

  const republikgg = new RepubliKAPI({ authToken, userId })
  const posts = await republikgg.Self.updateProfile.name("my name")
  console.log(posts)
}

;(async () => {
  await run()
})()
