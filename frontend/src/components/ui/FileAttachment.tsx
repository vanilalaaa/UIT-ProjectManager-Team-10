interface FileAttachmentProps {
  fileName: string
}

export default function FileAttachment({ fileName }: FileAttachmentProps) {
  const isPdf = fileName.toLowerCase().endsWith('.pdf')

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-soft/40 px-3 py-1 text-xs font-medium text-text-soft hover:bg-surface-soft transition-colors cursor-pointer shadow-sm">
      {isPdf ? (
        <svg className="size-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ) : (
        <svg className="size-3.5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
        </svg>
      )}
      <span>{fileName}</span>
    </div>
  )
}