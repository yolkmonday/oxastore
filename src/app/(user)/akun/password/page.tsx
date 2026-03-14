import ChangePasswordForm from "@/components/user/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default function PasswordPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ubah Password</h1>
      <ChangePasswordForm />
    </div>
  );
}
