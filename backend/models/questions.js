// ─── DSA Question Bank ────────────────────────────────────────────────────────
// Each question has: metadata, description, test cases, and per-language starter code.
// Add more questions here or fetch from an external DB in production.

export const questions = [
	// ── EASY ─────────────────────────────────────────────────────────────────────
	{
		id: "q1",
		title: "Two Sum",
		category: "Array",
		difficulty: "Easy",
		description:
			"Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.",
		inputFormat: "Line 1: space-separated integers\nLine 2: target integer",
		outputFormat: "Two space-separated indices",
		constraints: [
			"2 <= nums.length <= 10^4",
			"-10^9 <= nums[i] <= 10^9",
			"Only one valid answer exists.",
		],
		examples: [
			{ input: "2 7 11 15\n9", output: "0 1", explanation: "nums[0] + nums[1] = 9" },
			{ input: "3 2 4\n6",     output: "1 2", explanation: "nums[1] + nums[2] = 6" },
		],
		testCases: [
			{ input: "2 7 11 15\n9",   expected: "0 1" },
			{ input: "3 2 4\n6",       expected: "1 2" },
			{ input: "3 3\n6",         expected: "0 1" },
			{ input: "1 2 3 4 5\n9",   expected: "3 4" },
			{ input: "-1 -2 -3 -4\n-7", expected: "2 3" },
		],
		starterCode: {
			python: `import sys
def two_sum(nums, target):
    # Write your solution here
    pass

lines = sys.stdin.read().strip().split('\\n')
nums = list(map(int, lines[0].split()))
target = int(lines[1])
result = two_sum(nums, target)
print(' '.join(map(str, result)))`,
			javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l));
rl.on('close', () => {
  const nums = lines[0].split(' ').map(Number);
  const target = parseInt(lines[1]);
  function twoSum(nums, target) {
    // Write your solution here
  }
  console.log(twoSum(nums, target).join(' '));
});`,
			java: `import java.util.*;
public class Main {
  public static int[] twoSum(int[] nums, int target) {
    // Write your solution here
    return new int[]{};
  }
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
    int target = sc.nextInt();
    int[] r = twoSum(nums, target);
    System.out.println(r[0] + " " + r[1]);
  }
}`,
			cpp: `#include <bits/stdc++.h>
using namespace std;
vector<int> twoSum(vector<int>& nums, int target) {
  // Write your solution here
  return {};
}
int main() {
  string line; getline(cin, line);
  istringstream iss(line);
  vector<int> nums; int x;
  while (iss >> x) nums.push_back(x);
  int target; cin >> target;
  auto r = twoSum(nums, target);
  cout << r[0] << " " << r[1] << endl;
}`,
		},
	},

	{
		id: "q2",
		title: "Valid Parentheses",
		category: "String",
		difficulty: "Easy",
		description:
			"Given a string `s` containing just `(`, `)`, `{`, `}`, `[`, `]`, determine if the input string is valid.\n\nOpen brackets must be closed by the same type and in the correct order.",
		inputFormat: "A single string of bracket characters",
		outputFormat: '"true" or "false"',
		constraints: ["1 <= s.length <= 10^4", "s consists of bracket characters only"],
		examples: [
			{ input: "()",     output: "true" },
			{ input: "()[]{}", output: "true" },
			{ input: "(]",     output: "false" },
		],
		testCases: [
			{ input: "()",     expected: "true"  },
			{ input: "()[]{}", expected: "true"  },
			{ input: "(]",     expected: "false" },
			{ input: "([)]",   expected: "false" },
			{ input: "{[]}",   expected: "true"  },
		],
		starterCode: {
			python: `import sys
def is_valid(s):
    # Write your solution here
    pass
s = sys.stdin.read().strip()
print(str(is_valid(s)).lower())`,
			javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', s => {
  function isValid(s) {
    // Write your solution here
  }
  console.log(String(isValid(s)));
});`,
			java: `import java.util.*;
public class Main {
  public static boolean isValid(String s) {
    // Write your solution here
    return false;
  }
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    System.out.println(isValid(sc.nextLine()));
  }
}`,
			cpp: `#include <bits/stdc++.h>
using namespace std;
bool isValid(string s) {
  // Write your solution here
  return false;
}
int main() {
  string s; cin >> s;
  cout << (isValid(s) ? "true" : "false") << endl;
}`,
		},
	},

	// ── MEDIUM ───────────────────────────────────────────────────────────────────
	{
		id: "q3",
		title: "Maximum Subarray",
		category: "Array",
		difficulty: "Medium",
		description:
			"Given an integer array `nums`, find the subarray with the largest sum and return its sum.",
		inputFormat: "Space-separated integers",
		outputFormat: "An integer — the maximum subarray sum",
		constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
		examples: [
			{ input: "-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "[4,-1,2,1] = 6" },
			{ input: "5 4 -1 7 8",             output: "23" },
		],
		testCases: [
			{ input: "-2 1 -3 4 -1 2 1 -5 4", expected: "6"  },
			{ input: "1",                      expected: "1"  },
			{ input: "5 4 -1 7 8",             expected: "23" },
			{ input: "-1 -2 -3",               expected: "-1" },
			{ input: "1 2 3 4 5",              expected: "15" },
		],
		starterCode: {
			python: `import sys
def max_subarray(nums):
    # Hint: Kadane's algorithm
    pass
nums = list(map(int, sys.stdin.read().strip().split()))
print(max_subarray(nums))`,
			javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', line => {
  const nums = line.split(' ').map(Number);
  function maxSubArray(nums) {
    // Write your solution here
  }
  console.log(maxSubArray(nums));
});`,
			java: `import java.util.*;
public class Main {
  public static int maxSubArray(int[] nums) {
    // Write your solution here
    return 0;
  }
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
    System.out.println(maxSubArray(nums));
  }
}`,
			cpp: `#include <bits/stdc++.h>
