let logoutFunction: (() => void) | null = null;

export const setLogoutFunction = (logoutFn: () => void) => {
  logoutFunction = logoutFn;
};

export const logout = () => {
  if (logoutFunction) {
    logoutFunction();
  } else {
    console.error("Logout function is not set.");
  }
};
