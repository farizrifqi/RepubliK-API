import RepubliKAPI from "../republik-api/republik-api"

const run = async () => {
  const userId = ""
  const authToken = ""

  const republikgg = new RepubliKAPI({ authToken, userId })
  await republikgg.authenticate()

  const response = await republikgg.Self.updateProfile.name("my name")
  console.log(response)
}

;(async () => {
  await run()
})()