using namespace std;
int maxSubArray(vector<int>& nums) {
  // Write your solution here
  return 0;
}
int main() {
  string line; getline(cin, line);
  istringstream iss(line);
  vector<int> nums; int x;
  while (iss >> x) nums.push_back(x);
  cout << maxSubArray(nums) << endl;
}`,
		},
	},

	{
		id: "q4",
		title: "Coin Change",
		category: "DP",
		difficulty: "Medium",
		description:
			"You are given coins of different denominations and an integer `amount`. Return the fewest number of coins needed to make up that amount, or -1 if impossible.",
		inputFormat: "Line 1: space-separated coin denominations\nLine 2: target amount",
		outputFormat: "An integer",
		constraints: ["1 <= coins.length <= 12", "0 <= amount <= 10^4"],
		examples: [
			{ input: "1 5 10 25\n36", output: "3", explanation: "25+10+1" },
			{ input: "2\n3",           output: "-1" },
		],
		testCases: [
			{ input: "1 5 10 25\n36", expected: "3"  },
			{ input: "2\n3",           expected: "-1" },
			{ input: "1\n0",           expected: "0"  },
			{ input: "1 2 5\n11",      expected: "3"  },
		],
		starterCode: {
			python: `import sys
def coin_change(coins, amount):
    # Hint: Dynamic Programming
    pass
lines = sys.stdin.read().strip().split('\\n')
coins = list(map(int, lines[0].split()))
amount = int(lines[1])
print(coin_change(coins, amount))`,
			javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l));
rl.on('close', () => {
  const coins = lines[0].split(' ').map(Number);
  const amount = parseInt(lines[1]);
  function coinChange(coins, amount) {
    // Write your solution here
  }
  console.log(coinChange(coins, amount));
});`,
			java: `import java.util.*;
public class Main {
  public static int coinChange(int[] coins, int amount) {
    // Write your solution here
    return -1;
  }
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int[] coins = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
    int amount = sc.nextInt();
    System.out.println(coinChange(coins, amount));
  }
}`,
			cpp: `#include <bits/stdc++.h>
using namespace std;
int coinChange(vector<int>& coins, int amount) {
  // Write your solution here
  return -1;
}
int main() {
  string line; getline(cin, line);
  istringstream iss(line);
  vector<int> coins; int x;
  while (iss >> x) coins.push_back(x);
  int amount; cin >> amount;
  cout << coinChange(coins, amount) << endl;
}`,
		},
	},

	// ── HARD ─────────────────────────────────────────────────────────────────────
	{
		id: "q5",
		title: "Trapping Rain Water",
		category: "Array",
		difficulty: "Hard",
		description:
			"Given `n` non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.",
		inputFormat: "Space-separated non-negative integers (heights)",
		outputFormat: "An integer — total units of trapped water",
		constraints: ["1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
		examples: [
			{ input: "0 1 0 2 1 0 1 3 2 1 2 1", output: "6" },
			{ input: "4 2 0 3 2 5",             output: "9" },
		],
		testCases: [
			{ input: "0 1 0 2 1 0 1 3 2 1 2 1", expected: "6" },
			{ input: "4 2 0 3 2 5",             expected: "9" },
			{ input: "3 0 2 0 4",               expected: "7" },
			{ input: "1 0 1",                   expected: "1" },
			{ input: "1 2 3 4 5",               expected: "0" },
		],
		starterCode: {
			python: `import sys
def trap(height):
    # Write your solution here
    pass
height = list(map(int, sys.stdin.read().strip().split()))
print(trap(height))`,
			javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', line => {
  const height = line.split(' ').map(Number);
  function trap(height) {
    // Write your solution here
  }
  console.log(trap(height));
});`,
			java: `import java.util.*;
public class Main {
  public static int trap(int[] h) {
    // Write your solution here
    return 0;
  }
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int[] h = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
    System.out.println(trap(h));
  }
}`,
			cpp: `#include <bits/stdc++.h>
using namespace std;
int trap(vector<int>& h) {
  // Write your solution here
  return 0;
}
int main() {
  string line; getline(cin, line);
  istringstream iss(line);
  vector<int> h; int x;
  while (iss >> x) h.push_back(x);
  cout << trap(h) << endl;
}`,
		},
	},
];

/**
 * Pick a random question matching optional filters.
 * @param {{ difficulty?: string, category?: string }} filters
 */
export function getQuestion(filters = {}) {
	let pool = [...questions];
	if (filters.difficulty) {
		pool = pool.filter((q) => q.difficulty.toLowerCase() === filters.difficulty.toLowerCase());
	}
	if (filters.category && filters.category !== "Any") {
		pool = pool.filter((q) => q.category.toLowerCase() === filters.category.toLowerCase());
	}
	if (!pool.length) pool = questions; // fallback to full bank
	return pool[Math.floor(Math.random() * pool.length)];
}