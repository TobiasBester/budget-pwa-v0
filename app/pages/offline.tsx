import Head from 'next/head'

export default function Offline() {
    return (
        <div>
            <Head>
                <title>Offline - Budget PWA</title>
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">You are offline</h1>
                <p>Please check your internet connection and try again.</p>
            </main>
        </div>
    )
}