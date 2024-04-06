import { assert } from 'chai';

// Import the functions to be tested
import { removeColumn, constructQueryParamsString, determineSelectedColumns } from '../index.js';



(async () => {
  const { expect } = await import('chai');
  const { default: supertest } = await import('supertest');
  // Adjust the path to your actual index.js or the file you wish to test
  const { removeColumn, constructQueryParamsString, determineSelectedColumns } = await import('../index.js');

  describe("Testing remove column method", () => {
    it("should remove the column from the data", () => {
      let data = [
        { a: 1, b: 2, c: 3 },
        { a: 4, b: 5, c: 6 },
        { a: 7, b: 8, c: 9 }
      ];
      removeColumn(data, "a");
      // assert that column 'a' doesn't exist anymore
      assert.strictEqual(Object.keys(data[0]).length, 2);
      assert.strictEqual(Object.keys(data[1]).length, 2);
      assert.strictEqual(Object.keys(data[2]).length, 2);
    });
  });

  describe("Testing constructQueryParamsString function", () => {
    it("should correctly construct a query parameter string from an object", () => {
      // Example input
      const queryObject = {
        name: "Rodrigo Almeida",
        age: 40,
        hobbies: ["reading", "gaming"],
      };
  
      // Call the function with the example input
      const result = constructQueryParamsString(queryObject);
  
      // Expected output string, assuming the function URI encodes components
      const expectedOutput = "name=Rodrigo%20Almeida&age=40&hobbies=reading&hobbies=gaming";
  
      // Assert that the output matches the expected string
      assert.strictEqual(result, expectedOutput);
    });
  });

  
})();





