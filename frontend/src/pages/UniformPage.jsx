import { useState, useRef } from 'react'
import PageHeader from '../components/ui/PageHeader'

const PARTS = {
  beret: {
    name: 'Beret Cap', badge: 'HEADGEAR', icon: 'BRT',
    sub: 'Angle & placement guide',
    desc: 'The NCC beret is worn with the badge centered above the left eye. Excess fabric drapes neatly to the right side of the head.',
    steps: [
      'Place the beret so the badge sits 2.5 cm above the left eyebrow.',
      'Pull firmly down so it sits flat on the skull with no gaps.',
      'Drape all excess fabric to the right, just above the right ear.',
      'No hair should be visible from the front or sides.',
      'The beret must be clean and properly shaped before every parade.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample1',
  },
  hackle: {
    name: 'Hackle', badge: 'HEADGEAR ACCESSORY', icon: 'HCK',
    sub: 'Placement on cap',
    desc: 'The hackle is a decorative plume worn on the right side of the beret or cap for specific corps. Its colour identifies the regiment or wing.',
    steps: [
      'Identify your corps colour — only authorized personnel wear the hackle.',
      'Insert the hackle holder into the beret band on the right side.',
      'The plume should stand upright, angled slightly backward.',
      'Secure tightly so it does not shift during drill movements.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample_hackle',
  },
  capbadge: {
    name: 'Cap Badge', badge: 'INSIGNIA', icon: 'CBG',
    sub: 'Centering & polishing',
    desc: 'The cap badge is the NCC emblem worn at the front-center of the beret. It must be polished to a high shine before every parade.',
    steps: [
      'Center the badge horizontally on the front of the beret.',
      'It should sit 2–3 cm above the brim edge.',
      'Fasten the pin firmly through the beret fabric.',
      'Polish with Brasso or metal polish before each parade.',
      'Never wear a tarnished or damaged badge on parade.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample_badge',
  },
  scarf: {
    name: 'Neck Scarf', badge: 'NECKWEAR', icon: 'SCF',
    sub: 'Folding & wearing protocol',
    desc: 'The NCC scarf is folded into a triangle, worn around the neck with the point to the back, and knotted neatly at the front collar.',
    steps: [
      'Fold the scarf diagonally into a neat triangle.',
      'Drape it around the neck with the long edge at the top.',
      'Cross the two ends at the front and tie a single flat knot.',
      'The knot sits at the base of the throat, perfectly centered.',
      'Tuck any excess fabric under the shirt collar.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample5',
  },
  shoulder: {
    name: 'Cadet Rank', badge: 'RANK INSIGNIA', icon: 'RNK',
    sub: 'Shoulder epaulette placement',
    desc: "Shoulder rank insignia indicate the cadet's rank and must be positioned precisely on both shoulders at equal height, flush with the sleeve seam.",
    steps: [
      'Slide the epaulette onto the shoulder strap of the shirt.',
      'Position it 1 cm below the shoulder seam.',
      'Ensure both sides are at equal height — measure if unsure.',
      'The rank slide must be centered on the strap, not tilted.',
      'Polish any metal rank pips before parade.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample2',
  },
  lanyard: {
    name: 'Lace Yard (Lanyard)', badge: 'CORD', icon: 'LNY',
    sub: 'Wing-based looping guide',
    desc: 'The lanyard colour depends on your wing. It loops from the left shoulder epaulette, under the arm, and fastens to the second shirt button.',
    steps: [
      'Identify your wing colour: Army (green), Navy (blue), Air (sky blue).',
      'Loop the lanyard over the left shoulder epaulette.',
      'Bring it across the chest, under the left arm.',
      'Loop back to the front and clip to the second shirt button.',
      'Ensure the cord lies flat with no twists or tangles.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample3',
  },
  nameplate: {
    name: 'Name Plate', badge: 'IDENTIFICATION', icon: 'NMP',
    sub: 'Correct chest positioning',
    desc: 'The nameplate is placed on the right chest pocket, centered horizontally, sitting directly above the pocket flap.',
    steps: [
      'Center the nameplate horizontally above the right chest pocket.',
      'Position 3 mm above the top edge of the pocket flap.',
      'Text must be horizontal — not tilted in any direction.',
      'Pin or clip firmly so it does not shift during drill.',
      'Ensure the nameplate is clean and text is clearly legible.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample7',
  },
  nccshield: {
    name: 'NCC Badge', badge: 'EMBLEM', icon: 'SHD',
    sub: 'Placement on uniform',
    desc: 'The NCC Shield (or Corps badge) is worn on the left chest or sleeve as specified by the unit. It identifies the NCC Corps and wing.',
    steps: [
      'Sew the NCC shield on the left sleeve, 5 cm below the shoulder seam.',
      'Alternatively, pin to the left chest as per unit instructions.',
      'Ensure it is perfectly horizontal and wrinkle-free.',
      'Iron the sleeve flat before attaching the shield.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample_shield',
  },
  belt: {
    name: 'Belt with Buckle', badge: 'WAIST', icon: 'BLT',
    sub: 'Centering & polishing buckle',
    desc: 'The NCC white web belt is worn at the natural waist. The brass buckle must be centered with the shirt placket and polished to a mirror shine.',
    steps: [
      'Thread the belt through all trouser loops before tucking shirt.',
      'Center the brass buckle with the shirt button line.',
      'Tighten so the belt is firm but allows comfortable breathing.',
      'The free end points to the left after buckling.',
      'Polish the brass buckle to a mirror shine before every parade.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample4',
  },
  jhaltan: {
    name: 'Jhalar Patta', badge: 'UNIFORM FLAP', icon: 'JHT',
    sub: 'Shirt flap protocol',
    desc: 'Jhaltan refers to the shirt flap that hangs over the belt on the left side. It must be neatly folded and tucked, or left hanging as per unit orders.',
    steps: [
      'After tucking the shirt, pull out the left flap as per orders.',
      'The flap should hang straight and evenly — not bunched.',
      'Iron the flap flat before parade so it falls cleanly.',
      'During formal parade the flap is typically tucked in fully.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample_jhaltan',
  },
  kumerband: {
    name: 'Kamar Band', badge: 'WAISTBAND', icon: 'KMB',
    sub: 'Pleats must face downward',
    desc: 'The kumerband is a pleated fabric waistband worn over the shirt for formal occasions. All pleats must face downward — this is a strict protocol.',
    steps: [
      'Wrap the kumerband around the natural waist over the shirt.',
      'Ensure ALL pleats are facing downward — upward pleats are a violation.',
      'The band must fully cover the trouser waistband.',
      'Hook or velcro securely at the back, centered on the spine.',
      'It should be firm but allow full breathing without strain.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample11',
  },
  trouser: {
    name: 'Trouser', badge: 'UNIFORM BOTTOM', icon: 'TRS',
    sub: 'Creasing & length standard',
    desc: 'NCC khaki trousers must have sharp front creases and be hemmed so the bottom edge just touches the top of the boot.',
    steps: [
      'Wash, starch and iron sharp front creases before parade.',
      'The trouser hem should touch the top of the DMS boot.',
      'Ensure the fly is straight and buttoned fully.',
      'Belt loops must all be occupied before putting on the belt.',
      'No bunching or bagginess at the knees or ankles.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample_trouser',
  },
  spade: {
    name: 'Spade / Anklet', badge: 'FIELD EQUIPMENT', icon: 'SPD',
    sub: 'Carrying & attaching guide',
    desc: 'The entrenching spade is carried during field camps. Anklets are worn around the boot-trouser junction to create a neat tuck.',
    steps: [
      'For anklets: wrap around the trouser bottom above the boot.',
      'Fasten so the trouser is tucked neatly inside the boot.',
      'For the spade: fold the blade 90° and lock the hinge.',
      'Insert into the canvas carrier with the handle pointing down.',
      'Attach the carrier to the left side of the webbing belt.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample9',
  },
  dms: {
    name: 'Shoe (DMS)', badge: 'FOOTWEAR', icon: 'DMS',
    sub: 'Polishing & lacing guide',
    desc: 'Direct Moulded Sole (DMS) boots are standard NCC footwear. They must be polished to a mirror-glass shine with straight-bar military lacing.',
    steps: [
      'Remove all mud and dust with a dry brush before polishing.',
      'Apply black shoe polish in circular motions with a cloth.',
      'Buff with a soft brush until a mirror-glass shine is achieved.',
      'Lace using the straight-bar pattern — all rows must be horizontal.',
      'Tuck the bow knot inside the lacing after tying.',
    ],
    tutorial: 'https://www.youtube.com/watch?v=sample10',
  },
}

const PINS_CONFIG = [
  { part: 'beret', top: '16%', left: '23%', label: 'Beret Cap', side: 'right' },
  { part: 'hackle', top: '9%', left: '33%', label: 'Hackle', side: 'right' },
  { part: 'capbadge', top: '15.5%', left: '54%', label: 'Cap Badge', side: 'left' },
  { part: 'scarf', top: '26%', left: '52%', label: 'Neck Scarf', side: 'left' },
  { part: 'shoulder', top: '37%', left: '13%', label: 'Cadet Rank', side: 'right' },
  { part: 'lanyard', top: '29%', left: '63%', label: 'Lanyard', side: 'left' },
  { part: 'nameplate', top: '33%', left: '18%', label: 'Name Plate', side: 'right' },
  { part: 'nccshield', top: '32%', left: '67%', label: 'NCC Badge', side: 'left' },
  { part: 'belt', top: '41.5%', left: '52%', label: 'Belt', side: 'left' },
  { part: 'jhaltan', top: '50%', left: '63%', label: 'Jhalar Patta', side: 'left' },
  { part: 'kumerband', top: '45%', left: '22%', label: 'Kamar Band', side: 'right' },
  { part: 'trouser', top: '67%', left: '65%', label: 'Trouser', side: 'left' },
  { part: 'spade', top: '82%', left: '66.5%', label: 'Spade/Anklet', side: 'left' },
  { part: 'dms', top: '91%', left: '21%', label: 'Shoe (DMS)', side: 'right' },
]

export default function UniformPage() {
  const [selectedKey, setSelectedKey] = useState(null)
  const panelRef = useRef(null)

  const handleSelectPart = (key) => {
    setSelectedKey(key)
    setTimeout(() => {
      if (panelRef.current) {
        panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const selectedData = selectedKey ? PARTS[selectedKey] : null

  return (
    <div className="min-h-screen bg-army-dark text-cream flex flex-col pb-20">
      <PageHeader
        eyebrow="NSUT NCC — FIELD MANUAL"
        title="UNIFORM GUIDE"
        subtitle="Hover or tap any labelled part on the figure for the wearing guide"
      />

      <main className="flex-1 max-w-[1300px] mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT: Diagram Container */}
        <section className="w-full lg:w-[50%] flex flex-col items-center bg-army-deep/40 backdrop-blur-glass border border-gold/[0.08] p-4 md:p-6 rounded-lg shadow-2xl relative">
          <div className="absolute top-4 left-4 font-mono text-[0.65rem] text-gold/80 flex items-center gap-1.5 border border-gold/20 bg-army-dark/80 px-2.5 py-1 rounded">
            <span className="w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
            TAP A PART TO REVEAL DETAILS
          </div>

          <div className="relative w-full max-w-[380px] mx-auto mt-6 border border-gold/[0.1] rounded shadow-lg select-none bg-army-dark/60">
            <img
              src="/static/images/uniform_ref1.jpg"
              alt="NCC Uniform Reference"
              className="w-full h-auto block opacity-90 transition-opacity duration-300"
              draggable="false"
            />

            {/* Pins overlay */}
            {PINS_CONFIG.map((pin) => {
              const isActive = selectedKey === pin.part
              return (
                <button
                  key={pin.part}
                  className={`absolute group cursor-pointer focus:outline-none transition-all duration-300 ${
                    isActive ? 'scale-125 z-50' : 'z-20'
                  }`}
                  style={{ top: pin.top, left: pin.left }}
                  onClick={() => handleSelectPart(pin.part)}
                  aria-label={`Uniform part: ${pin.label}`}
                >
                  {/* Outer Pulsing Ring */}
                  <span
                    className={`absolute -inset-2.5 rounded-full border transition-all duration-300 ${
                      isActive
                        ? 'border-gold-bright bg-gold/20 scale-110 animate-pulse'
                        : 'border-gold/30 bg-gold/5 group-hover:border-gold/70 group-hover:scale-105'
                    }`}
                  />
                  {/* Central Dot */}
                  <span
                    className={`block w-2.5 h-2.5 rounded-full border transition-colors duration-300 ${
                      isActive ? 'bg-gold-bright border-white' : 'bg-gold border-army-dark group-hover:bg-gold-bright'
                    }`}
                  />

                  {/* Line + Label */}
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                      pin.side === 'right'
                        ? 'right-full flex-row-reverse mr-2'
                        : 'left-full flex-row ml-2'
                    }`}
                  >
                    {/* Line connection */}
                    <span className="w-4 h-[1px] bg-gold-bright/60" />
                    {/* Label badge */}
                    <span className="font-mono text-[0.65rem] bg-army-deep border border-gold/40 text-cream px-2 py-0.5 rounded shadow shadow-black/60">
                      {pin.label}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-xs font-mono text-ncc-muted text-center italic">
            ↑ Interact with the hotspot pins on the uniform photo
          </p>
        </section>

        {/* RIGHT: Details Panel */}
        <section
          ref={panelRef}
          className="w-full lg:w-[50%] min-h-[500px] flex flex-col bg-army-deep/60 backdrop-blur-glass border border-gold/[0.1] rounded-lg p-6 shadow-2xl transition-all duration-300 relative overflow-hidden"
        >
          {/* Decorative scanner line */}
          {selectedKey && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60 animate-glow-pulse" />
          )}

          {!selectedKey ? (
            /* DEFAULT PANEL STATE */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
              <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center mb-6 text-gold/60">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <h2 className="font-heading text-xl tracking-widest text-gold mb-2 font-bold uppercase">
                Select A Part
              </h2>
              <p className="font-mono text-[0.7rem] text-ncc-muted max-w-sm mb-8 leading-relaxed">
                Click any labelled dot on the uniform photo or select from the quick chips below to view the step-by-step wearing guide.
              </p>

              {/* Chips grid for quick selection */}
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {Object.entries(PARTS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectPart(key)}
                    className="font-mono text-[0.65rem] bg-army-green/40 hover:bg-army-green border border-gold/20 hover:border-gold/50 text-cream px-3 py-1.5 rounded transition-all duration-200 cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* DETAILED PART PANEL STATE */
            <div className="flex-1 flex flex-col animate-fade-up">
              {/* Back Button */}
              <button
                onClick={() => setSelectedKey(null)}
                className="self-start font-mono text-[0.65rem] tracking-wider text-gold hover:text-gold-bright flex items-center gap-1 border border-gold/20 hover:border-gold/40 px-3 py-1.5 rounded bg-army-dark/40 transition-colors mb-6 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                BACK TO ALL
              </button>

              <span className="font-mono text-[0.6rem] tracking-[0.2em] text-gold/80 bg-gold/10 px-2 py-0.5 rounded self-start border border-gold/15 mb-2">
                {selectedData.badge}
              </span>

              <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-wider text-cream mb-3">
                {selectedData.name}
              </h2>

              <p className="font-body text-xs md:text-sm text-ncc-muted leading-relaxed mb-6">
                {selectedData.desc}
              </p>

              <div className="h-px bg-gold/[0.1] w-full mb-6" />

              {/* Steps */}
              <div className="space-y-4 flex-1">
                <h3 className="font-mono text-[0.7rem] tracking-widest text-gold/80 mb-3 uppercase">
                  Wearing Instructions
                </h3>
                {selectedData.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded border border-gold/30 flex items-center justify-center font-mono text-[0.65rem] text-gold-bright bg-army-green/20">
                      {idx + 1}
                    </span>
                    <p className="font-body text-xs text-cream/90 leading-relaxed mt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tutorial Button */}
              {selectedData.tutorial && (
                <a
                  href={selectedData.tutorial}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center justify-center gap-2 font-mono text-xs text-army-dark bg-gold hover:bg-gold-bright font-bold py-3 px-4 rounded transition-all duration-200 shadow-md hover:shadow-gold/20"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  WATCH TUTORIAL
                </a>
              )}
            </div>
          )}
        </section>
      </main>

      {/* QUICK ACCESS GRID */}
      <section className="max-w-[1300px] mx-auto w-full px-4 md:px-8 mt-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent to-gold/40 flex-1" />
          <h2 className="font-mono text-xs tracking-[0.25em] text-gold uppercase text-center font-bold">
            All Parts Quick Access
          </h2>
          <div className="h-px bg-gradient-to-r from-gold/40 to-transparent flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(PARTS).map(([key, item]) => {
            const isSelected = selectedKey === key
            return (
              <button
                key={key}
                onClick={() => handleSelectPart(key)}
                className={`flex items-center gap-4 text-left p-4 rounded-md border backdrop-blur-glass transition-all duration-300 group cursor-pointer ${
                  isSelected
                    ? 'bg-army-green border-gold shadow-lg shadow-black/30'
                    : 'bg-army-deep/30 border-gold/10 hover:border-gold/30 hover:bg-army-deep/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-md flex items-center justify-center font-mono text-xs font-bold transition-colors duration-300 ${
                    isSelected
                      ? 'bg-gold-bright text-army-dark'
                      : 'bg-army-green/60 text-gold group-hover:bg-gold group-hover:text-army-dark'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-semibold text-cream tracking-wide group-hover:text-gold-bright transition-colors duration-200">
                    {item.name}
                  </h3>
                  <p className="font-mono text-[0.6rem] text-ncc-muted truncate mt-0.5">
                    {item.sub}
                  </p>
                </div>
                <div className="text-gold opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
