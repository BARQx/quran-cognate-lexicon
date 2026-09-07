// ============================================================
// Lexicon API Services (Sefaria & Wiktionary)
// ============================================================

function formatHomonymsLocally(entries) {
  let html = '';
  entries.forEach((group, index) => {
    const title = group.headword ? `<strong>Sense ${index + 1}: ${group.headword}</strong>` : `<strong>Meaning ${index + 1}</strong>`;
    const cleanDefs = group.defs.map(d => d.replace(/<\/?[^>]+(>|$)/g, "").trim()).filter(Boolean);
    
    if (cleanDefs.length > 0) {
      html += `<div class="homonym-group">
        <div class="homonym-title">${title}</div>
        <ul class="def-list">
          ${cleanDefs.map(d => `<li>${d}</li>`).join('')}
        </ul>
      </div>`;
    }
  });
  return html;
}

async function fetchSefariaDefinitionsGrouped(hebrewStr) {
  try {
    const response = await fetch(`https://www.sefaria.org/api/words/${encodeURIComponent(hebrewStr)}`);
    if (!response.ok) return {};
    const data = await response.json();
    
    const dictionaries = {};
    if (Array.isArray(data)) {
      data.forEach(entry => {
        const dictName = entry.parent_lexicon || entry.parent_lexicon_details?.name || "BDB Lexicon";
        let headword = entry.headword || "";
        let defs = [];
        
        if (entry.parent_lexicon_details && entry.parent_lexicon_details.defs) {
          defs = entry.parent_lexicon_details.defs;
        } else if (entry.content && entry.content.senses) {
          entry.content.senses.forEach(s => { if (s.definition) defs.push(s.definition); });
        }

        if (defs.length > 0) {
          if (!dictionaries[dictName]) dictionaries[dictName] = [];
          dictionaries[dictName].push({ headword, defs });
        }
      });
    }
    return dictionaries;
  } catch (e) {
    return {};
  }
}

async function fetchWiktionaryDefinition(hebrewStr) {
  try {
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(hebrewStr)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.he) return null;

    let entryGroups = [];
    data.he.forEach(entry => {
      let pos = entry.partOfSpeech || "Definition";
      let defs = entry.definitions.map(d => d.definition);
      entryGroups.push({ headword: pos, defs });
    });

    return entryGroups.length > 0 ? formatHomonymsLocally(entryGroups) : null;
  } catch (e) {
    return null;
  }
}
