import os

# Script to produce a clean, beautiful SVG vector illustration matching the attached image:
# Golden sunset sky, blue bus on GT road, detailed decorated Tata truck with hanging tassels,
# roadside Dhaba with corrugated tin roof, Sardar ji drinking tea, tea kettle with steam, and tea vendor.

svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
  <defs>
    <!-- Soft Grain / Paper Texture Filter -->
    <filter id="paperGrain" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.045 0" in="noise" result="coloredNoise"/>
      <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite"/>
      <feBlend mode="multiply" in="composite" in2="SourceGraphic"/>
    </filter>

    <!-- Golden Sunset Sky Gradients -->
    <linearGradient id="skyGolden" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5D061"/>
      <stop offset="50%" stop-color="#EBB342"/>
      <stop offset="100%" stop-color="#E29E2E"/>
    </linearGradient>

    <!-- Dirt Ground Gradients -->
    <linearGradient id="dirtGround" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#DF9E3C"/>
      <stop offset="40%" stop-color="#CD8729"/>
      <stop offset="100%" stop-color="#B0651A"/>
    </linearGradient>

    <!-- Tin Roof Stripe Pattern -->
    <pattern id="tinRoofStripes" width="16" height="16" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="16" y2="16" stroke="#9A2C1B" stroke-width="3"/>
      <line x1="0" y1="16" x2="16" y2="0" stroke="#D34C32" stroke-width="2"/>
    </pattern>

    <!-- Flower Motif Symbol for Truck -->
    <g id="truckFlower">
      <circle cx="0" cy="0" r="6" fill="#E6A125"/>
      <circle cx="-10" cy="0" r="5" fill="#C93B2B"/>
      <circle cx="10" cy="0" r="5" fill="#C93B2B"/>
      <circle cx="0" cy="-10" r="5" fill="#C93B2B"/>
      <circle cx="0" cy="10" r="5" fill="#C93B2B"/>
    </g>
  </defs>

  <!-- 1. PARCHMENT VINTAGE CANVAS BACKGROUND -->
  <rect width="1920" height="1080" fill="#FDF8EC"/>

  <!-- 2. SKY SECTION (TOP HALF) -->
  <rect x="30" y="30" width="1860" height="480" fill="url(#skyGolden)" rx="4"/>

  <!-- Soft Horizon Sun Rays & Clouds -->
  <path d="M 30 220 Q 400 180 960 210 T 1890 190 L 1890 510 L 30 510 Z" fill="#E8A932" opacity="0.4"/>
  <path d="M 30 280 Q 500 250 1100 270 T 1890 260 L 1890 510 L 30 510 Z" fill="#DE9726" opacity="0.3"/>

  <!-- Top Right Tree Canopy (Overhanging Leaves) -->
  <g id="treeCanopy" transform="translate(1250, 0)">
    <path d="M 120 0 Q 200 120 380 140 Q 520 160 640 40 L 640 0 Z" fill="#38421E"/>
    <path d="M 220 0 Q 300 90 460 110 Q 560 120 640 20 L 640 0 Z" fill="#4B5827"/>
    <path d="M 320 0 Q 400 70 520 85 Q 580 90 640 10 L 640 0 Z" fill="#627333"/>
  </g>

  <!-- 3. DISTANT MUSTARD FIELDS & GT ROAD HIGHWAY -->
  <!-- Mustard Fields Horizon -->
  <polygon points="30,450 1890,420 1890,520 30,520" fill="#DFA123"/>
  <polygon points="30,480 1890,460 1890,520 30,520" fill="#788232"/>

  <!-- Small Trees along Horizon -->
  <circle cx="90" cy="450" r="24" fill="#3D4A21"/>
  <circle cx="115" cy="445" r="18" fill="#586930"/>
  <circle cx="530" cy="455" r="20" fill="#3D4A21"/>
  <circle cx="550" cy="450" r="15" fill="#586930"/>

  <!-- GT Highway Asphalt Road (Left Half) -->
  <polygon points="30,520 620,510 620,580 30,600" fill="#3A3A3D"/>
  <!-- Road White Center Dashed Line -->
  <line x1="30" y1="560" x2="620" y2="545" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="30,20" opacity="0.85"/>

  <!-- Blue & White GT Road Bus -->
  <g id="gtBus" transform="translate(200, 440)">
    <!-- Shadow -->
    <rect x="0" y="70" width="280" height="14" rx="7" fill="#1C1A18" opacity="0.4"/>
    <!-- Lower Blue Body -->
    <rect x="10" y="38" width="260" height="34" fill="#386A8B" rx="2"/>
    <!-- Upper White Roof -->
    <rect x="10" y="10" width="260" height="28" fill="#F0F4F8" rx="4"/>
    <!-- Windows Row -->
    <rect x="25" y="22" width="26" height="18" fill="#1E3342" rx="2"/>
    <rect x="58" y="22" width="26" height="18" fill="#1E3342" rx="2"/>
    <rect x="91" y="22" width="26" height="18" fill="#1E3342" rx="2"/>
    <rect x="124" y="22" width="26" height="18" fill="#1E3342" rx="2"/>
    <rect x="157" y="22" width="26" height="18" fill="#1E3342" rx="2"/>
    <rect x="190" y="22" width="26" height="18" fill="#1E3342" rx="2"/>
    <rect x="223" y="22" width="36" height="18" fill="#1E3342" rx="2"/>
    <!-- Bus Side Text -->
    <text x="135" y="60" font-family="'Poppins', sans-serif" font-weight="800" font-size="8" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">PUNJAB ROADWAYS</text>
    <!-- Wheels -->
    <circle cx="60" cy="72" r="14" fill="#1C1A18"/>
    <circle cx="60" cy="72" r="6" fill="#B0B8C0"/>
    <circle cx="220" cy="72" r="14" fill="#1C1A18"/>
    <circle cx="220" cy="72" r="6" fill="#B0B8C0"/>
  </g>

  <!-- 4. FOREGROUND DIRT GROUND -->
  <polygon points="30,580 1890,520 1890,1050 30,1050" fill="url(#dirtGround)"/>
  <polygon points="600,600 1890,550 1890,1050 600,1050" fill="#9B5212" opacity="0.3"/>

  <!-- 5. CENTER HERO: DECORATED PUNJABI TATA TRUCK -->
  <g id="tataTruck" transform="translate(620, 160)">
    <!-- Truck Shadow -->
    <ellipse cx="280" cy="650" rx="340" ry="35" fill="#1F120A" opacity="0.5"/>

    <!-- Wooden Cargo Container (Back Side) -->
    <rect x="340" y="200" width="300" height="420" fill="#A83E28" rx="4" stroke="#5E1D10" stroke-width="4"/>
    <!-- Floral Truck Art Panels on Cargo -->
    <g id="cargoPanels">
      <line x1="410" y1="200" x2="410" y2="620" stroke="#5E1D10" stroke-width="3"/>
      <line x1="480" y1="200" x2="480" y2="620" stroke="#5E1D10" stroke-width="3"/>
      <line x1="550" y1="200" x2="550" y2="620" stroke="#5E1D10" stroke-width="3"/>

      <!-- Lotus Flower Motifs -->
      <path d="M 445 320 C 425 290, 465 290, 445 320 C 430 350, 460 350, 445 320 Z" fill="#F0A52B"/>
      <circle cx="445" cy="320" r="12" fill="#D93B2B"/>
      <path d="M 515 320 C 495 290, 535 290, 515 320 C 500 350, 530 350, 515 320 Z" fill="#F0A52B"/>
      <circle cx="515" cy="320" r="12" fill="#D93B2B"/>
    </g>

    <!-- Front Cabin Shell -->
    <!-- Crown Arch ("Matha") -->
    <path d="M 40 190 Q 210 110 380 190 L 390 230 L 30 230 Z" fill="#E6A125" stroke="#4F1A10" stroke-width="3"/>
    <path d="M 70 195 Q 210 140 350 195" stroke="#C93B2B" stroke-width="8" fill="none"/>
    <path d="M 90 190 Q 210 148 330 190" stroke="#2B6B78" stroke-width="4" fill="none"/>
    <use href="#truckFlower" x="130" y="180"/>
    <use href="#truckFlower" x="210" y="160"/>
    <use href="#truckFlower" x="290" y="180"/>

    <!-- Cabin Body -->
    <rect x="30" y="230" width="360" height="340" fill="#C93B2B" rx="12" stroke="#4F1A10" stroke-width="4"/>

    <!-- Windshield Outer Yellow Border -->
    <rect x="55" y="250" width="310" height="140" fill="#E6A125" rx="10" stroke="#704D12" stroke-width="3"/>

    <!-- Split Windows -->
    <rect x="65" y="260" width="140" height="120" fill="#92B8C7" rx="6" stroke="#1D2E38" stroke-width="3"/>
    <rect x="215" y="260" width="140" height="120" fill="#92B8C7" rx="6" stroke="#1D2E38" stroke-width="3"/>
    <!-- Glass Highlights -->
    <polygon points="75,265 130,265 90,375 75,375" fill="#FFFFFF" opacity="0.45"/>
    <polygon points="225,265 280,265 240,375 225,375" fill="#FFFFFF" opacity="0.45"/>

    <!-- Triangular Hazard Sign in Center -->
    <polygon points="210,285 190,330 230,330" fill="#E85827" stroke="#7A2203" stroke-width="2"/>

    <!-- Wipers -->
    <line x1="130" y1="375" x2="95" y2="290" stroke="#1A1A1D" stroke-width="4" stroke-linecap="round"/>
    <line x1="280" y1="375" x2="245" y2="290" stroke="#1A1A1D" stroke-width="4" stroke-linecap="round"/>

    <!-- Side Mirrors -->
    <rect x="-8" y="270" width="22" height="60" rx="4" fill="#1D2E38"/>
    <line x1="14" y1="295" x2="30" y2="295" stroke="#1D2E38" stroke-width="4"/>

    <!-- Front Grille -->
    <rect x="60" y="410" width="300" height="120" fill="#E3E8EC" rx="8" stroke="#5C6C78" stroke-width="3"/>
    <line x1="75" y1="435" x2="345" y2="435" stroke="#253540" stroke-width="3.5"/>
    <line x1="75" y1="460" x2="345" y2="460" stroke="#253540" stroke-width="3.5"/>
    <line x1="75" y1="485" x2="345" y2="485" stroke="#253540" stroke-width="3.5"/>
    <line x1="75" y1="510" x2="345" y2="510" stroke="#253540" stroke-width="3.5"/>

    <!-- TATA Chrome Emblem -->
    <circle cx="210" cy="472" r="22" fill="#225D6B" stroke="#0F2D36" stroke-width="2.5"/>
    <path d="M 198 468 L 222 468 M 210 468 L 210 482" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>

    <!-- Dual Headlights -->
    <rect x="70" y="515" width="50" height="40" rx="6" fill="#E6A125" stroke="#7A5310" stroke-width="2.5"/>
    <rect x="300" y="515" width="50" height="40" rx="6" fill="#E6A125" stroke="#7A5310" stroke-width="2.5"/>
    <circle cx="95" cy="535" r="14" fill="#FFFDF2"/>
    <circle cx="325" cy="535" r="14" fill="#FFFDF2"/>

    <!-- Bumper & Tassels -->
    <rect x="20" y="565" width="380" height="45" rx="8" fill="#C93B2B" stroke="#4F1A10" stroke-width="3.5"/>
    <!-- Yellow Caution Diagonal Stripes -->
    <polygon points="40,565 65,565 40,610 15,610" fill="#E6A125"/>
    <polygon points="110,565 135,565 110,610 85,610" fill="#E6A125"/>
    <polygon points="280,565 305,565 280,610 255,610" fill="#E6A125"/>
    <polygon points="350,565 375,565 350,610 325,610" fill="#E6A125"/>

    <!-- Hanging Nazar Tassels -->
    <g id="hangingTassels">
      <path d="M 40 610 L 40 655 L 46 668 L 34 668 Z" fill="#C93B2B"/>
      <path d="M 75 610 L 75 655 L 81 668 L 69 668 Z" fill="#E6A125"/>
      <path d="M 110 610 L 110 655 L 116 668 L 104 668 Z" fill="#225D6B"/>
      <path d="M 145 610 L 145 655 L 151 668 L 139 668 Z" fill="#586930"/>
      <path d="M 275 610 L 275 655 L 281 668 L 269 668 Z" fill="#C93B2B"/>
      <path d="M 310 610 L 310 655 L 316 668 L 304 668 Z" fill="#E6A125"/>
      <path d="M 345 610 L 345 655 L 351 668 L 339 668 Z" fill="#225D6B"/>
      <path d="M 380 610 L 380 655 L 386 668 L 374 668 Z" fill="#586930"/>
    </g>

    <!-- Wheels -->
    <rect x="25" y="585" width="60" height="115" rx="16" fill="#1C1A18" stroke="#000000" stroke-width="3"/>
    <circle cx="55" cy="642" r="12" fill="#B0B8C0"/>
    <rect x="335" y="585" width="60" height="115" rx="16" fill="#1C1A18" stroke="#000000" stroke-width="3"/>
    <circle cx="365" cy="642" r="12" fill="#B0B8C0"/>
  </g>

  <!-- 6. RIGHT HERO: HIGHWAY DHABA TEA STALL & SARDAR JI -->
  <g id="dhabaTeaStall" transform="translate(1120, 180)">
    <!-- Roof Structure -->
    <!-- Slanted Corrugated Tin Roof (Reddish-Orange) -->
    <polygon points="-40,280 580,180 540,320 -80,420" fill="#D34C32" stroke="#681F12" stroke-width="4"/>
    <polygon points="-40,280 580,180 540,320 -80,420" fill="url(#tinRoofStripes)" opacity="0.6"/>

    <!-- Wooden Pillars -->
    <rect x="50" y="320" width="22" height="460" fill="#422513" stroke="#221208" stroke-width="2"/>
    <rect x="350" y="270" width="22" height="510" fill="#422513" stroke="#221208" stroke-width="2"/>
    <rect x="520" y="240" width="22" height="540" fill="#422513" stroke="#221208" stroke-width="2"/>

    <!-- Dhaba Metal Counter & Samovar Tea Kettle -->
    <rect x="310" y="510" width="180" height="210" fill="#758590" stroke="#2D3B45" stroke-width="3" rx="4"/>
    <rect x="300" y="500" width="200" height="20" fill="#A4B3BC" stroke="#2D3B45" stroke-width="2"/>

    <!-- Large Metallic Tea Samovar / Kettle -->
    <g id="teaKettle" transform="translate(340, 380)">
      <path d="M 20 45 Q 8 80 20 105 L 90 105 Q 102 80 90 45 Z" fill="#D0D8DE" stroke="#3A4852" stroke-width="3"/>
      <ellipse cx="55" cy="45" rx="35" ry="10" fill="#EDF2F5" stroke="#3A4852" stroke-width="2.5"/>
      <circle cx="55" cy="32" r="7" fill="#1D2E38"/>
      <path d="M 12 40 C -12 0, 122 0, 98 40" fill="none" stroke="#1D2E38" stroke-width="6" stroke-linecap="round"/>
      <path d="M 85 68 Q 120 58 112 88" fill="none" stroke="#D0D8DE" stroke-width="8" stroke-linecap="round"/>

      <!-- Rising White Steam -->
      <path d="M 112 60 Q 125 35 118 10 Q 110 -15 128 -35" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.8" stroke-linecap="round"/>
      <path d="M 102 48 Q 112 28 105 5 Q 98 -15 112 -30" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.6" stroke-linecap="round"/>
    </g>

    <!-- Glass Cups on Counter -->
    <rect x="420" y="480" width="14" height="22" fill="#EAEFF2" stroke="#3A4852" stroke-width="1.5" rx="1"/>
    <rect x="440" y="482" width="14" height="20" fill="#EAEFF2" stroke="#3A4852" stroke-width="1.5" rx="1"/>

    <!-- Stainless Steel Tables & Benches -->
    <!-- Table 1 (Foreground Right) -->
    <rect x="360" y="620" width="220" height="15" fill="#B0BCC4" stroke="#3A4852" stroke-width="2"/>
    <rect x="375" y="635" width="14" height="140" fill="#687882"/>
    <rect x="550" y="635" width="14" height="140" fill="#687882"/>

    <!-- Bench 1 (Sardar Ji Sitting) -->
    <rect x="80" y="640" width="220" height="20" fill="#804B26" stroke="#381D0A" stroke-width="2.5"/>
    <rect x="95" y="660" width="18" height="110" fill="#522F16"/>
    <rect x="265" y="660" width="18" height="110" fill="#522F16"/>

    <!-- SARDAR JI SITTING DRINKING TEA -->
    <g id="sardarJi" transform="translate(150, 440)">
      <!-- Yellow Turban -->
      <path d="M 40 10 C 20 -20, 90 -20, 75 10 Z" fill="#E6A125" stroke="#80570C" stroke-width="2.5"/>
      <ellipse cx="58" cy="15" rx="25" ry="15" fill="#E6A125"/>

      <!-- Face & Beard -->
      <ellipse cx="58" cy="32" rx="14" ry="15" fill="#B86F3D"/>
      <path d="M 46 32 Q 58 58 70 32 Z" fill="#1C1815"/> <!-- Black Beard -->
      <path d="M 50 30 Q 58 24 66 30" stroke="#1C1815" stroke-width="3.5" fill="none"/>

      <!-- Brown Kurta -->
      <path d="M 32 46 L 84 46 L 96 125 L 20 125 Z" fill="#6B3C20" stroke="#381E0F" stroke-width="2.5"/>

      <!-- White Pajama Pants -->
      <rect x="30" y="125" width="22" height="85" fill="#EFECE6" stroke="#AAA293" stroke-width="2"/>
      <rect x="60" y="125" width="22" height="85" fill="#EFECE6" stroke="#AAA293" stroke-width="2"/>

      <!-- Arm & Glass of Tea -->
      <path d="M 78 55 Q 102 68 90 88" fill="none" stroke="#6B3C20" stroke-width="12" stroke-linecap="round"/>
      <rect x="86" y="82" width="12" height="18" fill="#EAEFF2" stroke="#3A4852" stroke-width="1.5"/>
      <rect x="87" y="84" width="10" height="8" fill="#C93B2B"/> <!-- Chai -->
    </g>

    <!-- TEA VENDOR (CHAIWALA) STANDING ON RIGHT -->
    <g id="teaVendor" transform="translate(520, 420)">
      <!-- Head & Hair -->
      <circle cx="20" cy="20" r="14" fill="#B86F3D"/>
      <path d="M 8 16 Q 20 4 32 16 Z" fill="#1C1815"/>
      <!-- Beige Kurta -->
      <rect x="6" y="34" width="28" height="95" rx="4" fill="#B8A982" stroke="#66593A" stroke-width="2.5"/>
      <!-- Dark Trousers -->
      <rect x="8" y="129" width="11" height="80" fill="#21323D"/>
      <rect x="21" y="129" width="11" height="80" fill="#21323D"/>
      <!-- Arm Gesture -->
      <path d="M 8 48 Q -20 62 -8 78" fill="none" stroke="#B86F3D" stroke-width="8" stroke-linecap="round"/>
    </g>
  </g>

  <!-- 7. OUTER VINTAGE PAPER BORDER -->
  <rect x="15" y="15" width="1890" height="1050" fill="none" stroke="#FDF8EC" stroke-width="30"/>
  <rect x="30" y="30" width="1860" height="1020" fill="none" stroke="#3D2817" stroke-width="2" opacity="0.3" rx="4"/>

  <!-- Texture Grain Overlay -->
  <rect width="1920" height="1080" fill="url(#tinRoofStripes)" filter="url(#paperGrain)" opacity="0.1" pointer-events="none"/>
</svg>
'''

with open('./public/punjabi_truck_bg.svg', 'w') as f:
    f.write(svg_content.strip())

print("Created exact background matching attached image at ./public/punjabi_truck_bg.svg")
