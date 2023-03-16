module.exports = function config (api) {
  api.env('test')

  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      [
        '@babel/preset-react',
      ],
      ['@babel/preset-typescript', { allExtensions: true, isTSX: true }],
    ].filter(Boolean),
  }
}
