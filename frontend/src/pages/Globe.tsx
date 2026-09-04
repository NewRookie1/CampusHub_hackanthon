import { useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  ArrowLeft, Briefcase, GraduationCap, FileText, Globe as GlobeIcon, Search, RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_COUNTRIES } from '../data/mockData';
import { CONTINENT_OUTLINES } from '../data/continentData';
import GlassCard from '../components/GlassCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTheme } from '../context/ThemeContext';

interface Country {
  id: string;
  name: string;
  region: string;
  flag: string;
  lat: number;
  lng: number;
  jobs: string[];
  industries: string[];
  skills: string[];
  entranceExams: string[];
  languages: string[];
  visaInfo: { category: string; eligibility: string; process: string[]; timeline: string };
  averageSalary: string;
  topCompanies: string[];
  description: string;
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function GlobeSphere({ isDark }: { isDark: boolean }) {
  const globeRef = useRef<THREE.Group>(null);

  const continentLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    CONTINENT_OUTLINES.forEach((continent) => {
      continent.polygons.forEach((polygon) => {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i < polygon.length; i++) {
          const [lat, lng] = polygon[i];
          points.push(latLngToVector3(lat, lng, 2.01));
        }
        points.push(points[0].clone());
        lines.push(points);
      });
    });
    return lines;
  }, []);

  const continentMeshes = useMemo(() => {
    const meshes: { points: THREE.Vector3[]; id: string }[] = [];
    CONTINENT_OUTLINES.forEach((continent, ci) => {
      continent.polygons.forEach((polygon, pi) => {
        const verts: THREE.Vector3[] = [];
        for (let i = 0; i < polygon.length - 1; i++) {
          const [lat1, lng1] = polygon[i];
          const [lat2, lng2] = polygon[i + 1];
          const p1 = latLngToVector3(lat1, lng1, 2.005);
          const p2 = latLngToVector3(lat2, lng2, 2.005);
          const center = p1.clone().add(p2).multiplyScalar(0.5);
          const normal = center.clone().normalize();
          const offset = normal.multiplyScalar(0.003);
          verts.push(p1.clone().add(offset), p2.clone().add(offset));
        }
        meshes.push({ points: verts, id: `${ci}-${pi}` });
      });
    });
    return meshes;
  }, []);

  const countryMarkers = useMemo(() => {
    return MOCK_COUNTRIES.map((c) => ({
      ...c,
      position: latLngToVector3(c.lat, c.lng, 2.02),
    }));
  }, []);

  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    for (let latDeg = -60; latDeg <= 60; latDeg += 30) {
      const points: THREE.Vector3[] = [];
      for (let lngDeg = 0; lngDeg <= 360; lngDeg += 4) {
        points.push(latLngToVector3(latDeg, lngDeg, 2.001));
      }
      lines.push(points);
    }
    for (let lngDeg = 0; lngDeg < 360; lngDeg += 30) {
      const points: THREE.Vector3[] = [];
      for (let latDeg = -90; latDeg <= 90; latDeg += 4) {
        points.push(latLngToVector3(latDeg, lngDeg, 2.001));
      }
      lines.push(points);
    }
    return lines;
  }, []);

  return (
    <group ref={globeRef}>
      {/* Ocean sphere */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color={isDark ? '#0a0a1a' : '#1a1a3a'}
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.15, 64, 64]} />
        <meshBasicMaterial
          color={isDark ? '#4f46e5' : '#6366f1'}
          transparent
          opacity={isDark ? 0.06 : 0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Grid lines */}
      {gridLines.map((points, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: isDark ? '#6366f1' : '#818cf8', transparent: true, opacity: isDark ? 0.08 : 0.12 });
        const line = new THREE.Line(geometry, mat);
        return <primitive key={`grid-${i}`} object={line} />;
      })}

      {/* Continent outlines */}
      {continentLines.map((points, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: isDark ? '#6366f1' : '#4f46e5', transparent: true, opacity: isDark ? 0.4 : 0.5 });
        const line = new THREE.Line(geometry, mat);
        return <primitive key={`cont-${i}`} object={line} />;
      })}

      {/* Continent filled meshes (subtle land mass) */}
      {continentMeshes.map((mesh) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(mesh.points);
        const mat = new THREE.LineBasicMaterial({ color: isDark ? '#4f46e5' : '#6366f1', transparent: true, opacity: isDark ? 0.2 : 0.25 });
        const ls = new THREE.LineSegments(geometry, mat);
        return <primitive key={`mesh-${mesh.id}`} object={ls} />;
      })}

      {/* Country markers */}
      {countryMarkers.map((c) => (
        <CountryMarker key={c.id} country={c} isDark={isDark} />
      ))}
    </group>
  );
}

