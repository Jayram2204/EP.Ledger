'use client'

interface SealButtonProps {
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
}

export default function SealButton({ disabled, isLoading, onClick }: SealButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full bg-ink text-parchment font-serif px-6 py-4 rounded-sm shadow-md hover:shadow-lg active:shadow-inner active:scale-[0.98] transition-all disabled:opacity-50"
    >
      {isLoading ? 'Sealing...' : 'Seal Ledger'}
    </button>
  );
}
