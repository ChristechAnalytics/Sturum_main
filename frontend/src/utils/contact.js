/** Display contact from API (string or legacy number). */
export const formatContact = (contact) => {
  if (contact === null || contact === undefined || contact === "") return "";
  return String(contact).replace(/\D/g, "") || String(contact);
};
