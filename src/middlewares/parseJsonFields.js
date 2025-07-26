export const parseJsonFields =
  (fields = []) =>
  (req, res, next) => {
    console.log('ParseJsonFields')
    fields.forEach((field) => {
      const value = req.body[field];
      if (typeof value === "string") {
        try {
          req.body[field] = JSON.parse(value);
        } catch (e) {
          console.log(e.message)
          console.error(e.message);
        }
      }
    });
    next();
  };
