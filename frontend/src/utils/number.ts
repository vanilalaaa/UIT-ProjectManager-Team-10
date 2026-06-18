/**
 * Hiển thị điểm đúng giá trị đã chấm, KHÔNG làm tròn lên/xuống.
 * Chỉ chuẩn hoá tối đa 2 chữ số thập phân (đúng độ chính xác lưu ở backend,
 * cột BigDecimal scale=2) để tránh nhiễu số thực (vd 0.1 + 0.2 = 0.3000...4),
 * và bỏ các số 0 thừa ở cuối (8.50 -> 8.5, 8.00 -> 8).
 */
export const formatScore = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value)) return '0'
  return String(Math.round(value * 100) / 100)
}
