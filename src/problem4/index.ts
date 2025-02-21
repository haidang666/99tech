console.log('Problem 4');

// mathematical solution
function sum_to_n_a(n: number): number {
  return n * (n + 1) / 2;
}

// recursive solution
function sum_to_n_b(n: number): number {
  if (n === 0) {
    return 0;
  }
  return n + sum_to_n_b(n - 1);
}

// iterative solution
function sum_to_n_c(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

function assert(a: any, b: any) {
  if (a !== b) {
    console.error(`Expected ${b}, but got ${a}`);
  } else {
    console.log(`Passed: ${a}`);
  }
}

function test() {
  const testCases = [5, 21, 32, 14, 35, 10];
  const expected = [15, 231, 528, 105, 630, 55];
  testCases.forEach((testCase,i) => {
    assert(sum_to_n_a(testCase), expected[i]);
    assert(sum_to_n_b(testCase), expected[i]);
    assert(sum_to_n_c(testCase), expected[i]);
  });
}

test();
