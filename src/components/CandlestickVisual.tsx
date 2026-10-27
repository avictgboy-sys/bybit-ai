import React from 'react';

export interface CandlestickVisualProps {
  patternId?: string;
  name?: string;
  type?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabels?: boolean;
  className?: string;
}

/**
 * High-quality SVG Candlestick Diagram Component
 * Renders accurate graphical illustrations for single, double, and triple candlestick patterns.
 */
export const CandlestickVisual: React.FC<CandlestickVisualProps> = ({
  patternId = '',
  name = '',
  type = 'BULLISH',
  size = 'sm',
  showLabels = false,
  className = '',
}) => {
  const normId = (patternId + ' ' + name).toLowerCase();

  // Size dimensions
  const dimensions = {
    xs: { width: 32, height: 32, stroke: 1.5 },
    sm: { width: 44, height: 44, stroke: 1.5 },
    md: { width: 64, height: 64, stroke: 2 },
    lg: { width: 100, height: 90, stroke: 2 },
    xl: { width: 150, height: 130, stroke: 2.5 },
  }[size];

  const greenColor = '#10b981'; // emerald-500
  const greenFill = '#10b981';
  const redColor = '#f43f5e';   // rose-500
  const redFill = '#f43f5e';
  const yellowColor = '#eab308'; // yellow-500
  const purpleColor = '#a855f7'; // purple-500
  const neutralColor = '#94a3b8'; // slate-400

  // 1. BB Breakout Hammer (Buy)
  if (normId.includes('bb-buy') || normId.includes('bb breakout green hammer')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* Lower Bollinger Band (Purple line) */}
        <line x1="5" y1="45" x2="95" y2="45" stroke={purpleColor} strokeWidth="3" strokeDasharray="4 3" />
        {/* Wick: Pierces deep below purple line */}
        <line x1="50" y1="30" x2="50" y2="92" stroke={greenColor} strokeWidth="3" strokeLinecap="round" />
        {/* Green Hammer Body (closes above lower band) */}
        <rect x="36" y="30" width="28" height="24" rx="2" fill={greenFill} stroke={greenColor} strokeWidth="2" />
        {showLabels && (
          <>
            <text x="70" y="42" fill={purpleColor} fontSize="8" fontWeight="bold">DN Band</text>
            <text x="50" y="24" fill={greenColor} fontSize="8" fontWeight="bold" textAnchor="middle">BUY</text>
          </>
        )}
      </svg>
    );
  }

  // 2. BB Breakout Inverted Hammer (Sell)
  if (normId.includes('bb-sell') || normId.includes('bb breakout inverted hammer')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* Upper Bollinger Band (Yellow line) */}
        <line x1="5" y1="55" x2="95" y2="55" stroke={yellowColor} strokeWidth="3" strokeDasharray="4 3" />
        {/* Wick: Pierces deep above yellow line */}
        <line x1="50" y1="8" x2="50" y2="70" stroke={redColor} strokeWidth="3" strokeLinecap="round" />
        {/* Red Inverted Hammer Body (closes below upper band) */}
        <rect x="36" y="46" width="28" height="24" rx="2" fill={redFill} stroke={redColor} strokeWidth="2" />
        {showLabels && (
          <>
            <text x="70" y="60" fill={yellowColor} fontSize="8" fontWeight="bold">UP Band</text>
            <text x="50" y="85" fill={redColor} fontSize="8" fontWeight="bold" textAnchor="middle">SELL</text>
          </>
        )}
      </svg>
    );
  }

  // 3. Hammer (Bullish Hammer)
  if (normId.includes('hammer') && !normId.includes('inv') && !normId.includes('shooting')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* Upper tiny wick */}
        <line x1="50" y1="12" x2="50" y2="18" stroke={greenColor} strokeWidth="3" strokeLinecap="round" />
        {/* Lower long shadow (2.5x body) */}
        <line x1="50" y1="42" x2="50" y2="92" stroke={greenColor} strokeWidth="3" strokeLinecap="round" />
        {/* Small body at top */}
        <rect x="34" y="18" width="32" height="24" rx="2" fill={greenFill} stroke={greenColor} strokeWidth="2" />
        {showLabels && (
          <text x="50" y="98" fill={greenColor} fontSize="8" fontWeight="bold" textAnchor="middle">Lower Wick 2x</text>
        )}
      </svg>
    );
  }

  // 4. Inverted Hammer (Bullish Reversal)
  if (normId.includes('inv-hammer') || normId.includes('inverted hammer')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* Long upper shadow */}
        <line x1="50" y1="8" x2="50" y2="58" stroke={greenColor} strokeWidth="3" strokeLinecap="round" />
        {/* Small lower wick */}
        <line x1="50" y1="82" x2="50" y2="88" stroke={greenColor} strokeWidth="3" strokeLinecap="round" />
        {/* Small body at bottom */}
        <rect x="34" y="58" width="32" height="24" rx="2" fill={greenFill} stroke={greenColor} strokeWidth="2" />
      </svg>
    );
  }

  // 5. Shooting Star (Bearish Reversal Pin Bar)
  if (normId.includes('shooting') || normId.includes('star-')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* Long upper shadow */}
        <line x1="50" y1="8" x2="50" y2="58" stroke={redColor} strokeWidth="3" strokeLinecap="round" />
        {/* Small lower wick */}
        <line x1="50" y1="82" x2="50" y2="88" stroke={redColor} strokeWidth="3" strokeLinecap="round" />
        {/* Small red body at bottom */}
        <rect x="34" y="58" width="32" height="24" rx="2" fill={redFill} stroke={redColor} strokeWidth="2" />
      </svg>
    );
  }

  // 6. Hanging Man (Bearish Top Reversal)
  if (normId.includes('hanging')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* Upper tiny wick */}
        <line x1="50" y1="12" x2="50" y2="18" stroke={redColor} strokeWidth="3" strokeLinecap="round" />
        {/* Lower long shadow */}
        <line x1="50" y1="42" x2="50" y2="92" stroke={redColor} strokeWidth="3" strokeLinecap="round" />
        {/* Small red body at top */}
        <rect x="34" y="18" width="32" height="24" rx="2" fill={redFill} stroke={redColor} strokeWidth="2" />
      </svg>
    );
  }

  // 7. Bullish Engulfing (Double Candle: 1 small Red, 1 huge Green)
  if (normId.includes('bull-engulf') || normId.includes('bullish engulfing')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* 1st Small Red Candle */}
        <line x1="28" y1="30" x2="28" y2="70" stroke={redColor} strokeWidth="2.5" />
        <rect x="18" y="38" width="20" height="24" rx="1.5" fill={redFill} stroke={redColor} strokeWidth="1.5" />

        {/* 2nd Large Green Candle (Engulfs 1st completely) */}
        <line x1="68" y1="10" x2="68" y2="90" stroke={greenColor} strokeWidth="3" />
        <rect x="54" y="20" width="28" height="60" rx="2" fill={greenFill} stroke={greenColor} strokeWidth="2" />
      </svg>
    );
  }

  // 8. Bearish Engulfing (Double Candle: 1 small Green, 1 huge Red)
  if (normId.includes('bear-engulf') || normId.includes('bearish engulfing')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* 1st Small Green Candle */}
        <line x1="28" y1="30" x2="28" y2="70" stroke={greenColor} strokeWidth="2.5" />
        <rect x="18" y="38" width="20" height="24" rx="1.5" fill={greenFill} stroke={greenColor} strokeWidth="1.5" />

        {/* 2nd Large Red Candle (Engulfs 1st completely) */}
        <line x1="68" y1="10" x2="68" y2="90" stroke={redColor} strokeWidth="3" />
        <rect x="54" y="20" width="28" height="60" rx="2" fill={redFill} stroke={redColor} strokeWidth="2" />
      </svg>
    );
  }

  // 9. Morning Star (Triple Candle: Red -> Small Gap Star -> Big Green)
  if (normId.includes('morning-star') || normId.includes('morning star')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* 1st Candle: Long Red */}
        <line x1="22" y1="12" x2="22" y2="72" stroke={redColor} strokeWidth="2" />
        <rect x="14" y="20" width="16" height="42" rx="1.5" fill={redFill} stroke={redColor} strokeWidth="1.5" />

        {/* 2nd Candle: Small Star / Doji at bottom */}
        <line x1="50" y1="65" x2="50" y2="92" stroke={neutralColor} strokeWidth="2" />
        <rect x="42" y="74" width="16" height="10" rx="1" fill={greenFill} stroke={greenColor} strokeWidth="1.5" />

        {/* 3rd Candle: Strong Green closing above midpoint */}
        <line x1="78" y1="16" x2="78" y2="76" stroke={greenColor} strokeWidth="2" />
        <rect x="70" y="25" width="16" height="42" rx="1.5" fill={greenFill} stroke={greenColor} strokeWidth="1.5" />
      </svg>
    );
  }

  // 10. Evening Star (Triple Candle: Green -> Small Gap Star -> Big Red)
  if (normId.includes('evening-star') || normId.includes('evening star')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* 1st Candle: Long Green */}
        <line x1="22" y1="28" x2="22" y2="88" stroke={greenColor} strokeWidth="2" />
        <rect x="14" y="38" width="16" height="42" rx="1.5" fill={greenFill} stroke={greenColor} strokeWidth="1.5" />

        {/* 2nd Candle: Small Star / Doji at top */}
        <line x1="50" y1="8" x2="50" y2="35" stroke={neutralColor} strokeWidth="2" />
        <rect x="42" y="16" width="16" height="10" rx="1" fill={redFill} stroke={redColor} strokeWidth="1.5" />

        {/* 3rd Candle: Strong Red closing below midpoint */}
        <line x1="78" y1="24" x2="78" y2="84" stroke={redColor} strokeWidth="2" />
        <rect x="70" y="33" width="16" height="42" rx="1.5" fill={redFill} stroke={redColor} strokeWidth="1.5" />
      </svg>
    );
  }

  // 11. Dragonfly Doji (T-shaped with long lower wick)
  if (normId.includes('dragonfly')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* Long lower wick */}
        <line x1="50" y1="20" x2="50" y2="90" stroke={greenColor} strokeWidth="3" strokeLinecap="round" />
        {/* Flat Top Bar */}
        <line x1="25" y1="20" x2="75" y2="20" stroke={greenColor} strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  // 12. Gravestone Doji (Inverted T-shaped with long upper wick)
  if (normId.includes('gravestone')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* Long upper wick */}
        <line x1="50" y1="10" x2="50" y2="80" stroke={redColor} strokeWidth="3" strokeLinecap="round" />
        {/* Flat Bottom Bar */}
        <line x1="25" y1="80" x2="75" y2="80" stroke={redColor} strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  // 13. Standard Doji (Cross shaped)
  if (normId.includes('doji')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* Balanced Vertical wick */}
        <line x1="50" y1="10" x2="50" y2="90" stroke={neutralColor} strokeWidth="3" strokeLinecap="round" />
        {/* Horizontal thin body */}
        <line x1="25" y1="50" x2="75" y2="50" stroke={neutralColor} strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  // 14. Marubozu Bullish (Full Green, No wicks)
  if (normId.includes('maru') && (type === 'BULLISH' || normId.includes('bull'))) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        <rect x="28" y="10" width="44" height="80" rx="3" fill={greenFill} stroke={greenColor} strokeWidth="2.5" />
      </svg>
    );
  }

  // 15. Marubozu Bearish (Full Red, No wicks)
  if (normId.includes('maru') && (type === 'BEARISH' || normId.includes('bear'))) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        <rect x="28" y="10" width="44" height="80" rx="3" fill={redFill} stroke={redColor} strokeWidth="2.5" />
      </svg>
    );
  }

  // 16. Piercing Line
  if (normId.includes('piercing')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* 1st Red Candle */}
        <line x1="30" y1="15" x2="30" y2="75" stroke={redColor} strokeWidth="2.5" />
        <rect x="18" y="25" width="24" height="42" rx="1.5" fill={redFill} stroke={redColor} strokeWidth="1.5" />

        {/* 2nd Green Candle (Opens below low, closes above 50% of 1st) */}
        <line x1="70" y1="30" x2="70" y2="90" stroke={greenColor} strokeWidth="2.5" />
        <rect x="58" y="36" width="24" height="46" rx="1.5" fill={greenFill} stroke={greenColor} strokeWidth="1.5" />
      </svg>
    );
  }

  // 17. Dark Cloud Cover
  if (normId.includes('dark cloud') || normId.includes('dark-cloud')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* 1st Green Candle */}
        <line x1="30" y1="25" x2="30" y2="85" stroke={greenColor} strokeWidth="2.5" />
        <rect x="18" y="33" width="24" height="42" rx="1.5" fill={greenFill} stroke={greenColor} strokeWidth="1.5" />

        {/* 2nd Red Candle (Opens above high, closes below 50% of 1st) */}
        <line x1="70" y1="10" x2="70" y2="70" stroke={redColor} strokeWidth="2.5" />
        <rect x="58" y="18" width="24" height="46" rx="1.5" fill={redFill} stroke={redColor} strokeWidth="1.5" />
      </svg>
    );
  }

  // 18. Three White Soldiers
  if (normId.includes('white soldiers') || normId.includes('three-white')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        <line x1="20" y1="50" x2="20" y2="90" stroke={greenColor} strokeWidth="2" />
        <rect x="12" y="58" width="16" height="26" rx="1.5" fill={greenFill} stroke={greenColor} />

        <line x1="50" y1="30" x2="50" y2="70" stroke={greenColor} strokeWidth="2" />
        <rect x="42" y="38" width="16" height="26" rx="1.5" fill={greenFill} stroke={greenColor} />

        <line x1="80" y1="10" x2="80" y2="50" stroke={greenColor} strokeWidth="2" />
        <rect x="72" y="18" width="16" height="26" rx="1.5" fill={greenFill} stroke={greenColor} />
      </svg>
    );
  }

  // 19. Three Black Crows
  if (normId.includes('black crows') || normId.includes('three-black')) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        <line x1="20" y1="10" x2="20" y2="50" stroke={redColor} strokeWidth="2" />
        <rect x="12" y="18" width="16" height="26" rx="1.5" fill={redFill} stroke={redColor} />

        <line x1="50" y1="30" x2="50" y2="70" stroke={redColor} strokeWidth="2" />
        <rect x="42" y="38" width="16" height="26" rx="1.5" fill={redFill} stroke={redColor} />

        <line x1="80" y1="50" x2="80" y2="90" stroke={redColor} strokeWidth="2" />
        <rect x="72" y="58" width="16" height="26" rx="1.5" fill={redFill} stroke={redColor} />
      </svg>
    );
  }

  // 20. Harami (Bullish / Bearish)
  if (normId.includes('harami')) {
    const isBullHarami = type === 'BULLISH' || normId.includes('bull');
    return (
      <svg
        viewBox="0 0 100 100"
        width={dimensions.width}
        height={dimensions.height}
        className={`shrink-0 ${className}`}
      >
        {/* Parent Candle (Big) */}
        <line x1="30" y1="12" x2="30" y2="88" stroke={isBullHarami ? redColor : greenColor} strokeWidth="2.5" />
        <rect
          x="16"
          y="22"
          width="28"
          height="56"
          rx="2"
          fill={isBullHarami ? redFill : greenFill}
          stroke={isBullHarami ? redColor : greenColor}
          strokeWidth="2"
        />

        {/* Baby Candle (Small inside body) */}
        <line x1="72" y1="36" x2="72" y2="64" stroke={isBullHarami ? greenColor : redColor} strokeWidth="2" />
        <rect
          x="62"
          y="42"
          width="20"
          height="16"
          rx="1.5"
          fill={isBullHarami ? greenFill : redFill}
          stroke={isBullHarami ? greenColor : redColor}
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  // Generic Default Candlestick (Bullish / Bearish / Neutral)
  const isBull = type === 'BULLISH';
  const isBear = type === 'BEARISH';
  const color = isBull ? greenColor : isBear ? redColor : neutralColor;
  const fill = isBull ? greenFill : isBear ? redFill : neutralColor;

  return (
    <svg
      viewBox="0 0 100 100"
      width={dimensions.width}
      height={dimensions.height}
      className={`shrink-0 ${className}`}
    >
      {/* Upper shadow */}
      <line x1="50" y1="10" x2="50" y2="28" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Real body */}
      <rect x="32" y="28" width="36" height="44" rx="2" fill={fill} stroke={color} strokeWidth="2" />
      {/* Lower shadow */}
      <line x1="50" y1="72" x2="50" y2="90" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};
