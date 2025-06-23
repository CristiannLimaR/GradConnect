export const validateDate = (req, res, next) => {
  let { closingDate } = req.body;

  if (!closingDate) return next();

  // Si viene en formato dd/mm/yyyy, convertirla
  if (typeof closingDate === "string" && closingDate.includes("/")) {
    const [day, month, year] = closingDate.split("/");
    closingDate = new Date(`${year}-${month}-${day}`);
  } else {
    closingDate = new Date(closingDate); // puede venir ya en formato ISO
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // comparar solo fecha, no hora

  if (closingDate < now) {
    return res.status(400).json({
      msg: "La fecha de cierre no puede estar en el pasado.",
    });
  }

  next();
};
