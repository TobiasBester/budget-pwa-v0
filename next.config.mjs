import withPWA from 'next-pwa';

const nextConfig = {
    // Your existing Next.js config
};

const pwaConfig = withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development'
});

export default pwaConfig(nextConfig);