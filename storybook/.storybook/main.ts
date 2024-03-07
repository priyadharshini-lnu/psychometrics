export default {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: {
      name: '@storybook/builder-vite',
      options: {
        viteConfigPath: './vite.config.js',
      },
    }
  },
  // async viteFinal(config) {
  //   // Merge custom configuration into the default config
  //   return {
  //     ...config,
  //     resolve: {
  //       alias: {
  //         "*": '../app/frontend/*',
  //         "~": '../app/frontend/*',
  //         videojs: 'video.js',
  //         'window.videojs': 'video.js',
  //         WaveSurfer: 'wavesurfer.js',
  //         RecordRTC: 'recordrtc',
  //         'window.RecordRTC': 'recordrtc',
  //       },
  //       extensions: ['.cjs', '.mjs', '.js', '.ts', '.jsx', '.tsx']
  //     },
  //   }
  // },
}
