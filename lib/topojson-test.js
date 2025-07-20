var tape = require("tape"),
    testExports = require("./topojson-master/test/test-exports");

for (var dependency in require("./topojson-master/package.json").dependencies) {
  testExports(dependency);
}
