import { NextRequest, NextResponse } from "next/server";

/**
 * 全局边缘中间件
 * 在所有请求之前运行，用于添加安全头、地理位置路由等
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. 添加安全响应头
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  // 2. 添加地理位置信息到响应头（用于调试）
  const country = request.geo?.country || "Unknown";
  const city = request.geo?.city || "Unknown";
  response.headers.set("X-Visitor-Country", country);
  response.headers.set("X-Visitor-City", city);

  // 3. 添加自定义响应头标识这是通过边缘中间件处理的
  response.headers.set("X-Edge-Middleware", "active");
  response.headers.set("X-Edge-Region", process.env.VERCEL_REGION || "local");

  // 4. 根据地理位置添加欢迎信息头（示例）
  const welcomeMessage = getWelcomeMessage(country);
  response.headers.set("X-Welcome-Message", encodeURIComponent(welcomeMessage));

  return response;
}

/**
 * 根据国家/地区返回不同的欢迎信息
 */
function getWelcomeMessage(country: string): string {
  const messages: Record<string, string> = {
    CN: "欢迎来自中国的访客！🇨🇳",
    US: "Welcome visitor from United States! 🇺🇸",
    JP: "日本からの訪問者を歓迎します！🇯🇵",
    GB: "Welcome visitor from United Kingdom! 🇬🇧",
    DE: "Willkommen Besucher aus Deutschland! 🇩🇪",
    FR: "Bienvenue visiteur de France! 🇫🇷",
    KR: "한국 방문자를 환영합니다! 🇰🇷",
  };

  return messages[country] || `Welcome visitor from ${country}! 🌍`;
}

/**
 * 配置中间件应用的路径
 * 这里配置为对所有路径生效
 * 如果只想对特定路径生效，可以修改 matcher
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - public 目录下的文件
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
