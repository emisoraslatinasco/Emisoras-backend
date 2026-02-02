/**
 * Script para copiar imágenes del frontend al backend
 * 
 * Uso: node scripts/copy-images.js
 * 
 * Este script copia:
 * - Banderas de países desde Emisoras-Latinas/public/flags
 * - Logos de emisoras desde Emisoras-Latinas/public/logos_emisoras-*
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_PUBLIC = path.resolve(__dirname, '../../Emisoras-Latinas/public');
const BACKEND_PUBLIC = path.resolve(__dirname, '../public');

// Mapeo de carpetas de logos a códigos de país
const LOGO_FOLDERS = {
  'logos_emisoras-colombia': 'CO',
  'logos_emisoras-argentinas': 'AR',
  'logos_emisoras-bolivia': 'BO',
  'logos_emisoras-brasil': 'BR',
  'logos_emisoras-chile': 'CL',
  'logos_emisoras-costarica': 'CR',
  'logos_emisoras-dinamarca': 'DK',
  'logos_emisoras-elsalvador': 'SV',
  'logos_emisoras-españa': 'ES',
  'logos_emisoras-francia': 'FR',
  'logos_emisoras-guatemala': 'GT',
  'logos_emisoras-honduras': 'HN',
  'logos_emisoras-italia': 'IT',
  'logos_emisoras-jamaica': 'JM',
  'logos_emisoras-mexico': 'MX',
  'logos_emisoras-nicaragua': 'NI',
  'logos_emisoras-portugal': 'PT',
  'logos_emisoras-puertorico': 'PR',
  'logos_emisoras-reino_unido': 'GB',
  'logos_emisoras-republica_dominicana': 'DO',
  'logos_emisoras-trinidad_y_tobago': 'TT',
  'logos_emisoras-ucrania': 'UA',
  'logos_emisoras-uruguay': 'UY',
  'logos_emisoras-usa': 'US',
  'logos_emisoras-venezuela': 'VE',
  'logos_peru_ecuador': 'PE', // Perú
};

// Caso especial: Ecuador comparte carpeta con Perú
const SPECIAL_MAPPINGS = [
  { folder: 'logos_peru_ecuador', countryCode: 'EC' }
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Creado directorio: ${dir}`);
  }
}

function copyDir(src, dest) {
  ensureDir(dest);
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  let count = 0;
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  
  return count;
}

async function main() {
  console.log('🚀 Iniciando copia de imágenes...\n');
  
  // 1. Copiar banderas
  const flagsSrc = path.join(FRONTEND_PUBLIC, 'flags');
  const flagsDest = path.join(BACKEND_PUBLIC, 'flags');
  
  if (fs.existsSync(flagsSrc)) {
    const flagsCount = copyDir(flagsSrc, flagsDest);
    console.log(`✅ Banderas copiadas: ${flagsCount} archivos`);
  } else {
    console.warn('⚠️ Carpeta de banderas no encontrada');
  }
  
  // 2. Copiar logos por país
  const logosBaseDest = path.join(BACKEND_PUBLIC, 'logos');
  ensureDir(logosBaseDest);
  
  let totalLogos = 0;
  
  for (const [folder, countryCode] of Object.entries(LOGO_FOLDERS)) {
    const logosSrc = path.join(FRONTEND_PUBLIC, folder);
    const logosDest = path.join(logosBaseDest, countryCode);
    
    if (fs.existsSync(logosSrc)) {
      const count = copyDir(logosSrc, logosDest);
      totalLogos += count;
      console.log(`  ✅ ${countryCode}: ${count} logos`);
    } else {
      console.log(`  ⚠️ ${folder} no encontrada`);
    }
  }

  // Procesar casos especiales (carpetas compartidas)
  if (typeof SPECIAL_MAPPINGS !== 'undefined') {
    for (const mapping of SPECIAL_MAPPINGS) {
      const logosSrc = path.join(FRONTEND_PUBLIC, mapping.folder);
      const logosDest = path.join(logosBaseDest, mapping.countryCode);
      
      if (fs.existsSync(logosSrc)) {
        const count = copyDir(logosSrc, logosDest);
        totalLogos += count;
        console.log(`  ✅ ${mapping.countryCode} (desde ${mapping.folder}): ${count} logos`);
      }
    }
  }
  
  console.log(`\n🎉 Total: ${totalLogos} logos copiados`);
  console.log(`📂 Destino: ${BACKEND_PUBLIC}`);
}

main().catch(console.error);
