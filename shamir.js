const { split, join } = require("shamir");
const { randomBytes } = require("crypto");

function splitMessage(secret, numParts, quorum) {
  // you can use any polyfill to covert string to Uint8Array
  const utf8Encoder = new TextEncoder();
  const secretBytes = utf8Encoder.encode(secret);
  // parts is a object whos keys are the part number and values are an Uint8Array
  const parts = split(randomBytes, numParts, quorum, secretBytes);
  //return parts
  const partStrings = [];
  for (const part in parts) {
    partStrings.push({ part: part, value: parts[part].toString() });
  }
  return partStrings;
}

function joinParts(partStrings) {
  // you can use any polyfill to covert Uint8Array to string
  const utf8Decoder = new TextDecoder();
  const parts = {};
  for (const partString of partStrings) {
    parts[partString.part] = Uint8Array.from(partString.value.split(","));
  }
  const secretBytes = join(parts);
  return utf8Decoder.decode(secretBytes);
}

module.exports = { splitMessage, joinParts };
