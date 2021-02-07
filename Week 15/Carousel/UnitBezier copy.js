class UnitBezier
{
    constructor(x1, y1, x2, y2)
    {
        // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
        this._cx = 3.0 * x1;
        this._bx = 3.0 * (x2 - x1) - this._cx;
        this._ax = 1.0 - this._cx - this._bx;

        this._cy = 3.0 * y1;
        this._by = 3.0 * (y2 - y1) - this._cy;
        this._ay = 1.0 - this._cy - this._by;
    }

    // Public

    solve(x, epsilon)
    {
        return this._sampleCurveY(this._solveCurveX(x, epsilon));
    }

    // Private

    _sampleCurveX(t)
    {
        // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
        return ((this._ax * t + this._bx) * t + this._cx) * t;
    }

    _sampleCurveY(t)
    {
        return ((this._ay * t + this._by) * t + this._cy) * t;
    }

    _sampleCurveDerivativeX(t)
    {
        return (3.0 * this._ax * t + 2.0 * this._bx) * t + this._cx;
    }

    // Given an x value, find a parametric value it came from.
    _solveCurveX(x, epsilon)
    {
        var t0, t1, t2, x2, d2, i;

        // First try a few iterations of Newton's method -- normally very fast.
        for (t2 = x, i = 0; i < 8; i++) {
            x2 = this._sampleCurveX(t2) - x;
            if (Math.abs(x2) < epsilon)
                return t2;
            d2 = this._sampleCurveDerivativeX(t2);
            if (Math.abs(d2) < 1e-6)
                break;
            t2 = t2 - x2 / d2;
        }

        // Fall back to the bisection method for reliability.
        t0 = 0.0;
        t1 = 1.0;
        t2 = x;

        if (t2 < t0)
            return t0;
        if (t2 > t1)
            return t1;

        while (t0 < t1) {
            x2 = this._sampleCurveX(t2);
            if (Math.abs(x2 - x) < epsilon)
                return t2;
            if (x > x2)
                t0 = t2;
            else
                t1 = t2;
            t2 = (t1 - t0) * 0.5 + t0;
        }

        // Failure.
        return t2;
    }
}
