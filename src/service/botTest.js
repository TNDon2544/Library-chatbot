export const botTest = (prompt) => {
    try {
      if (prompt === "fail") {
        return false;
      } else {
        return "hello";
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };