export const SHOT_TYPES = [
  // Full names with abbreviations
  "Extreme Wide Shot (EWS)",
  "Wide Shot (WS)",
  "Full Shot (FS)",
  "Medium Wide Shot (MWS)",
  "Medium Shot (MS)",
  "Medium Close-up",
  "Close-Up (CU)",
  "Over-the-Shoulder Shot (OTS)",
  "Point-of-View Shot (POV)",

  // Common variations
  "Extreme Wide Shot",
  "Wide Shot",
  "Full Shot",
  "Medium Wide Shot",
  "Medium Shot",
  "Close-Up",
  "Close up",
  "Extreme Close-Up",
  "Macro shot",
  "Aerial shot",
  "Bird's-Eye View shot",
  "Worm's-Eye View",
  "Over-the-Shoulder Shot",
  "Point-of-View Shot"
] as const;

export const CAMERA_ANGLES = [
  // Standard Angles First
  "Eye-Level Angle",
  "High Angle",
  "Low Angle",
  // Extreme Angles
  "Overhead Angle / Bird's Eye View",
  "Worm's Eye View",
  "Extreme High Angle",
  "Extreme Low Angle",
  // Creative Angles
  "Dutch Angle / Tilted Angle",
  "Over-the-Shoulder Angle",
  "Point of View (POV) Angle",
  // Height-Based Angles
  "Shoulder-Level Angle",
  "Hip-Level Angle",
  "Knee-Level Angle",
  "Ground-Level Angle",
  // Movement-Based Angles
  "Crane Angle",
  "Tracking Angle",
  "Handheld Angle",
  // Special Angles
  "Reverse Angle",
  "Close Combat Angle",
  "Extreme Perspective Angle"
] as const;

// Update FILM_GENRES to prioritize cinematic styles
export const FILM_GENRES = [
  // Modern Cinema
  "Modern Drama",
  "Epic Fantasy",
  "Film Noir",
  "Disney 3D Animation",
  "Futuristic Fantasy",
  // Other Cinematic Styles (Alphabetically)
  "Action Blockbuster",
  "Anime",
  "Art House Cinema",
  "Cyberpunk",
  "Dark Fantasy",
  "Documentary Style",
  "French New Wave",
  "German Expressionism",
  "Gothic Horror",
  "Historical Epic",
  "Horror",
  "Italian Neorealism",
  "Magical Realism",
  "Neo-Noir",
  "Period Drama",
  "Pixar Style",
  "Post-Apocalyptic",
  "Psychological Thriller",
  "Science Fiction",
  "Space Western",
  "Spaghetti Western",
  "Stop Motion",
  "Surrealist",
  "Tech Noir",
  "Urban Fantasy",
  "War Film",
  "Western"
] as const;

export const SCENE_TEMPLATES = [
  {
    description: "Through a shattered mirror, a ballet dancer rehearses in an abandoned theater, dust particles catching the last rays of sunset through broken windows",
    genre: "Drama",
    shotType: "Medium Long Shot",
    cameraAngle: "Dutch Angle",
    parameters: {
      camera: "ARRI ALEXA",
      lens: "Anamorphic",
      lighting: "golden hour lighting",
      mood: "melancholic reflective mood",
      style: "Emmanuel Lubezki",
      filmStock: "Kodak Vision3 500T",
      colorPalette: "muted earth tones"
    },
    generatedPrompt: "Cinematic, fine art photography, graceful ballet dancer in torn practice clothes, rehearsing ethereal movements, Medium Long Shot, Dutch Angle, decaying vintage theater with shattered mirrors, golden sunset hour streaming through broken windows, classical ballet aesthetic with modern decay, Emmanuel Lubezki, ARRI ALEXA, Anamorphic, Kodak Vision3 500T, golden hour lighting with dust particles, muted earth tones, melancholic reflective mood --ar 16:9 --style raw"
  },
  {
    description: "In a brutalist concrete hallway, rain cascades down through a geometric skylight, creating abstract light patterns on a solitary figure in red",
    genre: "Psychological Thriller",
    shotType: "Low Angle",
    cameraAngle: "Worm's Eye View",
    parameters: {
      camera: "Sony Venice",
      lens: "Ultra Wide 14mm",
      lighting: "rembrandt lighting",
      mood: "mysterious enigmatic mood",
      style: "Christopher Doyle",
      filmStock: "Kodak Vision3 500T",
      colorPalette: "cold steel blues"
    },
    generatedPrompt: "Cinematic, architectural photography, solitary figure in flowing red dress, standing motionless, Low Angle, Worm's Eye View, brutalist concrete hallway with geometric patterns, rainy afternoon with dramatic shadows, minimalist modernist architecture, Christopher Doyle, Sony Venice, Ultra Wide 14mm, Kodak Vision3 500T, rembrandt lighting with rain reflections, cold steel blues, mysterious enigmatic mood --ar 16:9 --style raw"
  },
  // Add more templates here...
] as const;

