const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  mdxOptions: {
    rehypePlugins: [rehypeCodeLanguageLabel],
  },
})

module.exports = withNextra()

function rehypeCodeLanguageLabel() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'pre') {
        return
      }

      const code = node.children?.find(
        (child) => child.type === 'element' && child.tagName === 'code',
      )
      const language = code?.properties?.className?.find((className) =>
        className.startsWith('language-'),
      )

      if (language && language !== 'language-text') {
        node.properties = {
          ...node.properties,
          'data-language': language.replace('language-', ''),
        }
      }
    })
  }
}

function visit(node, callback) {
  callback(node)

  for (const child of node.children ?? []) {
    visit(child, callback)
  }
}
