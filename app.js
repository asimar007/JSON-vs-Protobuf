const protobuf = require('protobufjs');
const { performance } = require('perf_hooks');

// Define a simple User message structure in .proto format
const protoDefinition = `
syntax = "proto3";
package userpackage;

message User {
  string name = 1;
  int32 age = 2;
}
`;

// Load the protobuf definition
async function loadProto() {
    const root = await protobuf.parse(protoDefinition).root;
    return root.lookupType('userpackage.User');
}

// Generate a large array of users
function generateLargeUserArray(size) {
    return Array.from({ length: size }, (_, i) => ({
        name: `User${i}`,
        age: Math.floor(Math.random() * 100),
    }));
}

// Measure serialization and deserialization times for both JSON and Protobuf
async function measurePerformance() {
    const User = await loadProto();

    const userArray = generateLargeUserArray(10000); // Generate 10,000 users

    // Measure JSON serialization
    const startJsonSerialize = performance.now();
    const jsonString = JSON.stringify(userArray);
    const endJsonSerialize = performance.now();

    // Measure JSON deserialization
    const startJsonDeserialize = performance.now();
    const jsonParsed = JSON.parse(jsonString);
    const endJsonDeserialize = performance.now();

    // Measure Protobuf serialization
    const startProtobufSerialize = performance.now();
    const protobufBuffer = User.encodeDelimited(userArray).finish();
    const endProtobufSerialize = performance.now();

    // Measure Protobuf deserialization
    const startProtobufDeserialize = performance.now();
    const protobufDecoded = User.decodeDelimited(protobufBuffer);
    const endProtobufDeserialize = performance.now();

    console.log('JSON Serialization Time:', endJsonSerialize - startJsonSerialize, 'ms');
    console.log('JSON Deserialization Time:', endJsonDeserialize - startJsonDeserialize, 'ms');

    console.log('Protobuf Serialization Time:', endProtobufSerialize - startProtobufSerialize, 'ms');
    console.log('Protobuf Deserialization Time:', endProtobufDeserialize - startProtobufDeserialize, 'ms');

    console.log('JSON Size:', Buffer.byteLength(jsonString), 'bytes');
    console.log('Protobuf Size:', protobufBuffer.length, 'bytes');
}

measurePerformance().catch(console.error);