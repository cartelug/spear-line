import test from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry } from "../public/validation.js";

const vehicle = {service:"vehicle",name:"Test Buyer",contact:"buyer@example.com",model:"Pickup",location:"Kampala",consent:true};
const timber = {service:"timber",name:"Test Customer",contact:"+256 700 000000",pickup:"Pickup town",destination:"Kampala",load:"To be confirmed",timing:"November",consent:true};
const supplies = {service:"supplies",name:"Test Buyer",contact:"buyer@example.com",products:"Rice, grade A",quantity:"100 bags",supplyDestination:"Kampala",supplyTiming:"November",consent:true};
test("vehicle and timber requests retain the right fields",() => {
  const v = validateEnquiry({...vehicle,pickup:"Should not be stored",extra:"Unknown"});
  assert.equal(v.ok,true); assert.equal(v.value.pickup,undefined); assert.equal(v.value.extra,undefined);
  assert.equal(validateEnquiry(timber).ok,true);
});
test("required details, consent and contact formats are enforced",() => {
  for (const key of ["name","contact","model","location"]) assert.ok(validateEnquiry({...vehicle,[key]:""}).errors[key],key);
  for (const key of ["pickup","destination","load","timing"]) assert.ok(validateEnquiry({...timber,[key]:""}).errors[key],key);
  for (const consent of [false,"true","on",1,null]) assert.ok(validateEnquiry({...vehicle,consent}).errors.consent);
  for (const contact of ["not an address","123","foo@bar","https://example.com"]) assert.ok(validateEnquiry({...vehicle,contact}).errors.contact);
});
test("unknown services, invalid shapes and overlong or control-character input are rejected",() => {
  for (const value of [null,undefined,[],42,"text"]) assert.equal(validateEnquiry(value).ok,false);
  assert.ok(validateEnquiry({...vehicle,service:"unknown"}).errors.service);
  assert.ok(validateEnquiry({...vehicle,notes:"a".repeat(2001)}).errors.notes);
  assert.ok(validateEnquiry({...vehicle,name:"A\u0000B"}).errors.name);
  assert.ok(validateEnquiry({...vehicle,model:{value:"Pickup"}}).errors.model);
});
test("optional budget and notes can be omitted; whitespace is trimmed",() => {
  const value = validateEnquiry({...vehicle,name:"  Buyer  "}).value;
  assert.equal(value.name,"Buyer"); assert.equal(value.budget,""); assert.equal(value.notes,"");
});
test("supplies require product, quantity, destination and timing and discard unrelated fields",() => {
  const result=validateEnquiry({...supplies,model:"Should not be stored",pickup:"Unrelated"});
  assert.equal(result.ok,true); assert.equal(result.value.products,"Rice, grade A");
  assert.equal(result.value.model,undefined); assert.equal(result.value.pickup,undefined);
  for(const field of ["products","quantity","supplyDestination","supplyTiming"]) assert.ok(validateEnquiry({...supplies,[field]:""}).errors[field]);
  assert.ok(validateEnquiry({...supplies,products:"a".repeat(501)}).errors.products);
});
test("legacy timber requests and current logistics requests share the logistics schema",() => {
  assert.equal(validateEnquiry(timber).value.service,"logistics");
  assert.equal(validateEnquiry({...timber,service:"logistics"}).ok,true);
});
test("businesses still being set up take interest enquiries with their own fields",() => {
  const property = {service:"property",name:"Test Visitor",contact:"visitor@example.com",propertyNeed:"A two-bedroom flat to rent",propertyArea:"Kampala",consent:true};
  const result = validateEnquiry({...property,model:"Should not be stored",propertyWhen:"Next year"});
  assert.equal(result.ok,true); assert.equal(result.value.mode,"interest");
  assert.equal(result.value.propertyNeed,"A two-bedroom flat to rent"); assert.equal(result.value.propertyWhen,"Next year"); assert.equal(result.value.model,undefined);
  for (const field of ["propertyNeed","propertyArea"]) assert.ok(validateEnquiry({...property,[field]:""}).errors[field],field);
  assert.equal(validateEnquiry({...property,propertyWhen:""}).ok,true,"timing is optional");
  assert.ok(validateEnquiry({...property,propertyNeed:"a".repeat(401)}).errors.propertyNeed);
  assert.equal(validateEnquiry({service:"fitness",name:"Test Visitor",contact:"+256 700 000000",fitnessNeed:"Group classes",consent:true}).ok,true,"place is optional for fitness");
  assert.equal(validateEnquiry({service:"hospitality",name:"Test Visitor",contact:"visitor@example.com",hospitalityNeed:"Private events",consent:true}).ok,true);
  assert.equal(validateEnquiry({service:"digital",name:"Test Visitor",contact:"visitor@example.com",digitalNeed:"A company website",consent:true}).ok,true);
  assert.equal(validateEnquiry({service:"construction",name:"Test Visitor",contact:"visitor@example.com",constructionNeed:"Roofing sheets",constructionArea:"Juba",consent:true}).value.constructionWhen,"");
  assert.equal(validateEnquiry(vehicle).value.mode,"quote");
  assert.equal(validateEnquiry({...vehicle,service:"constructor"}).ok,false,"inherited object keys are not services");
});
