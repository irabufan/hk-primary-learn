import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-20 text-center space-y-4">
      <h1 className="text-2xl font-black">找不到頁面 / Page not found</h1>
      <p className="text-muted">這個連結不在示範範圍內。</p>
      <Link href="/" className="btn-primary inline-flex">
        返回主頁 / Home
      </Link>
    </div>
  );
}
