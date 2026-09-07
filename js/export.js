// ============================================================
// Research Export & External Scholarly Portals
// Markdown brief generation, CAL lookup, and deep-link copying
// ============================================================

function copyAnalysisLink() {
  if (typeof lastAnalysis === 'undefined' || !lastAnalysis) return;
  const url = new URL(window.location.href);
  url.searchParams.set('root', lastAnalysis.root);
  navigator.clipboard.writeText(url.toString()).then(() => alert('Analysis link copied to clipboard.'));
}

function openCalLexicon() {
  if (typeof lastAnalysis === 'undefined' || !lastAnalysis) {
    alert("Please perform an analysis first!");
    return;
  }
  // matchedHebrew defaults to the primary derived cognate, and is only
  // swapped for an attested alternate spelling when that's what actually
  // returned dictionary results — so it's always the "best" root to use.
  const root = lastAnalysis.matchedHebrew || lastAnalysis.hebrew;
  const url = `https://cal.huc.edu/browseSKEYheaders.php?tools=on&first3=${encodeURIComponent(root)}`;
  window.open(url, '_blank');
}

function copyResearchBrief() {
  if (typeof lastAnalysis === 'undefined' || !lastAnalysis) {
    alert("Please perform an analysis first!");
    return;
  }

  // Helper to strip HTML, normalize spaces, and collapse whitespace cleanly
  const cleanText = (str) => {
    if (!str) return '';
    return str
      .replace(/<[^>]*>/g, '')                 // Remove HTML tags
      .replace(/\u00A0/g, ' ')                 // Replace non-breaking spaces
      .replace(/[ \t]+/g, ' ')                 // Collapse multiple spaces/tabs
      .replace(/\n\s*\n/g, '\n')               // Remove empty blank lines 
      .trim();
  };

  let markdown = `### Semitic Comparative Brief: Root [ ${lastAnalysis.root} ]\n\n`;
  markdown += `**Cognate Breakdown**\n`;
  markdown += `* **Arabic Root:** ${lastAnalysis.root}\n`;
  markdown += `* **Nabataean:** ${lastAnalysis.nabataean}\n`;
  if (lastAnalysis.usedAlternate) {
    markdown += `* **Hebrew (Reconstructed):** ${lastAnalysis.hebrew}\n`;
    markdown += `* **Hebrew (Attested in Lexicons):** ${lastAnalysis.matchedHebrew}\n`;
  } else {
    markdown += `* **Hebrew:** ${lastAnalysis.hebrew}\n`;
  }
  markdown += `* **Syriac:** ${lastAnalysis.syriac}\n`;
  markdown += `* **Musnad (Sabaic):** ${lastAnalysis.musnad}\n`;
  markdown += `* **Ge'ez:** ${lastAnalysis.geez}\n`;
  if (lastAnalysis.tags && lastAnalysis.tags.length > 0) {
    markdown += `* **Morphology:** ${lastAnalysis.tags.join(', ')}\n`;
  }
  markdown += `\n`;

  const hasSefaria = lastAnalysis.sefaria && Object.keys(lastAnalysis.sefaria).length > 0;
  const hasWiki = !!lastAnalysis.wiktionary;

  if (hasSefaria || hasWiki) {
    markdown += `--- \n\n### Lexicon Definitions\n\n`;

    // 1. Process Sefaria Entries with strict "Sense X: Headword" matching UI
    if (hasSefaria) {
      markdown += `#### Sefaria Classical Lexicons\n`;
      for (const [dict, entries] of Object.entries(lastAnalysis.sefaria)) {
        markdown += `**${dict}**\n`;
        entries.forEach((group, index) => {
          const hw = cleanText(group.headword);
          let senseTitle = hw ? `Sense ${index + 1}: ${hw}` : `Sense ${index + 1}`;
          if (group.transliteration) senseTitle += ` [${group.transliteration}]`;
          if (group.strongNumber) senseTitle += ` (#${group.strongNumber})`;
          
          markdown += `* **${senseTitle}**\n`;

          (group.defs || []).forEach(d => {
            const sanitized = cleanText(d);
            if (sanitized) {
              markdown += `  * ${sanitized}\n`;
            }
          });

          if (group.stems && group.stems.length > 0) {
            group.stems.forEach(s => {
              const stemParts = [s.stem, s.form ? `(${s.form})` : '', s.defs ? s.defs.join('; ') : ''].filter(Boolean).join(' ');
              if (stemParts) {
                markdown += `  * *Verbal Stem:* ${cleanText(stemParts)}\n`;
              }
            });
          }

          if (group.etymology) {
            const etymText = cleanText(group.etymology);
            if (etymText) {
              markdown += `  * *Comparative Etymology:* ${etymText}\n`;
            }
          }
        });
        markdown += `\n`;
      }
    }

    // 2. Process Wiktionary Entries with strict Sense retention
    if (hasWiki) {
      markdown += `#### Wiktionary (Modern Hebrew)\n`;
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = lastAnalysis.wiktionary;
      
      const groups = tempDiv.querySelectorAll('.homonym-group, .lex-entry-card');
      if (groups.length > 0) {
        groups.forEach(g => {
          const title = cleanText(
            g.querySelector('.part-of-speech')?.textContent || 
            g.querySelector('.homonym-title')?.textContent || 
            g.querySelector('.lex-entry-meta')?.textContent || ''
          );
          if (title) {
            markdown += `**${title}**\n`;
          }
          g.querySelectorAll('li').forEach(li => {
            const itemText = cleanText(li.textContent);
            if (itemText) {
              markdown += `* ${itemText}\n`;
            }
          });
          markdown += `\n`;
        });
      } else {
        const sanitizedWiki = cleanText(lastAnalysis.wiktionary);
        markdown += `${sanitizedWiki}\n`;
      }
    }
  }

  navigator.clipboard.writeText(markdown).then(() => {
    alert("Research brief copied to clipboard in clean Markdown format!");
  });
}