export const CAMERA_TYPES = [
  // Standard Digital Cameras First
  "ARRI ALEXA",
  // Other Cameras Alphabetically
  "IMAX",
  "Panavision DXL2",
  "RED EPIC",
  "Sony Venice"
] as const;

export const LENS_TYPES = [
  // Standard Lenses First
  "Standard 50mm",
  // Other Lenses Alphabetically
  "Anamorphic",
  "Macro",
  "Portrait 85mm",
  "Telephoto 135mm",
  "Ultra Wide 14mm",
  "Wide 24mm"
] as const;

export const LIGHTING_SETUPS = [
  // Natural Lighting First
  "natural ambient lighting",
  // Other Lighting Setups Alphabetically
  "blue hour lighting",
  "golden hour lighting",
  "high key lighting",
  "low key lighting",
  "neon lighting",
  "noir lighting",
  "practical lighting",
  "rembrandt lighting",
  "split lighting"
] as const;

export const MOOD_TYPES = [
  // Neutral/Natural Moods First
  "natural contemplative mood",
  "peaceful serene mood",
  // Other Moods Alphabetically
  "dramatic intense mood",
  "energetic dynamic mood",
  "ethereal dreamlike mood",
  "haunting mysterious mood",
  "melancholic reflective mood",
  "mysterious enigmatic mood",
  "nostalgic reminiscent mood",
  "romantic passionate mood",
  "tense suspenseful mood"
] as const;

export const STYLE_REFERENCES = [
  // Directors Alphabetically
  "Agnès Varda",
  "Akira Kurosawa",
  "Alejandro González Iñárritu",
  "Alfred Hitchcock",
  "Andrei Tarkovsky",
  "Apichatpong Weerasethakul",
  "Bong Joon-ho",
  "Bradford Young",
  "Brian De Palma",
  "Chloé Zhao",
  "Christopher McQuarrie",
  "Christopher Nolan",
  "Claudio Miranda",
  "Clint Eastwood",
  "Coen Brothers",
  "Dan Laustsen",
  "Darren Aronofsky",
  "David Fincher",
  "David Lynch",
  "Denis Villeneuve",
  "Emmanuel Lubezki",
  "Federico Fellini",
  "Francis Ford Coppola",
  "Gaspar Noé",
  "George Lucas",
  "Greig Fraser",
  "Guillermo del Toro",
  "Hayao Miyazaki",
  "Hoyte van Hoytema",
  "Ingmar Bergman",
  "James Cameron",
  "Jane Campion",
  "Janusz Kamiński",
  "Jean-Luc Godard",
  "Jean-Pierre Jeunet",
  "John Carpenter",
  "Ken Loach",
  "Lars von Trier",
  "Lina Wertmüller",
  "Linus Sandgren",
  "Luchino Visconti",
  "Luis Buñuel",
  "Łukasz Żal",
  "Martin Scorsese",
  "Matthew Libatique",
  "Michael Haneke",
  "Natalie Portman",
  "Newton Thomas Sigel",
  "Oliver Stone",
  "Orson Welles",
  "Park Chan-wook",
  "Paul Thomas Anderson",
  "Pedro Almodóvar",
  "Quentin Tarantino",
  "Rainer Werner Fassbinder",
  "Ridley Scott",
  "Robert Richardson",
  "Roberto Rossellini",
  "Roger Deakins",
  "Sam Peckinpah",
  "Satoshi Kon",
  "Sergei Eisenstein",
  "Sofia Coppola",
  "Spike Jonze",
  "Spike Lee",
  "Stanley Kubrick",
  "Steven Spielberg",
  "Terrence Malick",
  "Tim Burton",
  "Victor Fleming",
  "Vittorio Storaro",
  "Wes Anderson",
  "Wong Kar-wai",
  "Woody Allen",
  "Yasujirō Ozu",
  "Yorgos Lanthimos"
] as const;

export const FILM_STOCK = [
  // Kodak Vision3 Series
  "Kodak Vision3 50D",
  "Kodak Vision3 200T",
  "Kodak Vision3 250D",
  "Kodak Vision3 500T",
  "Kodak Vision3 800T",

  // Kodak Vision2 Series
  "Kodak Vision2 100T",
  "Kodak Vision2 200T",
  "Kodak Vision2 250D",
  "Kodak Vision2 500T",

  // Kodak Vision Series
  "Kodak Vision 100T",

  // Other Kodak Professional Stocks
  "Kodak Portra 160",
  "Kodak Portra 400",
  "Kodak Portra 800",
  "Kodak Ektar 100",
  "Kodak Ektachrome",
  "Kodak Double X",
  "Kodak Plus-X",
  "Kodak Tri-X",
  "Kodak T-Max 400",

  // Fujifilm Professional Series
  "Fujifilm Eterna 100T",
  "Fujifilm Eterna 200D",
  "Fujifilm Eterna 500T",
  "Fujifilm Pro 400H",
  "Fujifilm Pro 160C",
  "Fujifilm Pro 160NS",
  "Fujifilm Superia XTRA 400",
  "Fujifilm Velvia 50",
  "Fujifilm Velvia 100",
  "Fujifilm Neopan 100 Acros",
  "Fuji Neopan 1600",

  // Ilford Series
  "Ilford Delta 3200",
  "Ilford Delta 100",
  "Ilford Delta 400",
  "Ilford HP5 Plus",
  "Ilford FP4 Plus",

  // CineStill
  "Cinestill 800T",
  "Cinestill 50D",

  // Other Manufacturers
  "Agfa Scala 200x II",
  "Agfa DuPont Fine Grain Stock",
  "Arriflex Ultra 800",
  "ORWO NP-11",
  "Tasma Panchromatic",
  "Konica Century 50D"
] as const;

export const COLOR_PALETTES = [
  // Natural/Realistic Palettes First
  "Natural Colors",
  // Other Palettes Alphabetically
  "Cold Steel Blues",
  "Golden Age Hollywood",
  "High Contrast B&W",
  "Monochromatic",
  "Muted Earth Tones",
  "Neo-Tokyo Cyberpunk",
  "Neon Noir",
  "Pastel Dream",
  "Vibrant Technicolor",
  "Vintage Sepia"
] as const;

export const PHOTOGRAPHY_STYLES = [
  // Base Photography Types
  "Documentary Photography",    // For realistic, candid moments
  "Portrait Photography",       // For people-focused shots
  "Landscape Photography",      // For nature and scenic views
  "Street Photography",        // For urban life and candid city shots
  "Fashion Photography",       // For style and clothing focused
  "Product Photography",       // For commercial and item focused
  "Wildlife Photography",      // For nature and animal focused
  "Macro Photography",         // For extreme close-ups
  "Architecture Photography",  // For buildings and structures
  "Editorial Photography",     // For magazine/news style
  "Sports Photography",        // For action and athletic events
  "Still Life Photography",    // For arranged inanimate objects
  "Event Photography",         // For social gatherings and ceremonies
  "Pet Photography",           // For domestic animals
  "Food Photography",          // For culinary subjects
  "Travel Photography",        // For location-based stories
  "Aerial Photography",        // For drone/high angle views
  "Fine Art Photography",      // For artistic expression
  "Photojournalism",          // For news and documentary
  "Night Photography"          // For low-light and evening shots
] as const;

export const CAMERA_MOVEMENTS = [
  "Static Shot",
  "Track Left",
  "Track Right",
  "Pan Left",
  "Pan Right",
  "Dolly In",
  "Dolly Out",
  "Zoom In",
  "Zoom Out",
  "Tilt Up",
  "Tilt Down",
  "Crane Shot",
  "Steadicam Shot",
  "Handheld Shot",
  "Roll Shot",
  "Arc Shot",
  "Push In",
  "Pull Out",
  "Whip Pan",
  "Swish Pan",
  "Pedestal Up",
  "Pedestal Down",
  "Bird's Eye View",
  "Flyover Shot",
  "Chase Shot",
  "Establishing Aerial Shot",
  "Tracking Shot"
] as const;

