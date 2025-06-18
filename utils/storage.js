export const getStoredUser = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('mockUser'));
    return storedUser?.name || null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

export const setStoredUser = (userData) => {
  try {
    localStorage.setItem('mockUser', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

export const getStoredTestResults = () => {
  try {
    const results = JSON.parse(localStorage.getItem('testResults'));
    return results || [];
  } catch (error) {
    console.error('Error parsing test results:', error);
    return [];
  }
};

export const setStoredTestResults = (results) => {
  try {
    localStorage.setItem('testResults', JSON.stringify(results));
    return true;
  } catch (error) {
    console.error('Error storing test results:', error);
    return false;
  }
}; 