export default function isValidCollectionName(name: string): ReturnValidation {
  // if (name === undefined || name.length === 0) {
  //   return { error: true, message: 'You forgot to enter a collection name!' }
  // }

  // Collection names must begin with a letter, underscore, hyphen or slash, (tested v3.2.4)
  // and can contain only letters, underscores, hyphens, numbers, dots or slashes
  if (!/^[/A-Z_a-z-][\w./-]*$/.test(name)) {
    return {
      error: 'Collection names must begin with a letter, underscore, hyphen or'
        + ' slash, and can contain only letters,'
        + ' underscores, hyphens, numbers, dots or slashes'
    }
  }
  return {}
}
