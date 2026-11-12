import assert from "node:assert/strict";
import test from "node:test";
import { getIpsosContacts } from "../src/types/subsample";

test("Ipsos contacts retain multiple names/emails, preserve explicit empty lists and fall back to legacy email", () => {
  const contacts = [{ name: "Alex", email: "alex@example.test" }, { name: "Taylor", email: "taylor@example.test" }];
  assert.deepEqual(getIpsosContacts({ ipsosContacts: contacts, ipsosContact: "legacy@example.test" }), contacts);
  assert.deepEqual(getIpsosContacts({ ipsosContacts: [], ipsosContact: "legacy@example.test" }), []);
  assert.deepEqual(getIpsosContacts({ ipsosContact: "legacy@example.test" }), [{ name: "", email: "legacy@example.test" }]);
  assert.deepEqual(getIpsosContacts({}), []);
});
