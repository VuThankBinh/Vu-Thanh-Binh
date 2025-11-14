/**
 * Giải pháp A: sử dụng công thức Gauss n(n + 1) / 2.
 * Độ phức tạp: thời gian O(1), bộ nhớ O(1).
 */
export function sum_to_n_a(n: number): number {
  if (!Number.isInteger(n)) {
    throw new TypeError('n phải là số nguyên');
  }

  if (n <= 0) {
    return 0;
  }

  return (n * (n + 1)) / 2;
}

/**
 * Giải pháp B: duyệt tuyến tính và cộng dồn.
 * Độ phức tạp: thời gian O(n), bộ nhớ O(1).
 */
export function sum_to_n_b(n: number): number {
  if (!Number.isInteger(n)) {
    throw new TypeError('n phải là số nguyên');
  }

  if (n <= 0) {
    return 0;
  }

  let sum = 0;
  for (let i = 1; i <= n; i += 1) {
    sum += i;
  }

  return sum;
}

/**
 * Giải pháp C: dùng kỹ thuật reduce trên mảng ảo.
 * Độ phức tạp: thời gian O(n), bộ nhớ O(n) vì cần tạo mảng trung gian.
 */
export function sum_to_n_c(n: number): number {
  if (!Number.isInteger(n)) {
    throw new TypeError('n phải là số nguyên');
  }

  if (n <= 0) {
    return 0;
  }

  return Array.from({ length: n }, (_, index) => index + 1).reduce(
    (acc, value) => acc + value,
    0,
  );
}

if (require.main === module) {
  console.log('A(10)=', sum_to_n_a(10));
  console.log('B(10)=', sum_to_n_b(10));
  console.log('C(10)=', sum_to_n_c(10));
}
