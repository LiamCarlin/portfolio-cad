# PortfolioCAD 🔧

A unique portfolio website that looks and behaves like professional CAD software (SolidWorks/Onshape), but the "model" is your project catalog.

## 🎯 Core Concept

Instead of a traditional scrolling portfolio, visitors experience your work through CAD metaphors:

- **3D Viewport** = Interactive assembly of your portfolio
- **Assembly Tree** = Projects and subsystems hierarchy
- **Tabs** = Different document views (Assembly, Drawing, Timeline, Results, Media)
- **Inspect Tool** = Reveals metrics, details, and outcomes
- **Configurations** = Different versions of the same project
- **Explode View** = Interactive storytelling through component separation

## ✨ Features

### CAD-Like Interface
- Professional dark theme matching engineering software
- Top bar with File/Edit/View/Tools/Help menus
- Collapsible left panel (Assembly Tree)
- Center viewport with 3D WebGL scene
- Collapsible right panel (Inspector)
- Bottom timeline panel

### Interactive 3D Viewport
- Orbit, pan, and zoom controls
- Click-to-select parts with highlighting
- Shift-click for multi-selection with aggregated stats
- Smooth explode view slider
- Hover tooltips with part information
- Label visibility toggles

### Project Navigation
- Hierarchical assembly tree
- Search across projects, descriptions, and tools
- Category filters (Robotics, Vehicles, Software, Research)
- Click tree items to select in viewport (and vice versa)

### Inspector Panel
- Project overview with Challenge/Solution/Impact
- Individual part details
- Multi-selection aggregated metrics
- Links to GitHub, videos, CAD documents

### Timeline
- Visual milestone progression
- Hover for detailed descriptions
- Completion status indicators

### Guided Tutorial Mode
- Step-by-step walkthrough of your best work
- Condition-based progression
- Perfect for recruiters who want a quick demo

### Command Palette
- Quick access to all commands (Ctrl+P)
- Search projects, change views, toggle tools
- Keyboard shortcuts for power users

## 🎹 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-5` | Switch view tabs |
| `F` | Focus on selection |
| `E` | Toggle explode mode |
| `M` | Measure mode |
| `L` | Toggle labels |
| `S` | Select mode |
| `T` | Start tutorial |
| `Esc` | Clear selection / Close dialogs |
| `Ctrl+P` | Open command palette |

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Navigate to the project
cd portfolio-cad

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
portfolio-cad/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles & CSS variables
│   │   ├── layout.tsx       # Root layout with metadata
│   │   └── page.tsx         # Main page entry
│   ├── components/
│   │   ├── CADLayout.tsx    # Main layout orchestrator
│   │   ├── layout/
│   │   │   ├── TopBar.tsx       # Menu bar and tabs
│   │   │   ├── Toolbar.tsx      # Tool buttons and controls
│   │   │   └── CommandPalette.tsx
│   │   ├── panels/
│   │   │   ├── AssemblyTree.tsx # Project hierarchy
│   │   │   ├── Inspector.tsx    # Details panel
│   │   │   └── Timeline.tsx     # Milestone timeline
│   │   ├── viewport/
│   │   │   └── Viewport.tsx     # 3D canvas with Three.js
│   │   └── overlays/
│   │       └── TutorialOverlay.tsx
│   ├── data/
│   │   └── sampleProjects.ts    # Portfolio project data
│   └── store/
│       └── usePortfolioStore.ts # Zustand state management
├── public/                      # Static assets
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **3D Rendering**: Three.js + React Three Fiber + Drei
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React

## 📝 Customizing Your Portfolio

### Adding Projects

Edit `src/data/sampleProjects.ts` to add your projects. Each project follows this structure:

```typescript
{
  id: 'unique-id',
  name: 'Project Name',
  year: 2024,
  category: 'robotics', // robotics | vehicles | software | research | other
  description: 'Brief description',
  challenge: 'What problem did you solve?',
  solution: 'How did you solve it?',
  impact: 'What were the results?',
  role: 'Your Role',
  tools: ['Tool1', 'Tool2'],
  links: {
    github: 'https://...',
    video: 'https://...',
    onshape: 'https://...',
  },
  subsystems: [...], // Nested components
  milestones: [...], // Project timeline
  configurations: [...], // Different versions
}
```

### Subsystem Structure

Each subsystem (part) includes:

```typescript
{
  id: 'part-id',
  name: 'Part Name',
  description: 'What this component does',
  role: 'Your specific role',
  tools: ['Tools used'],
  outcomes: ['Key achievements'],
  position: [x, y, z],       // 3D position
  explodeVector: [dx, dy, dz], // Explode direction
  color: '#hex',
  children: [...], // Nested subcomponents
}
```

### Loading Real CAD Models

Replace the placeholder box geometry in `Viewport.tsx` with your actual models:

1. Export as glTF/GLB from SolidWorks or Onshape
2. Place files in `public/models/`
3. Use `useGLTF` hook from @react-three/drei

```typescript
import { useGLTF } from '@react-three/drei';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}
```

## 🎨 Theming

Colors are defined in `src/app/globals.css` using CSS variables and Tailwind classes. The design follows a professional CAD software aesthetic with:

- Dark gray backgrounds (#030712, #111827, #1f2937)
- Blue accents for selection and focus (#3b82f6)
- Clear visual hierarchy
- Professional typography

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Static Export

```bash
npm run build
# Output in .next folder
```

## 📖 Future Roadmap

- [ ] **Milestone 3**: Load real glTF models per project
- [ ] **Milestone 4**: Enhanced guided tutorial with camera animations
- [ ] **Milestone 5**: Drawing view with SVG/PDF display
- [ ] **Milestone 6**: Performance optimization & Draco compression
- [ ] **Bonus**: Simulation tab with embedded plots
- [ ] **Bonus**: Version comparison split-screen
- [ ] **Bonus**: Manufacturing process cards

## 📄 License

MIT License - feel free to use this as a template for your own portfolio.

---

Built with ❤️ using Next.js, Three.js, and a passion for mechanical engineering.
