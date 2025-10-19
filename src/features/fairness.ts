export const unevenScore = ({
  sideA,
  sideB
}: {
  sideA: number[],
  sideB: number[]
}): { A: number, B: number, diff: number, fairness: number, warn: boolean } => {
  const sumA = sideA.reduce((sum, val) => sum + val, 0);
  const sumB = sideB.reduce((sum, val) => sum + val, 0);

  const diff = Math.abs(sumA - sumB);
  const maxSide = Math.max(sumA, sumB);
  const reference = Math.max(50, maxSide);

  const fairness = Math.max(0, Math.min(1, 1 - diff / reference));
  const warn = diff >= 50 || (maxSide > 0 && diff / maxSide >= 0.25);

  return {
    A: sumA,
    B: sumB,
    diff,
    fairness,
    warn
  };
};