export const PHOTOGRAPHY_GENRES = [
  "Abstract Photography",
  "Action Photography",
  "Adventure Photography",
  "Aerial Photography",
  "Architectural Photography",
  "Astrophotography",
  "Candid Photography",
  "Car Photography",
  "Celebrity Portraiture",
  "Concert Photography",
  "Conceptual Photography",
  "Corporate Photography",
  "Cyberpunk Photography",
  "Documentary Photography",
  "Editorial Photography",
  "Environmental Photography",
  "Environmental Portraiture",
  "Experimental Photography",
  "Fantasy Photography",
  "Fashion Editorials",
  "Fashion Photography",
  "Fashion Portraits",
  "Film Still Photography",
  "Fine Art Photography",
  "Food Photography",
  "Forensic Photography",
  "Gothic Photography",
  "Historical Photography",
  "Horror Photography",
  "Industrial Photography",
  "Infrared Photography",
  "Interior Design Photography",
  "Landscape Photography",
  "Lifestyle Photography",
  "Light Painting",
  "Macro Photography",
  "Medical Photography",
  "Microscopy Photography",
  "Minimalist Photography",
  "Multiple Exposure Photography",
  "Motorsport Photography",
  "Noir Photography",
  "Pinhole Photography",
  "Product Photography",
  "Real Estate Photography",
  "SciFi Photography",
  "Selfie Photography",
  "SelfPortraiture",
  "Social Documentary Photography",
  "Sports Photography",
  "Street & Urban Photography",
  "Street Photography",
  "Surreal Photography",
  "Traditional Portrait Photography",
  "Travel Photography",
  "Underwater Photography",
  "War Photography",
  "Wedding Photography",
  "Western Photography",
  "Wildlife Photography"
] as const;

export const AESTHETICS = [
  // Historical Art Movements
  "Abstract Expressionist Aesthetic",
  "Art Brut Aesthetic",
  "Baroque Aesthetic",
  "Bauhaus Aesthetic",
  "Byzantine Aesthetic",
  "Constructivist Aesthetic",
  "Cubist Aesthetic",
  "De Stijl Aesthetic",
  "Gothic Revival Aesthetic",
  "Impressionist Aesthetic",
  "Medieval Aesthetic",
  "Metaphysical Aesthetic",
  "Neoclassical Aesthetic",
  "Op Art Aesthetic",
  "Pop Art Aesthetic",
  "Pre-Raphaelite Aesthetic",
  "Renaissance Aesthetic",
  "Rococo Aesthetic",
  "Romanticism Aesthetic",
  "Victorian Aesthetic",
  "Victorian Gothic Aesthetic",

  // Modern Aesthetics
  "Bohemian Aesthetic",
  "Dreamcore Aesthetic",
  "Industrial Aesthetic",
  "Liminal Space Aesthetic",
  "Maximalist Aesthetic",
  "Minimalist Monochrome Aesthetic",
  "Psychedelic Aesthetic",
  "Retro Futurist Aesthetic",

  // Photography Aesthetics
  "Hyper-Realistic Aesthetic",
  "Naturalistic Aesthetic",
  "Documentary Aesthetic",
  "Soft Focus Aesthetic",
  "High-Contrast Aesthetic",
  "Film-Look Aesthetic",
  "Cinematic Realism Aesthetic",
  "Studio Photography Aesthetic",
  "Editorial Aesthetic",
  "Lifestyle Aesthetic",
  "Vintage Film Aesthetic",
  "Desaturated Gritty Aesthetic",
  "Dreamlike Soft Light Aesthetic",

  // Art Aesthetics
  "Steampunk Aesthetic",
  "Dieselpunk Aesthetic",
  "Cyberpunk Aesthetic",
  "Solarpunk Aesthetic",
  "Art Nouveau Aesthetic",
  "Art Deco Aesthetic",
  "Surrealist Aesthetic",
  "Expressionist Aesthetic",
  "Minimalist Aesthetic",
  "Brutalist Aesthetic",
  "Postmodern Aesthetic",
  "Retro-Futurism Aesthetic",
  "Neon Noir Aesthetic",
  "Dark Academia Aesthetic",
  "Cottagecore Aesthetic",
  "Vaporwave Aesthetic",

  // Experimental Aesthetics
  "Infrared Aesthetic",
  "Ultraviolet Aesthetic",
  "Multiple Exposure Aesthetic",
  "Long Exposure Aesthetic",
  "Pinhole Camera Aesthetic",
  "Light Painting Aesthetic",
  "Silhouette Aesthetic",
  "Negative Space Aesthetic",
  "Monochrome Aesthetic",
  "Duotone Aesthetic"
] as const;

