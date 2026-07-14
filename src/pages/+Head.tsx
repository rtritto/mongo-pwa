// Default <head> (can be overridden by pages)
export function Head() {
  return (
    <>
      <link rel="manifest" href="/manifest.webmanifest" />
      <link rel="shortcut icon" type="image/ico" href="/favicon.ico" />
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Mongo Solid</title>
    </>
  )
}
