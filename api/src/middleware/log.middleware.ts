import { Request, Response, NextFunction } from 'express';

const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
};
const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, dob, gender } = req.params;
  if (!email || !password) {
    return res.status(400).json({
      message: 'Missing required fields: email and password are mandatory',
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
    const dobRegex = /^\d{2}-\d{2}-\d{4}$/; // DD-MM-YYYY format
    if (!dobRegex.test(dob)) {
      return { valid: false, message: 'Invalid format. Use DD-MM-YYYY.' };
    }
    
    const [day, month, year] = dob.split('-').map(Number);
    
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1000) {
      return { valid: false, message: 'Invalid date values.' };
    }
    const date = new Date(year, month - 1, day); 
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return { valid: false, message: 'Invalid date.' };
    }
  
    const today = new Date();
    if (date >= today) {
      return res.status(400).json({
        valid: false,
        message: 'DOB cannot be today or in the future.',
      });
    }
    res.status(200).json({
      valid: true,
      message: 'Valid DOB.',
    });

    if(!(gender ==='male' || gender === 'female' || gender ==='other')){
      return res.status(400).json({ message: 'Choose a gender' });
  };
  next();
};
const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.params;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
  next();
  }

const validateChangePassword = (req: Request, res: Response, next: NextFunction) => {
  const { oldPassword, newPassword } = req.params;
  if (oldPassword === newPassword) {
    return res.status(400).json({ message: 'New password cannot be the same as old password.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
  next();
}
const validateDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.params;
  if(!password){
    return res.status(400).json({ message: 'Password is required' });
  }
}
const validateResetPassword = (req: Request, res: Response, next: NextFunction) => {
  const { password, confirmPassword } = req.params;
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  if(!password){
    return res.status(400).json({ message: 'Password is required' });
  }
  if(!confirmPassword){
    return res.status(400).json({ message: 'Confirm password is required' });
  }
};

export default logMiddleware;
