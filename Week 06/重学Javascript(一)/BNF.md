ArithmeticAtomExpression ::= "("<ArithmeticExpression>")" |
                             <Number>|
MultiplicativeExpression ::= <ArithmeticAtomExpression>|
                             <MultiplicativeExpression> "*" <ArithmeticAtomExpression>|
                             <MultiplicativeExpression> "/" <ArithmeticAtomExpression>|
AdditiveExpression ::= <MultiplicativeExpression>|
                       <AdditiveExpression> "+" <MultiplicativeExpression>|
                       <AdditiveExpression> "-" <MultiplicativeExpression>|
ArithmeticExpression :: = <AdditiveExpression>"EOF"

运算原子式 ::= "("<四则运算式>")" |
              <数字>|
乘法 ::= <运算原子式>|
        <乘法> "*" <运算原子式>|
        <乘法> "/" <运算原子式>|
加法 ::= <乘法>|
        <加法> "+" <乘法>|
        <加法> "-" <乘法>|
四则运算式 :: = <加法>"EOF"
