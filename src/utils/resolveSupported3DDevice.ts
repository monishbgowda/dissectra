export type Supported3DDevice = 'mouse' | 'pendrive';

/**
 * Resolves whether an AI analysis result, product object, or raw object name
 * corresponds to a supported procedural 3D model template.
 *
 * Supported devices:
 * - 'mouse'    -> Computer Mouse procedural model
 * - 'pendrive' -> USB Flash Drive / Pen Drive procedural model
 *
 * Returns null if the device is unsupported or unrecognized.
 */
export function resolveSupported3DDevice(
  analysisOrProduct: unknown,
): Supported3DDevice | null {
  if (!analysisOrProduct) {
    return null;
  }

  let textToAnalyze = '';

  if (typeof analysisOrProduct === 'string') {
    textToAnalyze = analysisOrProduct;
  } else if (typeof analysisOrProduct === 'object') {
    const obj = analysisOrProduct as any;
    const parts: string[] = [];

    // 1. Structured product metadata from Gemini analysis
    if (obj.product && typeof obj.product === 'object') {
      if (obj.product.name) parts.push(String(obj.product.name));
      if (obj.product.category) parts.push(String(obj.product.category));
      if (obj.product.brand) parts.push(String(obj.product.brand));
      if (obj.product.model) parts.push(String(obj.product.model));
    }

    // 2. Direct inspection / scan properties
    if (obj.objectName) parts.push(String(obj.objectName));
    if (obj.object) parts.push(String(obj.object));
    if (obj.name) parts.push(String(obj.name));
    if (obj.category) parts.push(String(obj.category));
    if (obj.description) parts.push(String(obj.description));

    // 3. Labels / tags if present
    if (Array.isArray(obj.labels)) {
      parts.push(...obj.labels.map(String));
    }

    textToAnalyze = parts.filter(Boolean).join(' ');
  }

  const normalized = textToAnalyze.toLowerCase().trim();
  if (!normalized) {
    return null;
  }

  // 1. PEN DRIVE / USB FLASH DRIVE MATCHING
  // Distinct phrases indicating a USB storage drive (avoid single word "usb")
  const penDrivePatterns = [
    /\bpen\s*drive\b/i,
    /\bpendrive\b/i,
    /\bflash\s*drive\b/i,
    /\busb\s*flash\b/i,
    /\busb\s*drive\b/i,
    /\busb\s*stick\b/i,
    /\busb\s*memory\b/i,
    /\bthumb\s*drive\b/i,
    /\bthumbdrive\b/i,
    /\bmemory\s*stick\b/i,
    /\bjump\s*drive\b/i,
  ];

  for (const pattern of penDrivePatterns) {
    if (pattern.test(normalized)) {
      return 'pendrive';
    }
  }

  // 2. COMPUTER MOUSE MATCHING
  // Match mouse keywords while excluding accessories like mouse pads, adapters, receivers
  const isMouseKeyword = /\b(mouse|mice)\b/i.test(normalized);
  const isAccessory =
    /\b(mouse\s*pad|mousepad|mouse\s*mat|mouse\s*adapter|mouse\s*receiver|mouse\s*dongle|mouse\s*cable|mouse\s*wire|mouse\s*case|mouse\s*pouch)\b/i.test(
      normalized,
    );

  if (isMouseKeyword && !isAccessory) {
    return 'mouse';
  }

  return null;
}