function CountryMarker({
  country,
  isDark,
}: {
  country: Country & { position: THREE.Vector3 };
  isDark: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  return (
    <group position={country.position}>
      {/* Pin dot */}
      <mesh
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); setClicked(!clicked); }}
      >
        <sphereGeometry args={[hovered || clicked ? 0.04 : 0.025, 16, 16]} />
        <meshBasicMaterial
          color={clicked ? '#ec4899' : hovered ? '#8b5cf6' : '#818cf8'}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glow ring */}
      {(hovered || clicked) && (
        <mesh>
          <ringGeometry args={[0.04, 0.07, 32]} />
          <meshBasicMaterial
            color={clicked ? '#ec4899' : '#8b5cf6'}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label */}
      {(hovered || clicked) && (
        <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div className="px-2 py-1 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-white/10 text-[10px] text-white font-semibold whitespace-nowrap shadow-lg">
            {country.flag} {country.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function RotatingGlobe({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <GlobeSphere isDark={isDark} />
    </group>
  );
}

function GlobeCanvas({ onSelectCountry }: { onSelectCountry: (c: Country) => void }) {
  const { isDark } = useTheme();

  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={isDark ? 0.4 : 0.6} />
        <directionalLight position={[5, 3, 5]} intensity={isDark ? 0.8 : 1.0} />
        <directionalLight position={[-5, -2, -3]} intensity={isDark ? 0.3 : 0.4} color="#6366f1" />

        <RotatingGlobe isDark={isDark} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          autoRotate={false}
          rotateSpeed={0.5}
          dampingFactor={0.1}
          enableDamping
        />
      </Canvas>
    </div>
  );
}

function CountryPanel({ country, onClose }: { country: Country; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card p-6 max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{country.flag}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{country.name}</h2>
            <p className="text-xs text-white/40">{country.region}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors text-sm">Close</button>
      </div>

      <p className="text-sm text-white/50 mb-5 leading-relaxed">{country.description}</p>

      <div className="p-3 rounded-xl bg-white/5 mb-4">
        <div className="text-xs text-white/40">Average Salary Range</div>
        <div className="text-sm font-semibold text-emerald-400">{country.averageSalary}</div>
      </div>

      <div className="mb-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
          <Briefcase className="w-4 h-4 text-indigo-400" /> Career Opportunities
        </h3>
        <div className="grid grid-cols-1 gap-1.5">
          {country.jobs.map((j) => (
            <div key={j} className="px-3 py-2 rounded-lg bg-white/5 text-sm text-white/70">{j}</div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
          <GlobeIcon className="w-4 h-4 text-purple-400" /> Top Companies
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {country.topCompanies.map((c) => (
            <span key={c} className="px-2 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">{c}</span>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
          <FileText className="w-4 h-4 text-amber-400" /> Requirements
        </h3>
        <div className="space-y-2">
          <div><span className="text-xs text-white/40">Entrance Exams: </span><span className="text-xs text-white/70">{country.entranceExams.join(', ')}</span></div>
          <div><span className="text-xs text-white/40">Languages: </span><span className="text-xs text-white/70">{country.languages.join(', ')}</span></div>
          <div><span className="text-xs text-white/40">Key Skills: </span><span className="text-xs text-white/70">{country.skills.join(', ')}</span></div>
        </div>
      </div>

      <div className="mb-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
          <GraduationCap className="w-4 h-4 text-emerald-400" /> Visa Information
        </h3>
        <div className="p-3 rounded-xl bg-white/5 space-y-2">
          <div><span className="text-xs text-white/40">Category: </span><span className="text-xs text-white/70 font-medium">{country.visaInfo.category}</span></div>
          <div><span className="text-xs text-white/40">Eligibility: </span><span className="text-xs text-white/70">{country.visaInfo.eligibility}</span></div>
          <div><span className="text-xs text-white/40">Timeline: </span><span className="text-xs text-emerald-400 font-medium">{country.visaInfo.timeline}</span></div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <p className="text-xs text-indigo-300">This is prototype information for demonstration purposes. Always verify official immigration and employment requirements.</p>
      </div>
    </motion.div>
  );
}

export default function Globe() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { ref, isVisible } = useScrollReveal();

  const filteredCountries = MOCK_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div ref={ref} className={`${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">
            <span className="text-gradient">Explore</span> Career Destinations
          </h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Drag to rotate the globe. Click a country to discover career opportunities, requirements, and visa information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="p-2 aspect-square max-h-[560px]">
                <GlobeCanvas onSelectCountry={setSelectedCountry} />
              </div>
            </GlassCard>
            <p className="text-center text-xs text-white/30 mt-2">
              Drag to rotate • Scroll to zoom • Click a country to explore
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none text-sm"
                placeholder="Search countries..."
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => setSelectedCountry(country)}
                  className={`w-full text-left p-3 rounded-xl transition-all text-sm ${
                    selectedCountry?.id === country.id
                      ? 'bg-indigo-500/20 border border-indigo-500/30 text-white'
                      : 'bg-white/5 border border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{country.flag}</span>
                  {country.name}
                  <span className="text-xs text-white/30 ml-2">({country.region})</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {selectedCountry && (
                <CountryPanel
                  key={selectedCountry.id}
                  country={selectedCountry}
                  onClose={() => setSelectedCountry(null)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
