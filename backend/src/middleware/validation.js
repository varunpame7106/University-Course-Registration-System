const { sendError } = require('../utils/apiResponse');

const nameRegex = /^[A-Za-z ]+$/;
const strictNameRegex = /^[A-Za-z]+$/;
const numberRegex = /^[0-9]+$/;

const validatePasswordStrength = (val) => {
  if (!val) return true;
  if (val.length < 8) return false;
  if (new Set(val).size === 1) return false;
  const halfLen = Math.floor(val.length / 2);
  for (let i = 2; i <= halfLen; i++) {
    const pattern = val.substring(0, i);
    let repeated = pattern;
    while (repeated.length < val.length) repeated += pattern;
    if (repeated === val) return false;
  }
  return true;
};

const validateStudent = (req, res, next) => {
  const { first_name, last_name, user_id, phone_no, city, state, pincode, year_enrolled, password } = req.body;

  if (!first_name) return sendError(res, 'First name is required', [], 400);
  if (!strictNameRegex.test(first_name)) return sendError(res, 'Only alphabets allowed', [], 400);
  if (first_name.length < 2) return sendError(res, 'Minimum 2 letters required', [], 400);

  if (!last_name) return sendError(res, 'Last name is required', [], 400);
  if (!strictNameRegex.test(last_name)) return sendError(res, 'Only alphabets allowed', [], 400);
  if (last_name.length < 2) return sendError(res, 'Minimum 2 letters required', [], 400);

  if (!user_id) return sendError(res, 'PRN number is required', [], 400);
  if (!numberRegex.test(user_id)) return sendError(res, 'PRN must contain numbers only', [], 400);
  if (user_id.length !== 8) return sendError(res, 'PRN must be exactly 8 digits', [], 400);
  if (phone_no.length !== 10 || !numberRegex.test(phone_no)) return sendError(res, 'Invalid phone number: Must be 10 digits', [], 400);
  if (!nameRegex.test(city)) return sendError(res, 'Invalid city: Only alphabets allowed', [], 400);
  if (!nameRegex.test(state)) return sendError(res, 'Invalid state: Only alphabets allowed', [], 400);
  if (pincode.length !== 6 || !numberRegex.test(pincode)) return sendError(res, 'Invalid pincode: Must be 6 digits', [], 400);
  
  const year = parseInt(year_enrolled);
  const currentYear = new Date().getFullYear();
  if (year_enrolled.length !== 4 || isNaN(year) || year < 2000 || year > currentYear + 1) {
    return sendError(res, 'Invalid year: Must be 4 digits between 2000 and current+1', [], 400);
  }

  if (password && !validatePasswordStrength(password)) {
    return sendError(res, 'Choose stronger password', [], 400);
  }

  next();
};

const validateFaculty = (req, res, next) => {
  const { first_name, last_name, user_id, contact_no, password } = req.body;

  if (!nameRegex.test(first_name)) return sendError(res, 'Invalid first name: Only alphabets allowed', [], 400);
  if (!nameRegex.test(last_name)) return sendError(res, 'Invalid last name: Only alphabets allowed', [], 400);
  if (!numberRegex.test(user_id)) return sendError(res, 'Invalid Faculty ID: Only numbers allowed', [], 400);
  if (contact_no.length !== 10 || !numberRegex.test(contact_no)) return sendError(res, 'Invalid contact number: Must be 10 digits', [], 400);

  if (password && !validatePasswordStrength(password)) {
    return sendError(res, 'Choose stronger password', [], 400);
  }

  next();
};

const validateDepartment = (req, res, next) => {
  const { dept_name } = req.body;
  if (!dept_name || !nameRegex.test(dept_name)) {
    return sendError(res, 'Invalid department name: Only alphabets allowed', [], 400);
  }
  next();
};

module.exports = {
  validateStudent,
  validateFaculty,
  validateDepartment
};
