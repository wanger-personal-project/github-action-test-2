import React from 'react'

const config = {
  footer: <p>© 2025 我的技术博客</p>,
  head: ({ title, meta }) => (
    <>
      {meta.description && (
        <meta name="description" content={meta.description} />
      )}
      {meta.tag && <meta name="keywords" content={meta.tag} />}
      {meta.author && <meta name="author" content={meta.author} />}
    </>
  ),
  readMore: '阅读全文 →',
  postFooter: null,
  darkMode: true,
  navs: [
    {
      url: 'https://github.com/your-username/my-nextra-blog',
      name: 'GitHub'
    }
  ]
}

export default config