export const ILLUSTRATION_TYPES = [
  // Priority Animation Styles First
  "Pixar-style animation",
  "Disney-style animation",
  "DreamWorks-style animation",
  "Ghibli-style animation",
  "Anime-style animation",
  "Stop-motion animation",
  "Claymation animation",
  "Cel-shaded animation",
  "Frame-by-frame hand-drawn animation",
  "Rotoscope animation",
  "Watercolor animation",
  "Oil-painted animation",
  "Pencil sketch animation",
  "Low-poly 3D animation",
  "Comic book animation",
  "Paper cut-out animation",
  "Silhouette animation",
  "Pixel art animation",
  "Vector animation",
  "Minimalist flat animation",
  "Neon cyberpunk animation",
  "VHS anime-style animation",
  "Graffiti-style animation",

  // Then other illustration types
  "Watercolor illustration",
  "Ink sketch illustration",
  "Pencil drawing illustration",
  "Oil painting illustration",
  "Gouache illustration",
  "Acrylic painting illustration",
  "Digital painting illustration",
  "Vector illustration",
  "Flat illustration",
  "Minimalist illustration",
  "Vintage illustration",
  "Art Nouveau illustration",
  "Art Deco illustration",
  "Storybook illustration",
  "Children's book illustration",
  "Fantasy illustration",
  "Sci-fi illustration",
  "Cyberpunk illustration",
  "Dark fantasy illustration",
  "Noir illustration",
  "Surrealist illustration",
  "Expressionist illustration",
  "Ukiyo-e illustration",
  "Steampunk illustration",
  "Retro comic book illustration",
  "Pop art illustration",
  "Psychedelic illustration",
  "Chalkboard illustration",
  "Pastel illustration",
  "Neon glow illustration",
  "Cut-out paper illustration",
  "Graffiti-style illustration",
  "Mosaic illustration",
  "Embroidery illustration"
] as const;

export const ANIMATION_STUDIOS = [
  "Aardman Animation Style",
  "Alphonse Mucha Style",
  "Anime Style",
  "Anthony Browne Style",
  "Anime OVA 90s Style",
  "Archie Comics Style",
  "Aubrey Beardsley Style",
  "Banksy Style",
  "Beatrix Potter Style",
  "Bande Dessinée Style",
  "Blue Sky Studios Style",
  "Blender Stylized 3D Style",
  "Blur Studio Style",
  "Bones Animation Style",
  "Brian Selznick Style",
  "Cartoon Network Animation Style",
  "Chris Van Allsburg Style",
  "David McKee Style",
  "Disney Animation Style",
  "Disney 2D Animation Style",
  "Disney 3D Animation Style",
  "Disney Animation Studios",
  "Disney Style",
  "Dr. Seuss (Theodor Geisel) Style",
  "DreamWorks Animation",
  "DreamWorks Animation Style",
  "E. H. Shepard Style",
  "Emily Gravett Style",
  "Eric Carle Style",
  "European Comic Art Style",
  "Fleischer Studios Style",
  "Frank Frazetta Style",
  "Garth Williams Style",
  "Ghibli Studios",
  "Gustav Klimt Style",
  "H.R. Giger Style",
  "Hayao Miyazaki Style",
  "Illumination Entertainment",
  "Illumination Entertainment Style",
  "Industrial Light & Magic (ILM) Animation Style",
  "Jackson Pollock Style",
  "Jan Brett Style",
  "Jean Giraud Style",
  "Jill Barklem Style",
  "Jon Klassen Style",
  "Junji Ito Style",
  "Katsuhiro Otomo Style",
  "Keith Haring Style",
  "Kentaro Miura Style",
  "Kyoto Animation Style",
  "Laika Studios",
  "Laika Stop-Motion Style",
  "Lane Smith Style",
  "Leo Lionni Style",
  "Looney Tunes Animation Style",
  "Ludwig Bemelmans Style",
  "MAPPA Animation Style",
  "Madhouse",
  "Manga Style",
  "Mary Blair Style",
  "Maurice Sendak Style",
  "Mo Willems Style",
  "Netflix Animation Style",
  "Nickelodeon Animation Style",
  "Oliver Jeffers Style",
  "Pablo Picasso Style",
  "Pixar Animation Style",
  "Pixar 3D Animation Style",
  "Pixar Studios",
  "Pixar Style",
  "Quentin Blake Style",
  "Richard Scarry Style",
  "Salvador Dalí Style",
  "Shaun Tan Style",
  "Sony Animation Style",
  "Sony Pictures Animation Style",
  "Studio Ghibli Animation Style",
  "Studio Trigger",
  "Studio Wit",
  "Sunrise Animation Style",
  "Tasha Tudor Style",
  "Toei Animation Style",
  "Tomie dePaola Style",
  "Trigger Animation Style",
  "UFOTABLE",
  "Unreal Engine Cinematic Style",
  "Warner Bros. Animation Style"
] as const;

export const RENDERING_ENGINES = [
  "Arnold Renderer",
  "Blender Cycles",
  "Cinema 4D",
  "Corona Renderer",
  "Houdini",
  "KeyShot",
  "Maya",
  "Mental Ray",
  "RenderMan",
  "Unreal Engine",
  "V-Ray",
  "ZBrush"
] as const;