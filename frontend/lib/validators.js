export const nameRegex = /^[A-Za-z ]+$/;
export const numberRegex = /^[0-9]+$/;

export const validateName = (val) => nameRegex.test(val);
export const validateNumber = (val) => numberRegex.test(val);

export const validatePhone = (val) => val.length === 10 && numberRegex.test(val);
export const validatePincode = (val) => val.length === 6 && numberRegex.test(val);
export const validateYear = (val) => {
  const year = parseInt(val);
  const currentYear = new Date().getFullYear();
  return val.length === 4 && numberRegex.test(val) && year >= 2000 && year <= currentYear + 1;
};

export const validatePasswordStrength = (val) => {
  if (!val) return true; // Let Zod handle requiredness
  if (val.length < 8) return false;
  
  // Reject if all characters are the same
  if (new Set(val).size === 1) return false;

  // Reject simple repeated patterns (e.g., abab, 1212)
  const halfLen = Math.floor(val.length / 2);
  for (let i = 2; i <= halfLen; i++) {
    const pattern = val.substring(0, i);
    let repeated = pattern;
    while (repeated.length < val.length) {
      repeated += pattern;
    }
    if (repeated === val) return false;
  }

  return true;
};
