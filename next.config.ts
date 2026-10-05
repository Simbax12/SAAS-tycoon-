import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stop `next dev` adding its own rules block to CLAUDE.md. CLAUDE.md is the project's hub,
  // and the block's punctuation fails the docs check (scripts/check-docs.mjs).
  agentRules: false,
};

export default nextConfig;
