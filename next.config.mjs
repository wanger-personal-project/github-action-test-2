import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-blog',
  themeConfig: './theme.config.tsx'
})

export default withNextra({
  // Next.js 配置
  reactStrictMode: true,

  // 可选：自定义域名
  // images: {
  //   domains: ['yourdomain.com'],
  // },
})
