const path = require('path');
const { getDefaultConfig } = require('@callstack/repack');

module.exports = async function (env, argv) {
  const mode = (argv && argv.mode) || process.env.NODE_ENV || 'production';
  const defaultConfig = await getDefaultConfig(__dirname, { mode, platform: 'android' });

  return {
    ...defaultConfig,
    mode,
    module: {
      ...defaultConfig.module,
      rules: [
        ...defaultConfig.module.rules,
        {
          test: /\.(glb|gltf|obj|mtl|bin)$/i,
          use: [
            {
              loader: require.resolve('file-loader'),
              options: {
                name: 'assets/models/[name].[hash].[ext]',
              },
            },
          ],
        },
      ],
    },
    resolve: {
      ...defaultConfig.resolve,
      alias: {
        ...(defaultConfig.resolve && defaultConfig.resolve.alias),
      },
    },
    output: {
      ...defaultConfig.output,
      assetModuleFilename: 'assets/[name].[hash][ext][query]'
    }
  };
};
