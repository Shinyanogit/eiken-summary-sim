"use client";

export default function WordCounter({ count }: { count: number }) {
  const isOutOfRange = count > 0 && (count < 90 || count > 110);
  const color = isOutOfRange ? "text-red-600" : "text-gray-600";

  return (
    <div className={`text-right text-sm ${color} mt-1`}>
      {count} words
    </div>
  );
}
