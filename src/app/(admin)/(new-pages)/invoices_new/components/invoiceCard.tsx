type InvoiceCardProps = {
  balance: number;
  invTotal: number;
  audTotal: number;
  unpaidTotal: number;
  unpaidAmount: number;
};

export default function InvoiceCard(InvoiceCardProps: InvoiceCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="grid rounded-2xl border border-gray-200 bg-white sm:grid-cols-2 xl:grid-cols-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-5 sm:border-r xl:border-b-0 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">Дансны үлдэгдэл</span>
          <div className="mt-2 flex items-end gap-3">
            <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
              {InvoiceCardProps.balance.toLocaleString("en-US")} ₮
            </h4>
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-5 sm:border-r xl:border-b-0 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">Нийт нэхэмжлэхийн тоо</span>
          <div className="mt-2 flex items-end gap-3">
            <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
              {InvoiceCardProps.invTotal}
            </h4>
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-5 sm:border-r sm:border-b-0 dark:border-gray-800">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Нийт аудитын эрх</span>
            <div className="mt-2 flex items-end gap-3">
              <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
                {InvoiceCardProps.audTotal}
              </h4>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-5 xl:border-r xl:border-b-0 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">Төлөгдөөгүй нэхэмжлэх</span>
          <div className="mt-2 flex items-end gap-3">
            <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
              {InvoiceCardProps.unpaidTotal}
            </h4>
          </div>
        </div>
        <div className="px-6 py-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Төлөгдөөгүй дүн</span>
          <div className="mt-2 flex items-end gap-3">
            <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
              {InvoiceCardProps.unpaidAmount.toLocaleString("en-US")} ₮
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
