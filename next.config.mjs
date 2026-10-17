/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pages moved under /accounts and /expenses; keep the old URLs working.
  async redirects() {
    return [
      { source: "/bank-accounts", destination: "/accounts/bank-accounts", permanent: true },
      { source: "/investing", destination: "/accounts/investing", permanent: true },
      { source: "/:page(credit-cards|subscriptions|loans|insurance)", destination: "/expenses/:page", permanent: true },
    ];
  },
};

export default nextConfig;
