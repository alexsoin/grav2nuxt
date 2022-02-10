export default function rexp(str, rexp) {
	return Array.from(str.matchAll(rexp))[0] || [];
}
