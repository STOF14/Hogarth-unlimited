/**
 * Natural-order comparator so "page2.jpg" sorts before "page10.jpg"
 * (plain string sort would put page10 before page2).
 */
export function naturalCompare(a: string, b: string): number {
  const chunk = (s: string) => s.match(/(\d+|\D+)/g) ?? [];
  const chunksA = chunk(a);
  const chunksB = chunk(b);
  const len = Math.max(chunksA.length, chunksB.length);

  for (let i = 0; i < len; i++) {
    const partA = chunksA[i] ?? "";
    const partB = chunksB[i] ?? "";
    const numA = Number(partA);
    const numB = Number(partB);
    const bothNumeric = !Number.isNaN(numA) && !Number.isNaN(numB);

    if (bothNumeric) {
      if (numA !== numB) return numA - numB;
    } else if (partA !== partB) {
      return partA < partB ? -1 : 1;
    }
  }
  return 0;
}
