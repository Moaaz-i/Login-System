const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const nameInput = document.getElementById('name');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const deleteBtn = document.getElementById('deleteBtn');

let usersData = safeLocalStorage('getItem', 'users') || [];
let currentUser = safeLocalStorage('getItem', 'currentUser') || null;

if (!window.location.href.includes('/dashboard.html') && currentUser) {
  window.location.href = '../../dashboard.html/dashboard.html';
} else if (window.location.href.includes('/dashboard.html') && currentUser) {
  document.getElementById('name').innerHTML += currentUser.name;
  document.getElementById('email').innerHTML += currentUser.email;
  document.getElementById('createdAt').innerHTML += currentUser.createdAt
    .split('T')
    .join(' ')
    .split('.')[0];
  document.getElementById('wn').innerHTML += currentUser.name;
}

injectStyles();

const patterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9-]+\.[A-Z]{2,}$/i,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{5,8}$/,
  name: /^[a-z0-9]{3,7}$/i,
};

const inputs = [emailInput, passwordInput, nameInput].filter(
  (input) => input !== null
);
inputs.forEach((input) => {
  ensureErrorEl(input);
  input.addEventListener('input', () => validateField(input));
  input.addEventListener('blur', () => validateField(input));
});

if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!validateAll()) {
      showNotification('Please fix the errors before submitting.', 'error');
    } else {
      const data = [emailInput.value.trim(), passwordInput.value];
      Login(data[0], data[1]);
    }
  });
}

if (signupBtn) {
  signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!validateAll()) {
      showNotification('Please fix the errors before submitting.', 'error');
    } else {
      const data = [
        nameInput.value.trim(),
        emailInput.value.trim(),
        passwordInput.value,
      ];
      Signup(data[0], data[1], data[2]);
    }
  });
}

if (logoutBtn && deleteBtn) {
  logoutBtn.addEventListener('click', () => {
    Logout();
  });

  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account forever ?')) {
      DeleteAccount();
    }
  });
}

function validateAll() {
  const emailOk = emailInput ? validateField(emailInput) : true;
  const passOk = passwordInput ? validateField(passwordInput) : true;
  const nameOk = nameInput ? validateField(nameInput) : true;
  return emailOk && passOk && (nameInput ? nameOk : true);
}

function validateField(input) {
  const value = input.value.trim();
  let valid = true,
    msg = '';

  if (value === '') {
    msg = 'This field is required';
    valid = false;
  } else {
    switch (input.id) {
      case 'email':
        valid = patterns.email.test(value);
        if (!valid)
          msg = 'Invalid email address. Make sure @ and domain are correct.';
        break;
      case 'password':
        valid = patterns.password.test(value);
        if (!valid)
          msg =
            'Password must be 5-8 characters with uppercase, lowercase, number, and special character.';
        break;
      case 'name':
        valid = patterns.name.test(value);
        if (!valid)
          msg =
            'Name must be 3-7 characters and can only contain letters and numbers.';
        break;
    }
  }

  if (valid) {
    clearError(input);
    setSuccess(input);
  } else {
    setError(input, msg);
    clearSuccess(input);
  }
  return valid;
}

function Login(email, password) {
  const user = usersData.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    safeLocalStorage('setItem', 'currentUser', user);
    showNotification('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = '../../dashboard.html';
    }, 1500);
  } else {
    showNotification('Invalid email or password. Please try again.', 'error');
  }
}

function Signup(name, email, password, additionalData = {}) {
  if (usersData.some((user) => user.email === email)) {
    showNotification(
      'Email already exists. Please use a different email.',
      'error'
    );
    return false;
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
    ...additionalData,
  };

  usersData.push(newUser);
  safeLocalStorage('setItem', 'users', usersData);

  setTimeout(() => {
    window.location.href = '../../index.html';
  }, 1500);

  showNotification(
    'Account created successfully! You can now login.',
    'success'
  );

  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';

  return true;
}

function Logout() {
  showNotification('You are being logged out.', 'success');
  safeLocalStorage('removeItem', 'currentUser');
  setTimeout(() => {
    window.location.href = '../../index.html';
  }, 1500);
}

function DeleteAccount() {
  if (currentUser) {
    const userIndex = usersData.findIndex((user) => user.id === currentUser.id);

    if (userIndex !== -1) {
      usersData.splice(userIndex, 1);

      safeLocalStorage('setItem', 'users', usersData);

      Logout();

      showNotification(
        'Your account has been deleted successfully.',
        'success'
      );
    } else {
      showNotification('User not found in database.', 'error');
    }
  } else {
    showNotification('No user is currently logged in.', 'error');
  }
}

function ensureErrorEl(input) {
  const next = input.nextElementSibling;
  if (next && next.classList.contains('error-text')) return next;

  const small = document.createElement('small');
  small.className = 'error-text';
  small.setAttribute('aria-live', 'polite');
  input.parentNode.insertBefore(small, input.nextSibling);
  return small;
}

function setError(input, message) {
  input.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  const el = ensureErrorEl(input);
  el.textContent = message;
  el.style.display = 'block';
}

function setSuccess(input) {
  input.classList.add('is-valid');
  input.setAttribute('aria-valid', 'true');
}

function clearError(input) {
  input.classList.remove('is-invalid');
  input.removeAttribute('aria-invalid');
  const el = input.nextElementSibling;
  if (el && el.classList.contains('error-text')) {
    el.textContent = '';
    el.style.display = 'none';
  }
}

function clearSuccess(input) {
  input.classList.remove('is-valid');
  input.removeAttribute('aria-valid');
}

function injectStyles() {
  const css = `
    .error-text { 
      color: #dc3545; 
      font-size: 0.85rem; 
      margin-top: 4px; 
      display: none; 
    }
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      z-index: 10000;
      max-width: 350px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0;
      transform: translateY(-20px);
      transition: opacity 0.3s, transform 0.3s;
    }
    .notification.show {
      opacity: 1;
      transform: translateY(0);
    }
    .notification.success {
      background-color: #28a745;
    }
    .notification.error {
      background-color: #dc3545;
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

function showNotification(message, type = 'info') {
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

function safeLocalStorage(action = 'getItem', key = '', value = null) {
  try {
    if (!['getItem', 'setItem', 'removeItem', 'clear'].includes(action)) {
      throw new Error(`Unsupported operation: ${action}`);
    }

    if (action !== 'clear' && typeof key !== 'string') {
      throw new Error('The key must be a valid string');
    }

    switch (action) {
      case 'setItem':
        if (value === null || value === undefined) {
          throw new Error('Cannot store an empty value');
        }
        const safeValue =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
        localStorage.setItem(key, safeValue);
        return true;

      case 'getItem':
        const raw = localStorage.getItem(key);
        if (
          raw === null ||
          raw === 'null' ||
          raw === 'undefined' ||
          raw === ''
        ) {
          return null;
        }
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }

      case 'removeItem':
        localStorage.removeItem(key);
        return true;

      case 'clear':
        localStorage.clear();
        return true;
    }
  } catch (error) {
    console.error('LocalStorage error:', error.message);
    return null;
  }
}
