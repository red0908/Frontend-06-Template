
export let linear = v => v
export function UnitBezier(p1x, p1y, p2x, p2y) {
  const ZERO_LIMIT = 1e-6

  // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx -bx;
    
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
      
  function sampleCurveX(t)
  {
    // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
    return ((ax * t + bx) * t + cx) * t;
  }
      
  function sampleCurveY(t)
  {
    return ((ay * t + by) * t + cy) * t;
  }
      
  function sampleCurveDerivativeX(t)
  {
    return (3 * ax * t + 2 * bx) * t + cx;
  }
      
  // Given an x value, find a parametric value it came from.
  function solveCurveX(x) {
    var t2 = x;
    var derivative;
    var x2;
    let t0;
    let t1;
    // let t2;
    // let x2;
    // let d2;
    // let i;

    // First try a few iterations of Newton's method -- normally very fast.
    for (let i = 0; i < 8; i++) {
      // f(t) - x = 0
        x2 = sampleCurveX(t2) - x;
        if (Math.abs(x2) < ZERO_LIMIT)
            return t2;
        derivative = sampleCurveDerivativeX(t2);
        if (Math.abs(derivative) < ZERO_LIMIT)
            break;
        t2 = t2 - x2 / derivative;
    }

    // Fall back to the bisection method for reliability.
    // wiki/Bisection_method
    t0 = 0;
    t1 = 1;
    t2 = x;

    if (t2 < t0)
        return t0;
    if (t2 > t1)
        return t1;

    while (t0 < t1) {
        x2 = sampleCurveX(t2) - x;
        if (Math.abs(x2 - x) < ZERO_LIMIT)
            return t2;
        if (x2 > 0)
            t1 = t2;
        else
            t0 = t2;
        t2 = (t1 - t0) / 2
    }

    // Failure.
    return t2;
  }

  function solve (x)
  {
    return sampleCurveY(solveCurveX(x));
  }
  return solve
}
export let ease = UnitBezier(.25,.1,.25,1)
export let easeIn = UnitBezier(.42,0,1,1)
export let easeOut = UnitBezier(0,0,.58,1)
export let easeInOut = UnitBezier(.42,0,.58,1)
