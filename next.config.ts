import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 외부 IP(스마트폰 등) 접속 허용 설정
  allowedDevOrigins: ['222.113.199.93', 'localhost:3000', '127.0.0.1:3000'],
};

export default nextConfig;