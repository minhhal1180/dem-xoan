export function CourtyardArt() {
  return (
    <svg
      className="courtyard-art"
      viewBox="0 0 720 520"
      role="img"
      aria-label="Minh họa sân đình đêm hội với hai nhân vật hát đối đáp"
    >
      <defs>
        <pattern id="tiles" width="56" height="24" patternUnits="userSpaceOnUse">
          <path
            d="M0 24H56M28 0v12M0 12h56M0 12v12M56 12v12"
            fill="none"
            stroke="#315057"
            strokeWidth=".8"
          />
        </pattern>
        <pattern id="roof" width="13" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 8q6-8 13 0" fill="none" stroke="#436068" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="720" height="520" rx="20" fill="#142e37" />
      <circle cx="562" cy="95" r="45" fill="#e7cf91" />
      <circle cx="548" cy="82" r="40" fill="#eddaaa" />
      {[
        [72, 80],
        [203, 37],
        [375, 69],
        [656, 158],
        [636, 54],
        [100, 166],
        [440, 27],
        [306, 105],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1.7 : 1.1} fill="#a5b6b2" />
      ))}
      <path d="M0 323Q100 265 190 310t185 3 190-30 155 25V520H0Z" fill="#1b3941" />
      <path d="M77 285h510v105H77Z" fill="#10272d" />
      <path d="M130 245h391v129H130Z" fill="#6a4e39" />
      <path d="M148 252h354v111H148Z" fill="#2b3430" />
      <path d="M190 257h78v106h-78ZM378 257h78v106h-78Z" fill="#4b3931" />
      <path
        d="M205 270v79m14-79v79m14-79v79m14-79v79m145-79v79m14-79v79m14-79v79m14-79v79"
        stroke="#8d6d48"
        strokeWidth="3"
      />
      <path d="M285 260h77v103h-77Z" fill="#101e20" />
      <path d="M272 258h103v-16H272Z" fill="#bd985d" />
      <path d="M157 242v130m122-130v130m93-130v130m123-130v130" stroke="#a57a4d" strokeWidth="11" />
      <path d="M57 244Q122 238 169 178q150 45 310 0 45 61 109 66l-43 19H101Z" fill="#2e4d52" />
      <path d="M57 244Q122 238 169 178q150 45 310 0 45 61 109 66l-43 19H101Z" fill="url(#roof)" />
      <path
        d="M58 245q42 10 84-4h360q43 13 86 3M169 177q155 42 310 0"
        stroke="#8b9b84"
        strokeWidth="5"
        fill="none"
      />
      <path d="M218 176q64-11 107-60 43 49 107 60l-27 16H246Z" fill="#304e51" />
      <path d="M218 176q64-11 107-60 43 49 107 60l-27 16H246Z" fill="url(#roof)" />
      <path d="M219 177q55-9 106-61 49 50 107 61" stroke="#9b9e7d" strokeWidth="4" fill="none" />
      <path d="M323 115v-12m-5 5h12" stroke="#d1b57c" strokeWidth="3" />
      <path d="M106 374h435v13H106ZM86 388h475v13H86Z" fill="#747064" />
      <path d="M0 401H720V520H0Z" fill="url(#tiles)" />
      <path d="M0 401h720M48 520l191-119m345 119L416 401" stroke="#496063" fill="none" />
      <path d="M0 70Q335 158 720 117" fill="none" stroke="#73908a" strokeWidth="1.1" />
      {[
        [97, 94],
        [250, 122],
        [442, 134],
        [643, 127],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 0v20" stroke="#91a195" />
          <ellipse cy="36" rx="14" ry="21" fill="#c2764c" />
          <path d="M-7 17H7M-8 55H8M0 57v12" stroke="#e3ba77" strokeWidth="3" />
          <path d="M0 19v35" stroke="#e5ac61" />
        </g>
      ))}
      <g transform="translate(287 298)">
        <ellipse cx="0" cy="146" rx="37" ry="8" fill="#0b232a" opacity=".65" />
        <path d="M-20 55l-13 88h65L19 55Z" fill="#c37d4e" />
        <path d="M-10 58l-4 84H5L8 58Z" fill="#f0cd88" />
        <path
          d="M-15 63l-23 33-34-9-5 10 44 18 34-35M14 64l18 26 28-14 5 10-36 24-25-29"
          fill="#cb8b56"
        />
        <path d="M-17 13q19-14 34 0v30q-17 25-34 0Z" fill="#d6aa7e" />
        <path d="M-23 17Q-19-4 0-4T24 17Z" fill="#1b2425" />
        <path d="M-25 13q24-11 50 0v7h-50Z" fill="#804933" />
        <path d="M-8 46v12l8 11 8-11V46" fill="#d5a475" />
        <path d="M-24 142l-6 8H-5v-8m19 0v8h22l-7-8" fill="#13242a" />
        <path d="M-73 88l-8-3-4 6 7 8m141-23 10-3 3 5-10 8" fill="#d6aa7e" />
      </g>
      <g transform="translate(438 302)">
        <ellipse cx="0" cy="143" rx="36" ry="8" fill="#0b232a" opacity=".65" />
        <path d="M-18 54l-17 87h68L17 54Z" fill="#a84d42" />
        <path d="M-12 65l-8 76h37L10 65Z" fill="#d19462" />
        <path
          d="M-16 57l-17 20-25-10-4 9 30 21L-8 77m22-20 15 25 26 3-1 10-34-1-16-17"
          fill="#a84d42"
        />
        <path d="M-16 10q17-13 32 0v28q-16 24-32 0Z" fill="#d8af82" />
        <path d="M-23 11q0-24 23-24t23 24l-6 22-5-22q-11 7-23 0l-7 22Z" fill="#162328" />
        <path d="M-25 3q22-18 50 0l-2 10q-23-15-46 0Z" fill="#623d3b" />
        <path d="M-8 44v12L0 66l8-10V44" fill="#d6a878" />
        <path d="M-31 139l-7 7h29v-7m22 0v7h25l-8-7" fill="#11252c" />
        <path d="M-58 67l-10-5-3 6 10 8m116 9 9 3v7h-11" fill="#d8af82" />
        <path d="M-2 67v66" stroke="#e5b77b" strokeWidth="2" />
      </g>
      <g fill="#d8b97a" opacity=".8">
        <circle cx="93" cy="351" r="2" />
        <circle cx="591" cy="336" r="2.5" />
        <circle cx="199" cy="438" r="1.5" />
        <circle cx="619" cy="422" r="1.8" />
      </g>
      <path
        d="M-10 363q36-46 50-122m-16 44-20-38m31 7 32-20M689 391q-19-72 11-158m-9 51-23-30m28 5 26-26"
        stroke="#365957"
        strokeWidth="12"
        fill="none"
      />
      <text x="35" y="485" fill="#aebfba" fontSize="11" letterSpacing="2">
        PHÚ THỌ · MIỀN DI SẢN
      </text>
      <text x="685" y="485" textAnchor="end" fill="#aebfba" fontSize="10">
        Tranh minh họa
      </text>
    </svg>
  )
}
