export declare global {
  declare var config: import('@/server/config').Config
  declare var mongo: Mongo
  declare var messageError: string | undefined
  declare var messageSuccess: string | undefined
}
