import BigNumber from "bignumber.js";

let prime = 113;
let max = 200;

class PublicKeyEncryption {
	// Good values:
	// P: 17, G: 3
	// P: 23, G: 5
	// P: 29, G: 2
	// P: 41, G: 6
	// P: 53, G: 2
	// P: 83, G: 2
	// P: 83, G: 2
	// P: 113, G: 3
	PUBLIC = {
		// P | Base | Prime number
		P_Base: 17,
		// G | Generator of P | Primitive root modulo p
		G_Generator: 3,
		// Max private key
		max: 12,
	};
	MATCHES = 0;
	SECRETS = new Map();

	sharedKey({ P1_PRIVATE, P2_PRIVATE }) {
		if (!(this.PUBLIC.G_Generator && this.PUBLIC.P_Base)) {
			console.error("VALUES CANT BE NULL");
			return false;
		}
		const bnP_Base = new BigNumber(this.PUBLIC.P_Base);
		const bnG_Generator = new BigNumber(this.PUBLIC.G_Generator);

		// Player 1 (Amazon.com)
		// const P1_PRIVATE = this.#randomNumber();
		const bnP1_POWER = bnG_Generator.exponentiatedBy(P1_PRIVATE); // g^P1_PRIVATE
		const bnP1_PN = bnP1_POWER.modulo(bnP_Base); // g^P1_PRIVATE mod p

		// Player 2 (Customer)
		// const P2_PRIVATE = this.#randomNumber();
		const bnP2_POWER = bnG_Generator.exponentiatedBy(P2_PRIVATE); // g^P2_PRIVATE
		const bnP2_PN = bnP2_POWER.modulo(bnP_Base); // g^P2_PRIVATE mod p

		// Player 1 (Amazon.com)
		const P1_SECRET = bnP2_PN.exponentiatedBy(P1_PRIVATE).modulo(bnP_Base).toNumber();

		// Player 2 (Customer)
		const P2_SECRET = bnP1_PN.exponentiatedBy(P2_PRIVATE).modulo(bnP_Base).toNumber();

		const values = {
			PRIVATE: { p1: P1_PRIVATE, p2: P2_PRIVATE },
			PN: { p1: bnP1_PN.toFixed(), p2: bnP2_PN.toFixed() },
			SECRET: { p1: P1_SECRET, p2: P2_SECRET },
			// POWER: { p1: P1_POWER, p2: P2_POWER },
		};
		if (P1_SECRET === P2_SECRET) {
			// console.log("GOOD");
			// console.log(JSON.stringify(values));
			this.MATCHES++;
			let mapKey = bnP1_PN.toNumber();
			let mapValue = this.SECRETS.get(mapKey);
			if (!mapValue) {
				mapValue = new Set();
			}
			mapValue.add(P1_PRIVATE);
			this.SECRETS.set(mapKey, mapValue);
			return values;
		} else {
			// console.log(values);
			console.error(JSON.stringify(values));
			return undefined;
		}
	}

