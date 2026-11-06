// Only finite, committed public-action IDs select these reviewed summaries.
// No raw case metadata, player claims or provider text is read here.
export function explainAshcroft(state) {
  const inspected = (id) => state.inspected.has(id);
  const discussed = (npc, core) => state.npcs.get(npc)?.discussed.has(core) ?? false;
  const contract = inspected('torn-contract');
  const cufflink = inspected('silver-cufflink');
  const recognition = cufflink && discussed('alice-mercer', 'alice-mercer-cufflink-recognition');
  const alice = discussed('alice-mercer', 'alice-mercer-sighting');
  const clara = discussed('clara-voss', 'clara-voss-sighting');
  const paragraphs = [];
  if (contract) paragraphs.push('The investigation recorded a contract showing Victor intended to end his partnership with Clara, suggesting a possible motive. Motive alone does not establish guilt.');
  if (alice) paragraphs.push('Alice reported seeing Clara coming in from the garden shortly before the alarm, but did not see where she went next.');
  if (clara) paragraphs.push('Clara said she was nowhere near the garden after dinner.');
  if (alice && clara) paragraphs.push('Those garden accounts conflict; the disagreement alone does not establish which witness is truthful.');
  if (recognition) paragraphs.push('The cufflink found beneath Victor’s desk has a design Alice remembers on Clara’s dinner accessories. Alice could not be certain it belonged to Clara, did not see her drop it, and could not explain how or when it reached the study. This is a possible connection, not proof of murder-time presence.');
  else if (cufflink) paragraphs.push('The investigation recorded a silver cufflink with a V-shaped engraving beneath Victor’s desk; its owner and arrival time were not established.');
  if (inspected('muddy-footprints')) {
    paragraphs.push('Fresh footprints suggest a possible route between the garden door and the study side entrance, without identifying their maker.');
    if (discussed('ben-carter', 'ben-carter-evidence')) paragraphs.push('Ben explained that anyone using the muddy path could have tracked mud inside.');
  }
  if (contract && recognition && alice && clara) paragraphs.push('Together, the documentary motive, conflicting accounts and possible accessory connection provide substantial circumstantial support for the accusation. No single clue independently establishes guilt.');
  else paragraphs.push('The accusation is correct, but the investigation did not establish the complete supporting chain. The recorded evidence is incomplete.');
  return '\n\n' + paragraphs.join('\n\n');
}
