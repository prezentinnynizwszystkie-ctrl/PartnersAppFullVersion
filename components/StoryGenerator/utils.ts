
import { StoryBlock, StoryLector } from './types';

// Funkcja parsująca surowy tekst na bloki
export const parseScriptToBlocks = (rawText: string, lectors: StoryLector[]): StoryBlock[] => {
  const lines = rawText.split('\n');
  const blocks: StoryBlock[] = [];

  // Mapa nazw lektorów na ich ID dla szybkiego wyszukiwania
  const lectorsMap = new Map(lectors.map(l => [l.name.toLowerCase(), l.id]));
  const defaultLectorId = lectors.length > 0 ? lectors[0].id : undefined;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed === 'End') return; // Ignoruj 'End' z DSL

    const id = crypto.randomUUID();

    // 1. Wykrywanie EPISODE
    if (trimmed.toLowerCase().startsWith('episode:')) {
      blocks.push({
        id,
        type: 'EPISODE',
        content: trimmed.replace(/^episode:/i, '').trim(),
      });
      return;
    }

    // 2. Wykrywanie CHAPTER
    if (trimmed.toLowerCase().startsWith('chapter:')) {
      blocks.push({
        id,
        type: 'CHAPTER',
        content: trimmed.replace(/^chapter:/i, '').trim(),
      });
      return;
    }

    // 3. Wykrywanie BACKGROUND (DSL + Text Format)
    // Format DSL: BackgroundSampleLine: Code=Nazwa, FadeIn=...
    if (trimmed.includes('BackgroundSampleLine')) {
        const codeMatch = trimmed.match(/Code=([^,]+)/);
        const fadeMatch = trimmed.match(/FadeIn=([^,]+)/);
        blocks.push({
            id,
            type: 'BACKGROUND',
            content: codeMatch ? codeMatch[1] : 'Music',
            metadata: { fadeIn: fadeMatch ? fadeMatch[1] : '00:00:01' }
        });
        return;
    }
    // Format Text: Background: Nazwa
    if (trimmed.toLowerCase().startsWith('background')) {
        const parts = trimmed.split(':');
        const bgName = parts[0].trim();
        const param = parts[1] ? parts[1].trim() : '';
        
        blocks.push({
            id,
            type: 'BACKGROUND',
            content: bgName,
            metadata: { fadeIn: param }
        });
        return;
    }

    // 4. Wykrywanie PAUSE (DSL + Text Format)
    // Format DSL: PauseLine: 00:00:0X
    if (trimmed.includes('PauseLine')) {
        const timeMatch = trimmed.match(/00:00:0(\d+)/);
        const duration = timeMatch ? parseInt(timeMatch[1]) : 2;
        blocks.push({
            id,
            type: 'PAUSE',
            content: 'Pauza',
            metadata: { duration }
        });
        return;
    }
    // Format Text: Pause: 2
    if (trimmed.toLowerCase().startsWith('pause:') || trimmed.toLowerCase().startsWith('pauza:')) {
        const val = trimmed.split(':')[1]?.trim();
        blocks.push({
            id,
            type: 'PAUSE',
            content: 'Pauza',
            metadata: { duration: parseInt(val) || 2 }
        });
        return;
    }

    // 5. Wykrywanie Linii Dialogowej (DSL)
    const dslLineRegex = /(SampleLine|DynamicSampleLine):\s*Code=([A-Z0-9]+)/i;
    const dslMatch = trimmed.match(dslLineRegex);
    if (dslMatch) {
        // To jest linia z bazy (Schema). Tworzymy blok z Kodem, ale pustą treścią (zostanie wypełniona z JSON)
        blocks.push({
            id,
            type: 'LINE',
            content: '', 
            code: dslMatch[2],
            lectorId: defaultLectorId
        });
        return;
    }

    // 6. Wykrywanie Linii Dialogowej (Format Edytora)

    // PRZYPADEK A: Format "S1: Tekst" lub "Z1: Tekst" (Bez nazwy lektora)
    const codeStartRegex = /^([SZ]\d+):\s*(.*)/i;
    const codeMatch = trimmed.match(codeStartRegex);

    if (codeMatch) {
        const code = codeMatch[1].toUpperCase(); // np. S1
        const content = codeMatch[2].trim();     // czysty tekst
        
        blocks.push({
            id,
            type: 'LINE',
            content,
            code,
            lectorId: defaultLectorId // Przypisujemy domyślnego lektora
        });
        return;
    }

    // PRZYPADEK B: Format "Rola (KOD): Tekst"
    const roleRegex = /^([^(]+)\s*\(([^)]+)\):\s*(.*)/;
    const match = trimmed.match(roleRegex);

    if (match) {
        const roleName = match[1].trim();
        const code = match[2].trim();
        const content = match[3].trim();

        const matchedLectorId = lectorsMap.get(roleName.toLowerCase()) || defaultLectorId;

        blocks.push({
            id,
            type: 'LINE',
            content,
            code,
            lectorId: matchedLectorId
        });
    } else {
        // PRZYPADEK C: Zwykła linia tekstu (np. opisowa lub bez kodu)
        // Ignorujemy linie wcięć z DSL (np. "    End")
        if (trimmed === 'End') return;

        blocks.push({
            id,
            type: 'LINE',
            content: trimmed,
            code: '', 
            lectorId: defaultLectorId
        });
    }
  });

  return blocks;
};

// Funkcja generująca podgląd scenariusza (output)
export const generateScenarioOutput = (blocks: StoryBlock[], lectors: StoryLector[]): string => {
    let output = '';
    const lectorsMap = new Map(lectors.map(l => [l.id, l.name]));

    blocks.forEach(block => {
        if (block.type === 'EPISODE') {
            output += `Episode: ${block.content}\n`;
        } else if (block.type === 'CHAPTER') {
            output += `  Chapter: ${block.content}\n`;
        } else if (block.type === 'BACKGROUND') {
            output += `    Background: ${block.content}${block.metadata?.fadeIn ? `: ${block.metadata.fadeIn}` : ''}\n`;
        } else if (block.type === 'PAUSE') {
            output += `    Pause: ${block.metadata?.duration || 2}\n`;
        } else if (block.type === 'LINE') {
            const lectorName = lectorsMap.get(block.lectorId || '') || 'Narrator';
            // Format: "Lektor (KOD): Treść"
            if (block.code) {
               output += `    ${lectorName} (${block.code}): ${block.content}\n`; 
            } else {
               output += `    ${lectorName}: ${block.content}\n`;
            }
        }
        output += '\n';
    });

    return output.trim();
};
