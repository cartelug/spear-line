export const LIMITS = Object.freeze({name:100,contact:160,model:160,budget:100,location:200,pickup:200,destination:200,load:120,timing:120,products:500,quantity:200,supplyDestination:200,supplyTiming:120,notes:2000});
export function validateEnquiry(input) {
  const errors = {};
  const clean = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return {ok:false,errors:{form:"Please check your enquiry."}};
  const allowed = ["vehicle","supplies","logistics"];
  clean.service = typeof input.service === "string" ? input.service.trim() : "";
  if (clean.service === "timber") clean.service = "logistics";
  if (!allowed.includes(clean.service)) errors.service = "Choose a service.";
  const serviceFields = {vehicle:["model","budget","location"],supplies:["products","quantity","supplyDestination","supplyTiming"],logistics:["pickup","destination","load","timing"]};
  const selected = ["name","contact","notes"].concat(serviceFields[clean.service] || []);
  for (const key of selected) {
    const value = input[key];
    clean[key] = typeof value === "string" ? value.trim() : "";
    if (value != null && typeof value !== "string") errors[key] = "Use text for this field.";
    if (clean[key].length > LIMITS[key]) errors[key] = "Please use " + LIMITS[key] + " characters or fewer.";
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(clean[key])) errors[key] = "Please remove unsupported characters.";
  }
  const required = ["name","contact"].concat(clean.service === "vehicle" ? ["model","location"] : serviceFields[clean.service] || []);
  for (const key of required) if (!clean[key]) errors[key] = "Please complete this field.";
  if (clean.contact && !errors.contact) {
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.contact);
    const phone = /^[+\d\s().-]+$/.test(clean.contact) && clean.contact.replace(/\D/g,"").length >= 7 && clean.contact.replace(/\D/g,"").length <= 15;
    if (!email && !phone) errors.contact = "Enter an email address or phone number, including country code.";
  }
  clean.consent = input.consent === true;
  if (!clean.consent) errors.consent = "Please agree so we can respond to your request.";
  return {ok:Object.keys(errors).length === 0,errors,value:clean};
}
