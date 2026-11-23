// Tiện ích HTTP dùng chung — PHẦN CHUNG

/** Lỗi có mã HTTP, ném ra ở bất kỳ đâu sẽ được errorHandler trả về cho client. */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Bọc controller async: lỗi tự chuyển tới errorHandler. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Chuỗi đã trim, hoặc '' nếu không phải chuỗi. */
const str = (value) => (typeof value === 'string' ? value.trim() : '');

/** Số nguyên >= 0, hoặc null nếu không hợp lệ. */
const nonNegativeInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
};

const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 'YYYY-MM-DD' hợp lệ hay không. */
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value));

module.exports = { HttpError, asyncHandler, str, nonNegativeInt, isDate, PHONE_REGEX, EMAIL_REGEX };
