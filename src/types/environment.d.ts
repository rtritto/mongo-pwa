export { }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-var
  var config: import('../../config.default.ts').Config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-var
  var mongo: Mongo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-var
  var messageError: string | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-var
  var messageSuccess: string | undefined
}
