module.exports = function config (api) {
  const validEnv = ['development', 'test', 'production']
  const currentEnv = api.env()

  const isDevelopmentEnv = api.env('development')
  const isProductionEnv = api.env('production')
  const isTestEnv = api.env('test')

  if (!validEnv.includes(currentEnv)) {
    throw new Error(
      `${
        'Please specify a valid `NODE_ENV` or '
        + '`BABEL_ENV` environment variables. Valid values are "development", '
        + '"test", and "production". Instead, received: '
      }${JSON.stringify(currentEnv)}.`,
    )
  }

  return {
    presets: [
      isTestEnv && ['@babel/preset-env', { targets: { node: 'current' } }],
      (isProductionEnv || isDevelopmentEnv) && [
        '@babel/preset-env',
        {
          targets: 'defaults, not ie 11',
          forceAllTransforms: true,
          useBuiltIns: 'entry',
          corejs: '3.8',
          modules: 'commonjs',
          bugfixes: true,
          exclude: ['transform-typeof-symbol'],
        },
      ],
      [
        '@babel/preset-react',
        {
          development: isDevelopmentEnv || isTestEnv,
          useBuiltIns: true,
        },
      ],
      ['@babel/preset-typescript', { allExtensions: true, isTSX: true }],
    ].filter(Boolean),
    plugins: [
      'babel-plugin-macros',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      [
        '@babel/plugin-proposal-class-properties',
        {
          loose: true,
        },
      ],
      [
        '@babel/plugin-proposal-object-rest-spread',
        {
          useBuiltIns: true,
        },
      ],
      [
        '@babel/plugin-transform-runtime',
        {
          helpers: false,
          regenerator: true,
        },
      ],
      [
        // TODO: Remove later and depend on webpack resolution only
        'babel-plugin-module-resolver',
        {
          root: ['./app/frontend'],
          alias: {
            rb: './app/frontend/modules/reports',
          },
        },
      ],
      isProductionEnv && [
        'babel-plugin-transform-react-remove-prop-types',
        {
          removeImport: true,
        },
      ],
    ].filter(Boolean),
  }
}
