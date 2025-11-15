const analysisForm = document.querySelector('#analysis-form');
const sourceInput = document.querySelector('#source-text');
const comparisonInput = document.querySelector('#comparison-text');
const outputDisplay = document.querySelector('#output-display');

function tokenize(str) {
    return str.toLowerCase()
              .split(/\s+/)
              .filter(s => s.length > 1);
}

function getSimilarityScore(baseStr, comparisonStr) {
    const listA = tokenize(baseStr);
    const listB = tokenize(comparisonStr);

    const denominator = listA.length + listB.length;
    if (denominator === 0) {
        return 0;
    }
    
    const matches = listA.reduce((count, word) => {
        return count + (listB.includes(word) ? 1 : 0);
    }, 0);
    
    return (matches / denominator) * 100;
}

function handleAnalysis(event) {
    event.preventDefault();
    
    const textA = sourceInput.value.trim();
    const textB = comparisonInput.value.trim();
    
    if (!textA || !textB) {
        outputDisplay.textContent = 'Wpisz dwa teksty';
        return;
    }
    
    const score = getSimilarityScore(textA, textB);
    outputDisplay.textContent = `Podobienstwo: ${score.toFixed(2)}%`;
}

analysisForm.addEventListener('submit', handleAnalysis);