	findPrimitiveRootNumber(n) {
		function option1() {
			let prns = [];
			let found = false;
			for (let prnTest = 2; prnTest <= 2 * n; prnTest++) {
				let values = new Set();
				for (let i = 1; i <= n - 1; i++) {
					const pow = Math.pow(prnTest, i); // prnTest ^ i
					const mod = pow % n; // (prnTest ^ i) mod n
					if (values.has(mod)) {
						break;
					}
					values.add(mod);
				}
				if (values.size === n - 1) {
					found = true;
					prns.push(prnTest);
					// console.log(`${prnTest} is Primitive root modulo ${n}`);
					// break;
				} else {
					// console.log(`${prnTest} is NOT`);
				}
			}
			// console.log(`DONE: Found: ${found}`);
			return prns;
		}

		function option2() {
			// https://www.geeksforgeeks.org/primitive-root-of-a-prime-number-n-modulo-n/
			// Javascript program to find primitive root of a given number n
			// Returns true if n is prime
			function isPrime(n) {
				// Corner cases
				if (n <= 1) return false;
				if (n <= 3) return true;
				// This is checked so that we can skip
				// middle five numbers in below loop
				if (n % 2 == 0 || n % 3 == 0) return false;
				for (let i = 5; i * i <= n; i = i + 6) if (n % i == 0 || n % (i + 2) == 0) return false;
				return true;
			}
			/* Iterative Function to calculate (x^n)%p in O(log y) */
			function power(x, y, p) {
				let res = 1; // Initialize result
				x = x % p; // Update x if it is more than or equal to p
				while (y > 0) {
					// If y is odd, multiply x with result
					if (y & 1) res = (res * x) % p;
					// y must be even now
					y = y >> 1; // y = y/2
					x = (x * x) % p;
				}
				return res;
			}
			// Utility function to store prime factors of a number
			function findPrimefactors(s, n) {
				// Print the number of 2s that divide n
				while (n % 2 == 0) {
					s.add(2);
					n = n / 2;
				}
				// n must be odd at this point. So we can skip
				// one element (Note i = i +2)
				for (let i = 3; i <= Math.sqrt(n); i = i + 2) {
					// While i divides n, print i and divide n
					while (n % i == 0) {
						s.add(i);
						n = n / i;
					}
				}
				// This condition is to handle the case when
				// n is a prime number greater than 2
				if (n > 2) s.add(n);
			}
			// Function to find smallest primitive root of n
			function findPrimitive(n) {
				let s = new Set();
				// Check if n is prime or not
				if (isPrime(n) == false) return -1;
				// Find value of Euler Totient function of n
				// Since n is a prime number, the value of Euler
				// Totient function is n-1 as there are n-1
				// relatively prime numbers.
				let phi = n - 1;
				// Find prime factors of phi and store in a set
				findPrimefactors(s, phi);
				// Check for every number from 2 to phi
				for (let r = 2; r <= phi; r++) {
					// Iterate through all prime factors of phi.
					// and check if we found a power with value 1
					let flag = false;
					for (let it of s) {
						// Check if r^((phi)/primefactors) mod n
						// is 1 or not
						if (power(r, phi / it, n) == 1) {
							flag = true;
							break;
						}
					}
					// If there was no power with value 1.
					if (flag == false) return r;
				}
				// If no primitive root found
				return -1;
			}
			// Driver code
			return findPrimitive(n);
		}

		function option3() {
			let prn = null;
			let found = false;
			for (let prnTest = 2; prnTest <= n - 1; prnTest++) {
				let values = new Set();
				for (let i = 1; i <= n - 1; i++) {
					const bnPrnTest = new BigNumber(prnTest);
					const bnPow = bnPrnTest.exponentiatedBy(i); // prnTest ^ i
					const bnMod = bnPow.modulo(n); // (prnTest ^ i) mod n
					const mod = bnMod.toNumber();
					if (values.has(mod)) {
						break;
					}
					values.add(mod);
				}
				if (values.size === n - 1) {
					found = true;
					prn = prnTest;

					break;
				} else {
					// console.log(`${prnTest} is NOT`);
				}
			}
			// console.log(`DONE: Found: ${found}`);
			return prn;
		}

		let prn = option2();
		console.log(`${prn} is Primitive root modulo ${n}`);
		return prn;
	}
}

// // Video
// let pke = new PublicKeyEncryption();
// pke.PUBLIC.P_Base = 17;
// pke.PUBLIC.G_Generator = 3;
// pke.PUBLIC.max = 10;
// let values = pke.sharedKey({ P1_PRIVATE: 15, P2_PRIVATE: 13 });
// console.log(values);

let worked = true;
let pke = new PublicKeyEncryption();
let prn = pke.findPrimitiveRootNumber(prime);
pke.PUBLIC.P_Base = prime;
pke.PUBLIC.G_Generator = prn;
pke.PUBLIC.max = max;
// console.log(`Trying: P: ${pke.PUBLIC.P_Base}, G:  ${pke.PUBLIC.G_Generator}, max: ${max}`);
for (let P1_PRIVATE = 1; P1_PRIVATE <= max; P1_PRIVATE++) {
	for (let P2_PRIVATE = 1; P2_PRIVATE <= max; P2_PRIVATE++) {
		if (pke.sharedKey({ P1_PRIVATE, P2_PRIVATE })) {
			// OK
		} else {
			worked = false;
			break;
		}
	}
}
console.log(`MATCHES: ${pke.MATCHES} (${Math.sqrt(pke.MATCHES)})`);
console.log(`SECRETS: ${Array.from(pke.SECRETS.keys()).length}`);
if (worked) {
	console.log(`WORKED:P: ${pke.PUBLIC.P_Base}, G: ${pke.PUBLIC.G_Generator}, max: ${max}`);
} else {
	console.error("FAILED");
}
console.warn("DONE");
