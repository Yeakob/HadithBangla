export default function NotFound({ what = 'এই পাতাটি পাওয়া যায়নি।' }: { what?: string }) {
  return (
    <div className="wrap grid min-h-[50vh] place-items-center py-20 text-center">
      <div>
        <p className="eyebrow mb-3">৪০৪</p>
        <h1 className="text-[28px] font-semibold">{what}</h1>
        <p className="mt-2 text-muted">ঠিকানাটি ভুল হতে পারে, অথবা হাদিসটি এই ডেটাবেসে নেই।</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a className="btn-primary" href="#home">প্রথম পাতায় যান</a>
          <a className="btn-ghost" href="#search">অনুসন্ধান করুন</a>
        </div>
      </div>
    </div>
  )
}
