import Link from "next/link";
import Image from "next/image";
import AuthTabs from "@/components/auth/AuthTabs";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function MasukPage({ searchParams }: Props) {
  const { redirect } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/oxa-logo.png"
              alt="OXA Matter"
              height={36}
              width={180}
              className="h-9 w-auto mx-auto"
              priority
            />
          </Link>
          <p className="text-gray-500 text-sm mt-2">
            Masuk atau daftar untuk melanjutkan
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <AuthTabs redirectTo={redirect} />
        </div>
      </div>
    </div>
  );
}
